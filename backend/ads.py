"""
buildecogroup.com — Paid Advertisement Portal.
Advertisers create ad campaigns (placement + duration → server-computed fee),
pay via Wallet or Stripe, and (after Super-Admin approval) go live. Performance
metrics (impressions/clicks) are deterministically simulated per campaign/day
for the analytics dashboards. Super Admin: approval queue, revenue analytics,
placement pricing/slot controls.
"""
import os
import uuid
import random
import asyncio
import logging
from datetime import datetime, timezone, timedelta, date
from typing import Optional

import requests
from fastapi import APIRouter, Request, HTTPException, Query, UploadFile, File, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

logger = logging.getLogger("ads")

_db = None
_get_current_user = None


def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user


def now_utc(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat() if isinstance(dt, datetime) else dt
def new_id(p): return f"{p}_{uuid.uuid4().hex[:12]}"
def today(): return now_utc().date()


router = APIRouter(prefix="/api/ads", tags=["ads"])

TAX_RATE = 0.18
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")

DEFAULT_PLACEMENTS = [
    {"code": "header", "name": "Header Banner", "price_per_week": 1000.0,
     "description": "Top-of-page leaderboard banner shown across the site.", "enabled": True, "sort": 1},
    {"code": "sidebar", "name": "Sidebar Sticky", "price_per_week": 500.0,
     "description": "Sticky ad unit in the right sidebar of content pages.", "enabled": True, "sort": 2},
    {"code": "infeed", "name": "In-Feed Native", "price_per_week": 750.0,
     "description": "Native ad card blended inside marketplace / content feeds.", "enabled": True, "sort": 3},
]

BASE_IMPR = {"header": 6000, "sidebar": 1800, "infeed": 3200}


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
async def _require_super(request: Request):
    user = await _get_current_user(request)
    if user.get("role") != "super_admin":
        raise HTTPException(403, "Only Super Admin can perform this action")
    return user


async def _owned(cid: str, user: dict):
    c = await _db.ad_campaigns.find_one({"id": cid}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Campaign not found")
    if user.get("role") != "super_admin" and c["user_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    return c


def _fee(price_per_week: float, weeks: int):
    base = round(float(price_per_week) * int(weeks), 2)
    tax = round(base * TAX_RATE, 2)
    return base, tax, round(base + tax, 2)


def _end_date(c: dict) -> date:
    s = date.fromisoformat(c["start_date"])
    return s + timedelta(days=int(c["duration_weeks"]) * 7 - 1)


async def _maybe_expire(c: dict) -> dict:
    if c.get("status") in ("active", "paused") and today() > _end_date(c):
        await _db.ad_campaigns.update_one({"id": c["id"]}, {"$set": {"status": "expired"}})
        c["status"] = "expired"
    return c


def _daily_stats(c: dict):
    return []


async def _series(cid: str):
    rows = await _db.ad_stats.find(
        {"campaign_id": cid}, {"_id": 0, "date": 1, "impressions": 1, "clicks": 1}).sort("date", 1).to_list(400)
    return [{"date": r["date"], "impressions": r.get("impressions", 0), "clicks": r.get("clicks", 0)} for r in rows]


async def _agg(cid: str):
    s = await _series(cid)
    impr = sum(x["impressions"] for x in s)
    clk = sum(x["clicks"] for x in s)
    ctr = round(clk / impr * 100, 2) if impr else 0.0
    return impr, clk, ctr, s


def _stripe(request: Request) -> StripeCheckout:
    webhook_url = f"{str(request.base_url)}api/webhook/stripe"
    return StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)


# --------------------------------------------------------------------------- #
# Object storage (banner uploads) — Emergent object storage
# --------------------------------------------------------------------------- #
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "buildecogroup-ads"
_storage_key = None
MIME = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp",
        "gif": "image/gif", "mp4": "video/mp4", "webm": "video/webm"}


def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init",
                         json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _put_object(path, data, content_type):
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def _get_object(path):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# --------------------------------------------------------------------------- #
# Placements
# --------------------------------------------------------------------------- #
@router.get("/placements")
async def list_placements(request: Request):
    await _get_current_user(request)
    rows = await _db.ad_placements.find({"enabled": True}, {"_id": 0}).sort("sort", 1).to_list(50)
    return rows


# --------------------------------------------------------------------------- #
# Campaigns (advertiser)
# --------------------------------------------------------------------------- #
class CampaignIn(BaseModel):
    name: str = Field(min_length=2)
    destination_url: str = Field(min_length=3)
    placement_code: str
    start_date: str
    duration_weeks: int = Field(ge=1, le=52)
    banner_url: Optional[str] = ""
    media_type: Optional[str] = "image"


@router.post("/campaigns")
async def create_campaign(body: CampaignIn, request: Request):
    user = await _get_current_user(request)
    pl = await _db.ad_placements.find_one({"code": body.placement_code, "enabled": True}, {"_id": 0})
    if not pl:
        raise HTTPException(400, "Invalid or disabled placement")
    try:
        date.fromisoformat(body.start_date)
    except Exception:
        raise HTTPException(400, "Invalid start date (use YYYY-MM-DD)")
    base, tax, total = _fee(pl["price_per_week"], body.duration_weeks)
    doc = {
        "id": new_id("ad"), "user_id": user["id"], "user_email": user["email"],
        "user_name": user.get("name"), "company_id": user.get("company_id", "company_default"),
        "name": body.name, "destination_url": body.destination_url,
        "banner_url": body.banner_url or "", "banner_storage_path": None,
        "media_type": body.media_type or "image",
        "placement_code": pl["code"], "placement_name": pl["name"],
        "price_per_week": pl["price_per_week"], "duration_weeks": body.duration_weeks,
        "start_date": body.start_date, "base_fee": base, "tax": tax, "total": total,
        "status": "draft", "payment_status": "unpaid", "payment_mode": None,
        "reject_reason": None, "created_at": iso(now_utc()),
    }
    await _db.ad_campaigns.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@router.get("/campaigns")
async def list_campaigns(request: Request):
    user = await _get_current_user(request)
    q = {} if user.get("role") == "super_admin" else {"user_id": user["id"]}
    rows = await _db.ad_campaigns.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    out = []
    for c in rows:
        await _maybe_expire(c)
        impr, clk, ctr, _ = await _agg(c["id"])
        c["impressions"], c["clicks"], c["ctr"] = impr, clk, ctr
        out.append(c)
    return out


@router.get("/campaigns/{cid}")
async def get_campaign(cid: str, request: Request):
    user = await _get_current_user(request)
    c = await _owned(cid, user)
    await _maybe_expire(c)
    impr, clk, ctr, _ = await _agg(c["id"])
    c["impressions"], c["clicks"], c["ctr"] = impr, clk, ctr
    return c


@router.get("/campaigns/{cid}/stats")
async def campaign_stats(cid: str, request: Request):
    user = await _get_current_user(request)
    c = await _owned(cid, user)
    await _maybe_expire(c)
    impr, clk, ctr, series = await _agg(c["id"])
    return {"campaign": {"id": c["id"], "name": c["name"], "status": c["status"], "placement_name": c.get("placement_name")},
            "impressions": impr, "clicks": clk, "ctr": ctr, "series": series}


@router.post("/campaigns/{cid}/pause")
async def pause_campaign(cid: str, request: Request):
    user = await _get_current_user(request)
    c = await _owned(cid, user)
    if c["status"] != "active":
        raise HTTPException(400, "Only an active campaign can be paused")
    await _db.ad_campaigns.update_one({"id": cid}, {"$set": {"status": "paused"}})
    return {"ok": True, "status": "paused"}


@router.post("/campaigns/{cid}/resume")
async def resume_campaign(cid: str, request: Request):
    user = await _get_current_user(request)
    c = await _owned(cid, user)
    if c["status"] != "paused":
        raise HTTPException(400, "Only a paused campaign can be resumed")
    if today() > _end_date(c):
        raise HTTPException(400, "Campaign schedule has already ended")
    await _db.ad_campaigns.update_one({"id": cid}, {"$set": {"status": "active"}})
    return {"ok": True, "status": "active"}


@router.delete("/campaigns/{cid}")
async def delete_campaign(cid: str, request: Request):
    user = await _get_current_user(request)
    c = await _owned(cid, user)
    if c.get("payment_status") == "paid" and user.get("role") != "super_admin":
        raise HTTPException(400, "Paid campaigns cannot be deleted")
    await _db.ad_campaigns.delete_one({"id": cid})
    return {"ok": True}


# --------------------------------------------------------------------------- #
# Payment (wallet / stripe)
# --------------------------------------------------------------------------- #
@router.post("/campaigns/{cid}/pay-wallet")
async def pay_wallet(cid: str, request: Request):
    user = await _get_current_user(request)
    c = await _owned(cid, user)
    if c["payment_status"] == "paid":
        raise HTTPException(400, "Campaign already paid")
    import wallet
    txn = await wallet.apply_transaction(
        user["id"], "debit", c["total"], f"Ad campaign · {c['name']}",
        created_by=user["id"], created_by_email=user["email"], meta={"ad_campaign_id": cid})
    await _db.ad_campaigns.update_one({"id": cid}, {"$set": {
        "payment_status": "paid", "status": "pending_approval",
        "paid_at": iso(now_utc()), "payment_mode": "wallet"}})
    return {"ok": True, "status": "pending_approval", "balance": txn["balance_after"]}


class CheckoutIn(BaseModel):
    origin_url: str


@router.post("/campaigns/{cid}/checkout")
async def checkout(cid: str, body: CheckoutIn, request: Request):
    user = await _get_current_user(request)
    c = await _owned(cid, user)
    if c["payment_status"] == "paid":
        raise HTTPException(400, "Campaign already paid")
    amount = round(float(c["total"]), 2)
    sc = _stripe(request)
    origin = body.origin_url.rstrip("/")
    req = CheckoutSessionRequest(
        amount=amount, currency="inr",
        success_url=f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{origin}/payment/cancel",
        metadata={"ad_campaign_id": cid, "user_id": user["id"], "type": "ad_campaign"})
    session = await sc.create_checkout_session(req)
    await _db.payment_transactions.insert_one({
        "id": new_id("ptx"), "session_id": session.session_id, "ad_campaign_id": cid,
        "user_id": user["id"], "amount": amount, "currency": "inr",
        "status": "initiated", "payment_status": "pending",
        "created_at": iso(now_utc()), "updated_at": iso(now_utc())})
    return {"checkout_url": session.url, "session_id": session.session_id}


# --------------------------------------------------------------------------- #
# Banner upload / serve
# --------------------------------------------------------------------------- #
@router.post("/campaigns/{cid}/banner")
async def upload_banner(cid: str, request: Request, file: UploadFile = File(...)):
    user = await _get_current_user(request)
    await _owned(cid, user)
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "png"
    content_type = file.content_type or MIME.get(ext, "application/octet-stream")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 10 MB)")
    path = f"{APP_NAME}/banners/{user['id']}/{cid}/{uuid.uuid4().hex}.{ext}"
    try:
        result = await asyncio.to_thread(_put_object, path, data, content_type)
    except Exception as e:
        logger.error("Banner upload failed: %s", str(e))
        raise HTTPException(502, "Upload failed. Please try again.")
    media_type = "video" if content_type.startswith("video") else "image"
    banner_url = f"/api/ads/campaigns/{cid}/banner"
    await _db.ad_campaigns.update_one({"id": cid}, {"$set": {
        "banner_storage_path": result["path"], "banner_url": banner_url,
        "banner_content_type": content_type, "media_type": media_type}})
    return {"ok": True, "banner_url": banner_url, "media_type": media_type}


@router.get("/campaigns/{cid}/banner")
async def serve_banner(cid: str):
    c = await _db.ad_campaigns.find_one({"id": cid}, {"_id": 0})
    if not c or not c.get("banner_storage_path"):
        raise HTTPException(404, "No banner")
    try:
        data, ct = await asyncio.to_thread(_get_object, c["banner_storage_path"])
    except Exception:
        raise HTTPException(502, "Could not fetch banner")
    return Response(content=data, media_type=c.get("banner_content_type", ct),
                    headers={"Cache-Control": "public, max-age=3600"})


# --------------------------------------------------------------------------- #
# Public ad serving + genuine impression / click tracking
# --------------------------------------------------------------------------- #
@router.get("/serve/{placement}")
async def serve_ads(placement: str, limit: int = Query(1, ge=1, le=5)):
    pl = await _db.ad_placements.find_one({"code": placement, "enabled": True}, {"_id": 0})
    if not pl:
        return {"ads": []}
    t = today().isoformat()
    rows = await _db.ad_campaigns.find(
        {"placement_code": placement, "status": "active", "payment_status": "paid"}, {"_id": 0}).to_list(200)
    live = [c for c in rows if c["start_date"] <= t <= _end_date(c).isoformat()]
    random.shuffle(live)
    live = live[:limit]
    return {"ads": [{
        "id": c["id"], "name": c["name"], "banner_url": c.get("banner_url") or "",
        "destination_url": c["destination_url"], "media_type": c.get("media_type", "image"),
        "placement": placement,
    } for c in live]}


async def _bump(cid: str, field: str):
    t = today().isoformat()
    await _db.ad_stats.update_one(
        {"campaign_id": cid, "date": t},
        {"$inc": {field: 1}, "$setOnInsert": {"campaign_id": cid, "date": t}}, upsert=True)


class ImpressionIn(BaseModel):
    campaign_id: str


@router.post("/track/impression")
async def track_impression(body: ImpressionIn):
    c = await _db.ad_campaigns.find_one({"id": body.campaign_id}, {"_id": 0, "status": 1, "payment_status": 1})
    if not c or c.get("status") != "active" or c.get("payment_status") != "paid":
        return {"ok": False}
    await _bump(body.campaign_id, "impressions")
    return {"ok": True}


@router.get("/click/{cid}")
async def track_click(cid: str):
    c = await _db.ad_campaigns.find_one({"id": cid}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Ad not found")
    if c.get("status") == "active" and c.get("payment_status") == "paid":
        await _bump(cid, "clicks")
    dest = (c.get("destination_url") or "").strip() or "/"
    if not dest.startswith(("http://", "https://", "/")):
        dest = "https://" + dest
    return RedirectResponse(url=dest, status_code=302)


# --------------------------------------------------------------------------- #
# Advertiser analytics
# --------------------------------------------------------------------------- #
@router.get("/analytics/me")
async def my_analytics(request: Request):
    user = await _get_current_user(request)
    camps = await _db.ad_campaigns.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    total_impr = total_clk = active = 0
    spend = 0.0
    daymap = {}
    for c in camps:
        await _maybe_expire(c)
        if c["status"] == "active":
            active += 1
        if c.get("payment_status") == "paid":
            spend += c.get("total", 0)
        impr, clk, _, series = await _agg(c["id"])
        total_impr += impr
        total_clk += clk
        for pt in series:
            m = daymap.setdefault(pt["date"], {"date": pt["date"], "impressions": 0, "clicks": 0})
            m["impressions"] += pt["impressions"]
            m["clicks"] += pt["clicks"]
    series = sorted(daymap.values(), key=lambda x: x["date"])
    ctr = round(total_clk / total_impr * 100, 2) if total_impr else 0.0
    return {"active_ads": active, "total_campaigns": len(camps), "impressions": total_impr,
            "clicks": total_clk, "ctr": ctr, "spend": round(spend, 2), "series": series}


# --------------------------------------------------------------------------- #
# Admin: approval queue, analytics, placement controls
# --------------------------------------------------------------------------- #
@router.get("/admin/queue")
async def admin_queue(request: Request):
    await _require_super(request)
    rows = await _db.ad_campaigns.find({"status": "pending_approval"}, {"_id": 0}).sort("paid_at", 1).to_list(500)
    return rows


@router.post("/admin/campaigns/{cid}/approve")
async def admin_approve(cid: str, request: Request):
    admin = await _require_super(request)
    c = await _db.ad_campaigns.find_one({"id": cid}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Campaign not found")
    if c.get("payment_status") != "paid":
        raise HTTPException(400, "Campaign is not paid yet")
    await _db.ad_campaigns.update_one({"id": cid}, {"$set": {
        "status": "active", "approved_at": iso(now_utc()), "approved_by": admin["email"], "reject_reason": None}})
    return {"ok": True, "status": "active"}


class RejectIn(BaseModel):
    reason: str = Field(min_length=2)


@router.post("/admin/campaigns/{cid}/reject")
async def admin_reject(cid: str, request: Request, body: RejectIn = None):
    admin = await _require_super(request)
    if not body:
        raise HTTPException(422, "Reason is required")
    c = await _db.ad_campaigns.find_one({"id": cid}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Campaign not found")
    refunded = False
    if c.get("payment_status") == "paid" and c.get("payment_mode") == "wallet" and not c.get("refunded"):
        import wallet
        await wallet.apply_transaction(
            c["user_id"], "credit", c["total"], f"Ad rejected refund · {c['name']}",
            created_by=admin["id"], created_by_email=admin["email"],
            meta={"ad_campaign_id": cid, "refund": True})
        refunded = True
    await _db.ad_campaigns.update_one({"id": cid}, {"$set": {
        "status": "rejected", "reject_reason": body.reason,
        "rejected_at": iso(now_utc()), "refunded": refunded}})
    return {"ok": True, "status": "rejected", "refunded": refunded}


@router.get("/admin/analytics")
async def admin_analytics(request: Request):
    await _require_super(request)
    camps = await _db.ad_campaigns.find({}, {"_id": 0}).to_list(2000)
    paid = [c for c in camps if c.get("payment_status") == "paid"]
    months = {}
    for c in paid:
        pa = c.get("paid_at") or c.get("created_at") or ""
        key = pa[:7] if pa else "unknown"
        months[key] = round(months.get(key, 0) + c.get("total", 0), 2)
    monthly = [{"month": k, "revenue": v} for k, v in sorted(months.items())]
    slots = {}
    for c in paid:
        s = slots.setdefault(c["placement_code"], {
            "code": c["placement_code"], "placement": c.get("placement_name", c["placement_code"]),
            "revenue": 0.0, "campaigns": 0})
        s["revenue"] = round(s["revenue"] + c.get("total", 0), 2)
        s["campaigns"] += 1
    top_slots = sorted(slots.values(), key=lambda x: -x["revenue"])
    adv = {}
    for c in camps:
        await _maybe_expire(c)
        impr, clk, _, _ = await _agg(c["id"])
        a = adv.setdefault(c["user_id"], {"user_id": c["user_id"], "email": c.get("user_email"),
                                          "name": c.get("user_name"), "campaigns": 0, "active": 0,
                                          "spend": 0.0, "impressions": 0})
        a["campaigns"] += 1
        if c["status"] == "active":
            a["active"] += 1
        if c.get("payment_status") == "paid":
            a["spend"] = round(a["spend"] + c.get("total", 0), 2)
        a["impressions"] += impr
    advertisers = sorted(adv.values(), key=lambda x: -x["spend"])
    return {
        "total_revenue": round(sum(c.get("total", 0) for c in paid), 2),
        "paid_campaigns": len(paid),
        "pending": len([c for c in camps if c["status"] == "pending_approval"]),
        "active": len([c for c in camps if c["status"] == "active"]),
        "monthly": monthly, "top_slots": top_slots, "advertisers": advertisers,
    }


@router.get("/admin/placements")
async def admin_list_placements(request: Request):
    await _require_super(request)
    return await _db.ad_placements.find({}, {"_id": 0}).sort("sort", 1).to_list(50)


class PlacementUpdate(BaseModel):
    price_per_week: Optional[float] = Field(default=None, gt=0)
    enabled: Optional[bool] = None
    name: Optional[str] = None
    description: Optional[str] = None


@router.put("/admin/placements/{code}")
async def admin_update_placement(code: str, body: PlacementUpdate, request: Request):
    await _require_super(request)
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if not upd:
        raise HTTPException(400, "Nothing to update")
    r = await _db.ad_placements.update_one({"code": code}, {"$set": upd})
    if not r.matched_count:
        raise HTTPException(404, "Placement not found")
    return await _db.ad_placements.find_one({"code": code}, {"_id": 0})


# --------------------------------------------------------------------------- #
# Bootstrap
# --------------------------------------------------------------------------- #
async def seed_placements():
    for p in DEFAULT_PLACEMENTS:
        await _db.ad_placements.update_one({"code": p["code"]}, {"$setOnInsert": p}, upsert=True)


async def ensure_indexes():
    for f in ["user_id", "status", "placement_code", "payment_status"]:
        try:
            await _db.ad_campaigns.create_index(f)
        except Exception:
            pass
    try:
        await _db.ad_placements.create_index("code", unique=True)
    except Exception:
        pass
    try:
        await _db.ad_stats.create_index([("campaign_id", 1), ("date", 1)], unique=True)
    except Exception:
        pass

"""
buildecogroup.com — Phase 3C (ADDITIVE): Subscriptions, Invoicing, Commission Payouts.
Demo/mock payment mode (mirrors existing Razorpay demo). Reuses rbac + phase3 commission engine.
Non-destructive: nothing existing is removed.
"""
import uuid
import io
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from pymongo import ReturnDocument
import rbac

_db = None
_get_current_user = None


def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user


def now_utc(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat() if isinstance(dt, datetime) else dt
def new_id(p): return f"{p}_{uuid.uuid4().hex[:12]}"

DEFAULT_COMPANY_ID = "company_default"
GST = 0.18

public_router = APIRouter(prefix="/api", tags=["phase3c-billing"])
admin_router = APIRouter(prefix="/api/admin", tags=["phase3c-admin"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def next_invoice_number():
    year = now_utc().year
    doc = await _db.app_settings.find_one_and_update(
        {"key": f"invoice_counter_{year}"},
        {"$inc": {"value": 1}},
        upsert=True, return_document=ReturnDocument.AFTER)
    seq = (doc or {}).get("value", 1)
    return f"INV-{year}-{seq:04d}"


async def _create_invoice(user, inv_type, line_items, period=None, meta=None, company_id=None):
    subtotal = round(sum(float(li["amount"]) for li in line_items), 2)
    tax = round(subtotal * GST, 2)
    total = round(subtotal + tax, 2)
    number = await next_invoice_number()
    doc = {
        "id": new_id("inv"), "number": number, "type": inv_type,
        "user_id": user["id"], "user_email": user.get("email"), "user_name": user.get("name"),
        "company_id": company_id or user.get("company_id", DEFAULT_COMPANY_ID),
        "line_items": line_items, "subtotal": subtotal, "tax": tax, "tax_percent": round(GST * 100, 2),
        "total": total, "currency": "INR", "status": "pending",
        "period": period, "metadata": meta or {},
        "created_at": iso(now_utc()), "paid_at": None, "payment_ref": None,
    }
    await _db.invoices.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


async def _get_invoice_for(user, inv_id):
    inv = await _db.invoices.find_one({"id": inv_id}, {"_id": 0})
    if not inv:
        raise HTTPException(404, "Invoice not found")
    if inv["user_id"] != user["id"] and user.get("role") != "super_admin":
        raise HTTPException(403, "Forbidden")
    return inv


# ---------------------------------------------------------------------------
# Subscriptions
# ---------------------------------------------------------------------------
class SubscribeIn(BaseModel):
    plan_id: str


@public_router.post("/subscriptions/subscribe")
async def subscribe(body: SubscribeIn, request: Request):
    user = await _get_current_user(request)
    plan = await _db.plans.find_one({"id": body.plan_id}, {"_id": 0})
    if not plan:
        raise HTTPException(404, "Plan not found")
    if plan.get("price", 0) < 0:
        raise HTTPException(400, "This plan requires contacting sales")
    start = now_utc()
    period_days = 365 if plan.get("period") == "yr" else 30
    end = start + timedelta(days=period_days)
    is_free = plan.get("price", 0) == 0
    sub = {
        "id": new_id("sub"), "user_id": user["id"],
        "company_id": user.get("company_id", DEFAULT_COMPANY_ID),
        "plan_id": plan["id"], "plan_name": plan["name"], "price": plan.get("price", 0),
        "period": plan.get("period", "mo"), "status": "active" if is_free else "pending",
        "user_email": user.get("email"), "user_name": user.get("name"),
        "started_at": iso(start), "current_period_start": iso(start),
        "current_period_end": iso(end), "updated_at": iso(start),
    }
    existing = await _db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    if existing:
        sub["id"] = existing["id"]
    await _db.subscriptions.update_one({"user_id": user["id"]}, {"$set": sub}, upsert=True)
    invoice = None
    if not is_free:
        invoice = await _create_invoice(
            user, "subscription",
            [{"description": f"{plan['name']} plan subscription ({plan.get('period', 'mo')})",
              "qty": 1, "unit_price": plan["price"], "amount": plan["price"]}],
            period={"start": iso(start), "end": iso(end)},
            meta={"plan_id": plan["id"], "subscription_id": sub["id"]})
    await rbac.audit_log("CREATE", "settings", sub["id"], None, {"plan": plan["name"]},
                         user=user, request=request, metadata={"event": "SUBSCRIBE"})
    return {"subscription": sub, "invoice": invoice}


@public_router.get("/subscriptions/me")
async def my_subscription(request: Request):
    user = await _get_current_user(request)
    sub = await _db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    plan = await _db.plans.find_one({"id": sub["plan_id"]}, {"_id": 0}) if sub else None
    return {"subscription": sub, "plan": plan}


@public_router.post("/subscriptions/cancel")
async def cancel_subscription(request: Request):
    user = await _get_current_user(request)
    sub = await _db.subscriptions.find_one({"user_id": user["id"]}, {"_id": 0})
    if not sub:
        raise HTTPException(404, "No active subscription")
    await _db.subscriptions.update_one(
        {"user_id": user["id"]},
        {"$set": {"status": "cancelled", "cancelled_at": iso(now_utc()), "updated_at": iso(now_utc())}})
    await rbac.audit_log("EDIT", "settings", sub["id"], {"status": sub.get("status")}, {"status": "cancelled"},
                         user=user, request=request, metadata={"event": "CANCEL_SUBSCRIPTION"})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Invoices
# ---------------------------------------------------------------------------
@public_router.get("/invoices/me")
async def my_invoices(request: Request):
    user = await _get_current_user(request)
    return await _db.invoices.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


@public_router.get("/invoices/{inv_id}")
async def get_invoice(inv_id: str, request: Request):
    user = await _get_current_user(request)
    return await _get_invoice_for(user, inv_id)


@public_router.post("/invoices/{inv_id}/pay")
async def pay_invoice(inv_id: str, request: Request):
    user = await _get_current_user(request)
    inv = await _get_invoice_for(user, inv_id)
    if inv["status"] == "paid":
        return {"ok": True, "status": "paid"}
    ref = f"demo_{uuid.uuid4().hex[:10]}"
    await _db.invoices.update_one(
        {"id": inv_id},
        {"$set": {"status": "paid", "paid_at": iso(now_utc()), "payment_ref": ref, "mode": "demo"}})
    if inv["type"] == "subscription":
        sid = (inv.get("metadata") or {}).get("subscription_id")
        if sid:
            await _db.subscriptions.update_one(
                {"id": sid}, {"$set": {"status": "active", "updated_at": iso(now_utc())}})
    await rbac.audit_log("MANAGE", "settings", inv_id, {"status": inv["status"]}, {"status": "paid"},
                         user=user, request=request, metadata={"event": "INVOICE_PAID_DEMO"})
    return {"ok": True, "status": "paid", "mode": "demo", "payment_ref": ref}


@public_router.get("/invoices/{inv_id}/pdf")
async def invoice_pdf(inv_id: str, request: Request):
    user = await _get_current_user(request)
    inv = await _get_invoice_for(user, inv_id)
    pdf = _render_invoice_pdf(inv)
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="{inv["number"]}.pdf"'})


def _render_invoice_pdf(inv):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    orange = colors.HexColor("#FF5A1F")
    x = 20 * mm
    y = h - 25 * mm

    c.setFillColor(orange)
    c.rect(0, h - 12 * mm, w, 12 * mm, fill=1, stroke=0)

    c.setFillColor(orange)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(x, y, "buildecogroup.com")
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)
    c.drawString(x, y - 6 * mm, "Enterprise Construction SaaS")

    c.setFont("Helvetica-Bold", 16)
    c.drawRightString(w - x, y, "INVOICE")
    c.setFont("Helvetica", 10)
    c.drawRightString(w - x, y - 6 * mm, inv.get("number", ""))
    status = (inv.get("status") or "").upper()
    c.setFillColor(colors.HexColor("#10B981") if inv.get("status") == "paid" else colors.HexColor("#9CA3AF"))
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(w - x, y - 11 * mm, status)
    c.setFillColor(colors.black)

    y -= 22 * mm
    c.setFont("Helvetica-Bold", 9)
    c.drawString(x, y, "BILL TO")
    c.setFont("Helvetica", 10)
    c.drawString(x, y - 5 * mm, inv.get("user_name") or "-")
    c.drawString(x, y - 10 * mm, inv.get("user_email") or "-")

    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(w - x, y, "DETAILS")
    c.setFont("Helvetica", 9)
    created = (inv.get("created_at") or "")[:10]
    c.drawRightString(w - x, y - 5 * mm, f"Date: {created}")
    c.drawRightString(w - x, y - 10 * mm, f"Type: {inv.get('type', '')}")
    period = inv.get("period") or {}
    if period.get("label"):
        c.drawRightString(w - x, y - 15 * mm, f"Period: {period.get('label')}")

    # Table header
    y -= 26 * mm
    c.setFillColor(colors.HexColor("#111827"))
    c.rect(x, y, w - 2 * x, 8 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(x + 2 * mm, y + 2.5 * mm, "DESCRIPTION")
    c.drawRightString(w - x - 45 * mm, y + 2.5 * mm, "QTY")
    c.drawRightString(w - x - 22 * mm, y + 2.5 * mm, "RATE")
    c.drawRightString(w - x - 2 * mm, y + 2.5 * mm, "AMOUNT")
    c.setFillColor(colors.black)

    y -= 4 * mm
    c.setFont("Helvetica", 9)
    for li in inv.get("line_items", []):
        y -= 7 * mm
        desc = str(li.get("description", ""))[:70]
        c.drawString(x + 2 * mm, y, desc)
        c.drawRightString(w - x - 45 * mm, y, str(li.get("qty", 1)))
        c.drawRightString(w - x - 22 * mm, y, f"Rs {float(li.get('unit_price', 0)):,.2f}")
        c.drawRightString(w - x - 2 * mm, y, f"Rs {float(li.get('amount', 0)):,.2f}")
        c.setStrokeColor(colors.HexColor("#E5E7EB"))
        c.line(x, y - 2 * mm, w - x, y - 2 * mm)

    # Totals
    y -= 12 * mm
    c.setFont("Helvetica", 10)
    c.drawRightString(w - x - 22 * mm, y, "Subtotal")
    c.drawRightString(w - x - 2 * mm, y, f"Rs {inv.get('subtotal', 0):,.2f}")
    y -= 6 * mm
    c.drawRightString(w - x - 22 * mm, y, f"GST ({inv.get('tax_percent', 18)}%)")
    c.drawRightString(w - x - 2 * mm, y, f"Rs {inv.get('tax', 0):,.2f}")
    y -= 8 * mm
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(orange)
    c.drawRightString(w - x - 22 * mm, y, "TOTAL")
    c.drawRightString(w - x - 2 * mm, y, f"Rs {inv.get('total', 0):,.2f}")
    c.setFillColor(colors.black)

    if inv.get("payment_ref"):
        y -= 12 * mm
        c.setFont("Helvetica-Oblique", 8)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawString(x, y, f"Paid via {inv.get('mode', 'demo')} · Ref: {inv.get('payment_ref')}")
        c.setFillColor(colors.black)

    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#9CA3AF"))
    c.drawCentredString(w / 2, 15 * mm, "This is a system-generated invoice from buildecogroup.com · Demo billing mode")

    c.showPage()
    c.save()
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Admin: billing dashboard + commission payout run
# ---------------------------------------------------------------------------
@admin_router.get("/billing/summary")
async def billing_summary(user=Depends(rbac.rbac_admin)):
    invoices = await _db.invoices.find({}, {"_id": 0}).to_list(5000)
    subs = await _db.subscriptions.find({}, {"_id": 0}).to_list(5000)
    total_invoiced = round(sum(i.get("total", 0) for i in invoices), 2)
    total_paid = round(sum(i.get("total", 0) for i in invoices if i.get("status") == "paid"), 2)
    outstanding = round(sum(i.get("total", 0) for i in invoices if i.get("status") != "paid"), 2)
    total_commission = round(sum(i.get("subtotal", 0) for i in invoices if i.get("type") == "commission"), 2)
    active = [s for s in subs if s.get("status") == "active"]
    mrr = round(sum((s.get("price", 0) if s.get("period") == "mo" else s.get("price", 0) / 12) for s in active), 2)
    return {"total_invoiced": total_invoiced, "total_paid": total_paid, "outstanding": outstanding,
            "total_commission": total_commission, "active_subscriptions": len(active),
            "mrr": mrr, "invoice_count": len(invoices)}


@admin_router.get("/billing/invoices")
async def all_invoices(status: Optional[str] = None, type: Optional[str] = None, user=Depends(rbac.rbac_admin)):
    q = {}
    if status:
        q["status"] = status
    if type:
        q["type"] = type
    return await _db.invoices.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)


@admin_router.get("/billing/subscriptions")
async def all_subscriptions(user=Depends(rbac.rbac_admin)):
    return await _db.subscriptions.find({}, {"_id": 0}).sort("updated_at", -1).to_list(1000)


class RunCommissionIn(BaseModel):
    period: Optional[str] = None  # 'YYYY-MM'
    company_id: Optional[str] = None  # tenant scope (super_admin bills a specific tenant)


@admin_router.post("/billing/run-commission")
async def run_commission(body: RunCommissionIn, request: Request, user=Depends(rbac.rbac_admin)):
    import phase3
    cfg = await phase3.get_commission_config()
    now = now_utc()
    period = body.period or now.strftime("%Y-%m")
    year, month = map(int, period.split("-"))
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    end = datetime(year + (month // 12), (month % 12) + 1, 1, tzinfo=timezone.utc)

    order_q = {"status": "paid"}
    if body.company_id:  # tenant isolation: only orders belonging to this company
        order_q["company_id"] = body.company_id
    orders = await _db.orders.find(order_q, {"_id": 0}).to_list(10000)
    vendor_lines = {}
    for o in orders:
        raw = o.get("paid_at") or o.get("created_at")
        try:
            dt = datetime.fromisoformat(raw)
        except Exception:
            continue
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        if not (start <= dt < end):
            continue
        for it in o.get("items", []):
            pid = it.get("product_id")
            vendor_id = None
            if pid:
                prod = await _db.products.find_one({"id": pid}, {"_id": 0, "vendor_id": 1, "name": 1})
                if prod:
                    vendor_id = prod.get("vendor_id")
            if not vendor_id:
                continue
            line_total = it.get("price", 0) * it.get("qty", 1)
            pct = phase3.commission_for(cfg, it.get("category"))
            comm = round(line_total * pct / 100, 2)
            if comm <= 0:
                continue
            vendor_lines.setdefault(vendor_id, []).append({
                "description": f"Commission {pct}% on {it.get('name', pid)} (order {str(o['id'])[:14]})",
                "qty": it.get("qty", 1), "unit_price": comm, "amount": comm})

    created = []
    for vendor_id, lines in vendor_lines.items():
        existing = await _db.invoices.find_one({"type": "commission", "user_id": vendor_id, "period.label": period})
        if existing:
            continue
        vendor = await _db.users.find_one({"id": vendor_id}, {"_id": 0})
        if not vendor:
            continue
        inv = await _create_invoice(
            vendor, "commission", lines,
            period={"label": period, "start": iso(start), "end": iso(end)},
            meta={"kind": "commission_payout"},
            company_id=vendor.get("company_id", DEFAULT_COMPANY_ID))
        created.append(inv["number"])

    await rbac.audit_log("MANAGE", "settings", "commission_run", None,
                         {"period": period, "created": len(created)},
                         user=user, request=request, metadata={"event": "COMMISSION_RUN"})
    return {"ok": True, "period": period, "invoices_created": len(created), "numbers": created}


# ---------------------------------------------------------------------------
# Indexes
# ---------------------------------------------------------------------------
async def ensure_indexes():
    for coll, fields in {
        "invoices": ["user_id", "status", "type", "number", "company_id"],
        "subscriptions": ["user_id", "status", "company_id"],
    }.items():
        for f in fields:
            try:
                await _db[coll].create_index(f)
            except Exception:
                pass

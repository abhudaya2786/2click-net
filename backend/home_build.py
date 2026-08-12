"""
buildecogroup.com — Home Build Lifecycle: naksha → griha pravesh
Extends construction ERP with lifecycle stages, layout unlocks,
agreements, payment schedules, anonymous geo-RFQ, and trade rates.
"""
import math
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
import rbac

_db = None
_get_user = None

LIFECYCLE_STAGES = [
    "planning", "naksha", "sanction", "boq", "agreement",
    "foundation", "structure", "mep", "finishing", "griha_pravesh",
]

SEGMENTS = ["new_home", "villa", "interior", "renovation", "villa_upgrade"]

TRADES = ["electrical", "electronic", "plumbing", "paint_putty", "tiles", "aggregate", "logistics",
          "false_ceiling", "pvc_work", "fabrication", "gardening", "interior_decoration", "renovation", "vastu"]

LAYOUT_STEPS = [
    {"id": "layout_basic", "name": "Basic Floor Plan (Naksha)", "name_hi": "बेसिक फ्लोर प्लान", "price": 0, "free": True},
    {"id": "layout_boq", "name": "BOQ Unlock", "name_hi": "BOQ अनलॉक", "price": 499, "free": False},
    {"id": "layout_3d", "name": "3D Floor Map", "name_hi": "3D फ्लोर मैप", "price": 999, "free": False},
    {"id": "layout_electrical", "name": "Electrical Layout", "name_hi": "इलेक्ट्रिकल लेआउट", "price": 799, "free": False},
    {"id": "layout_plumbing", "name": "Plumbing Layout", "name_hi": "प्लंबिंग लेआउट", "price": 799, "free": False},
    {"id": "layout_interior", "name": "Interior Layout", "name_hi": "इंटीरियर लेआउट", "price": 1299, "free": False},
]

DEFAULT_MILESTONES = [
    {"stage": "planning", "label": "Planning & Requirement", "payment_pct": 5},
    {"stage": "naksha", "label": "Naksha / Layout Approval", "payment_pct": 10},
    {"stage": "sanction", "label": "Sanction & Permits", "payment_pct": 5},
    {"stage": "boq", "label": "BOQ Finalization", "payment_pct": 10},
    {"stage": "agreement", "label": "Agreement Signed", "payment_pct": 10},
    {"stage": "foundation", "label": "Foundation Complete", "payment_pct": 15},
    {"stage": "structure", "label": "Structure Complete", "payment_pct": 20},
    {"stage": "mep", "label": "MEP (Electrical/Plumbing)", "payment_pct": 15},
    {"stage": "finishing", "label": "Finishing & Interior", "payment_pct": 8},
    {"stage": "griha_pravesh", "label": "Griha Pravesh / Handover", "payment_pct": 2},
]

SEGMENT_CATALOG = {
    "interior": [
        {"name": "Modular Kitchen L-Shape", "unit": "set", "rate": 85000, "image": "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400"},
        {"name": "Wardrobe Sliding 8ft", "unit": "set", "rate": 32000, "image": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400"},
        {"name": "False Ceiling POP", "unit": "sqft", "rate": 95, "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"},
        {"name": "Vitrified Flooring", "unit": "sqft", "rate": 65, "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400"},
    ],
    "renovation": [
        {"name": "Bathroom Renovation Complete", "unit": "set", "rate": 125000, "image": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400"},
        {"name": "Wall Demolition + Debris", "unit": "sqft", "rate": 45, "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400"},
        {"name": "Waterproofing Terrace", "unit": "sqft", "rate": 85, "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400"},
    ],
    "villa_upgrade": [
        {"name": "Villa Extension 500 sqft", "unit": "sqft", "rate": 2200, "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"},
        {"name": "Swimming Pool Upgrade", "unit": "set", "rate": 450000, "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"},
        {"name": "Landscape Garden", "unit": "sqft", "rate": 120, "image": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400"},
    ],
    "new_home": [],
    "villa": [],
}

SEED_TRADE_RATES = [
    {"trade": "electrical", "name": "Electrical Wiring (concealed)", "unit": "sqft", "rate": 85},
    {"trade": "electrical", "name": "MCB Panel + Earthing", "unit": "set", "rate": 8500},
    {"trade": "electronic", "name": "CCTV 4-Camera Setup", "unit": "set", "rate": 18000},
    {"trade": "electronic", "name": "Smart Home Hub", "unit": "set", "rate": 12000},
    {"trade": "plumbing", "name": "CPVC Plumbing (per point)", "unit": "point", "rate": 2500},
    {"trade": "plumbing", "name": "Bathroom Fitting Labour", "unit": "bathroom", "rate": 15000},
    {"trade": "paint_putty", "name": "Interior Emulsion (2 coat)", "unit": "sqft", "rate": 28},
    {"trade": "paint_putty", "name": "Exterior Weatherproof", "unit": "sqft", "rate": 38},
    {"trade": "tiles", "name": "Vitrified Tile Laying", "unit": "sqft", "rate": 45},
    {"trade": "tiles", "name": "Wall Tile Laying", "unit": "sqft", "rate": 55},
    {"trade": "aggregate", "name": "River Sand Supply", "unit": "cft", "rate": 55},
    {"trade": "aggregate", "name": "20mm Aggregate", "unit": "cft", "rate": 42},
    {"trade": "logistics", "name": "Material Transport (10T)", "unit": "trip", "rate": 3500},
    {"trade": "logistics", "name": "Crane Hire (per day)", "unit": "day", "rate": 12000},
    {"trade": "false_ceiling", "name": "POP False Ceiling Labour", "unit": "sqft", "rate": 42},
    {"trade": "false_ceiling", "name": "Gypsum Ceiling Labour", "unit": "sqft", "rate": 48},
    {"trade": "pvc_work", "name": "UPVC Window Fitting", "unit": "sqft", "rate": 85},
    {"trade": "pvc_work", "name": "PVC Door Fitting", "unit": "piece", "rate": 1200},
    {"trade": "fabrication", "name": "MS Gate Fabrication Labour", "unit": "sqft", "rate": 180},
    {"trade": "fabrication", "name": "SS Railing Labour", "unit": "rft", "rate": 220},
    {"trade": "gardening", "name": "Landscape Labour", "unit": "sqft", "rate": 35},
    {"trade": "gardening", "name": "Artificial Grass Laying", "unit": "sqft", "rate": 28},
    {"trade": "interior_decoration", "name": "Modular Kitchen Install", "unit": "sqft", "rate": 350},
    {"trade": "interior_decoration", "name": "Wardrobe Installation", "unit": "sqft", "rate": 280},
    {"trade": "renovation", "name": "Bathroom Renovation Labour", "unit": "bathroom", "rate": 25000},
    {"trade": "renovation", "name": "Wall Demolition Labour", "unit": "sqft", "rate": 28},
    {"trade": "vastu", "name": "Vastu Consultation (on-site)", "unit": "visit", "rate": 5000},
]

router = APIRouter(prefix="/api/home", tags=["home-build"])
admin_router = APIRouter(prefix="/api/admin/home", tags=["home-build-admin"])


def init(db, get_current_user):
    global _db, _get_user
    _db = db
    _get_user = get_current_user


def now_utc():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def new_id(p):
    return f"{p}_{uuid.uuid4().hex[:12]}"


def haversine_km(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return 9999.0
    r = 6371.0
    p = math.pi / 180
    a = math.sin((lat2 - lat1) * p / 2) ** 2 + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin((lon2 - lon1) * p / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


async def _seed_trade_rates():
    if await _db.trade_labor_rates.count_documents({}) > 0:
        return
    for row in SEED_TRADE_RATES:
        doc = {**row, "id": new_id("tr"), "zone": "default", "status": "active", "created_at": iso(now_utc())}
        await _db.trade_labor_rates.insert_one(doc)


async def _project_access(proj, user):
    if user["role"] == "super_admin":
        return True
    if proj.get("customer_id") == user["id"]:
        return True
    if proj.get("owner_id") == user["id"]:
        return True
    if proj.get("assigned_architect_id") == user["id"]:
        return True
    if proj.get("assigned_engineer_id") == user["id"]:
        return True
    return False


async def _enrich_project(proj, user):
    pid = proj["id"]
    milestones = await _db.project_milestones.find({"project_id": pid}, {"_id": 0}).sort("order", 1).to_list(50)
    unlocks = await _db.layout_unlocks.find({"project_id": pid}, {"_id": 0}).to_list(20)
    unlocked_ids = {u["step_id"] for u in unlocks}
    agreement = await _db.project_agreements.find_one({"project_id": pid}, {"_id": 0})
    items = await _db.boq.find({"project_id": pid}, {"_id": 0}).to_list(500)
    boq_total = round(sum(i.get("amount", 0) for i in items), 2)
    schedules = await _db.payment_schedules.find({"project_id": pid}, {"_id": 0}).sort("order", 1).to_list(20)
    layouts = []
    for step in LAYOUT_STEPS:
        layouts.append({**step, "unlocked": step["free"] or step["id"] in unlocked_ids})
    return {
        **proj,
        "milestones": milestones,
        "layouts": layouts,
        "agreement": agreement,
        "boq_total": boq_total,
        "boq_items_count": len(items),
        "payment_schedules": schedules,
        "lifecycle_stages": LIFECYCLE_STAGES,
        "current_stage_index": LIFECYCLE_STAGES.index(proj.get("lifecycle_stage", "planning")) if proj.get("lifecycle_stage") in LIFECYCLE_STAGES else 0,
    }


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class HomeProjectIn(BaseModel):
    name: str
    client: str = ""
    budget: float = 0
    location: str = ""
    segment: str = "new_home"
    pincode: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    plot_area_sqft: Optional[float] = None
    floors: int = 1
    target_griha_pravesh: Optional[str] = None


class StageUpdateIn(BaseModel):
    lifecycle_stage: str
    notes: Optional[str] = None


class AssignTeamIn(BaseModel):
    assigned_architect_id: Optional[str] = None
    assigned_engineer_id: Optional[str] = None


class AgreementIn(BaseModel):
    boq_total: float
    advance_pct: float = 10
    delivery_days: int = 180
    terms: Optional[str] = None


class AgreementSignIn(BaseModel):
    accepted: bool = True


class UnlockLayoutIn(BaseModel):
    step_id: str
    payment_mode: str = "wallet"  # wallet | demo


class RFQIn(BaseModel):
    project_id: Optional[str] = None
    trade: str
    material_description: str
    quantity: float = 1
    unit: str = "unit"
    lat: float
    lng: float
    radius_km: float = Field(default=10, ge=2, le=30)


class RFQBidIn(BaseModel):
    amount: float
    delivery_days: int = 7
    note: str = ""


class TradeRateIn(BaseModel):
    trade: str
    name: str
    unit: str
    rate: float
    zone: str = "default"


async def _user(request: Request):
    return await _get_user(request)


# ---------------------------------------------------------------------------
# Public / catalog
# ---------------------------------------------------------------------------
@router.get("/catalog")
async def home_catalog():
    await _seed_trade_rates()
    return {
        "lifecycle_stages": LIFECYCLE_STAGES,
        "segments": SEGMENTS,
        "trades": TRADES,
        "layout_steps": LAYOUT_STEPS,
        "segment_catalog": SEGMENT_CATALOG,
    }


@router.get("/segment/{segment}")
async def segment_catalog(segment: str):
    if segment not in SEGMENTS:
        raise HTTPException(status_code=400, detail="Invalid segment")
    trade_rates = await _db.trade_labor_rates.find({"status": "active"}, {"_id": 0}).to_list(200)
    return {
        "segment": segment,
        "packages": SEGMENT_CATALOG.get(segment, []),
        "trade_rates": trade_rates,
    }


@router.get("/trade-rates")
async def list_trade_rates(trade: Optional[str] = None):
    await _seed_trade_rates()
    q = {"status": "active"}
    if trade:
        q["trade"] = trade
    return await _db.trade_labor_rates.find(q, {"_id": 0}).to_list(200)


# ---------------------------------------------------------------------------
# Projects (customer + contractor + team)
# ---------------------------------------------------------------------------
@router.get("/projects")
async def list_home_projects(request: Request):
    user = await _user(request)
    if user["role"] == "super_admin":
        q = {}
    elif user["role"] == "customer":
        q = {"customer_id": user["id"]}
    elif user["role"] == "contractor":
        q = {"$or": [{"owner_id": user["id"]}, {"assigned_engineer_id": user["id"]}]}
    elif user.get("user_type") in ("architect", "engineer"):
        q = {"$or": [{"assigned_architect_id": user["id"]}, {"assigned_engineer_id": user["id"]}]}
    else:
        q = {"owner_id": user["id"]}
    rows = await _db.projects.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    out = []
    for p in rows:
        out.append(await _enrich_project(p, user))
    return out


@router.post("/projects")
async def create_home_project(body: HomeProjectIn, request: Request):
    user = await _user(request)
    if body.segment not in SEGMENTS:
        raise HTTPException(status_code=400, detail="Invalid segment")
    doc = body.model_dump()
    doc.update({
        "id": new_id("proj"),
        "lifecycle_stage": "planning",
        "progress": 0,
        "status": "active",
        "created_at": iso(now_utc()),
        "unlocked_layouts": ["layout_basic"],
    })
    if user["role"] == "customer":
        doc["customer_id"] = user["id"]
        doc["client"] = doc.get("client") or user.get("name", "")
        doc["owner_id"] = user["id"]
    else:
        doc["owner_id"] = user["id"]
        if not doc.get("customer_id"):
            doc["customer_id"] = user["id"]
    await _db.projects.insert_one(dict(doc))
    for i, m in enumerate(DEFAULT_MILESTONES):
        ms = {
            "id": new_id("ms"),
            "project_id": doc["id"],
            "stage": m["stage"],
            "label": m["label"],
            "payment_pct": m["payment_pct"],
            "order": i,
            "status": "pending",
            "planned_date": None,
            "actual_date": None,
        }
        await _db.project_milestones.insert_one(ms)
    await _db.layout_unlocks.insert_one({
        "id": new_id("lu"),
        "project_id": doc["id"],
        "step_id": "layout_basic",
        "unlocked_at": iso(now_utc()),
        "price_paid": 0,
        "user_id": user["id"],
    })
    return await _enrich_project(doc, user)


@router.get("/projects/{project_id}")
async def get_home_project(project_id: str, request: Request):
    user = await _user(request)
    proj = await _db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await _project_access(proj, user):
        raise HTTPException(status_code=403, detail="Forbidden")
    return await _enrich_project(proj, user)


@router.patch("/projects/{project_id}/stage")
async def update_stage(project_id: str, body: StageUpdateIn, request: Request):
    user = await _user(request)
    if body.lifecycle_stage not in LIFECYCLE_STAGES:
        raise HTTPException(status_code=400, detail="Invalid stage")
    proj = await _db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    allowed = user["role"] in ("super_admin", "contractor") or user.get("user_type") in ("architect", "engineer")
    if not allowed:
        raise HTTPException(status_code=403, detail="Only architect/engineer/contractor/admin can update stage")
    idx = LIFECYCLE_STAGES.index(body.lifecycle_stage)
    progress = round((idx + 1) / len(LIFECYCLE_STAGES) * 100)
    await _db.projects.update_one({"id": project_id}, {"$set": {
        "lifecycle_stage": body.lifecycle_stage,
        "progress": progress,
        "stage_notes": body.notes,
        "stage_updated_at": iso(now_utc()),
    }})
    await _db.project_milestones.update_one(
        {"project_id": project_id, "stage": body.lifecycle_stage},
        {"$set": {"status": "in_progress", "actual_date": iso(now_utc())[:10]}},
    )
    return {"ok": True, "lifecycle_stage": body.lifecycle_stage, "progress": progress}


@router.patch("/projects/{project_id}/assign")
async def assign_team(project_id: str, body: AssignTeamIn, request: Request):
    user = await _user(request)
    if user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin only")
    await _db.projects.update_one({"id": project_id}, {"$set": body.model_dump(exclude_none=True)})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Agreement + payment schedule
# ---------------------------------------------------------------------------
@router.post("/projects/{project_id}/agreement")
async def create_agreement(project_id: str, body: AgreementIn, request: Request):
    user = await _user(request)
    proj = await _db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] not in ("super_admin", "contractor") and user.get("user_type") not in ("architect", "engineer"):
        raise HTTPException(status_code=403, detail="Forbidden")
    items = await _db.boq.find({"project_id": project_id}, {"_id": 0}).to_list(500)
    boq_total = body.boq_total or round(sum(i.get("amount", 0) for i in items), 2)
    advance = round(boq_total * body.advance_pct / 100, 2)
    agreement = {
        "id": new_id("agr"),
        "project_id": project_id,
        "boq_total": boq_total,
        "advance_pct": body.advance_pct,
        "advance_amount": advance,
        "delivery_days": body.delivery_days,
        "terms": body.terms or "Standard buildecogroup.com construction agreement. Rates approved by company architect & engineer.",
        "status": "draft",
        "created_by": user["id"],
        "created_at": iso(now_utc()),
        "signed_at": None,
        "signed_by": None,
    }
    await _db.project_agreements.delete_many({"project_id": project_id, "status": "draft"})
    await _db.project_agreements.insert_one(dict(agreement))
    await _db.payment_schedules.delete_many({"project_id": project_id})
    milestones = await _db.project_milestones.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(20)
    for i, m in enumerate(milestones):
        amt = round(boq_total * m["payment_pct"] / 100, 2)
        await _db.payment_schedules.insert_one({
            "id": new_id("ps"),
            "project_id": project_id,
            "milestone_id": m["id"],
            "stage": m["stage"],
            "label": m["label"],
            "payment_pct": m["payment_pct"],
            "amount": amt,
            "order": i,
            "status": "pending",
            "due_date": None,
        })
    await _db.projects.update_one({"id": project_id}, {"$set": {"lifecycle_stage": "agreement", "estimated_total": boq_total}})
    return agreement


@router.post("/projects/{project_id}/agreement/sign")
async def sign_agreement(project_id: str, body: AgreementSignIn, request: Request):
    user = await _user(request)
    proj = await _db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if proj.get("customer_id") != user["id"] and user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Only project owner can sign")
    agr = await _db.project_agreements.find_one({"project_id": project_id}, {"_id": 0})
    if not agr:
        raise HTTPException(status_code=404, detail="No agreement found")
    await _db.project_agreements.update_one({"id": agr["id"]}, {"$set": {
        "status": "signed",
        "signed_at": iso(now_utc()),
        "signed_by": user["id"],
    }})
    await _db.projects.update_one({"id": project_id}, {"$set": {"lifecycle_stage": "foundation", "agreement_signed": True}})
    return {"ok": True, "status": "signed"}


@router.get("/projects/{project_id}/agreement")
async def get_agreement(project_id: str, request: Request):
    user = await _user(request)
    proj = await _db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj or not await _project_access(proj, user):
        raise HTTPException(status_code=403, detail="Forbidden")
    agr = await _db.project_agreements.find_one({"project_id": project_id}, {"_id": 0})
    schedules = await _db.payment_schedules.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(20)
    return {"agreement": agr, "payment_schedules": schedules}


# ---------------------------------------------------------------------------
# Layout unlock
# ---------------------------------------------------------------------------
@router.post("/projects/{project_id}/unlock-layout")
async def unlock_layout(project_id: str, body: UnlockLayoutIn, request: Request):
    user = await _user(request)
    proj = await _db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj or not await _project_access(proj, user):
        raise HTTPException(status_code=403, detail="Forbidden")
    step = next((s for s in LAYOUT_STEPS if s["id"] == body.step_id), None)
    if not step:
        raise HTTPException(status_code=400, detail="Invalid layout step")
    existing = await _db.layout_unlocks.find_one({"project_id": project_id, "step_id": body.step_id})
    if existing or step.get("free"):
        return {"ok": True, "already_unlocked": True}
    price = step["price"]
    if price > 0 and body.payment_mode == "wallet":
        udoc = await _db.users.find_one({"id": user["id"]}, {"wallet": 1})
        bal = float((udoc or {}).get("wallet", 0))
        if bal < price:
            raise HTTPException(status_code=400, detail=f"Insufficient wallet balance. Need ₹{price}")
        await _db.users.update_one({"id": user["id"]}, {"$inc": {"wallet": -price}})
        await _db.wallet_transactions.insert_one({
            "id": new_id("wt"),
            "user_id": user["id"],
            "amount": -price,
            "type": "layout_unlock",
            "note": f"Unlocked {step['name']}",
            "created_at": iso(now_utc()),
        })
    await _db.layout_unlocks.insert_one({
        "id": new_id("lu"),
        "project_id": project_id,
        "step_id": body.step_id,
        "unlocked_at": iso(now_utc()),
        "price_paid": price,
        "user_id": user["id"],
    })
    return {"ok": True, "step_id": body.step_id, "price_paid": price}


# ---------------------------------------------------------------------------
# Anonymous geo RFQ
# ---------------------------------------------------------------------------
@router.post("/rfq")
async def create_rfq(body: RFQIn, request: Request):
    user = await _user(request)
    if body.trade not in TRADES:
        raise HTTPException(status_code=400, detail="Invalid trade")
    rfq = {
        "id": new_id("rfq"),
        **body.model_dump(),
        "customer_id": user["id"],
        "status": "open",
        "created_at": iso(now_utc()),
        "bids": [],
    }
    vendors = await _db.users.find(
        {"role": "vendor"},
        {"_id": 0, "id": 1, "name": 1, "lat": 1, "lng": 1, "service_area": 1},
    ).to_list(500)
    matched = []
    base_lat, base_lng = body.lat, body.lng
    for v in vendors:
        vlat = v.get("lat")
        vlng = v.get("lng")
        if vlat is None or vlng is None:
            # Demo fallback: spread vendors around request location for geo-RFQ testing
            import hashlib
            h = int(hashlib.md5(v["id"].encode()).hexdigest()[:8], 16)
            vlat = base_lat + ((h % 100) - 50) * 0.001
            vlng = base_lng + (((h // 100) % 100) - 50) * 0.001
        d = haversine_km(body.lat, body.lng, vlat, vlng)
        if d <= body.radius_km:
            matched.append({"vendor_id": v["id"], "distance_km": round(d, 2)})
    rfq["matched_vendors"] = len(matched)
    rfq["vendor_pool"] = matched
    await _db.material_rfqs.insert_one(dict(rfq))
    return {"ok": True, "rfq_id": rfq["id"], "matched_vendors": len(matched)}


@router.get("/rfq")
async def list_my_rfqs(request: Request):
    user = await _user(request)
    q = {"customer_id": user["id"]} if user["role"] == "customer" else {}
    if user["role"] == "vendor":
        q = {"vendor_pool.vendor_id": user["id"]}
    rows = await _db.material_rfqs.find(q if q else {}, {"_id": 0, "vendor_pool": 0}).sort("created_at", -1).to_list(100)
    for r in rows:
        anon_bids = []
        for i, b in enumerate(r.get("bids", [])):
            anon_bids.append({
                "ref": f"Vendor {chr(65 + i)}",
                "amount": b["amount"],
                "delivery_days": b.get("delivery_days"),
                "distance_km": b.get("distance_km"),
                "rank": i + 1,
            })
        anon_bids.sort(key=lambda x: x["amount"])
        for i, b in enumerate(anon_bids):
            b["rank"] = i + 1
        r["anonymous_bids"] = anon_bids
        r.pop("bids", None)
    return rows


@router.get("/rfq/vendor-inbox")
async def vendor_rfq_inbox(request: Request):
    user = await _user(request)
    if user["role"] != "vendor":
        raise HTTPException(status_code=403, detail="Vendors only")
    rows = await _db.material_rfqs.find({"status": "open"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    out = []
    for r in rows:
        pool = r.get("vendor_pool", [])
        if not any(p["vendor_id"] == user["id"] for p in pool):
            continue
        dist = next((p["distance_km"] for p in pool if p["vendor_id"] == user["id"]), None)
        already = any(b.get("vendor_id") == user["id"] for b in r.get("bids", []))
        out.append({
            "id": r["id"],
            "trade": r["trade"],
            "material_description": r["material_description"],
            "quantity": r["quantity"],
            "unit": r["unit"],
            "distance_km": dist,
            "already_bid": already,
            "created_at": r["created_at"],
        })
    return out


@router.post("/rfq/{rfq_id}/bid")
async def place_rfq_bid(rfq_id: str, body: RFQBidIn, request: Request):
    user = await _user(request)
    if user["role"] != "vendor":
        raise HTTPException(status_code=403, detail="Vendors only")
    rfq = await _db.material_rfqs.find_one({"id": rfq_id}, {"_id": 0})
    if not rfq or rfq.get("status") != "open":
        raise HTTPException(status_code=404, detail="RFQ not found or closed")
    pool = rfq.get("vendor_pool", [])
    entry = next((p for p in pool if p["vendor_id"] == user["id"]), None)
    if not entry:
        raise HTTPException(status_code=403, detail="Not in vendor pool for this RFQ")
    bid = {
        "id": new_id("rb"),
        "vendor_id": user["id"],
        "amount": body.amount,
        "delivery_days": body.delivery_days,
        "note": body.note,
        "distance_km": entry["distance_km"],
        "created_at": iso(now_utc()),
    }
    await _db.material_rfqs.update_one({"id": rfq_id}, {"$push": {"bids": bid}})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------
@admin_router.get("/rfq")
async def admin_list_rfqs(user=Depends(rbac.rbac_admin)):
    rows = await _db.material_rfqs.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    for r in rows:
        for b in r.get("bids", []):
            v = await _db.users.find_one({"id": b.get("vendor_id")}, {"_id": 0, "name": 1, "email": 1, "phone": 1})
            if v:
                b["vendor_name"] = v.get("name")
                b["vendor_email"] = v.get("email")
    return rows


@admin_router.post("/trade-rates")
async def admin_create_trade_rate(body: TradeRateIn, user=Depends(rbac.rbac_admin)):
    if body.trade not in TRADES:
        raise HTTPException(status_code=400, detail="Invalid trade")
    doc = {**body.model_dump(), "id": new_id("tr"), "status": "active", "created_at": iso(now_utc())}
    await _db.trade_labor_rates.insert_one(doc)
    return doc


@admin_router.put("/trade-rates/{rate_id}")
async def admin_update_trade_rate(rate_id: str, body: TradeRateIn, user=Depends(rbac.rbac_admin)):
    await _db.trade_labor_rates.update_one({"id": rate_id}, {"$set": body.model_dump()})
    return {"ok": True}


@admin_router.delete("/trade-rates/{rate_id}")
async def admin_delete_trade_rate(rate_id: str, user=Depends(rbac.rbac_admin)):
    await _db.trade_labor_rates.update_one({"id": rate_id}, {"$set": {"status": "inactive"}})
    return {"ok": True}


@admin_router.get("/trade-rates")
async def admin_list_trade_rates(user=Depends(rbac.rbac_admin)):
    await _seed_trade_rates()
    return await _db.trade_labor_rates.find({}, {"_id": 0}).to_list(500)


@admin_router.patch("/projects/{project_id}/approve-rates")
async def admin_approve_boq_rates(project_id: str, user=Depends(rbac.rbac_admin)):
    await _db.projects.update_one({"id": project_id}, {"$set": {"rates_approved": True, "rates_approved_by": user["id"], "rates_approved_at": iso(now_utc())}})
    return {"ok": True}

"""
2Click.in — Super Mart: construction material catalog, category-wise + brand-wise
with per-brand editable rates. Public read; Super-Admin managed CRUD. Feeds the
Material Calculator + Contractor BOQ ("add from Super Mart" at the brand rate).
Adds: category images, per-material rate history (price-trend), and 1-click BOQ
templates (e.g. 3BHK Villa) resolved at live cheapest-brand rates.
"""
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import rbac

_db = None


def init(db):
    global _db
    _db = db


def now_utc(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat() if isinstance(dt, datetime) else dt
def new_id(p): return f"{p}_{uuid.uuid4().hex[:12]}"

public_router = APIRouter(prefix="/api", tags=["mart-public"])
admin_router = APIRouter(prefix="/api/admin", tags=["mart-admin"])


class MaterialIn(BaseModel):
    category: str
    name: str
    brand: str
    unit: str = "unit"
    rate: float
    hsn: Optional[str] = None
    image: Optional[str] = None
    status: str = "active"


class MaterialUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    brand: Optional[str] = None
    unit: Optional[str] = None
    rate: Optional[float] = None
    hsn: Optional[str] = None
    image: Optional[str] = None
    status: Optional[str] = None


# category -> representative image (used on Mart cards + calculator)
CATEGORY_IMAGES = {
    "Cement": "https://images.pexels.com/photos/29817952/pexels-photo-29817952.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Steel & TMT": "https://images.unsplash.com/photo-1550041462-7e8602a4c4bc?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Bricks & Blocks": "https://images.unsplash.com/photo-1495578942200-c5f5d2137def?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Sand & Aggregate": "https://images.unsplash.com/photo-1631948856825-73b6c57b5345?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Paint": "https://images.unsplash.com/photo-1643822308521-1da534425d82?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Tiles": "https://images.unsplash.com/photo-1647102256335-7a7370d99924?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Plumbing": "https://images.pexels.com/photos/12142829/pexels-photo-12142829.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Electrical": "https://images.unsplash.com/photo-1584774354932-62ceb99e6053?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Plywood & Wood": "https://images.unsplash.com/photo-1422246654994-34520d5a0340?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Waterproofing": "https://images.unsplash.com/photo-1674485169641-bcb2bf6f1df9?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
}


# category -> [ (material_name, unit, [(brand, rate), ...]) ]
SEED = {
    "Cement": [
        ("OPC 53 Grade", "bag", [("UltraTech", 420), ("ACC", 410), ("Ambuja", 415), ("Dalmia", 400), ("JK Lakshmi", 395)]),
        ("PPC", "bag", [("UltraTech", 400), ("ACC", 390), ("Ambuja", 395), ("Ramco", 385)]),
        ("White Cement", "bag", [("Birla White", 1250), ("JK White", 1180)]),
    ],
    "Steel & TMT": [
        ("TMT Bar Fe500", "kg", [("TATA Tiscon", 68), ("JSW", 66), ("SAIL", 65), ("Jindal Panther", 64), ("Kamdhenu", 62)]),
        ("TMT Bar Fe550", "kg", [("TATA Tiscon", 71), ("JSW", 69), ("SAIL", 68)]),
        ("Binding Wire", "kg", [("TATA", 78), ("Local", 70)]),
    ],
    "Bricks & Blocks": [
        ("Red Clay Brick", "piece", [("Local", 8), ("Wienerberger", 13)]),
        ("Fly Ash Brick", "piece", [("Local", 6), ("Ecobrick", 7)]),
        ("AAC Block", "block", [("Aerocon", 55), ("Biltech", 52), ("Magicrete", 50)]),
    ],
    "Sand & Aggregate": [
        ("River Sand", "cft", [("Graded", 65), ("Local", 58)]),
        ("M-Sand", "cft", [("Robo", 55), ("Local", 50)]),
        ("20mm Aggregate", "cft", [("Graded", 45)]),
        ("10mm Aggregate", "cft", [("Graded", 48)]),
    ],
    "Paint": [
        ("Interior Emulsion", "litre", [("Asian Paints", 280), ("Berger", 260), ("Nerolac", 250), ("Dulux", 270)]),
        ("Exterior Emulsion", "litre", [("Asian Apex", 320), ("Berger Weathercoat", 300), ("Nerolac Excel", 290)]),
        ("Wall Primer", "litre", [("Asian", 180), ("Berger", 170)]),
    ],
    "Tiles": [
        ("Vitrified Tile", "sqft", [("Kajaria", 65), ("Somany", 60), ("Nitco", 58), ("Johnson", 62)]),
        ("Ceramic Floor Tile", "sqft", [("Kajaria", 45), ("Somany", 42)]),
        ("Wall Tile", "sqft", [("Kajaria", 48), ("Johnson", 46)]),
    ],
    "Plumbing": [
        ("CPVC Pipe", "meter", [("Astral", 120), ("Supreme", 110), ("Ashirvad", 115), ("Prince", 105)]),
        ("PVC Pipe", "meter", [("Supreme", 90), ("Finolex", 95), ("Prince", 85)]),
        ("Water Tank 1000L", "piece", [("Sintex", 6800), ("Plasto", 6200)]),
    ],
    "Electrical": [
        ("Wire 1.5 sqmm", "meter", [("Havells", 22), ("Polycab", 20), ("Finolex", 21), ("RR Kabel", 19)]),
        ("Wire 2.5 sqmm", "meter", [("Havells", 34), ("Polycab", 32), ("Finolex", 33)]),
        ("Modular Switch", "piece", [("Havells", 85), ("Anchor", 60), ("Legrand", 120), ("GM", 55)]),
        ("MCB 32A", "piece", [("Havells", 320), ("Schneider", 380), ("Legrand", 350)]),
    ],
    "Plywood & Wood": [
        ("Plywood 18mm", "sqft", [("Century", 95), ("Greenply", 90), ("Kitply", 80)]),
        ("Laminate Sheet", "sqft", [("Merino", 55), ("Greenlam", 60)]),
    ],
    "Waterproofing": [
        ("Waterproofing Coat", "kg", [("Dr Fixit", 240), ("Fosroc", 220), ("Asian SmartCare", 210)]),
    ],
}


# 1-click BOQ templates. Items resolve to the cheapest active brand at request time.
SEED_TEMPLATES = [
    {
        "id": "tpl_villa_3bhk", "name": "3BHK Villa", "area": "~1800 sqft",
        "description": "Complete material estimate for a standard 3BHK independent villa (G+1).",
        "image": "https://images.pexels.com/photos/7031594/pexels-photo-7031594.jpeg?auto=compress&cs=tinysrgb&w=800",
        "items": [
            {"category": "Cement", "name": "OPC 53 Grade", "qty": 350},
            {"category": "Steel & TMT", "name": "TMT Bar Fe500", "qty": 4500},
            {"category": "Bricks & Blocks", "name": "Red Clay Brick", "qty": 14000},
            {"category": "Sand & Aggregate", "name": "River Sand", "qty": 1200},
            {"category": "Sand & Aggregate", "name": "20mm Aggregate", "qty": 900},
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 1800},
            {"category": "Paint", "name": "Interior Emulsion", "qty": 120},
            {"category": "Paint", "name": "Exterior Emulsion", "qty": 80},
            {"category": "Plumbing", "name": "CPVC Pipe", "qty": 250},
            {"category": "Electrical", "name": "Wire 2.5 sqmm", "qty": 600},
            {"category": "Plywood & Wood", "name": "Plywood 18mm", "qty": 400},
            {"category": "Waterproofing", "name": "Waterproofing Coat", "qty": 150},
        ],
    },
    {
        "id": "tpl_flat_2bhk", "name": "2BHK Flat", "area": "~1000 sqft",
        "description": "Material estimate for a 2BHK apartment / flat interior + civil.",
        "image": "https://images.pexels.com/photos/35339499/pexels-photo-35339499.jpeg?auto=compress&cs=tinysrgb&w=800",
        "items": [
            {"category": "Cement", "name": "OPC 53 Grade", "qty": 180},
            {"category": "Steel & TMT", "name": "TMT Bar Fe500", "qty": 2400},
            {"category": "Bricks & Blocks", "name": "AAC Block", "qty": 1800},
            {"category": "Sand & Aggregate", "name": "River Sand", "qty": 650},
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 1000},
            {"category": "Paint", "name": "Interior Emulsion", "qty": 70},
            {"category": "Plumbing", "name": "CPVC Pipe", "qty": 150},
            {"category": "Electrical", "name": "Wire 2.5 sqmm", "qty": 350},
        ],
    },
    {
        "id": "tpl_boundary_wall", "name": "Boundary Wall", "area": "100 rft × 6 ft",
        "description": "Compound / boundary wall material estimate (brick masonry, 6 ft high).",
        "image": "https://images.unsplash.com/photo-1592795694703-24f1814cfb0a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "items": [
            {"category": "Cement", "name": "OPC 53 Grade", "qty": 60},
            {"category": "Steel & TMT", "name": "TMT Bar Fe500", "qty": 350},
            {"category": "Bricks & Blocks", "name": "Red Clay Brick", "qty": 4500},
            {"category": "Sand & Aggregate", "name": "River Sand", "qty": 220},
            {"category": "Paint", "name": "Exterior Emulsion", "qty": 30},
        ],
    },
]


def _gen_history(rate, seed_str):
    """Deterministic-per-material 6-point monthly price trend ending at the current rate."""
    rnd = random.Random(seed_str)
    n = 6
    start_factor = 1 - rnd.uniform(0.03, 0.14)
    pts = []
    now = now_utc()
    for i in range(n):
        frac = i / (n - 1)
        f = start_factor + (1.0 - start_factor) * frac
        f = 1.0 if i == n - 1 else f + rnd.uniform(-0.02, 0.02)
        d = now - timedelta(days=30 * (n - 1 - i))
        pts.append({"date": d.date().isoformat(), "rate": round(rate * f, 2)})
    return pts


# ---------------------------------------------------------------------------
# Public reads
# ---------------------------------------------------------------------------
@public_router.get("/mart/categories")
async def mart_categories():
    return await _db.materials.distinct("category", {"status": "active"})


@public_router.get("/mart/brands")
async def mart_brands(category: Optional[str] = None):
    q = {"status": "active"}
    if category and category != "all":
        q["category"] = category
    return await _db.materials.distinct("brand", q)


@public_router.get("/mart/materials")
async def mart_materials(category: Optional[str] = None, brand: Optional[str] = None, q: Optional[str] = None):
    query = {"status": "active"}
    if category and category != "all":
        query["category"] = category
    if brand and brand != "all":
        query["brand"] = brand
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    return await _db.materials.find(query, {"_id": 0}).sort([("category", 1), ("name", 1), ("rate", 1)]).to_list(1000)


@public_router.get("/mart/boq-templates")
async def list_boq_templates():
    return [{"id": t["id"], "name": t["name"], "description": t["description"],
             "image": t["image"], "area": t["area"], "items": len(t["items"])} for t in SEED_TEMPLATES]


@public_router.get("/mart/boq-templates/{tid}")
async def get_boq_template(tid: str):
    t = next((x for x in SEED_TEMPLATES if x["id"] == tid), None)
    if not t:
        raise HTTPException(404, "Template not found")
    lines = []
    for it in t["items"]:
        mat = await _db.materials.find_one(
            {"category": it["category"], "name": it["name"], "status": "active"},
            {"_id": 0}, sort=[("rate", 1)])
        if not mat:
            continue
        rate = float(mat["rate"])
        qty = float(it["qty"])
        lines.append({"name": mat["name"], "category": mat["category"], "brand": mat["brand"],
                      "unit": mat["unit"], "rate": rate, "qty": qty, "amount": round(rate * qty, 2)})
    total = round(sum(l["amount"] for l in lines), 2)
    return {"id": t["id"], "name": t["name"], "description": t["description"],
            "area": t["area"], "image": t["image"], "lines": lines, "total": total}


# ---------------------------------------------------------------------------
# Super-Admin managed CRUD (rates editable, rate history tracked)
# ---------------------------------------------------------------------------
@admin_router.get("/mart/materials")
async def admin_list_materials(user=Depends(rbac.rbac_admin)):
    return await _db.materials.find({}, {"_id": 0}).sort([("category", 1), ("name", 1), ("brand", 1)]).to_list(5000)


@admin_router.post("/mart/materials")
async def admin_create_material(body: MaterialIn, request: Request, user=Depends(rbac.rbac_admin)):
    data = body.model_dump()
    if not data.get("image"):
        data["image"] = CATEGORY_IMAGES.get(data["category"])
    doc = {"id": new_id("mat"), **data,
           "rate_history": [{"date": now_utc().date().isoformat(), "rate": float(data["rate"])}],
           "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
    await _db.materials.insert_one(dict(doc))
    await rbac.audit_log("CREATE", "materials", doc["id"], None, {"name": body.name, "brand": body.brand, "rate": body.rate}, user=user, request=request)
    doc.pop("_id", None)
    return doc


@admin_router.put("/mart/materials/{mid}")
async def admin_update_material(mid: str, body: MaterialUpdate, request: Request, user=Depends(rbac.rbac_admin)):
    old = await _db.materials.find_one({"id": mid}, {"_id": 0})
    if not old:
        raise HTTPException(404, "Material not found")
    upd = body.model_dump(exclude_unset=True)
    if not upd:
        return {"ok": True}
    upd["updated_at"] = iso(now_utc())
    await _db.materials.update_one({"id": mid}, {"$set": upd})
    if "rate" in upd and float(old.get("rate", 0)) != float(upd["rate"]):
        await _db.materials.update_one(
            {"id": mid},
            {"$push": {"rate_history": {"date": now_utc().date().isoformat(), "rate": float(upd["rate"])}}})
    await rbac.audit_log("EDIT", "materials", mid, old, upd, user=user, request=request)
    return {"ok": True}


@admin_router.delete("/mart/materials/{mid}")
async def admin_delete_material(mid: str, request: Request, user=Depends(rbac.rbac_admin)):
    await _db.materials.delete_one({"id": mid})
    await rbac.audit_log("DELETE", "materials", mid, None, None, user=user, request=request)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Indexes + Seed + Migrate
# ---------------------------------------------------------------------------
async def ensure_indexes():
    for f in ["category", "brand", "name", "status"]:
        try:
            await _db.materials.create_index(f)
        except Exception:
            pass


async def seed_mart():
    if await _db.materials.count_documents({}) > 0:
        return
    order = 0
    for category, items in SEED.items():
        for name, unit, brands in items:
            for brand, rate in brands:
                order += 1
                await _db.materials.insert_one({
                    "id": new_id("mat"), "category": category, "name": name,
                    "brand": brand, "unit": unit, "rate": float(rate), "hsn": None,
                    "image": CATEGORY_IMAGES.get(category), "status": "active", "sort_order": order,
                    "rate_history": _gen_history(float(rate), f"{category}-{name}-{brand}"),
                    "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                })


async def migrate_mart():
    """Idempotent backfill: add category image + rate history to older material docs."""
    async for m in _db.materials.find({}, {"_id": 0}):
        upd = {}
        if not m.get("image"):
            img = CATEGORY_IMAGES.get(m.get("category"))
            if img:
                upd["image"] = img
        if not m.get("rate_history"):
            upd["rate_history"] = _gen_history(float(m.get("rate", 0)), m["id"])
        if upd:
            await _db.materials.update_one({"id": m["id"]}, {"$set": upd})

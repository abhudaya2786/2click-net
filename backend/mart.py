"""
2Click.in — Super Mart: construction material catalog, category-wise + brand-wise
with per-brand editable rates. Public read; Super-Admin managed CRUD. Feeds the
Material Calculator + Contractor BOQ ("add from Super Mart" at the brand rate).
"""
import uuid
from datetime import datetime, timezone
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


# ---------------------------------------------------------------------------
# Super-Admin managed CRUD (rates editable)
# ---------------------------------------------------------------------------
@admin_router.get("/mart/materials")
async def admin_list_materials(user=Depends(rbac.rbac_admin)):
    return await _db.materials.find({}, {"_id": 0}).sort([("category", 1), ("name", 1), ("brand", 1)]).to_list(5000)


@admin_router.post("/mart/materials")
async def admin_create_material(body: MaterialIn, request: Request, user=Depends(rbac.rbac_admin)):
    doc = {"id": new_id("mat"), **body.model_dump(), "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
    await _db.materials.insert_one(dict(doc))
    await rbac.audit_log("CREATE", "materials", doc["id"], None, {"name": body.name, "brand": body.brand, "rate": body.rate}, user=user, request=request)
    doc.pop("_id", None)
    return doc


@admin_router.put("/mart/materials/{mid}")
async def admin_update_material(mid: str, body: dict, request: Request, user=Depends(rbac.rbac_admin)):
    old = await _db.materials.find_one({"id": mid}, {"_id": 0})
    if not old:
        raise HTTPException(404, "Material not found")
    body.pop("id", None)
    if "rate" in body:
        body["rate"] = float(body["rate"])
    body["updated_at"] = iso(now_utc())
    await _db.materials.update_one({"id": mid}, {"$set": body})
    await rbac.audit_log("EDIT", "materials", mid, old, body, user=user, request=request)
    return {"ok": True}


@admin_router.delete("/mart/materials/{mid}")
async def admin_delete_material(mid: str, request: Request, user=Depends(rbac.rbac_admin)):
    await _db.materials.delete_one({"id": mid})
    await rbac.audit_log("DELETE", "materials", mid, None, None, user=user, request=request)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Indexes + Seed
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
                    "image": None, "status": "active", "sort_order": order,
                    "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                })

"""
2Click.in — Phase 3 (ADDITIVE): Dynamic Categories, White-Label Branding,
Pricing Plans + Commission Engine. Public read endpoints + Super-Admin managed.
Reuses rbac.audit_log / rbac.rbac_admin. Nothing existing is removed.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
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
def slug(s): return "".join(c if c.isalnum() else "-" for c in s.lower()).strip("-")

DEFAULT_COMPANY_ID = "company_default"

public_router = APIRouter(prefix="/api", tags=["phase3-public"])
admin_router = APIRouter(prefix="/api/admin", tags=["phase3-admin"])


# ---------------------------------------------------------------------------
# Dynamic Categories (nested, typed: product | service | tender)
# ---------------------------------------------------------------------------
class CategoryIn(BaseModel):
    name: str
    type: str = "product"
    category_type: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    status: str = "active"

# NOTE: public GET /api/categories is now served by phase3a (nested Category Engine).
# The Phase 3 flat categories route was removed to avoid a duplicate route; admin
# category management also lives in phase3a. This keeps a single source of truth.

@admin_router.get("/categories")
async def list_categories(type: Optional[str] = None, user=Depends(rbac.rbac_admin)):
    q = {} if not type else {"$or": [{"category_type": type}, {"type": type}]}
    rows = await _db.categories.find(q, {"_id": 0}).sort([("category_type", 1), ("name", 1)]).to_list(1000)
    for r in rows:  # normalize legacy rows that used `type`
        if not r.get("category_type") and r.get("type"):
            r["category_type"] = r["type"]
    return rows

@admin_router.post("/categories")
async def create_category(body: CategoryIn, request: Request, user=Depends(rbac.rbac_admin)):
    ct = body.category_type or body.type or "general"
    doc = {"id": new_id("cat"), "name": body.name, "category_type": ct, "slug": slug(body.name),
           "parent_id": body.parent_id, "icon": body.icon, "image": None, "description": "",
           "status": body.status, "sort_order": 0, "metadata": {},
           "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
           "created_by": "system", "updated_by": "system"}
    await _db.categories.insert_one(dict(doc))
    await rbac.audit_log("CREATE", "categories", doc["id"], None, {"name": body.name, "category_type": ct}, user=user, request=request)
    doc.pop("_id", None)
    return doc

@admin_router.patch("/categories/{cid}")
async def update_category(cid: str, body: dict, request: Request, user=Depends(rbac.rbac_admin)):
    old = await _db.categories.find_one({"id": cid}, {"_id": 0})
    body.pop("id", None); body["updated_at"] = iso(now_utc())
    await _db.categories.update_one({"id": cid}, {"$set": body})
    await rbac.audit_log("EDIT", "categories", cid, old, body, user=user, request=request)
    return {"ok": True}

@admin_router.delete("/categories/{cid}")
async def delete_category(cid: str, request: Request, user=Depends(rbac.rbac_admin)):
    await _db.categories.update_one({"id": cid}, {"$set": {"status": "disabled", "updated_at": iso(now_utc())}})
    await rbac.audit_log("DELETE", "categories", cid, None, None, user=user, request=request)
    return {"ok": True}


# ---------------------------------------------------------------------------
# White-Label Branding (per company; default company drives public site)
# ---------------------------------------------------------------------------
@public_router.get("/branding")
async def get_branding(company_id: Optional[str] = None, slug: Optional[str] = None, host: Optional[str] = None):
    """Resolve tenant branding by explicit id, slug, custom_domain or subdomain (falls back to default)."""
    c = None
    if company_id:
        c = await _db.companies.find_one({"id": company_id}, {"_id": 0})
    if not c and slug:
        c = await _db.companies.find_one({"slug": slug}, {"_id": 0})
    if not c and host:
        h = host.split(":")[0].lower().strip()
        c = await _db.companies.find_one({"custom_domain": h}, {"_id": 0})
        if not c and "." in h:
            sub = h.split(".")[0]
            if sub not in ("www", "app", "localhost"):
                c = await _db.companies.find_one({"slug": sub}, {"_id": 0})
    if not c:
        c = await _db.companies.find_one({"id": DEFAULT_COMPANY_ID}, {"_id": 0})
    b = (c or {}).get("branding") or {}
    return {
        "company_id": (c or {}).get("id", DEFAULT_COMPANY_ID),
        "slug": (c or {}).get("slug") or "",
        "custom_domain": (c or {}).get("custom_domain") or "",
        "brand_name": b.get("brand_name") or (c or {}).get("name") or "2Click.in",
        "logo": b.get("logo") or "",
        "favicon": b.get("favicon") or "",
        "primary_color": b.get("primary_color") or "#FF5A1F",
        "accent_color": b.get("accent_color") or "#10B981",
        "tagline": b.get("tagline") or "The operating system for construction",
    }

@admin_router.patch("/branding")
async def update_branding(body: dict, request: Request, user=Depends(rbac.rbac_admin)):
    company_id = body.pop("company_id", DEFAULT_COMPANY_ID)
    old = await _db.companies.find_one({"id": company_id}, {"_id": 0})
    root = {}
    if "slug" in body:
        root["slug"] = slug(body.pop("slug") or "") or None
    if "custom_domain" in body:
        root["custom_domain"] = (body.pop("custom_domain") or "").strip().lower() or None
    branding = {**((old or {}).get("branding") or {}), **body}
    await _db.companies.update_one({"id": company_id}, {"$set": {"branding": branding, "updated_at": iso(now_utc()), **root}})
    await rbac.audit_log("EDIT", "settings", company_id, (old or {}).get("branding"), branding,
                         user=user, request=request, metadata={"section": "branding"})
    return {"ok": True, "branding": branding, **root}


# ---------------------------------------------------------------------------
# Pricing Plans
# ---------------------------------------------------------------------------
class PlanIn(BaseModel):
    name: str
    price: float
    period: str = "mo"
    description: str = ""
    features: List[str] = []
    highlight: bool = False
    status: str = "active"
    order: int = 0

@public_router.get("/plans")
async def public_plans():
    return await _db.plans.find({"status": "active"}, {"_id": 0}).sort("order", 1).to_list(50)

@admin_router.get("/plans")
async def list_plans(user=Depends(rbac.rbac_admin)):
    return await _db.plans.find({}, {"_id": 0}).sort("order", 1).to_list(50)

@admin_router.post("/plans")
async def create_plan(body: PlanIn, request: Request, user=Depends(rbac.rbac_admin)):
    doc = {"id": new_id("plan"), **body.model_dump(), "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
    await _db.plans.insert_one(dict(doc))
    await rbac.audit_log("CREATE", "settings", doc["id"], None, {"plan": body.name}, user=user, request=request)
    doc.pop("_id", None)
    return doc

@admin_router.patch("/plans/{pid}")
async def update_plan(pid: str, body: dict, request: Request, user=Depends(rbac.rbac_admin)):
    old = await _db.plans.find_one({"id": pid}, {"_id": 0})
    body.pop("id", None); body["updated_at"] = iso(now_utc())
    await _db.plans.update_one({"id": pid}, {"$set": body})
    await rbac.audit_log("EDIT", "settings", pid, old, body, user=user, request=request)
    return {"ok": True}

@admin_router.delete("/plans/{pid}")
async def delete_plan(pid: str, request: Request, user=Depends(rbac.rbac_admin)):
    await _db.plans.update_one({"id": pid}, {"$set": {"status": "disabled"}})
    await rbac.audit_log("DELETE", "settings", pid, None, None, user=user, request=request)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Commission Engine (global default % + per-category overrides)
# ---------------------------------------------------------------------------
async def get_commission_config():
    doc = await _db.app_settings.find_one({"key": "commission"}, {"_id": 0})
    if not doc:
        return {"default_percent": 5.0, "per_category": []}
    return doc.get("value", {"default_percent": 5.0, "per_category": []})

def commission_for(config, category=None):
    if category:
        for row in config.get("per_category", []):
            if row.get("category") == category:
                return float(row.get("percent", config.get("default_percent", 5.0)))
    return float(config.get("default_percent", 5.0))

@admin_router.get("/commission")
async def get_commission(user=Depends(rbac.rbac_admin)):
    return await get_commission_config()

@admin_router.put("/commission")
async def set_commission(body: dict, request: Request, user=Depends(rbac.rbac_admin)):
    old = await get_commission_config()
    value = {"default_percent": float(body.get("default_percent", 5.0)),
             "per_category": body.get("per_category", [])}
    await _db.app_settings.update_one({"key": "commission"},
                                      {"$set": {"key": "commission", "value": value, "updated_at": iso(now_utc())}},
                                      upsert=True)
    await rbac.audit_log("MANAGE", "settings", "commission", old, value, user=user, request=request,
                         metadata={"section": "commission"})
    return {"ok": True, "value": value}


# ---------------------------------------------------------------------------
# Indexes + Seed
# ---------------------------------------------------------------------------
async def ensure_indexes():
    for coll, fields in {
        "categories": ["type", "status", "parent_id", "slug"],
        "plans": ["status", "order"],
        "app_settings": ["key"],
        "companies": ["slug", "custom_domain"],
    }.items():
        for f in fields:
            try:
                await _db[coll].create_index(f)
            except Exception:
                pass

async def seed_phase3():
    # Categories
    if await _db.categories.count_documents({}) == 0:
        product_cats = ["Steel & TMT", "Cement", "Bricks & Blocks", "Solar", "Aggregates",
                        "Plumbing", "Electricals", "Paints & Finishes", "Concrete", "Hardware"]
        service_cats = ["Construction & Projects", "Solar EPC", "Architecture & Design",
                        "Logistics & Fleet", "Tendering & Bidding", "Interior Design",
                        "Structural Consulting", "GST & Accounting"]
        tender_cats = ["Steel & TMT", "Solar", "Concrete", "Civil Works", "Electrical", "Road & Infra"]
        for lst, typ in [(product_cats, "product"), (service_cats, "service"), (tender_cats, "tender")]:
            for name in lst:
                await _db.categories.insert_one({
                    "id": new_id("cat"), "name": name, "type": typ, "slug": slug(name),
                    "parent_id": None, "icon": None, "status": "active",
                    "created_at": iso(now_utc()), "updated_at": iso(now_utc())})

    # Pricing plans
    if await _db.plans.count_documents({}) == 0:
        plans = [
            {"name": "Starter", "price": 0, "period": "mo", "description": "For individual buyers & small vendors",
             "features": ["Marketplace access", "Up to 5 tenders/mo", "1 user", "Community support"],
             "highlight": False, "order": 1},
            {"name": "Business", "price": 4999, "period": "mo", "description": "For growing vendors & contractors",
             "features": ["Everything in Starter", "Unlimited tenders & auctions", "Construction ERP",
                          "10 users + RBAC", "AI assistant", "Priority support"], "highlight": True, "order": 2},
            {"name": "Enterprise", "price": -1, "period": "", "description": "For large firms & marketplaces",
             "features": ["Everything in Business", "Unlimited users & roles", "Dedicated success manager",
                          "Custom integrations", "SLA & on-prem option", "White-label"], "highlight": False, "order": 3},
        ]
        for p in plans:
            await _db.plans.insert_one({"id": new_id("plan"), **p, "status": "active",
                                        "created_at": iso(now_utc()), "updated_at": iso(now_utc())})

    # Commission config
    if not await _db.app_settings.find_one({"key": "commission"}):
        await _db.app_settings.insert_one({"key": "commission", "value": {
            "default_percent": 5.0,
            "per_category": [{"category": "Solar", "percent": 3.0}, {"category": "Steel & TMT", "percent": 2.5}],
        }, "updated_at": iso(now_utc())})

    # Ensure default company branding
    c = await _db.companies.find_one({"id": DEFAULT_COMPANY_ID}, {"_id": 0})
    if c and not (c.get("branding") or {}).get("brand_name"):
        await _db.companies.update_one({"id": DEFAULT_COMPANY_ID}, {"$set": {"branding": {
            "brand_name": "2Click.in", "logo": "", "primary_color": "#FF5A1F",
            "tagline": "The operating system for construction",
        }}})

"""
2click.in — Consultant panel: exterior, interior, architect, vastu & more.
Roles + experience levels; public browse + consultant self-service profile.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
import rbac

_db = None
_get_current_user = None

router = APIRouter(prefix="/api/consultants", tags=["consultants"])

CONSULTANT_ROLES = [
    {"id": "exterior", "name": "Exterior Consultant", "name_hi": "एक्सटीरियर कंसल्टेंट",
     "desc": "Building elevation, facade, cladding & exterior finishes", "icon": "building"},
    {"id": "interior", "name": "Interior Consultant", "name_hi": "इंटीरियर कंसल्टेंट",
     "desc": "Interior design, modular, false ceiling, décor planning", "icon": "sofa"},
    {"id": "architect", "name": "Architect", "name_hi": "आर्किटेक्ट",
     "desc": "Architectural design, naksha, 3D, approvals", "icon": "compass"},
    {"id": "vastu", "name": "Vastu Consultant", "name_hi": "वास्तु कंसल्टेंट",
     "desc": "Vastu planning, site analysis, remedy guidance", "icon": "compass"},
    {"id": "structural", "name": "Structural Engineer", "name_hi": "स्ट्रक्चरल इंजीनियर",
     "desc": "Structural design, RCC, steel, load calculations", "icon": "ruler"},
    {"id": "landscape", "name": "Landscape Consultant", "name_hi": "लैंडस्केप कंसल्टेंट",
     "desc": "Gardening, landscaping, outdoor design", "icon": "leaf"},
    {"id": "real_estate", "name": "Real Estate Advisor", "name_hi": "रियल एस्टेट सलाहकार",
     "desc": "Property purchase, land deals, RERA, lease & investment advisory", "icon": "building"},
]

EXPERIENCE_LEVELS = [
    {"id": "fresher", "label": "Fresher (0–2 yrs)", "label_hi": "नया (0–2 वर्ष)", "min_years": 0, "max_years": 2},
    {"id": "junior", "label": "Junior (2–5 yrs)", "label_hi": "जूनियर (2–5 वर्ष)", "min_years": 2, "max_years": 5},
    {"id": "mid", "label": "Mid-level (5–10 yrs)", "label_hi": "मिड (5–10 वर्ष)", "min_years": 5, "max_years": 10},
    {"id": "senior", "label": "Senior (10–15 yrs)", "label_hi": "सीनियर (10–15 वर्ष)", "min_years": 10, "max_years": 15},
    {"id": "expert", "label": "Expert (15+ yrs)", "label_hi": "एक्सपर्ट (15+ वर्ष)", "min_years": 15, "max_years": 99},
]

ROLE_IDS = {r["id"] for r in CONSULTANT_ROLES}
LEVEL_IDS = {l["id"] for l in EXPERIENCE_LEVELS}

# user types that may register as consultants
CONSULTANT_USER_TYPES = {
    "freelancer", "architect", "engineer", "ca", "service_provider",
    "interior_consultant", "exterior_consultant", "vastu_consultant",
    "real_estate_advisor",
}


def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user


def now_utc():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def new_id(p):
    return f"{p}_{uuid.uuid4().hex[:12]}"


def level_from_years(years: int) -> str:
    y = max(0, int(years or 0))
    for lv in EXPERIENCE_LEVELS:
        if y >= lv["min_years"] and y < lv["max_years"]:
            return lv["id"]
    return "expert"


def role_meta(role_id: str):
    return next((r for r in CONSULTANT_ROLES if r["id"] == role_id), None)


def level_meta(level_id: str):
    return next((l for l in EXPERIENCE_LEVELS if l["id"] == level_id), None)


class ConsultantProfileIn(BaseModel):
    consultant_role: str
    experience_years: int = Field(ge=0, le=60)
    title: Optional[str] = None
    title_hi: Optional[str] = None
    bio: Optional[str] = None
    bio_hi: Optional[str] = None
    specializations: Optional[List[str]] = None
    projects_completed: Optional[int] = None
    service_area: Optional[str] = None
    expected_pricing: Optional[str] = None
    portfolio_url: Optional[str] = None
    availability: Optional[str] = None


async def _build_public_card(user: dict, profile: dict):
    role = profile.get("consultant_role") or _default_role_for_user_type(user.get("user_type"))
    role_info = role_meta(role) or {}
    level_id = profile.get("experience_level") or level_from_years(profile.get("experience_years", 0))
    level_info = level_meta(level_id) or {}
    ucs = await _db.user_categories.find({"user_id": user["id"]}, {"_id": 0}).to_list(30)
    cat_ids = [x["category_id"] for x in ucs]
    cats = await _db.categories.find({"id": {"$in": cat_ids}}, {"_id": 0, "name": 1}).to_list(30) if cat_ids else []
    return {
        "id": user["id"],
        "name": user.get("name"),
        "company": user.get("company"),
        "user_type": user.get("user_type"),
        "consultant_role": role,
        "role_name": role_info.get("name"),
        "role_name_hi": role_info.get("name_hi"),
        "experience_years": profile.get("experience_years", 0),
        "experience_level": level_id,
        "experience_label": level_info.get("label"),
        "experience_label_hi": level_info.get("label_hi"),
        "title": profile.get("title"),
        "title_hi": profile.get("title_hi"),
        "bio": profile.get("bio"),
        "bio_hi": profile.get("bio_hi"),
        "specializations": profile.get("specializations") or user.get("skills") or [],
        "projects_completed": profile.get("projects_completed", 0),
        "service_area": profile.get("service_area") or user.get("service_area"),
        "expected_pricing": profile.get("expected_pricing") or user.get("expected_pricing"),
        "portfolio_url": profile.get("portfolio_url") or user.get("portfolio_url"),
        "availability": profile.get("availability") or user.get("availability"),
        "categories": [c["name"] for c in cats],
        "rating": user.get("rating", 4.6),
        "verified": profile.get("verified", False),
    }


def _default_role_for_user_type(ut: str) -> str:
    return {
        "architect": "architect",
        "engineer": "structural",
        "interior_consultant": "interior",
        "exterior_consultant": "exterior",
        "vastu_consultant": "vastu",
        "real_estate_advisor": "real_estate",
    }.get(ut, "interior")


@router.get("/meta")
async def consultants_meta():
    return {"roles": CONSULTANT_ROLES, "experience_levels": EXPERIENCE_LEVELS}


@router.get("")
async def list_consultants(
    role: Optional[str] = None,
    experience: Optional[str] = None,
    q: Optional[str] = None,
    min_years: Optional[int] = None,
):
    query = {"status": "active"}
    if role and role in ROLE_IDS:
        query["consultant_role"] = role
    profiles = await _db.consultant_profiles.find(query, {"_id": 0}).to_list(500)
    if not profiles:
        return []
    user_ids = [p["user_id"] for p in profiles]
    users = await _db.users.find(
        {"id": {"$in": user_ids}, "status": {"$ne": "disabled"}},
        {"_id": 0, "password_hash": 0},
    ).to_list(500)
    user_map = {u["id"]: u for u in users}
    out = []
    for p in profiles:
        u = user_map.get(p["user_id"])
        if not u:
            continue
        if q and q.lower() not in (u.get("name") or "").lower():
            if not any(q.lower() in (s or "").lower() for s in (p.get("specializations") or [])):
                continue
        if experience and experience in LEVEL_IDS and p.get("experience_level") != experience:
            continue
        if min_years is not None and int(p.get("experience_years", 0)) < min_years:
            continue
        out.append(await _build_public_card(u, p))
    out.sort(key=lambda x: (-x.get("rating", 0), -x.get("experience_years", 0)))
    return out


@router.get("/{uid}")
async def get_consultant(uid: str):
    profile = await _db.consultant_profiles.find_one({"user_id": uid, "status": "active"}, {"_id": 0})
    if not profile:
        raise HTTPException(404, "Consultant not found")
    user = await _db.users.find_one({"id": uid}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(404, "Consultant not found")
    return await _build_public_card(user, profile)


@router.get("/me/profile")
async def my_consultant_profile(request: Request):
    user = await _get_current_user(request)
    profile = await _db.consultant_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        return {"has_profile": False, "user_id": user["id"], "eligible": user.get("user_type") in CONSULTANT_USER_TYPES}
    return {"has_profile": True, **profile, "eligible": True}


@router.put("/me/profile")
async def update_consultant_profile(body: ConsultantProfileIn, request: Request):
    user = await _get_current_user(request)
    if body.consultant_role not in ROLE_IDS:
        raise HTTPException(400, "Invalid consultant role")
    if user.get("user_type") not in CONSULTANT_USER_TYPES and user.get("role") != "super_admin":
        raise HTTPException(403, "Your account type cannot register as consultant")
    level_id = level_from_years(body.experience_years)
    now = iso(now_utc())
    doc = {
        "user_id": user["id"],
        "consultant_role": body.consultant_role,
        "experience_years": body.experience_years,
        "experience_level": level_id,
        "title": body.title,
        "title_hi": body.title_hi,
        "bio": body.bio,
        "bio_hi": body.bio_hi,
        "specializations": body.specializations or [],
        "projects_completed": body.projects_completed or 0,
        "service_area": body.service_area,
        "expected_pricing": body.expected_pricing,
        "portfolio_url": body.portfolio_url,
        "availability": body.availability,
        "status": "active",
        "updated_at": now,
    }
    existing = await _db.consultant_profiles.find_one({"user_id": user["id"]})
    if existing:
        await _db.consultant_profiles.update_one({"user_id": user["id"]}, {"$set": doc})
        profile_id = existing["id"]
    else:
        profile_id = new_id("cns")
        doc["id"] = profile_id
        doc["verified"] = False
        doc["created_at"] = now
        await _db.consultant_profiles.insert_one(dict(doc))
    # sync key fields to user record for freelancer listing compatibility
    sync = {}
    if body.service_area:
        sync["service_area"] = body.service_area
    if body.expected_pricing:
        sync["expected_pricing"] = body.expected_pricing
    if body.portfolio_url:
        sync["portfolio_url"] = body.portfolio_url
    if body.availability:
        sync["availability"] = body.availability
    if body.specializations:
        sync["skills"] = body.specializations
    if sync:
        await _db.users.update_one({"id": user["id"]}, {"$set": sync})
    await rbac.audit_log("UPDATE", "consultant_profiles", profile_id, None, {"role": body.consultant_role}, user=user, request=request)
    return {"ok": True, "id": profile_id, "experience_level": level_id}


async def ensure_indexes():
    for f in ["user_id", "consultant_role", "experience_level", "status"]:
        try:
            await _db.consultant_profiles.create_index(f)
        except Exception:
            pass


async def seed_consultants():
    """Seed demo consultant profiles (idempotent)."""
    demos = [
        ("architect", "architect", "Priya Sharma", 12, "Senior Architect — residential & villa"),
        ("interior", "interior", "Rahul Verma", 8, "Interior designer — modular kitchens & wardrobes"),
        ("exterior", "exterior", "Amit Khanna", 15, "Exterior facade & elevation specialist"),
        ("vastu", "vastu", "Dr. Meena Joshi", 20, "Certified Vastu consultant — residential & commercial"),
        ("structural", "structural", "Vikram Singh", 14, "Structural engineer — RCC & steel"),
        ("landscape", "landscape", "Sneha Patel", 6, "Landscape & gardening consultant"),
        ("real_estate", "real_estate_advisor", "Rajesh Malhotra", 18, "Real estate advisor — plots, RERA, commercial deals"),
    ]
    for role, ut_suffix, name, years, bio in demos:
        email = f"demo.{role}@2click.in"
        user = await _db.users.find_one({"email": email})
        if not user:
            uid = new_id("user")
            user = {
                "id": uid, "name": name, "email": email,
                "password_hash": "demo", "role": "customer",
                "user_type": "architect" if role == "architect" else ("real_estate_advisor" if role == "real_estate" else "freelancer"),
                "default_dashboard": "freelancer",
                "rating": 4.5 + (years % 5) * 0.1,
                "company_id": "company_default", "auth": "jwt",
                "created_at": iso(now_utc()),
            }
            await _db.users.insert_one(dict(user))
        if await _db.consultant_profiles.find_one({"user_id": user["id"]}):
            continue
        level_id = level_from_years(years)
        role_info = role_meta(role)
        await _db.consultant_profiles.insert_one({
            "id": new_id("cns"), "user_id": user["id"],
            "consultant_role": role,
            "experience_years": years,
            "experience_level": level_id,
            "title": role_info.get("name") if role_info else role,
            "title_hi": role_info.get("name_hi"),
            "bio": bio,
            "specializations": [role_info.get("name", role)] if role_info else [],
            "projects_completed": years * 3,
            "service_area": "Delhi NCR",
            "expected_pricing": "₹500–2000/sqft",
            "verified": True,
            "status": "active",
            "created_at": iso(now_utc()),
            "updated_at": iso(now_utc()),
        })

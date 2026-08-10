"""
2Click.in — Site customization (super_admin), geo lookup (pincode/state/city/GPS).
Public read for applied theme/languages; write endpoints are super_admin only.
"""
import math
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
import rbac

_db = None
DEFAULT_COMPANY_ID = "company_default"

public_router = APIRouter(prefix="/api", tags=["site-config-public"])
admin_router = APIRouter(prefix="/api/admin", tags=["site-config-admin"])

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
    "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
]

CITIES_BY_STATE = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
    "Delhi": ["New Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Gorakhpur", "Varanasi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
    "Telangana": ["Hyderabad", "Warangal"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode"],
}

# Seed pincode → geo (expandable via admin)
PINCODE_SEED = [
    {"pincode": "400001", "state": "Maharashtra", "city": "Mumbai", "district": "Mumbai", "lat": 18.9388, "lng": 72.8354},
    {"pincode": "411001", "state": "Maharashtra", "city": "Pune", "district": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"pincode": "110001", "state": "Delhi", "city": "New Delhi", "district": "Central Delhi", "lat": 28.6139, "lng": 77.2090},
    {"pincode": "560001", "state": "Karnataka", "city": "Bengaluru", "district": "Bengaluru Urban", "lat": 12.9716, "lng": 77.5946},
    {"pincode": "380001", "state": "Gujarat", "city": "Ahmedabad", "district": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
    {"pincode": "201301", "state": "Uttar Pradesh", "city": "Noida", "district": "Gautam Buddha Nagar", "lat": 28.5355, "lng": 77.3910},
    {"pincode": "122001", "state": "Haryana", "city": "Gurugram", "district": "Gurugram", "lat": 28.4595, "lng": 77.0266},
    {"pincode": "273001", "state": "Uttar Pradesh", "city": "Gorakhpur", "district": "Gorakhpur", "lat": 26.7606, "lng": 83.3732},
    {"pincode": "396191", "state": "Gujarat", "city": "Vapi", "district": "Valsad", "lat": 20.3893, "lng": 72.9106},
    {"pincode": "700001", "state": "West Bengal", "city": "Kolkata", "district": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    {"pincode": "500001", "state": "Telangana", "city": "Hyderabad", "district": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"pincode": "302001", "state": "Rajasthan", "city": "Jaipur", "district": "Jaipur", "lat": 26.9124, "lng": 75.7873},
]

DEFAULT_THEME = {
    "default_theme": "light",
    "layout": "standard",
    "navbar_style": "sticky",
    "icon_mode": "hardhat",
    "support_badge_url": "",
    "footer_text": "",
    "hero_layout": "split",
    "card_style": "rounded",
    "enabled_languages": ["en", "hi"],
    "default_language": "en",
}

DEFAULT_LOCALE_STRINGS = {
    "nav.marketplace": {"en": "Marketplace", "hi": "मार्केट"},
    "nav.tenders": {"en": "Tenders", "hi": "टेंडर"},
    "nav.solar": {"en": "Solar", "hi": "सोलर"},
    "nav.mart": {"en": "Super Mart", "hi": "सुपर मार्ट"},
    "nav.pricing": {"en": "Pricing", "hi": "प्लान"},
    "nav.login": {"en": "Log in", "hi": "लॉग इन"},
    "nav.register": {"en": "Sign up", "hi": "रजिस्टर"},
    "hero.cta": {"en": "Get started free", "hi": "मुफ़्त शुरू करें"},
    "location.state": {"en": "State", "hi": "राज्य"},
    "location.city": {"en": "City", "hi": "शहर"},
    "location.pincode": {"en": "Pincode", "hi": "पिनकोड"},
    "location.gps": {"en": "Use GPS", "hi": "GPS लोकेशन"},
}


def init(db):
    global _db
    _db = db


def now_utc():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def haversine_km(lat1, lng1, lat2, lng2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2 - lat1), math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


async def _branding_doc(company_id: str = DEFAULT_COMPANY_ID):
    c = await _db.companies.find_one({"id": company_id}, {"_id": 0}) or {}
    b = c.get("branding") or {}
    theme = {**DEFAULT_THEME, **(b.get("theme") or {})}
    return {
        "company_id": c.get("id", company_id),
        "brand_name": b.get("brand_name") or c.get("name") or "2Click.in",
        "logo": b.get("logo") or "",
        "favicon": b.get("favicon") or "",
        "primary_color": b.get("primary_color") or "#FF5A1F",
        "accent_color": b.get("accent_color") or "#10B981",
        "tagline": b.get("tagline") or "The operating system for construction",
        "slug": c.get("slug") or "",
        "custom_domain": c.get("custom_domain") or "",
        "theme": theme,
    }


async def _locale_config():
    doc = await _db.app_settings.find_one({"key": "locales"}, {"_id": 0})
    val = (doc or {}).get("value") or {}
    strings = {**DEFAULT_LOCALE_STRINGS, **(val.get("strings") or {})}
    enabled = val.get("enabled") or DEFAULT_THEME["enabled_languages"]
    default = val.get("default") or DEFAULT_THEME["default_language"]
    return {"enabled": enabled, "default": default, "strings": strings}


# ----- Public geo -----
@public_router.get("/geo/states")
async def list_states():
    return {"states": INDIAN_STATES}


@public_router.get("/geo/cities")
async def list_cities(state: str):
    if not state:
        raise HTTPException(400, "state required")
    cities = CITIES_BY_STATE.get(state)
    if cities:
        return {"state": state, "cities": cities}
    rows = await _db.geo_master.find({"state": state}, {"_id": 0, "city": 1}).to_list(500)
    uniq = sorted({r["city"] for r in rows if r.get("city")})
    return {"state": state, "cities": uniq or [state]}


@public_router.get("/geo/pincode/{pincode}")
async def pincode_lookup(pincode: str):
    code = "".join(c for c in pincode if c.isdigit())
    if len(code) != 6:
        raise HTTPException(400, "Pincode must be 6 digits")
    row = await _db.geo_master.find_one({"pincode": code}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Pincode not found")
    return row


@public_router.get("/geo/reverse")
async def reverse_geocode(lat: float, lng: float):
    """Nearest seeded pincode for state/city hint."""
    rows = await _db.geo_master.find({}, {"_id": 0}).to_list(500)
    if not rows:
        return {"state": "", "city": "", "pincode": "", "lat": lat, "lng": lng}
    best = min(rows, key=lambda r: haversine_km(lat, lng, r.get("lat", 0), r.get("lng", 0)))
    return {
        "state": best.get("state", ""),
        "city": best.get("city", ""),
        "district": best.get("district", ""),
        "pincode": best.get("pincode", ""),
        "lat": lat,
        "lng": lng,
    }


@public_router.get("/site-config")
async def get_site_config(company_id: Optional[str] = None):
    brand = await _branding_doc(company_id or DEFAULT_COMPANY_ID)
    locales = await _locale_config()
    return {**brand, "locales": locales}


@public_router.get("/locales")
async def get_locales():
    return await _locale_config()


# ----- Admin (super_admin only) -----
@admin_router.patch("/site-theme")
async def update_site_theme(body: dict, request: Request, user=Depends(rbac.rbac_super_admin)):
    company_id = body.pop("company_id", DEFAULT_COMPANY_ID)
    old = await _db.companies.find_one({"id": company_id}, {"_id": 0})
    branding = {**((old or {}).get("branding") or {})}
    theme = {**DEFAULT_THEME, **(branding.get("theme") or {}), **body}
    branding["theme"] = theme
    for k in ("brand_name", "logo", "favicon", "primary_color", "accent_color", "tagline"):
        if k in body:
            branding[k] = body[k]
    await _db.companies.update_one(
        {"id": company_id},
        {"$set": {"branding": branding, "updated_at": iso(now_utc())}},
    )
    await rbac.audit_log("EDIT", "settings", company_id, (old or {}).get("branding"), branding,
                         user=user, request=request, metadata={"section": "site-theme"})
    return {"ok": True, **await _branding_doc(company_id)}


@admin_router.get("/locales")
async def admin_get_locales(user=Depends(rbac.rbac_super_admin)):
    return await _locale_config()


@admin_router.patch("/locales")
async def update_locales(body: dict, request: Request, user=Depends(rbac.rbac_super_admin)):
    old = await _db.app_settings.find_one({"key": "locales"}, {"_id": 0})
    val = {**((old or {}).get("value") or {}), **body}
    if "strings" in body:
        val["strings"] = {**DEFAULT_LOCALE_STRINGS, **((old or {}).get("value") or {}).get("strings", {}), **body["strings"]}
    await _db.app_settings.update_one(
        {"key": "locales"},
        {"$set": {"key": "locales", "value": val, "updated_at": iso(now_utc())}},
        upsert=True,
    )
    await rbac.audit_log("EDIT", "settings", "locales", old, val, user=user, request=request)
    return {"ok": True, **val}


@admin_router.get("/geo/pincodes")
async def admin_list_pincodes(state: Optional[str] = None, user=Depends(rbac.rbac_super_admin)):
    q = {"state": state} if state else {}
    return await _db.geo_master.find(q, {"_id": 0}).sort("pincode", 1).to_list(500)


@admin_router.post("/geo/pincodes")
async def admin_add_pincode(body: dict, request: Request, user=Depends(rbac.rbac_super_admin)):
    code = "".join(c for c in str(body.get("pincode", "")) if c.isdigit())
    if len(code) != 6:
        raise HTTPException(400, "Pincode must be 6 digits")
    doc = {
        "pincode": code,
        "state": body.get("state", ""),
        "city": body.get("city", ""),
        "district": body.get("district", body.get("city", "")),
        "lat": float(body.get("lat") or 0),
        "lng": float(body.get("lng") or 0),
        "updated_at": iso(now_utc()),
    }
    await _db.geo_master.update_one({"pincode": code}, {"$set": doc}, upsert=True)
    await rbac.audit_log("CREATE", "settings", code, None, doc, user=user, request=request, metadata={"section": "geo"})
    return doc


async def ensure_indexes():
    await _db.geo_master.create_index("pincode", unique=True)
    await _db.geo_master.create_index("state")


async def seed_geo():
    for row in PINCODE_SEED:
        await _db.geo_master.update_one({"pincode": row["pincode"]}, {"$set": row}, upsert=True)
    if not await _db.app_settings.find_one({"key": "locales"}):
        await _db.app_settings.insert_one({
            "key": "locales",
            "value": {"enabled": ["en", "hi"], "default": "en", "strings": DEFAULT_LOCALE_STRINGS},
            "updated_at": iso(now_utc()),
        })
    c = await _db.companies.find_one({"id": DEFAULT_COMPANY_ID}, {"_id": 0})
    if c:
        b = c.get("branding") or {}
        if not b.get("theme"):
            b["theme"] = DEFAULT_THEME
            await _db.companies.update_one({"id": DEFAULT_COMPANY_ID}, {"$set": {"branding": b}})

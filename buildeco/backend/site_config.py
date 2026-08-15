"""
buildecogroup.com — Site customization (super_admin), geo lookup (pincode/state/city/GPS).
Public read for applied theme/languages; write endpoints are super_admin only.
"""
import csv
import io
import math
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List
import logging
import requests
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
import rbac

logger = logging.getLogger("site_config")
NOMINATIM_UA = "BuildEcoGroup/1.0 (https://www.buildecogroup.com; geo@buildecogroup.com)"

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
    {"pincode": "226001", "state": "Uttar Pradesh", "city": "Lucknow", "district": "Lucknow", "lat": 26.8467, "lng": 80.9462},
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
    "nav.store": {"en": "Store", "hi": "स्टोर"},
    "nav.tenders": {"en": "Tenders", "hi": "टेंडर"},
    "nav.solar": {"en": "Solar", "hi": "सोलर"},
    "nav.mart": {"en": "Super Mart", "hi": "सुपर मार्ट"},
    "nav.pricing": {"en": "Pricing", "hi": "प्लान"},
    "nav.consultants": {"en": "Consultants", "hi": "कंसल्टेंट"},
    "nav.interior_boq": {"en": "Interior BOQ", "hi": "इंटीरियर BOQ"},
    "nav.upcoming": {"en": "Upcoming Projects", "hi": "आगामी प्रोजेक्ट"},
    "nav.advisory": {"en": "Property Advisory", "hi": "प्रॉपर्टी सलाह"},
    "nav.rental": {"en": "Equipment Rental", "hi": "उपकरण रेंटल"},
    "nav.boq_builder": {"en": "Full BOQ", "hi": "पूरा BOQ"},
    "nav.login": {"en": "Log in", "hi": "लॉग इन"},
    "nav.register": {"en": "Sign up", "hi": "रजिस्टर"},
    "hero.cta": {"en": "Get started free", "hi": "मुफ़्त शुरू करें"},
    "location.state": {"en": "State", "hi": "राज्य"},
    "location.city": {"en": "City", "hi": "शहर"},
    "location.pincode": {"en": "Pincode", "hi": "पिनकोड"},
    "location.district": {"en": "District", "hi": "ज़िला"},
    "location.gps": {"en": "Use GPS", "hi": "GPS लोकेशन"},
}


def normalize_geo_row(raw: dict) -> Optional[dict]:
    code = "".join(c for c in str(raw.get("pincode", "")) if c.isdigit())
    if len(code) != 6:
        return None
    city = str(raw.get("city", "")).strip()
    district = str(raw.get("district", city)).strip()
    lat_raw, lng_raw = raw.get("lat"), raw.get("lng")
    try:
        lat = float(lat_raw) if lat_raw not in (None, "") else 0.0
        lng = float(lng_raw) if lng_raw not in (None, "") else 0.0
    except (TypeError, ValueError):
        lat, lng = 0.0, 0.0
    return {
        "pincode": code,
        "state": str(raw.get("state", "")).strip(),
        "city": city,
        "district": district or city,
        "lat": lat,
        "lng": lng,
        "updated_at": iso(now_utc()),
    }


async def upsert_geo_rows(rows: List[dict]) -> dict:
    imported, skipped = 0, 0
    for raw in rows:
        doc = normalize_geo_row(raw)
        if not doc:
            skipped += 1
            continue
        await _db.geo_master.update_one({"pincode": doc["pincode"]}, {"$set": doc}, upsert=True)
        imported += 1
    return {"imported": imported, "skipped": skipped, "total": len(rows)}


def parse_csv_geo(text: str) -> List[dict]:
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        return []
    norm_headers = {h.lower().strip(): h for h in reader.fieldnames}
    rows = []
    for line in reader:
        row = {}
        for key in ("pincode", "state", "city", "district", "lat", "lng"):
            src = norm_headers.get(key)
            if src:
                row[key] = line.get(src, "")
        if any(str(row.get(k, "")).strip() for k in ("pincode", "state", "city")):
            rows.append(row)
    return rows


# In-memory static geo cache (PINCODE_SEED + CSV files) — fallback when DB row missing
_STATIC_PINCODE_LOOKUP: dict = {}


def _load_static_pincode_cache():
    global _STATIC_PINCODE_LOOKUP
    if _STATIC_PINCODE_LOOKUP:
        return
    for row in PINCODE_SEED:
        code = row.get("pincode")
        if code:
            _STATIC_PINCODE_LOOKUP[code] = dict(row)
    for geo_dir in _geo_csv_directories():
        for path in sorted(geo_dir.glob("*.csv")):
            name = path.name.lower()
            if name.startswith("pincodes_template") or name.endswith(".template.csv"):
                continue
            try:
                for row in parse_csv_geo(path.read_text(encoding="utf-8-sig")):
                    doc = normalize_geo_row(row)
                    if doc:
                        _STATIC_PINCODE_LOOKUP[doc["pincode"]] = doc
            except OSError:
                continue


def _static_pincode_row(code: str):
    _load_static_pincode_cache()
    return _STATIC_PINCODE_LOOKUP.get(code)


def _static_pincode_rows():
    _load_static_pincode_cache()
    return list(_STATIC_PINCODE_LOOKUP.values())


def _geo_csv_directories() -> List[Path]:
    """Resolve folders containing pincode CSV seed files (repo data/geo + optional env)."""
    here = Path(__file__).resolve().parent
    candidates = []
    env_dir = os.environ.get("GEO_DATA_DIR", "").strip()
    if env_dir:
        candidates.append(Path(env_dir))
    candidates.extend([
        here.parent / "data" / "geo",
        here / "data" / "geo",
        Path.cwd() / "data" / "geo",
    ])
    seen = set()
    out = []
    for p in candidates:
        try:
            resolved = p.resolve()
        except OSError:
            continue
        if resolved.is_dir() and resolved not in seen:
            seen.add(resolved)
            out.append(resolved)
    return out


async def seed_geo_from_csv_files() -> dict:
    """Import all *.csv in data/geo (skips template-only files)."""
    imported, skipped, files = 0, 0, 0
    for geo_dir in _geo_csv_directories():
        for path in sorted(geo_dir.glob("*.csv")):
            name = path.name.lower()
            if name.startswith("pincodes_template") or name.endswith(".template.csv"):
                continue
            try:
                text = path.read_text(encoding="utf-8-sig")
            except OSError:
                continue
            rows = parse_csv_geo(text)
            if not rows:
                continue
            result = await upsert_geo_rows(rows)
            imported += result["imported"]
            skipped += result["skipped"]
            files += 1
    return {"files": files, "imported": imported, "skipped": skipped}


async def distinct_geo_values(field: str, match: dict) -> List[str]:
    vals = await _db.geo_master.distinct(field, match)
    return sorted({str(v).strip() for v in vals if v})


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
        "brand_name": b.get("brand_name") or c.get("name") or "BuildEco Group",
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
@public_router.get("/geo/meta")
async def geo_meta():
    total = await _db.geo_master.count_documents({})
    state_count = len([s for s in await _db.geo_master.distinct("state") if s])
    static_rows = _static_pincode_rows()
    meta = await _db.app_settings.find_one({"key": "geo_seed_meta"}, {"_id": 0})
    return {
        "total_pincodes": max(total, len(static_rows)),
        "states_with_data": state_count or len({r.get("state") for r in static_rows if r.get("state")}),
        "static_fallback_pincodes": len(static_rows),
        "last_csv_seed": (meta or {}).get("value"),
    }


@public_router.get("/geo/states")
async def list_states():
    db_states = await _db.geo_master.distinct("state")
    merged = sorted({s for s in INDIAN_STATES} | {s for s in db_states if s})
    return {"states": merged}


@public_router.get("/geo/cities")
async def list_cities(state: str, district: Optional[str] = None):
    if not state:
        raise HTTPException(400, "state required")
    q: dict = {"state": state}
    if district:
        q["district"] = district
    db_cities = await distinct_geo_values("city", q)
    static = CITIES_BY_STATE.get(state) or []
    merged = sorted({c for c in db_cities + static if c})
    return {
        "state": state,
        "district": district or "",
        "cities": merged if merged else [state],
    }


@public_router.get("/geo/districts")
async def list_districts(state: str):
    if not state:
        raise HTTPException(400, "state required")
    uniq = await distinct_geo_values("district", {"state": state})
    if not uniq:
        static = sorted({r.get("district") or r.get("city") for r in _static_pincode_rows() if r.get("state") == state and (r.get("district") or r.get("city"))})
        uniq = static
    return {"state": state, "districts": uniq}


@public_router.get("/geo/pincodes")
async def list_pincodes(
    state: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 200,
):
    filt: dict = {}
    if state:
        filt["state"] = state
    if city:
        filt["city"] = city
    if district:
        filt["district"] = district
    if q:
        pin = "".join(c for c in q if c.isdigit())
        if len(pin) >= 1:
            filt["pincode"] = {"$regex": f"^{pin}"}
    cap = max(1, min(limit, 500))
    rows = await _db.geo_master.find(filt, {"_id": 0}).sort("pincode", 1).limit(cap).to_list(cap)
    if not rows and q:
        pin = "".join(c for c in (q or "") if c.isdigit())
        if pin:
            static = [r for r in _static_pincode_rows() if r["pincode"].startswith(pin)]
            if state:
                static = [r for r in static if r.get("state") == state]
            if city:
                static = [r for r in static if r.get("city") == city]
            if district:
                static = [r for r in static if r.get("district") == district]
            rows = static[:cap]
    return {"pincodes": rows, "count": len(rows), "filters": {"state": state, "city": city, "district": district, "q": q}}


@public_router.get("/geo/pincode/{pincode}")
async def pincode_lookup(pincode: str):
    code = "".join(c for c in pincode if c.isdigit())
    if len(code) != 6:
        raise HTTPException(400, "Pincode must be 6 digits")
    row = await _db.geo_master.find_one({"pincode": code}, {"_id": 0})
    if not row:
        row = _static_pincode_row(code)
    if not row:
        raise HTTPException(404, "Pincode not found")
    return row


def _parse_nominatim(data: dict) -> Optional[dict]:
    if not data or not isinstance(data, dict):
        return None
    a = data.get("address") or {}
    city = a.get("city") or a.get("town") or a.get("village") or a.get("municipality") or a.get("city_district") or a.get("county") or ""
    district = a.get("state_district") or a.get("county") or a.get("district") or city
    state = a.get("state") or ""
    pin = "".join(c for c in str(a.get("postcode") or "") if c.isdigit())[:6]
    if not city and not state and not pin:
        return None
    return {
        "state": state,
        "city": city,
        "district": district,
        "pincode": pin,
        "display_name": data.get("display_name") or "",
        "source": "nominatim",
    }


def nominatim_reverse(lat: float, lng: float) -> Optional[dict]:
    """OpenStreetMap Nominatim: coordinates → city, state, pincode."""
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"format": "json", "lat": lat, "lon": lng, "addressdetails": 1},
            headers={"User-Agent": NOMINATIM_UA, "Accept-Language": "en-IN,en"},
            timeout=6,
        )
        if r.status_code != 200:
            return None
        return _parse_nominatim(r.json())
    except Exception as exc:
        logger.warning("nominatim reverse failed: %s", exc)
        return None


@public_router.get("/geo/reverse")
async def reverse_geocode(lat: float, lng: float):
    """GPS → city/state/pincode via Nominatim, then nearest seeded pincode."""
    nom = nominatim_reverse(lat, lng)
    if nom:
        return {**nom, "lat": lat, "lng": lng}

    rows = await _db.geo_master.find(
        {"lat": {"$ne": 0}, "lng": {"$ne": 0}},
        {"_id": 0, "pincode": 1, "state": 1, "city": 1, "district": 1, "lat": 1, "lng": 1},
    ).to_list(20000)
    if not rows:
        rows = await _db.geo_master.find({}, {"_id": 0}).to_list(500)
    if not rows:
        rows = [r for r in _static_pincode_rows() if r.get("lat") and r.get("lng")]
    if not rows:
        return {"state": "", "city": "", "pincode": "", "lat": lat, "lng": lng, "source": "none"}
    best = min(rows, key=lambda r: haversine_km(lat, lng, r.get("lat", 0), r.get("lng", 0)))
    return {
        "state": best.get("state", ""),
        "city": best.get("city", ""),
        "district": best.get("district", ""),
        "pincode": best.get("pincode", ""),
        "lat": lat,
        "lng": lng,
        "source": "seed",
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
async def admin_list_pincodes(
    state: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    user=Depends(rbac.rbac_super_admin),
):
    q: dict = {}
    if state:
        q["state"] = state
    if city:
        q["city"] = city
    if district:
        q["district"] = district
    cap = max(1, min(limit, 500))
    skip_n = max(0, skip)
    total = await _db.geo_master.count_documents(q)
    rows = await _db.geo_master.find(q, {"_id": 0}).sort("pincode", 1).skip(skip_n).limit(cap).to_list(cap)
    return {"pincodes": rows, "total": total, "skip": skip_n, "limit": cap}


@admin_router.get("/geo/summary")
async def admin_geo_summary(user=Depends(rbac.rbac_super_admin)):
    total = await _db.geo_master.count_documents({})
    by_state = []
    pipeline = [
        {"$group": {"_id": "$state", "count": {"$sum": 1}, "cities": {"$addToSet": "$city"}, "districts": {"$addToSet": "$district"}}},
        {"$sort": {"_id": 1}},
    ]
    async for row in _db.geo_master.aggregate(pipeline):
        by_state.append({
            "state": row["_id"] or "",
            "count": row["count"],
            "cities": len([c for c in row.get("cities") or [] if c]),
            "districts": len([d for d in row.get("districts") or [] if d]),
        })
    return {"total": total, "by_state": by_state}


@admin_router.post("/geo/pincodes/bulk")
async def admin_bulk_pincodes(body: dict, request: Request, user=Depends(rbac.rbac_super_admin)):
    rows = body.get("rows") or body.get("pincodes") or []
    if not isinstance(rows, list) or not rows:
        raise HTTPException(400, "rows array required")
    result = await upsert_geo_rows(rows)
    await rbac.audit_log(
        "CREATE", "settings", "geo_bulk", None, result,
        user=user, request=request, metadata={"section": "geo", "count": result["imported"]},
    )
    return result


@admin_router.post("/geo/pincodes/upload")
async def admin_upload_pincodes_csv(
    request: Request,
    file: UploadFile = File(...),
    user=Depends(rbac.rbac_super_admin),
):
    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")
    rows = parse_csv_geo(text)
    if not rows:
        raise HTTPException(400, "No valid rows — CSV must have pincode,state,city,district,lat,lng headers")
    result = await upsert_geo_rows(rows)
    await rbac.audit_log(
        "CREATE", "settings", "geo_csv", None, result,
        user=user, request=request, metadata={"section": "geo", "file": file.filename},
    )
    return {"ok": True, "filename": file.filename, **result}


@admin_router.post("/geo/pincodes")
async def admin_add_pincode(body: dict, request: Request, user=Depends(rbac.rbac_super_admin)):
    doc = normalize_geo_row(body)
    if not doc:
        raise HTTPException(400, "Pincode must be 6 digits")
    await _db.geo_master.update_one({"pincode": doc["pincode"]}, {"$set": doc}, upsert=True)
    await rbac.audit_log("CREATE", "settings", doc["pincode"], None, doc, user=user, request=request, metadata={"section": "geo"})
    return doc


async def ensure_indexes():
    await _db.geo_master.create_index("pincode", unique=True)
    await _db.geo_master.create_index("state")
    await _db.geo_master.create_index("city")
    await _db.geo_master.create_index("district")


async def seed_geo():
    for row in PINCODE_SEED:
        await _db.geo_master.update_one({"pincode": row["pincode"]}, {"$set": row}, upsert=True)
    csv_seed = await seed_geo_from_csv_files()
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
    if csv_seed.get("imported"):
        await _db.app_settings.update_one(
            {"key": "geo_seed_meta"},
            {
                "$set": {
                    "key": "geo_seed_meta",
                    "value": {**csv_seed, "updated_at": iso(now_utc())},
                    "updated_at": iso(now_utc()),
                }
            },
            upsert=True,
        )

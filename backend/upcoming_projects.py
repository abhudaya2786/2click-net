"""
2click.in — Public upcoming land & housing projects, filterable by location and requirements.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException

_db = None

router = APIRouter(prefix="/api/upcoming-projects", tags=["upcoming-projects"])

PROJECT_TYPES = [
    {"id": "residential_plot", "name": "Residential Plot", "name_hi": "आवासीय प्लॉट"},
    {"id": "apartment", "name": "Apartment / Flat", "name_hi": "अपार्टमेंट / फ्लैट"},
    {"id": "villa", "name": "Villa / Bungalow", "name_hi": "विला / बंगला"},
    {"id": "township", "name": "Township", "name_hi": "टाउनशिप"},
    {"id": "commercial", "name": "Commercial", "name_hi": "कॉमर्शियल"},
    {"id": "industrial", "name": "Industrial / Shed", "name_hi": "औद्योगिक / शेड"},
]

BHK_OPTIONS = [
    {"id": "1", "label": "1 BHK", "label_hi": "1 BHK"},
    {"id": "2", "label": "2 BHK", "label_hi": "2 BHK"},
    {"id": "3", "label": "3 BHK", "label_hi": "3 BHK"},
    {"id": "4", "label": "4 BHK", "label_hi": "4 BHK"},
    {"id": "5+", "label": "5+ BHK", "label_hi": "5+ BHK"},
    {"id": "plot", "label": "Plot only", "label_hi": "केवल प्लॉट"},
]

REQUIREMENT_TAGS = [
    {"id": "gated", "name": "Gated community", "name_hi": "गेटेड कम्युनिटी"},
    {"id": "corner_plot", "name": "Corner plot", "name_hi": "कॉर्नर प्लॉट"},
    {"id": "near_metro", "name": "Near metro / highway", "name_hi": "मेट्रो / हाईवे के पास"},
    {"id": "loan_approved", "name": "Bank loan approved", "name_hi": "बैंक लोन स्वीकृत"},
    {"id": "vastu_compliant", "name": "Vastu compliant", "name_hi": "वास्तु अनुकूल"},
    {"id": "ready_to_move", "name": "Ready to move", "name_hi": "रहने के लिए तैयार"},
    {"id": "under_construction", "name": "Under construction", "name_hi": "निर्माणाधीन"},
    {"id": "pre_launch", "name": "Pre-launch offer", "name_hi": "प्री-लॉन्च ऑफर"},
    {"id": "club_house", "name": "Club house / amenities", "name_hi": "क्लब हाउस / सुविधाएँ"},
    {"id": "green_zone", "name": "Green / open area", "name_hi": "हरित / खुला क्षेत्र"},
]

STATUSES = [
    {"id": "upcoming", "name": "Upcoming", "name_hi": "आगामी"},
    {"id": "launching_soon", "name": "Launching soon", "name_hi": "जल्द लॉन्च"},
    {"id": "pre_launch", "name": "Pre-launch", "name_hi": "प्री-लॉन्च"},
    {"id": "under_construction", "name": "Under construction", "name_hi": "निर्माणाधीन"},
]

TYPE_IDS = {t["id"] for t in PROJECT_TYPES}
BHK_IDS = {b["id"] for b in BHK_OPTIONS}
TAG_IDS = {t["id"] for t in REQUIREMENT_TAGS}
STATUS_IDS = {s["id"] for s in STATUSES}

SEED_PROJECTS = [
    {
        "slug": "pune-hinjewadi-plots",
        "title": "Hinjewadi Green Plots Phase II",
        "title_hi": "हिंजेवाड़ी ग्रीन प्लॉट्स फेज II",
        "developer": "Maharashtra Housing Co.",
        "state": "Maharashtra", "city": "Pune", "area": "Hinjewadi", "pincode": "411057",
        "lat": 18.5912, "lng": 73.7389,
        "project_type": "residential_plot", "bhk": "plot",
        "plot_size_sqft": 1200, "built_up_sqft": 0, "units_total": 86,
        "budget_min": 4500000, "budget_max": 7200000,
        "price_label": "₹45–72 Lakh",
        "status": "launching_soon", "launch_date": "2026-09-01",
        "requirement_tags": ["gated", "corner_plot", "loan_approved", "green_zone"],
        "highlights_en": ["DTCP approved", "15 min from IT park", "Underground drainage"],
        "highlights_hi": ["DTCP स्वीकृत", "आईटी पार्क से 15 मिनट", "भूमिगत नाली"],
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    },
    {
        "slug": "mumbai-thane-3bhk",
        "title": "Thane Skyline Residences — 3 BHK",
        "title_hi": "ठाणे स्काईलाइन रेजिडेंस — 3 BHK",
        "developer": "Western Build Corp",
        "state": "Maharashtra", "city": "Mumbai", "area": "Thane West", "pincode": "400601",
        "lat": 19.2183, "lng": 72.9781,
        "project_type": "apartment", "bhk": "3",
        "plot_size_sqft": 0, "built_up_sqft": 1150, "units_total": 240,
        "budget_min": 12500000, "budget_max": 15800000,
        "price_label": "₹1.25–1.58 Cr",
        "status": "under_construction", "launch_date": "2025-06-01",
        "requirement_tags": ["gated", "near_metro", "loan_approved", "club_house", "under_construction"],
        "highlights_en": ["RERA registered", "Metro 800 m", "Swimming pool & gym"],
        "highlights_hi": ["RERA पंजीकृत", "मेट्रो 800 मी", "स्विमिंग पूल और जिम"],
        "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    },
    {
        "slug": "noida-sector-150-villa",
        "title": "Sector 150 Luxury Villas",
        "title_hi": "सेक्टर 150 लक्ज़री विला",
        "developer": "NCR Premium Homes",
        "state": "Uttar Pradesh", "city": "Noida", "area": "Sector 150", "pincode": "201301",
        "lat": 28.5355, "lng": 77.3910,
        "project_type": "villa", "bhk": "4",
        "plot_size_sqft": 2400, "built_up_sqft": 3200, "units_total": 48,
        "budget_min": 28000000, "budget_max": 42000000,
        "price_label": "₹2.8–4.2 Cr",
        "status": "pre_launch", "launch_date": "2026-11-15",
        "requirement_tags": ["gated", "vastu_compliant", "pre_launch", "club_house", "green_zone"],
        "highlights_en": ["Golf course facing", "Private garden", "Smart home ready"],
        "highlights_hi": ["गोल्फ कोर्स फेसिंग", "निजी गार्डन", "स्मार्ट होम रेडी"],
        "image": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    },
    {
        "slug": "gurugram-sector-92-2bhk",
        "title": "Sector 92 Affordable 2 BHK",
        "title_hi": "सेक्टर 92 किफायती 2 BHK",
        "developer": "Haryana Urban Dev",
        "state": "Haryana", "city": "Gurugram", "area": "Sector 92", "pincode": "122001",
        "lat": 28.4595, "lng": 77.0266,
        "project_type": "apartment", "bhk": "2",
        "plot_size_sqft": 0, "built_up_sqft": 850, "units_total": 520,
        "budget_min": 6800000, "budget_max": 8200000,
        "price_label": "₹68–82 Lakh",
        "status": "upcoming", "launch_date": "2026-10-01",
        "requirement_tags": ["loan_approved", "near_metro", "under_construction"],
        "highlights_en": ["PM Awas eligible", "Dwarka expressway 5 km", "School within campus"],
        "highlights_hi": ["पीएम आवास योग्य", "द्वारका एक्सप्रेसवे 5 किमी", "स्कूल परिसर में"],
        "image": "https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=800",
    },
    {
        "slug": "bengaluru-whitefield-township",
        "title": "Whitefield Integrated Township",
        "title_hi": "व्हाइटफील्ड इंटीग्रेटेड टाउनशिप",
        "developer": "Karnataka Land Dev",
        "state": "Karnataka", "city": "Bengaluru", "area": "Whitefield", "pincode": "560066",
        "lat": 12.9698, "lng": 77.7500,
        "project_type": "township", "bhk": "3",
        "plot_size_sqft": 1800, "built_up_sqft": 1450, "units_total": 1200,
        "budget_min": 9500000, "budget_max": 18500000,
        "price_label": "₹95 Lakh–1.85 Cr",
        "status": "under_construction", "launch_date": "2025-03-01",
        "requirement_tags": ["gated", "club_house", "green_zone", "loan_approved", "under_construction"],
        "highlights_en": ["IT corridor", "Hospital & retail on-site", "Metro extension planned"],
        "highlights_hi": ["आईटी कॉरिडोर", "अस्पताल और रिटेल ऑन-साइट", "मेट्रो विस्तार योजना"],
        "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    },
    {
        "slug": "hyderabad-financial-district-plots",
        "title": "Financial District Plots",
        "title_hi": "फाइनेंसियल डिस्ट्रिक्ट प्लॉट",
        "developer": "Telangana Infra Ltd",
        "state": "Telangana", "city": "Hyderabad", "area": "Nanakramguda", "pincode": "500032",
        "lat": 17.4239, "lng": 78.3489,
        "project_type": "residential_plot", "bhk": "plot",
        "plot_size_sqft": 1500, "built_up_sqft": 0, "units_total": 64,
        "budget_min": 5800000, "budget_max": 8900000,
        "price_label": "₹58–89 Lakh",
        "status": "launching_soon", "launch_date": "2026-08-20",
        "requirement_tags": ["corner_plot", "loan_approved", "near_metro", "pre_launch"],
        "highlights_en": ["HMDA approved", "ORR access 2 km", "Corner plots available"],
        "highlights_hi": ["HMDA स्वीकृत", "ORR एक्सेस 2 किमी", "कॉर्नर प्लॉट उपलब्ध"],
        "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    },
    {
        "slug": "ahmedabad-sg-highway-commercial",
        "title": "SG Highway Commercial Complex",
        "title_hi": "एसजी हाईवे कॉमर्शियल कॉम्प्लेक्स",
        "developer": "Gujarat Commercial Hub",
        "state": "Gujarat", "city": "Ahmedabad", "area": "SG Highway", "pincode": "380015",
        "lat": 23.0225, "lng": 72.5714,
        "project_type": "commercial", "bhk": "plot",
        "plot_size_sqft": 0, "built_up_sqft": 2500, "units_total": 36,
        "budget_min": 15000000, "budget_max": 35000000,
        "price_label": "₹1.5–3.5 Cr",
        "status": "upcoming", "launch_date": "2026-12-01",
        "requirement_tags": ["loan_approved", "near_metro", "ready_to_move"],
        "highlights_en": ["Showroom + office mix", "Highway frontage", "Parking 1:1"],
        "highlights_hi": ["शोरूम + ऑफिस मिक्स", "हाईवे फ्रंटेज", "पार्किंग 1:1"],
        "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    },
    {
        "slug": "gorakhpur-affordable-plots",
        "title": "Gorakhpur Affordable Plots — Basharatpur",
        "title_hi": "गोरखपुर किफायती प्लॉट — बशरतपुर",
        "developer": "Eastern UP Housing",
        "state": "Uttar Pradesh", "city": "Gorakhpur", "area": "Basharatpur", "pincode": "273001",
        "lat": 26.7606, "lng": 83.3732,
        "project_type": "residential_plot", "bhk": "plot",
        "plot_size_sqft": 1000, "built_up_sqft": 0, "units_total": 120,
        "budget_min": 1800000, "budget_max": 2800000,
        "price_label": "₹18–28 Lakh",
        "status": "upcoming", "launch_date": "2026-09-15",
        "requirement_tags": ["loan_approved", "green_zone", "vastu_compliant"],
        "highlights_en": ["PM Awas linked", "Main road 200 m", "Water & electricity on plot"],
        "highlights_hi": ["पीएम आवास लिंक्ड", "मुख्य सड़क 200 मी", "प्लॉट पर पानी और बिजली"],
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    },
    {
        "slug": "kolkata-new-town-4bhk",
        "title": "New Town Premium 4 BHK",
        "title_hi": "न्यू टाउन प्रीमियम 4 BHK",
        "developer": "Bengal Realty",
        "state": "West Bengal", "city": "Kolkata", "area": "New Town", "pincode": "700161",
        "lat": 22.5726, "lng": 88.3639,
        "project_type": "apartment", "bhk": "4",
        "plot_size_sqft": 0, "built_up_sqft": 2100, "units_total": 96,
        "budget_min": 16500000, "budget_max": 22000000,
        "price_label": "₹1.65–2.2 Cr",
        "status": "under_construction", "launch_date": "2025-08-01",
        "requirement_tags": ["gated", "club_house", "vastu_compliant", "under_construction"],
        "highlights_en": ["Lake view towers", "Triple height lobby", "Concierge services"],
        "highlights_hi": ["लेक व्यू टावर्स", "ट्रिपल हाइट लॉबी", "कॉन्सियर्ज सेवाएँ"],
        "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    },
    {
        "slug": "jaipur-mansarovar-industrial",
        "title": "Mansarovar Industrial Shed Park",
        "title_hi": "मानसरोवर औद्योगिक शेड पार्क",
        "developer": "Rajasthan Industrial Corp",
        "state": "Rajasthan", "city": "Jaipur", "area": "Mansarovar", "pincode": "302020",
        "lat": 26.9124, "lng": 75.7873,
        "project_type": "industrial", "bhk": "plot",
        "plot_size_sqft": 5000, "built_up_sqft": 4000, "units_total": 24,
        "budget_min": 12000000, "budget_max": 28000000,
        "price_label": "₹1.2–2.8 Cr",
        "status": "launching_soon", "launch_date": "2026-10-15",
        "requirement_tags": ["loan_approved", "near_metro", "corner_plot"],
        "highlights_en": ["RIICO approved", "24×7 power", "Wide access roads"],
        "highlights_hi": ["RIICO स्वीकृत", "24×7 बिजली", "चौड़ी एक्सेस सड़कें"],
        "image": "https://images.unsplash.com/photo-1581094790879-aeaee3f07ae2?w=800",
    },
    {
        "slug": "delhi-dwarka-1bhk",
        "title": "Dwarka Expressway 1 BHK Studio",
        "title_hi": "द्वारका एक्सप्रेसवे 1 BHK स्टूडियो",
        "developer": "Delhi Metro Homes",
        "state": "Delhi", "city": "New Delhi", "area": "Dwarka", "pincode": "110075",
        "lat": 28.6139, "lng": 77.2090,
        "project_type": "apartment", "bhk": "1",
        "plot_size_sqft": 0, "built_up_sqft": 450, "units_total": 180,
        "budget_min": 4200000, "budget_max": 5500000,
        "price_label": "₹42–55 Lakh",
        "status": "pre_launch", "launch_date": "2026-11-01",
        "requirement_tags": ["near_metro", "loan_approved", "pre_launch", "ready_to_move"],
        "highlights_en": ["Metro connected", "Ideal for first-time buyers", "Rental yield 3.2%"],
        "highlights_hi": ["मेट्रो कनेक्टेड", "पहली खरीद के लिए आदर्श", "रेंटल यील्ड 3.2%"],
        "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    },
    {
        "slug": "chennai-omr-3bhk",
        "title": "OMR Waterfront 3 BHK",
        "title_hi": "OMR वॉटरफ्रंट 3 BHK",
        "developer": "Tamil Nadu Urban",
        "state": "Tamil Nadu", "city": "Chennai", "area": "Sholinganallur", "pincode": "600119",
        "lat": 12.8996, "lng": 80.2209,
        "project_type": "apartment", "bhk": "3",
        "plot_size_sqft": 0, "built_up_sqft": 1280, "units_total": 320,
        "budget_min": 9800000, "budget_max": 13200000,
        "price_label": "₹98 Lakh–1.32 Cr",
        "status": "under_construction", "launch_date": "2025-05-01",
        "requirement_tags": ["gated", "club_house", "green_zone", "under_construction", "loan_approved"],
        "highlights_en": ["IT corridor OMR", "Sea view option", "International school nearby"],
        "highlights_hi": ["आईटी कॉरिडोर OMR", "समुद्र दृश्य विकल्प", "अंतर्राष्ट्रीय स्कूल पास"],
        "image": "https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=800",
    },
]


def init(db):
    global _db
    _db = db


def now_utc():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def new_id(p):
    return f"{p}_{uuid.uuid4().hex[:12]}"


def type_meta(tid: str):
    return next((t for t in PROJECT_TYPES if t["id"] == tid), None)


def bhk_meta(bid: str):
    return next((b for b in BHK_OPTIONS if b["id"] == bid), None)


def status_meta(sid: str):
    return next((s for s in STATUSES if s["id"] == sid), None)


def _public_card(doc: dict):
    pt = type_meta(doc.get("project_type", "")) or {}
    bk = bhk_meta(doc.get("bhk", "")) or {}
    st = status_meta(doc.get("status", "")) or {}
    tags = [t for t in REQUIREMENT_TAGS if t["id"] in (doc.get("requirement_tags") or [])]
    return {
        "id": doc["id"],
        "slug": doc.get("slug"),
        "title": doc.get("title"),
        "title_hi": doc.get("title_hi"),
        "developer": doc.get("developer"),
        "state": doc.get("state"),
        "city": doc.get("city"),
        "area": doc.get("area"),
        "pincode": doc.get("pincode"),
        "lat": doc.get("lat"),
        "lng": doc.get("lng"),
        "location_label": doc.get("location_label") or _location_label(doc),
        "project_type": doc.get("project_type"),
        "project_type_name": pt.get("name"),
        "project_type_name_hi": pt.get("name_hi"),
        "bhk": doc.get("bhk"),
        "bhk_label": bk.get("label"),
        "bhk_label_hi": bk.get("label_hi"),
        "plot_size_sqft": doc.get("plot_size_sqft"),
        "built_up_sqft": doc.get("built_up_sqft"),
        "units_total": doc.get("units_total"),
        "budget_min": doc.get("budget_min"),
        "budget_max": doc.get("budget_max"),
        "price_label": doc.get("price_label"),
        "status": doc.get("status"),
        "status_name": st.get("name"),
        "status_name_hi": st.get("name_hi"),
        "launch_date": doc.get("launch_date"),
        "requirement_tags": doc.get("requirement_tags") or [],
        "requirement_tags_meta": tags,
        "highlights_en": doc.get("highlights_en") or [],
        "highlights_hi": doc.get("highlights_hi") or [],
        "image": doc.get("image"),
        "featured": doc.get("featured", False),
    }


def _location_label(doc: dict):
    parts = [doc.get("area"), doc.get("city"), doc.get("state")]
    return ", ".join(p for p in parts if p)


def _matches_budget(doc: dict, budget_min: Optional[int], budget_max: Optional[int]):
    lo = doc.get("budget_min") or 0
    hi = doc.get("budget_max") or lo
    if budget_min is not None and hi < budget_min:
        return False
    if budget_max is not None and lo > budget_max:
        return False
    return True


def _matches_tags(doc: dict, tag: Optional[str], tags: Optional[List[str]]):
    doc_tags = set(doc.get("requirement_tags") or [])
    if tag and tag in TAG_IDS and tag not in doc_tags:
        return False
    if tags:
        wanted = {t for t in tags if t in TAG_IDS}
        if wanted and not wanted.intersection(doc_tags):
            return False
    return True


@router.get("/meta")
async def upcoming_meta():
    rows = await _db.upcoming_projects.find({"published": True}, {"_id": 0, "state": 1, "city": 1}).to_list(2000)
    states = sorted({r["state"] for r in rows if r.get("state")})
    cities_by_state = {}
    for r in rows:
        st, ct = r.get("state"), r.get("city")
        if st and ct:
            cities_by_state.setdefault(st, set()).add(ct)
    cities_by_state = {k: sorted(v) for k, v in cities_by_state.items()}
    return {
        "project_types": PROJECT_TYPES,
        "bhk_options": BHK_OPTIONS,
        "requirement_tags": REQUIREMENT_TAGS,
        "statuses": STATUSES,
        "states": states,
        "cities_by_state": cities_by_state,
    }


@router.get("")
async def list_upcoming_projects(
    state: Optional[str] = None,
    city: Optional[str] = None,
    project_type: Optional[str] = None,
    bhk: Optional[str] = None,
    status: Optional[str] = None,
    requirement: Optional[str] = None,
    requirements: Optional[str] = None,
    budget_min: Optional[int] = None,
    budget_max: Optional[int] = None,
    q: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 50,
):
    query = {"published": True}
    if state:
        query["state"] = state
    if city:
        query["city"] = city
    if project_type and project_type in TYPE_IDS:
        query["project_type"] = project_type
    if bhk and bhk in BHK_IDS:
        query["bhk"] = bhk
    if status and status in STATUS_IDS:
        query["status"] = status
    if featured is not None:
        query["featured"] = featured

    req_list = []
    if requirements:
        req_list = [t.strip() for t in requirements.split(",") if t.strip()]
    if requirement and requirement in TAG_IDS:
        req_list.append(requirement)

    rows = await _db.upcoming_projects.find(query, {"_id": 0}).to_list(min(limit, 100))
    out = []
    for doc in rows:
        if not _matches_budget(doc, budget_min, budget_max):
            continue
        if not _matches_tags(doc, None, req_list if req_list else None):
            continue
        if q:
            blob = " ".join([
                doc.get("title") or "",
                doc.get("title_hi") or "",
                doc.get("developer") or "",
                doc.get("area") or "",
                doc.get("city") or "",
            ]).lower()
            if q.lower() not in blob:
                continue
        out.append(_public_card(doc))

    out.sort(key=lambda x: (-(1 if x.get("featured") else 0), x.get("launch_date") or "", x.get("title") or ""))
    return out


@router.get("/by-location")
async def projects_by_location(state: Optional[str] = None):
    """Group published projects by state → city for location-wise browse."""
    query = {"published": True}
    if state:
        query["state"] = state
    rows = await _db.upcoming_projects.find(query, {"_id": 0}).to_list(500)
    grouped = {}
    for doc in rows:
        st = doc.get("state") or "Other"
        ct = doc.get("city") or "Other"
        grouped.setdefault(st, {}).setdefault(ct, []).append(_public_card(doc))
    for st in grouped:
        for ct in grouped[st]:
            grouped[st][ct].sort(key=lambda x: x.get("title") or "")
    summary = []
    for st, cities in sorted(grouped.items()):
        city_list = []
        for ct, projects in sorted(cities.items()):
            city_list.append({
                "city": ct,
                "count": len(projects),
                "projects": projects,
            })
        summary.append({
            "state": st,
            "count": sum(c["count"] for c in city_list),
            "cities": city_list,
        })
    return {"regions": summary, "total": len(rows)}


@router.get("/{project_id}")
async def get_upcoming_project(project_id: str):
    doc = await _db.upcoming_projects.find_one(
        {"id": project_id, "published": True},
        {"_id": 0},
    )
    if not doc:
        doc = await _db.upcoming_projects.find_one(
            {"slug": project_id, "published": True},
            {"_id": 0},
        )
    if not doc:
        raise HTTPException(404, "Project not found")
    return _public_card(doc)


async def ensure_indexes():
    for f in ["state", "city", "project_type", "bhk", "status", "slug", "published", "featured"]:
        try:
            await _db.upcoming_projects.create_index(f)
        except Exception:
            pass


async def seed_upcoming_projects():
    now = iso(now_utc())
    for i, seed in enumerate(SEED_PROJECTS):
        existing = await _db.upcoming_projects.find_one({"slug": seed["slug"]})
        doc = {
            **seed,
            "location_label": _location_label(seed),
            "published": True,
            "featured": i < 4,
            "updated_at": now,
        }
        if existing:
            await _db.upcoming_projects.update_one({"slug": seed["slug"]}, {"$set": doc})
        else:
            doc["id"] = new_id("upc")
            doc["created_at"] = now
            await _db.upcoming_projects.insert_one(dict(doc))

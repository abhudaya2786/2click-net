"""
buildecogroup.com — Property advisory: match consultants & real-estate experts by property need,
with step-by-step expert guidance (e.g. new building from land to handover).
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, EmailStr

_db = None
_get_current_user = None

router = APIRouter(prefix="/api/property-advisory", tags=["property-advisory"])

PROPERTY_NEEDS = [
    {
        "id": "new_building",
        "name": "New building construction",
        "name_hi": "नया बिल्डिंग निर्माण",
        "desc": "Complete guidance from land to handover — villa, apartment block, or commercial building",
        "desc_hi": "जमीन से हैंडOver तक पूरी गाइडेंस — विला, अपार्टमेंट या कॉमर्शियल बिल्डिंग",
        "icon": "building",
    },
    {
        "id": "residential_plot",
        "name": "Residential plot / land",
        "name_hi": "आवासीय प्लॉट / जमीन",
        "desc": "Buy or develop residential land with location and legal checks",
        "desc_hi": "लोकेशन और कानूनी जाँच के साथ आवासीय जमीन खरीदें या विकसित करें",
        "icon": "map",
    },
    {
        "id": "commercial_space",
        "name": "Commercial property",
        "name_hi": "कॉमर्शियल प्रॉपर्टी",
        "desc": "Office, retail, showroom or mixed-use commercial space",
        "desc_hi": "ऑफिस, रिटेल, शोरूम या मिश्रित उपयोग वाली कॉमर्शियल जगह",
        "icon": "store",
    },
    {
        "id": "industrial_shed",
        "name": "Industrial / factory shed",
        "name_hi": "औद्योगिक / फैक्टरी शेड",
        "desc": "Warehouse, factory, RIICO/industrial plot development",
        "desc_hi": "गोदाम, फैक्टरी, RIICO/औद्योगिक प्लॉट विकास",
        "icon": "factory",
    },
    {
        "id": "villa_home",
        "name": "Villa / independent home",
        "name_hi": "विला / स्वतंत्र घर",
        "desc": "Custom villa or bungalow design and build",
        "desc_hi": "कस्टम विला या बंगला डिज़ाइन और निर्माण",
        "icon": "home",
    },
    {
        "id": "apartment_flat",
        "name": "Apartment / flat purchase",
        "name_hi": "अपार्टमेंट / फ्लैट खरीद",
        "desc": "New launch or ready-to-move flat with loan and RERA checks",
        "desc_hi": "नया लॉन्च या रहने के लिए तैयार फ्लैट — लोन और RERA जाँच",
        "icon": "apartment",
    },
    {
        "id": "renovation",
        "name": "Renovation / expansion",
        "name_hi": "नवीनीकरण / विस्तार",
        "desc": "Remodel, add floors, interior upgrade or structural change",
        "desc_hi": "रीमॉडल, फ्लोर जोड़ना, इंटीरियर अपग्रेड या स्ट्रक्चरल बदलाव",
        "icon": "hammer",
    },
    {
        "id": "township",
        "name": "Township / large project",
        "name_hi": "टाउनशिप / बड़ा प्रोजेक्ट",
        "desc": "Multi-phase residential or mixed township development",
        "desc_hi": "बहु-चरण आवासीय या मिश्रित टाउनशिप विकास",
        "icon": "layers",
    },
]

TIMELINES = [
    {"id": "urgent", "label": "Within 3 months", "label_hi": "3 महीने के अंदर"},
    {"id": "short", "label": "3–6 months", "label_hi": "3–6 महीने"},
    {"id": "medium", "label": "6–12 months", "label_hi": "6–12 महीने"},
    {"id": "long", "label": "1–2 years", "label_hi": "1–2 वर्ष"},
    {"id": "planning", "label": "Planning only", "label_hi": "केवल योजना"},
]

CLIENT_TYPES = [
    {"id": "company", "label": "Company / developer", "label_hi": "कंपनी / डेवलपर"},
    {"id": "individual", "label": "Individual / family", "label_hi": "व्यक्ति / परिवार"},
    {"id": "contractor", "label": "Contractor / builder", "label_hi": "ठेकेदार / बिल्डर"},
    {"id": "investor", "label": "Investor", "label_hi": "निवेशक"},
]

NEED_IDS = {n["id"] for n in PROPERTY_NEEDS}

# Consultant roles required per property need (+ real_estate for property transactions)
ROLE_MAP = {
    "new_building": ["architect", "structural", "real_estate", "vastu", "exterior"],
    "residential_plot": ["real_estate", "vastu", "architect"],
    "commercial_space": ["real_estate", "architect", "structural", "exterior"],
    "industrial_shed": ["real_estate", "structural", "architect"],
    "villa_home": ["architect", "interior", "vastu", "landscape", "real_estate"],
    "apartment_flat": ["real_estate", "interior", "vastu"],
    "renovation": ["architect", "structural", "interior", "exterior"],
    "township": ["architect", "real_estate", "structural", "landscape", "exterior"],
}

GUIDANCE_STEPS = {
    "new_building": [
        {"step": 1, "title_en": "Site & land advisory", "title_hi": "साइट और जमीन सलाह",
         "detail_en": "Verify title, encumbrance, zoning (residential/commercial), road access, utilities.",
         "detail_hi": "टाइटल, बंधन, ज़ोनिंग, सड़क एक्सेस, उपयोगिताएँ सत्यापित करें।",
         "roles": ["real_estate", "vastu"], "tools": ["/upcoming-projects", "/consultants"]},
        {"step": 2, "title_en": "Architectural concept & naksha", "title_hi": "वास्तुकला कॉन्सेप्ट और नक्शा",
         "detail_en": "Floor plans, elevations, 3D views, FAR/FSI compliance, client brief alignment.",
         "detail_hi": "फ्लोर प्लान, एलिवेशन, 3D, FAR/FSI अनुपालन, ब्रीफ मिलान।",
         "roles": ["architect"], "tools": ["/consultants", "/freelancers"]},
        {"step": 3, "title_en": "Vastu & site orientation", "title_hi": "वास्तु और साइट ओरिएंटेशन",
         "detail_en": "Plot shape, entrance, kitchen/bedroom placement, remedy if needed.",
         "detail_hi": "प्लॉट आकार, प्रवेश, किचन/बेडरूम स्थान, आवश्यक उपाय।",
         "roles": ["vastu"], "tools": ["/consultants"]},
        {"step": 4, "title_en": "Structural design", "title_hi": "स्ट्रक्चरल डिज़ाइन",
         "detail_en": "RCC/steel design, soil test, column grid, earthquake norms (IS codes).",
         "detail_hi": "RCC/स्टील डिज़ाइन, मिट्टी परीक्षण, कॉलम ग्रिड, भूकंप मानदंड।",
         "roles": ["structural"], "tools": ["/consultants", "/freelancers"]},
        {"step": 5, "title_en": "Approvals & NOC", "title_hi": "अनुमोदन और NOC",
         "detail_en": "Municipal building plan, fire, environment, water/sewer where applicable.",
         "detail_hi": "नगर निगम बिल्डिंग प्लान, फायर, पर्यावरण, पानी/सीवर NOC।",
         "roles": ["architect"], "tools": ["/consultants"]},
        {"step": 6, "title_en": "BOQ, costing & budget", "title_hi": "BOQ, लागत और बजट",
         "detail_en": "Material BOQ by category — civil, MEP, interior — with brand-wise rates.",
         "detail_hi": "श्रेणी-वार BOQ — सिविल, MEP, इंटीरियर — ब्रांड-वार दरें।",
         "roles": ["architect", "structural"], "tools": ["/boq-builder", "/mart", "/interior-boq"]},
        {"step": 7, "title_en": "Vendor & tender selection", "title_hi": "विक्रेता और टेंडर चयन",
         "detail_en": "Reverse auction tenders for materials and work packages; verified vendors.",
         "detail_hi": "सामग्री और वर्क पैकेज के लिए रिवर्स ऑक्शन टेंडर; सत्यापित विक्रेता।",
         "roles": ["real_estate"], "tools": ["/tenders", "/store", "/become-vendor"]},
        {"step": 8, "title_en": "Construction execution", "title_hi": "निर्माण कार्यान्वयन",
         "detail_en": "Stage-wise supervision, quality checks, site safety, progress billing.",
         "detail_hi": "चरण-वार पर्यवेक्षण, गुणवत्ता जाँच, साइट सुरक्षा, प्रगति बिलिंग।",
         "roles": ["structural", "architect"], "tools": ["/dashboard", "/tenders"]},
        {"step": 9, "title_en": "Interior, MEP & finishes", "title_hi": "इंटीरियर, MEP और फिनिश",
         "detail_en": "Plumbing, electrical, paint, kitchen, bathroom, lobby packages.",
         "detail_hi": "प्लंबिंग, इलेक्ट्रिकल, पेंट, किचन, बाथरूम, लॉबी पैकेज।",
         "roles": ["interior", "exterior"], "tools": ["/interior-boq", "/boq-builder", "/store"]},
        {"step": 10, "title_en": "Handover & compliance", "title_hi": "हैंडOver और अनुपालन",
         "detail_en": "Completion certificate, occupancy, snagging list, warranty documentation.",
         "detail_hi": "पूर्णता प्रमाणपत्र, ऑक्यूपेंसी, स्नैगिंग सूची, वारंटी दस्तावेज़।",
         "roles": ["architect", "real_estate"], "tools": ["/consultants", "/dashboard"]},
    ],
    "residential_plot": [
        {"step": 1, "title_en": "Location & market scan", "title_hi": "लोकेशन और बाज़ार स्कैन",
         "detail_en": "Compare growth corridors, infrastructure, upcoming projects nearby.",
         "detail_hi": "विकास कॉरिडोर, इंफ्रा, पास के आगामी प्रोजेक्ट तुलना।",
         "roles": ["real_estate"], "tools": ["/upcoming-projects"]},
        {"step": 2, "title_en": "Legal & title verification", "title_hi": "कानूनी और टाइटल सत्यापन",
         "detail_en": "7/12, mutation, encumbrance certificate, seller KYC.",
         "detail_hi": "7/12, म्यूटेशन, बंधन प्रमाणपत्र, विक्रेता KYC।",
         "roles": ["real_estate"], "tools": ["/consultants"]},
        {"step": 3, "title_en": "Vastu & plot suitability", "title_hi": "वास्तु और प्लॉट उपयुक्तता",
         "detail_en": "Shape, slope, road width, neighbour impact.",
         "detail_hi": "आकार, ढलान, सड़क चौड़ाई, पड़ोसी प्रभाव।",
         "roles": ["vastu"], "tools": ["/consultants"]},
        {"step": 4, "title_en": "Development plan", "title_hi": "विकास योजना",
         "detail_en": "Architect sketch, FAR usage, future build timeline.",
         "detail_hi": "आर्किटेक्ट स्केच, FAR उपयोग, भविष्य निर्माण समयरेखा।",
         "roles": ["architect"], "tools": ["/consultants", "/boq-builder"]},
    ],
    "commercial_space": [
        {"step": 1, "title_en": "Feasibility & location", "title_hi": "व्यवहार्यता और लोकेशन",
         "detail_en": "Footfall, highway frontage, parking, competition mapping.",
         "detail_hi": "फुटफॉल, हाईवे फ्रंटेज, पार्किंग, प्रतिस्पर्धा मानचित्र।",
         "roles": ["real_estate"], "tools": ["/upcoming-projects", "/consultants"]},
        {"step": 2, "title_en": "Layout & brand facade", "title_hi": "लेआउट और फेसाड",
         "detail_en": "Architect + exterior consultant for signage and elevation.",
         "detail_hi": "आर्किटेक्ट + एक्सटीरियर कंसल्टेंट साइनेज और एलिवेशन।",
         "roles": ["architect", "exterior"], "tools": ["/consultants"]},
        {"step": 3, "title_en": "BOQ & fit-out budget", "title_hi": "BOQ और फिट-आउट बजट",
         "detail_en": "Interior BOQ, MEP, fire systems costing.",
         "detail_hi": "इंटीरियर BOQ, MEP, फायर सिस्टम लागत।",
         "roles": ["interior", "structural"], "tools": ["/interior-boq", "/boq-builder"]},
    ],
    "industrial_shed": [
        {"step": 1, "title_en": "Industrial zone & plot", "title_hi": "औद्योगिक ज़ोन और प्लॉट",
         "detail_en": "RIICO/GIDC approval, power load, logistics access.",
         "detail_hi": "RIICO/GIDC अनुमोदन, बिजली लोड, लॉजिस्टिक्स एक्सेस।",
         "roles": ["real_estate"], "tools": ["/upcoming-projects", "/consultants"]},
        {"step": 2, "title_en": "Structural & shed design", "title_hi": "स्ट्रक्चरल और शेड डिज़ाइन",
         "detail_en": "PEB/steel shed, crane loads, floor loading.",
         "detail_hi": "PEB/स्टील शेड, क्रेन लोड, फ्लोर लोडिंग।",
         "roles": ["structural", "architect"], "tools": ["/consultants", "/boq-builder"]},
    ],
    "villa_home": [
        {"step": 1, "title_en": "Brief & site study", "title_hi": "ब्रीफ और साइट अध्ययन",
         "detail_en": "Family needs, BHK, lifestyle, landscape scope.",
         "detail_hi": "परिवार की ज़रूरत, BHK, जीवनशैली, लैंडस्केप स्कोप।",
         "roles": ["architect", "vastu"], "tools": ["/consultants"]},
        {"step": 2, "title_en": "Design & interiors", "title_hi": "डिज़ाइन और इंटीरियर",
         "detail_en": "Naksha, 3D, modular kitchen, landscape garden.",
         "detail_hi": "नक्शा, 3D, मॉड्यूलर किचन, लैंडस्केप गार्डन।",
         "roles": ["architect", "interior", "landscape"], "tools": ["/interior-boq", "/boq-builder"]},
    ],
    "apartment_flat": [
        {"step": 1, "title_en": "Shortlist & RERA check", "title_hi": "शॉर्टलिस्ट और RERA जाँच",
         "detail_en": "Compare projects by location, builder track record, RERA ID.",
         "detail_hi": "लोकेशन, बिल्डर ट्रैक रिकॉर्ड, RERA ID तुलना।",
         "roles": ["real_estate"], "tools": ["/upcoming-projects", "/consultants"]},
        {"step": 2, "title_en": "Loan & interior plan", "title_hi": "लोन और इंटीरियर योजना",
         "detail_en": "Home loan eligibility, interior BOQ for fit-out.",
         "detail_hi": "होम लोन पात्रता, फिट-आउट इंटीरियर BOQ।",
         "roles": ["real_estate", "interior"], "tools": ["/interior-boq", "/consultants"]},
    ],
    "renovation": [
        {"step": 1, "title_en": "Structural assessment", "title_hi": "स्ट्रक्चरल मूल्यांकन",
         "detail_en": "Existing structure safety before adding floors or openings.",
         "detail_hi": "फ्लोर या खुले स्थान जोड़ने से पहले संरचना सुरक्षा।",
         "roles": ["structural"], "tools": ["/consultants"]},
        {"step": 2, "title_en": "Design & BOQ", "title_hi": "डिज़ाइन और BOQ",
         "detail_en": "Renovation scope, interior packages, vendor quotes.",
         "detail_hi": "नवीनीकरण स्कोप, इंटीरियर पैकेज, विक्रेता कोट।",
         "roles": ["architect", "interior"], "tools": ["/interior-boq", "/boq-builder", "/tenders"]},
    ],
    "township": [
        {"step": 1, "title_en": "Master planning", "title_hi": "मास्टर प्लानिंग",
         "detail_en": "Land aggregation, phase-wise layout, amenities zoning.",
         "detail_hi": "भूमि एकत्रीकरण, चरण-वार लेआउट, सुविधा ज़ोनिंग।",
         "roles": ["architect", "real_estate", "landscape"], "tools": ["/consultants", "/upcoming-projects"]},
        {"step": 2, "title_en": "Infrastructure & approvals", "title_hi": "इंफ्रा और अनुमोदन",
         "detail_en": "Roads, water, STP, fire, environmental clearances.",
         "detail_hi": "सड़क, पानी, STP, फायर, पर्यावरणीय अनुमति।",
         "roles": ["structural", "architect"], "tools": ["/consultants", "/tenders"]},
    ],
}

EXPERT_OPINIONS = {
    "new_building": [
        {"topic_en": "Is my plot suitable for G+2 or G+3?", "topic_hi": "मेरा प्लॉट G+2 या G+3 के लिए उपयुक्त है?"},
        {"topic_en": "Estimated cost per sqft for my city?", "topic_hi": "मेरे शहर में अनुमानित लागत प्रति वर्ग फुट?"},
        {"topic_en": "Which approvals are mandatory before starting?", "topic_hi": "शुरू करने से पहले कौन से अनुमोदन अनिवार्य?"},
        {"topic_en": "How to avoid contractor disputes?", "topic_hi": "ठेकेदार विवाद से कैसे बचें?"},
    ],
    "residential_plot": [
        {"topic_en": "How to verify land title safely?", "topic_hi": "जमीन का टाइटल सुरक्षित कैसे सत्यापित करें?"},
        {"topic_en": "Corner vs regular plot — which is better?", "topic_hi": "कॉर्नर vs सामान्य प्लॉट — कौन बेहतर?"},
    ],
    "commercial_space": [
        {"topic_en": "ROI timeline for retail showroom?", "topic_hi": "रिटेल शोरूम के लिए ROI समयरेखा?"},
        {"topic_en": "Lease vs own — expert view?", "topic_hi": "लीज़ vs खरीद — विशेषज्ञ मत?"},
    ],
}


def init(db, get_current_user=None):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user


def now_utc():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def new_id(p):
    return f"{p}_{uuid.uuid4().hex[:12]}"


class AdvisoryMatchIn(BaseModel):
    property_need: str
    client_type: Optional[str] = "company"
    state: Optional[str] = None
    city: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    bhk: Optional[str] = None
    built_up_sqft: Optional[int] = None
    plot_sqft: Optional[int] = None
    timeline: Optional[str] = None
    company_name: Optional[str] = None
    notes: Optional[str] = None


class AdvisoryRequestIn(AdvisoryMatchIn):
    name: str = Field(min_length=2, max_length=120)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    message: Optional[str] = None


async def _match_consultants(roles: List[str], state: Optional[str], limit: int = 5):
    if not roles:
        return []
    profiles = await _db.consultant_profiles.find(
        {"status": "active", "consultant_role": {"$in": roles}},
        {"_id": 0},
    ).to_list(200)
    if not profiles:
        return []
    user_ids = [p["user_id"] for p in profiles]
    users = await _db.users.find(
        {"id": {"$in": user_ids}, "status": {"$ne": "disabled"}},
        {"_id": 0, "password_hash": 0},
    ).to_list(200)
    user_map = {u["id"]: u for u in users}

    import consultants as cmod
    out = []
    for p in profiles:
        u = user_map.get(p["user_id"])
        if not u:
            continue
        if state:
            area = (p.get("service_area") or u.get("service_area") or "").lower()
            if state.lower() not in area and (not area or area == "delhi ncr"):
                pass  # still include but rank lower
        card = await cmod._build_public_card(u, p)
        card["match_role"] = p.get("consultant_role")
        score = card.get("rating", 0) * 10 + card.get("experience_years", 0)
        if state and state.lower() in (card.get("service_area") or "").lower():
            score += 20
        card["match_score"] = score
        out.append(card)
    out.sort(key=lambda x: -x.get("match_score", 0))
    # dedupe by role — prefer top per role then fill
    seen_roles = set()
    deduped = []
    for c in out:
        r = c.get("consultant_role")
        if r not in seen_roles:
            seen_roles.add(r)
            deduped.append(c)
        if len(deduped) >= limit:
            break
    if len(deduped) < limit:
        for c in out:
            if c not in deduped:
                deduped.append(c)
            if len(deduped) >= limit:
                break
    return deduped[:limit]


async def _match_upcoming(state: Optional[str], city: Optional[str], budget_min: Optional[int], budget_max: Optional[int], limit: int = 4):
    query = {"published": True}
    if state:
        query["state"] = state
    if city:
        query["city"] = city
    rows = await _db.upcoming_projects.find(query, {"_id": 0}).to_list(50)
    out = []
    for doc in rows:
        lo, hi = doc.get("budget_min") or 0, doc.get("budget_max") or lo
        if budget_min and hi < budget_min:
            continue
        if budget_max and lo > budget_max:
            continue
        out.append({
            "id": doc["id"],
            "title": doc.get("title"),
            "title_hi": doc.get("title_hi"),
            "city": doc.get("city"),
            "state": doc.get("state"),
            "price_label": doc.get("price_label"),
            "project_type": doc.get("project_type"),
        })
    return out[:limit]


def _guidance_for(need_id: str):
    steps = GUIDANCE_STEPS.get(need_id) or GUIDANCE_STEPS.get("new_building", [])
    opinions = EXPERT_OPINIONS.get(need_id) or EXPERT_OPINIONS.get("new_building", [])
    roles = ROLE_MAP.get(need_id) or ROLE_MAP["new_building"]
    return {"steps": steps, "expert_opinions": opinions, "recommended_roles": roles}


@router.get("/meta")
async def advisory_meta():
    return {
        "property_needs": PROPERTY_NEEDS,
        "timelines": TIMELINES,
        "client_types": CLIENT_TYPES,
    }


@router.post("/match")
async def advisory_match(body: AdvisoryMatchIn):
    if body.property_need not in NEED_IDS:
        raise HTTPException(400, "Invalid property need type")
    roles = ROLE_MAP.get(body.property_need, [])
    guidance = _guidance_for(body.property_need)
    consultants = await _match_consultants(roles, body.state)
    projects = await _match_upcoming(body.state, body.city, body.budget_min, body.budget_max)
    need_meta = next((n for n in PROPERTY_NEEDS if n["id"] == body.property_need), {})
    return {
        "property_need": body.property_need,
        "property_need_meta": need_meta,
        "guidance_steps": guidance["steps"],
        "expert_opinions": guidance["expert_opinions"],
        "recommended_roles": guidance["recommended_roles"],
        "matched_consultants": consultants,
        "matched_projects": projects,
        "recommended_tools": [
            {"path": "/boq-builder", "en": "Full Home BOQ", "hi": "पूरा घर BOQ"},
            {"path": "/upcoming-projects", "en": "Upcoming projects", "hi": "आगामी प्रोजेक्ट"},
            {"path": "/tenders", "en": "Tender Hub", "hi": "टेंडर"},
            {"path": "/consultants", "en": "All consultants", "hi": "सभी कंसल्टेंट"},
        ],
    }


@router.post("/request")
async def submit_advisory_request(body: AdvisoryRequestIn, request: Request):
    if body.property_need not in NEED_IDS:
        raise HTTPException(400, "Invalid property need type")
    user_id = None
    if _get_current_user:
        try:
            user = await _get_current_user(request)
            user_id = user.get("id")
        except Exception:
            pass
    match = await advisory_match(AdvisoryMatchIn(**body.model_dump(exclude={"name", "email", "phone", "message"})))
    now = iso(now_utc())
    doc = {
        "id": new_id("adv"),
        "user_id": user_id,
        "name": body.name,
        "email": body.email,
        "phone": body.phone,
        "company_name": body.company_name,
        "client_type": body.client_type,
        "property_need": body.property_need,
        "state": body.state,
        "city": body.city,
        "budget_min": body.budget_min,
        "budget_max": body.budget_max,
        "bhk": body.bhk,
        "built_up_sqft": body.built_up_sqft,
        "plot_sqft": body.plot_sqft,
        "timeline": body.timeline,
        "notes": body.notes,
        "message": body.message,
        "matched_consultant_ids": [c["id"] for c in match.get("matched_consultants", [])],
        "status": "new",
        "created_at": now,
        "updated_at": now,
    }
    await _db.property_advisory_requests.insert_one(dict(doc))
    # Also store as contact lead for ops visibility
    await _db.contact_messages.insert_one({
        "id": new_id("contact"),
        "name": body.name,
        "email": body.email or f"{(body.phone or '').replace(' ', '')}@lead.buildecogroup.com",
        "phone": body.phone,
        "message": body.message or f"Property advisory: {body.property_need} — {body.state or ''} {body.city or ''}",
        "source": "property_advisory",
        "interest": body.property_need,
        "created_at": now,
    })
    return {
        "ok": True,
        "request_id": doc["id"],
        "match": match,
    }


async def ensure_indexes():
    for f in ["property_need", "state", "status", "user_id", "created_at"]:
        try:
            await _db.property_advisory_requests.create_index(f)
        except Exception:
            pass

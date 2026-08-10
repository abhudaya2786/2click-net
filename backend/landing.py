"""
2Click.in — Regional landing content + lightweight geo lookup for homepage.
"""
import math
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException

_db = None

public_router = APIRouter(prefix="/api", tags=["landing-public"])
admin_router = APIRouter(prefix="/api/admin", tags=["landing-admin"])

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
]

CITIES_BY_STATE = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
    "Delhi": ["New Delhi", "South Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Vapi"],
    "Uttar Pradesh": ["Lucknow", "Noida", "Gorakhpur", "Kanpur"],
    "Haryana": ["Gurugram", "Faridabad"],
    "Tamil Nadu": ["Chennai", "Coimbatore"],
    "West Bengal": ["Kolkata"],
    "Rajasthan": ["Jaipur", "Jodhpur"],
    "Telangana": ["Hyderabad"],
}

PINCODE_SEED = [
    {"pincode": "411001", "state": "Maharashtra", "city": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"pincode": "400001", "state": "Maharashtra", "city": "Mumbai", "lat": 18.9388, "lng": 72.8354},
    {"pincode": "110001", "state": "Delhi", "city": "New Delhi", "lat": 28.6139, "lng": 77.2090},
    {"pincode": "560001", "state": "Karnataka", "city": "Bengaluru", "lat": 12.9716, "lng": 77.5946},
    {"pincode": "380001", "state": "Gujarat", "city": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
    {"pincode": "201301", "state": "Uttar Pradesh", "city": "Noida", "lat": 28.5355, "lng": 77.3910},
    {"pincode": "122001", "state": "Haryana", "city": "Gurugram", "lat": 28.4595, "lng": 77.0266},
    {"pincode": "273001", "state": "Uttar Pradesh", "city": "Gorakhpur", "lat": 26.7606, "lng": 83.3732},
    {"pincode": "396191", "state": "Gujarat", "city": "Vapi", "lat": 20.3893, "lng": 72.9106},
    {"pincode": "500001", "state": "Telangana", "city": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
]

DEFAULT_LANDING = {
    "region_label": "India",
    "region_label_hi": "भारत",
    "headline_en": "Construction super-app for your city",
    "headline_hi": "आपके शहर के लिए निर्माण सुपर ऐप",
    "key_points": [
        {"icon": "store", "en": "Buy steel, cement & solar from verified vendors", "hi": "सत्यापित विक्रेताओं से स्टील, सीमेंट और सोलर खरीदें"},
        {"icon": "gavel", "en": "Post tenders & get live reverse-auction bids", "hi": "टेंडर पोस्ट करें और लाइव रिवर्स ऑक्शन बिड पाएँ"},
        {"icon": "home", "en": "Mera Ghar — naksha to griha pravesh journey", "hi": "मेरा घर — नक्शे से गृह प्रवेश तक पूरा सफर"},
        {"icon": "users", "en": "Hire architects, BOQ & CAD freelancers nearby", "hi": "पास के वास्तुकार, बीओक्यू और सीएडी फ्रीलांसर किराए पर लें"},
        {"icon": "sun", "en": "Solar EPC quotes with subsidy calculator", "hi": "सब्सिडी कैलकुलेटर के साथ सोलर ईपीसी अनुमान"},
        {"icon": "truck", "en": "Logistics & site delivery tracking", "hi": "लॉजिस्टिक्स और साइट डिलीवरी ट्रैकिंग"},
    ],
    "stats": [
        {"k": "12,500+", "v_en": "Verified vendors", "v_hi": "सत्यापित विक्रेता"},
        {"k": "48,000+", "v_en": "Material SKUs", "v_hi": "निर्माण सामग्री उत्पाद"},
        {"k": "2,400 Cr+", "v_en": "Tender value", "v_hi": "टेंडर मूल्य"},
    ],
    "cta_en": "Start free in your area",
    "cta_hi": "अपने इलाके में मुफ़्त शुरू करें",
}

REGION_OVERRIDES = {
    "Maharashtra": {
        "region_label": "Maharashtra",
        "region_label_hi": "महाराष्ट्र",
        "headline_en": "Mumbai · Pune · Nagpur — build smarter",
        "headline_hi": "मुंबई · पुणे · नागपुर — समझदारी से निर्माण",
        "key_points": [
            {"icon": "gavel", "en": "180+ active MH tenders — infra & housing", "hi": "१८०+ सक्रिय महाराष्ट्र टेंडर — अवसंरचना और आवास"},
            {"icon": "store", "en": "Pune & Mumbai Super Mart live rates", "hi": "पुणे और मुंबई सुपर मार्ट लाइव दरें"},
            {"icon": "sun", "en": "Rooftop solar EPC for MH DISCOMs", "hi": "छत पर सोलर ईपीसी — महाराष्ट्र बिजली वितरण"},
            {"icon": "users", "en": "320+ architects & BOQ freelancers", "hi": "३२०+ वास्तुकार और बीओक्यू फ्रीलांसर"},
            {"icon": "home", "en": "Villa & apartment home-build packages", "hi": "विला और अपार्टमेंट घर निर्माण पैकेज"},
            {"icon": "truck", "en": "Western corridor logistics partners", "hi": "पश्चिमी कॉरिडोर लॉजिस्टिक्स साझेदार"},
        ],
        "stats": [
            {"k": "2,400+", "v_en": "MH vendors", "v_hi": "महाराष्ट्र विक्रेता"},
            {"k": "180+", "v_en": "Live tenders", "v_hi": "लाइव टेंडर"},
            {"k": "320+", "v_en": "Freelancers", "v_hi": "फ्रीलांसर"},
        ],
    },
    "Uttar Pradesh": {
        "region_label": "Uttar Pradesh",
        "region_label_hi": "उत्तर प्रदेश",
        "headline_en": "Noida · Gorakhpur · Lucknow projects",
        "headline_hi": "नोएडा · गोरखपुर · लखनऊ — प्रोजेक्ट",
        "key_points": [
            {"icon": "home", "en": "Affordable home build & renovation BOQ", "hi": "किफायती घर निर्माण और नवीनीकरण बीओक्यू"},
            {"icon": "store", "en": "Cement, TMT & bricks at local rates", "hi": "स्थानीय दर पर सीमेंट, टीएमटी और ईंट"},
            {"icon": "gavel", "en": "Government & private tender bidding", "hi": "सरकारी और निजी टेंडर बिडिंग"},
            {"icon": "users", "en": "Civil engineers & estimators on demand", "hi": "मांग पर सिविल इंजीनियर और अनुमानक"},
            {"icon": "sun", "en": "Solar for homes & MSME units", "hi": "घरों और लघु उद्योगों के लिए सोलर"},
            {"icon": "truck", "en": "UP-wide material delivery network", "hi": "पूरे उत्तर प्रदेश में सामग्री वितरण"},
        ],
        "stats": [
            {"k": "1,800+", "v_en": "UP vendors", "v_hi": "उत्तर प्रदेश विक्रेता"},
            {"k": "95+", "v_en": "Live tenders", "v_hi": "लाइव टेंडर"},
            {"k": "210+", "v_en": "Freelancers", "v_hi": "फ्रीलांसर"},
        ],
    },
    "Gujarat": {
        "region_label": "Gujarat",
        "region_label_hi": "गुजरात",
        "headline_en": "Ahmedabad · Surat · Vapi industrial hub",
        "headline_hi": "अहमदाबाद · सूरत · वापी — औद्योगिक केंद्र",
        "key_points": [
            {"icon": "store", "en": "Factory-grade steel & chemical materials", "hi": "फैक्ट्री ग्रेड स्टील और रासायनिक सामग्री"},
            {"icon": "sun", "en": "Large-scale solar EPC for industry", "hi": "उद्योग के लिए बड़े पैमाने पर सोलर ईपीसी"},
            {"icon": "gavel", "en": "Industrial tender & reverse auction", "hi": "औद्योगिक टेंडर और रिवर्स ऑक्शन"},
            {"icon": "users", "en": "Plant layout & CAD freelancers", "hi": "प्लांट लेआउट और सीएडी फ्रीलांसर"},
            {"icon": "truck", "en": "Port & highway logistics", "hi": "बंदरगाह और राजमार्ग लॉजिस्टिक्स"},
            {"icon": "home", "en": "Villa upgrade & interior packages", "hi": "विला उन्नयन और इंटीरियर पैकेज"},
        ],
        "stats": [
            {"k": "1,200+", "v_en": "GJ vendors", "v_hi": "गुजरात विक्रेता"},
            {"k": "70+", "v_en": "Live tenders", "v_hi": "लाइव टेंडर"},
            {"k": "150+", "v_en": "Freelancers", "v_hi": "फ्रीलांसर"},
        ],
    },
    "Karnataka": {
        "region_label": "Karnataka",
        "region_label_hi": "कर्नाटक",
        "headline_en": "Bengaluru tech-city construction",
        "headline_hi": "बेंगलुरु टेक-सिटी निर्माण",
        "key_points": [
            {"icon": "users", "en": "Architects & 3D design freelancers", "hi": "वास्तुकार और त्रि-आयामी डिज़ाइन फ्रीलांसर"},
            {"icon": "store", "en": "Premium finishes & smart home materials", "hi": "प्रीमियम फिनिश और स्मार्ट होम सामग्री"},
            {"icon": "gavel", "en": "IT park & commercial tenders", "hi": "आईटी पार्क और वाणिज्यिक टेंडर"},
            {"icon": "sun", "en": "Rooftop solar for apartments", "hi": "अपार्टमेंट के लिए छत पर सोलर"},
            {"icon": "home", "en": "Interior & villa upgrade catalog", "hi": "इंटीरियर और विला उन्नयन कैटलॉग"},
            {"icon": "truck", "en": "Bangalore metro-area delivery", "hi": "बेंगलुरु मेट्रो क्षेत्र में डिलीवरी"},
        ],
        "stats": [
            {"k": "1,500+", "v_en": "KA vendors", "v_hi": "कर्नाटक विक्रेता"},
            {"k": "110+", "v_en": "Live tenders", "v_hi": "लाइव टेंडर"},
            {"k": "280+", "v_en": "Freelancers", "v_hi": "फ्रीलांसर"},
        ],
    },
    "Delhi": {
        "region_label": "Delhi NCR",
        "region_label_hi": "दिल्ली एनसीआर",
        "headline_en": "NCR mega-projects & procurement",
        "headline_hi": "एनसीआर महा-परियोजनाएँ और खरीद",
        "key_points": [
            {"icon": "gavel", "en": "High-value infra & housing tenders", "hi": "उच्च मूल्य की अवसंरचना और आवास टेंडर"},
            {"icon": "store", "en": "Bulk procurement for contractors", "hi": "ठेकेदारों के लिए थोक खरीद"},
            {"icon": "users", "en": "CA, legal & consultant freelancers", "hi": "सीए, कानूनी और सलाहकार फ्रीलांसर"},
            {"icon": "home", "en": "Luxury home build lifecycle", "hi": "लक्ज़री घर निर्माण जीवनचक्र"},
            {"icon": "sun", "en": "Commercial solar & net metering", "hi": "वाणिज्यिक सोलर और नेट मीटरिंग"},
            {"icon": "truck", "en": "NCR-wide fleet & logistics", "hi": "एनसीआर व्यापी फ्लीट और लॉजिस्टिक्स"},
        ],
        "stats": [
            {"k": "2,100+", "v_en": "NCR vendors", "v_hi": "एनसीआर विक्रेता"},
            {"k": "140+", "v_en": "Live tenders", "v_hi": "लाइव टेंडर"},
            {"k": "400+", "v_en": "Freelancers", "v_hi": "फ्रीलांसर"},
        ],
    },
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


def _resolve_landing(state: Optional[str], city: Optional[str]):
    base = {**DEFAULT_LANDING}
    if state and state in REGION_OVERRIDES:
        base.update(REGION_OVERRIDES[state])
    place = city or (state if state else "India")
    base["place"] = place
    base["state"] = state or ""
    base["city"] = city or ""
    return base


@public_router.get("/geo/states")
async def list_states():
    return {"states": INDIAN_STATES}


@public_router.get("/geo/cities")
async def list_cities(state: str):
    if not state:
        raise HTTPException(400, "state required")
    cities = CITIES_BY_STATE.get(state, [])
    rows = await _db.geo_master.find({"state": state}, {"_id": 0, "city": 1}).to_list(200) if _db else []
    extra = sorted({r["city"] for r in rows if r.get("city")})
    merged = list(dict.fromkeys(cities + extra))
    return {"state": state, "cities": merged or [state]}


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
    rows = await _db.geo_master.find({}, {"_id": 0}).to_list(500)
    if not rows:
        return {"state": "", "city": "", "pincode": "", "lat": lat, "lng": lng}
    best = min(rows, key=lambda r: haversine_km(lat, lng, r.get("lat", 0), r.get("lng", 0)))
    return {**best, "lat": lat, "lng": lng}


@public_router.get("/landing")
async def get_landing(state: Optional[str] = None, city: Optional[str] = None, pincode: Optional[str] = None):
    st, ct = state, city
    if pincode:
        code = "".join(c for c in pincode if c.isdigit())
        row = await _db.geo_master.find_one({"pincode": code}, {"_id": 0})
        if row:
            st, ct = row.get("state", st), row.get("city", ct)
    content = _resolve_landing(st, ct)
    return content


async def ensure_indexes():
    await _db.geo_master.create_index("pincode", unique=True)
    await _db.geo_master.create_index("state")
    await _db.landing_regions.create_index("state")


async def seed_landing():
    for row in PINCODE_SEED:
        await _db.geo_master.update_one({"pincode": row["pincode"]}, {"$set": row}, upsert=True)
    for state, data in REGION_OVERRIDES.items():
        await _db.landing_regions.update_one(
            {"state": state},
            {"$set": {"state": state, **data, "updated_at": iso(now_utc())}},
            upsert=True,
        )
    await _db.landing_regions.update_one(
        {"state": "__default__"},
        {"$set": {"state": "__default__", **DEFAULT_LANDING, "updated_at": iso(now_utc())}},
        upsert=True,
    )

"""
2click.in — Construction equipment rental, machinery hire & logistics services.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, EmailStr

_db = None
_get_current_user = None

router = APIRouter(prefix="/api/equipment-rental", tags=["equipment-rental"])

SERVICE_TYPES = [
    {"id": "equipment_rental", "name": "Equipment rental", "name_hi": "उपकरण रेंटल"},
    {"id": "machinery_hire", "name": "Machinery hire", "name_hi": "मशीनरी हायर"},
    {"id": "logistics", "name": "Logistics & transport", "name_hi": "लॉजिस्टिक्स और ट्रांसपोर्ट"},
    {"id": "site_delivery", "name": "Site material delivery", "name_hi": "साइट मटेरियल डिलीवरी"},
    {"id": "heavy_haulage", "name": "Heavy haulage", "name_hi": "भारी ढुलाई"},
]

EQUIPMENT_CATEGORIES = [
    {"id": "jcb_earthmoving", "name": "JCB & Earthmoving", "name_hi": "JCB और अर्थमूविंग",
     "icon": "tractor", "service_types": ["equipment_rental", "machinery_hire"],
     "examples_en": "JCB 3DX, Backhoe loader, Excavator, Bulldozer",
     "examples_hi": "JCB 3DX, बैकहो लोडर, एक्सकेवेटर, बुलडोज़र"},
    {"id": "crane_lifting", "name": "Crane & Lifting", "name_hi": "क्रेन और लिफ्टिंग",
     "icon": "crane", "service_types": ["equipment_rental", "machinery_hire"],
     "examples_en": "Mobile crane, Hydra, Tower crane, Forklift",
     "examples_hi": "मोबाइल क्रेन, हाइड्रा, टावर क्रेन, फोर्कलिफ्ट"},
    {"id": "concrete", "name": "Concrete equipment", "name_hi": "कंक्रीट उपकरण",
     "icon": "concrete", "service_types": ["equipment_rental", "machinery_hire"],
     "examples_en": "Transit mixer, Concrete pump, Batching plant",
     "examples_hi": "ट्रांजिट मिक्सर, कंक्रीट पंप, बैचिंग प्लांट"},
    {"id": "road_compaction", "name": "Road & compaction", "name_hi": "रोड और कम्पैक्शन",
     "icon": "road", "service_types": ["equipment_rental", "machinery_hire"],
     "examples_en": "Vibratory roller, Paver, Motor grader",
     "examples_hi": "वाइब्रेटरी रोलर, पेवर, मोटर ग्रेडर"},
    {"id": "transport_tipper", "name": "Tipper & Dumper", "name_hi": "टिपर और डंपर",
     "icon": "truck", "service_types": ["logistics", "site_delivery", "heavy_haulage"],
     "examples_en": "10T tipper, 20T dumper, Hyva, Trailer",
     "examples_hi": "10T टिपर, 20T डंपर, हाइवा, ट्रेलर"},
    {"id": "flatbed_haulage", "name": "Flatbed & heavy haulage", "name_hi": "फ्लैटबेड और भारी ढुलाई",
     "icon": "haulage", "service_types": ["logistics", "heavy_haulage"],
     "examples_en": "Flatbed trailer, Low-bed, Steel transport",
     "examples_hi": "फ्लैटबेड ट्रेलर, लो-बेड, स्टील ट्रांसपोर्ट"},
    {"id": "generator_power", "name": "Generator & power", "name_hi": "जनरेटर और पावर",
     "icon": "generator", "service_types": ["equipment_rental"],
     "examples_en": "DG set 62KVA–500KVA, Welding set, Compressor",
     "examples_hi": "DG सेट, वेल्डिंग सेट, कंप्रेसर"},
    {"id": "scaffolding", "name": "Scaffolding & access", "name_hi": "स्कैफोल्डिंग और एक्सेस",
     "icon": "scaffold", "service_types": ["equipment_rental"],
     "examples_en": "Cuplock scaffolding, Ladder, Work platform",
     "examples_hi": "कपलॉक स्कैफोल्डिंग, लैडर, वर्क प्लेटफॉर्म"},
    {"id": "material_delivery", "name": "Material delivery fleet", "name_hi": "मटेरियल डिलीवरी फ्लीट",
     "icon": "delivery", "service_types": ["logistics", "site_delivery"],
     "examples_en": "Cement, sand, TMT, brick delivery to site",
     "examples_hi": "सीमेंट, रेत, TMT, ईंट साइट डिलीवरी"},
    {"id": "specialized", "name": "Specialized machinery", "name_hi": "विशेष मशीनरी",
     "icon": "special", "service_types": ["equipment_rental", "machinery_hire"],
     "examples_en": "Rock breaker, Pile rig, Boom lift, Manlift",
     "examples_hi": "रॉक ब्रेकर, पाइल रिग, बूम लिफ्ट, मैनलिफ्ट"},
]

RATE_UNITS = [
    {"id": "hour", "label": "Per hour", "label_hi": "प्रति घंटा"},
    {"id": "day", "label": "Per day", "label_hi": "प्रति दिन"},
    {"id": "trip", "label": "Per trip", "label_hi": "प्रति ट्रिप"},
    {"id": "ton", "label": "Per ton", "label_hi": "प्रति टन"},
    {"id": "month", "label": "Per month", "label_hi": "प्रति माह"},
]

CAT_IDS = {c["id"] for c in EQUIPMENT_CATEGORIES}
SVC_IDS = {s["id"] for s in SERVICE_TYPES}

SEED_LISTINGS = [
    {
        "slug": "jcb-3dx-pune-day",
        "title": "JCB 3DX Backhoe Loader — with operator",
        "title_hi": "JCB 3DX बैकहो लोडर — ऑपरेटर सहित",
        "category_id": "jcb_earthmoving", "service_type": "equipment_rental",
        "equipment_model": "JCB 3DX", "brand": "JCB", "capacity": "1.1 cum bucket",
        "state": "Maharashtra", "city": "Pune", "service_area": "Pune, Pimpri, Hinjewadi",
        "rate": 2200, "rate_unit": "hour", "rate_label": "₹2,200/hr · min 8 hrs",
        "operator_included": True, "verified": True, "vendor_name": "Western Earthmovers",
        "availability": "available", "min_duration": "8 hours",
        "features_en": ["Fuel extra or package", "Night shift available", "Site mobilization 1 day notice"],
        "features_hi": ["फ्यूल अतिरिक्त या पैकेज", "नाइट शिफ्ट", "1 दिन नोटिस"],
        "image": "https://images.unsplash.com/photo-1581094790879-aeaee3f07ae2?w=800",
    },
    {
        "slug": "excavator-20t-mumbai",
        "title": "20T Hydraulic Excavator",
        "title_hi": "20T हाइड्रोलिक एक्सकेवेटर",
        "category_id": "jcb_earthmoving", "service_type": "machinery_hire",
        "equipment_model": "Tata Hitachi EX210", "brand": "Tata Hitachi", "capacity": "20 ton",
        "state": "Maharashtra", "city": "Mumbai", "service_area": "Mumbai, Thane, Navi Mumbai",
        "rate": 18500, "rate_unit": "day", "rate_label": "₹18,500/day",
        "operator_included": True, "verified": True, "vendor_name": "MH Heavy Rentals",
        "availability": "available", "min_duration": "1 day",
        "features_en": ["Rock breaker attachment optional", "GPS tracked fleet"],
        "features_hi": ["रॉक ब्रेकर ऑप्शन", "GPS फ्लीट"],
        "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    },
    {
        "slug": "mobile-crane-25t-delhi",
        "title": "25T Mobile Crane — pick & carry",
        "title_hi": "25T मोबाइल क्रेन",
        "category_id": "crane_lifting", "service_type": "equipment_rental",
        "equipment_model": "Escorts TRX 2529", "brand": "Escorts", "capacity": "25 ton",
        "state": "Delhi", "city": "New Delhi", "service_area": "Delhi NCR",
        "rate": 28000, "rate_unit": "day", "rate_label": "₹28,000/day",
        "operator_included": True, "verified": True, "vendor_name": "NCR Crane Services",
        "availability": "available", "min_duration": "1 day",
        "features_en": ["Outrigger mats included", "Night lift surcharge"],
        "features_hi": ["आउटरिगर मैट्स", "नाइट लिफ्ट सरचार्ज"],
        "image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    },
    {
        "slug": "hydra-14t-gurugram",
        "title": "14T Hydra Crane",
        "title_hi": "14T हाइड्रा क्रेन",
        "category_id": "crane_lifting", "service_type": "machinery_hire",
        "equipment_model": "ACE 14T Hydra", "brand": "ACE", "capacity": "14 ton",
        "state": "Haryana", "city": "Gurugram", "service_area": "Gurugram, Faridabad, Noida",
        "rate": 14500, "rate_unit": "day", "rate_label": "₹14,500/day",
        "operator_included": True, "verified": True, "vendor_name": "NCR Lift & Shift",
        "availability": "available", "min_duration": "4 hours",
        "features_en": ["Quick mobilization", "Steel erection jobs"],
        "features_hi": ["त्वरित मोबिलाइज़ेशन", "स्टील इरेक्शन"],
        "image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    },
    {
        "slug": "transit-mixer-bengaluru",
        "title": "Transit Mixer 6 cum",
        "title_hi": "ट्रांजिट मिक्सर 6 cum",
        "category_id": "concrete", "service_type": "equipment_rental",
        "equipment_model": "Ashok Leyland 6 cum", "brand": "Ashok Leyland", "capacity": "6 cum",
        "state": "Karnataka", "city": "Bengaluru", "service_area": "Bengaluru Urban",
        "rate": 3200, "rate_unit": "hour", "rate_label": "₹3,200/hr",
        "operator_included": True, "verified": True, "vendor_name": "BLR Concrete Fleet",
        "availability": "available", "min_duration": "4 hours",
        "features_en": ["RMC plant tie-ups", "Pump combo available"],
        "features_hi": ["RMC प्लांट टाई-अप", "पंप कॉम्बो"],
        "image": "https://images.unsplash.com/photo-1581094790879-aeaee3f07ae2?w=800",
    },
    {
        "slug": "concrete-pump-hyderabad",
        "title": "Concrete Boom Pump 32m",
        "title_hi": "कंक्रीट बूम पंप 32m",
        "category_id": "concrete", "service_type": "machinery_hire",
        "equipment_model": "Putzmeister 32m", "brand": "Putzmeister", "capacity": "32m reach",
        "state": "Telangana", "city": "Hyderabad", "service_area": "Hyderabad, Ranga Reddy",
        "rate": 45000, "rate_unit": "day", "rate_label": "₹45,000/day",
        "operator_included": True, "verified": True, "vendor_name": "Deccan Pumping",
        "availability": "limited", "min_duration": "1 day",
        "features_en": ["High-rise pour specialist", "Pipeline extra"],
        "features_hi": ["हाई-राइज पोर", "पाइपलाइन अतिरिक्त"],
        "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    },
    {
        "slug": "vibratory-roller-jaipur",
        "title": "Vibratory Roller 10T",
        "title_hi": "वाइब्रेटरी रोलर 10T",
        "category_id": "road_compaction", "service_type": "equipment_rental",
        "equipment_model": "Escorts VRL 10", "brand": "Escorts", "capacity": "10 ton",
        "state": "Rajasthan", "city": "Jaipur", "service_area": "Jaipur district",
        "rate": 12000, "rate_unit": "day", "rate_label": "₹12,000/day",
        "operator_included": True, "verified": False, "vendor_name": "RJ Road Machines",
        "availability": "available", "min_duration": "1 day",
        "features_en": ["Road & plot compaction", "Fuel on client"],
        "features_hi": ["रोड और प्लॉट कम्पैक्शन"],
        "image": "https://images.unsplash.com/photo-1581094790879-aeaee3f07ae2?w=800",
    },
    {
        "slug": "tipper-10t-pune-logistics",
        "title": "10T Tipper — sand / debris / aggregate",
        "title_hi": "10T टिपर — रेत / मलबा / एग्रीगेट",
        "category_id": "transport_tipper", "service_type": "logistics",
        "equipment_model": "Tata 10T Tipper", "brand": "Tata", "capacity": "10 ton",
        "state": "Maharashtra", "city": "Pune", "service_area": "Pune, PCMC, Chakan",
        "rate": 2800, "rate_unit": "trip", "rate_label": "₹2,800/trip (up to 25 km)",
        "operator_included": True, "verified": True, "vendor_name": "Pune Site Logistics",
        "availability": "available", "min_duration": "1 trip",
        "features_en": ["E-way bill support", "Multiple trips/day"],
        "features_hi": ["ई-वे बिल सपोर्ट", "कई ट्रिप/दिन"],
        "image": "https://images.unsplash.com/photo-1601584115207-0bbf79590007?w=800",
    },
    {
        "slug": "hyva-20t-noida",
        "title": "20T Hyva / Dumper — construction debris",
        "title_hi": "20T हाइवा — निर्माण मलबा",
        "category_id": "transport_tipper", "service_type": "site_delivery",
        "equipment_model": "Ashok Leyland 2516", "brand": "Ashok Leyland", "capacity": "20 ton",
        "state": "Uttar Pradesh", "city": "Noida", "service_area": "Noida, Ghaziabad, Greater Noida",
        "rate": 4200, "rate_unit": "trip", "rate_label": "₹4,200/trip",
        "operator_included": True, "verified": True, "vendor_name": "UP Haul Masters",
        "availability": "available", "min_duration": "1 trip",
        "features_en": ["C&D waste authorized carriers", "Night delivery"],
        "features_hi": ["C&D वेस्ट कैरियर", "रात डिलीवरी"],
        "image": "https://images.unsplash.com/photo-1601584115207-0bbf79590007?w=800",
    },
    {
        "slug": "flatbed-steel-mumbai",
        "title": "Flatbed trailer — TMT / steel coil transport",
        "title_hi": "फ्लैटबेड — TMT / स्टील कोयल ट्रांसपोर्ट",
        "category_id": "flatbed_haulage", "service_type": "heavy_haulage",
        "equipment_model": "40T Flatbed", "brand": "Tata Prima", "capacity": "40 ton",
        "state": "Maharashtra", "city": "Mumbai", "service_area": "Mumbai port corridor",
        "rate": 18500, "rate_unit": "trip", "rate_label": "₹18,500/trip (port to site)",
        "operator_included": True, "verified": True, "vendor_name": "Western Steel Movers",
        "availability": "available", "min_duration": "1 trip",
        "features_en": ["Insurance optional", "Escort for oversize"],
        "features_hi": ["बीमा ऑप्शन", "ओवरसाइज एस्कॉर्ट"],
        "image": "https://images.unsplash.com/photo-1601584115207-0bbf79590007?w=800",
    },
    {
        "slug": "dg-125kva-chennai",
        "title": "DG Set 125 KVA — silent canopy",
        "title_hi": "DG सेट 125 KVA — साइलेंट",
        "category_id": "generator_power", "service_type": "equipment_rental",
        "equipment_model": "Cummins 125 KVA", "brand": "Cummins", "capacity": "125 KVA",
        "state": "Tamil Nadu", "city": "Chennai", "service_area": "Chennai metro",
        "rate": 8500, "rate_unit": "day", "rate_label": "₹8,500/day (fuel extra)",
        "operator_included": False, "verified": True, "vendor_name": "TN Power Rentals",
        "availability": "available", "min_duration": "1 day",
        "features_en": ["AMC available", "Cable & changeover"],
        "features_hi": ["AMC उपलब्ध", "केबल और चेंजOver"],
        "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
    },
    {
        "slug": "scaffolding-cuplock-gurugram",
        "title": "Cuplock scaffolding — rent per sqft",
        "title_hi": "कपलॉक स्कैफोल्डिंग — प्रति sqft रेंट",
        "category_id": "scaffolding", "service_type": "equipment_rental",
        "equipment_model": "Cuplock system", "brand": "MS Scaff", "capacity": "per sqft shuttering",
        "state": "Haryana", "city": "Gurugram", "service_area": "NCR",
        "rate": 28, "rate_unit": "day", "rate_label": "₹28/sqft/month equiv.",
        "operator_included": False, "verified": True, "vendor_name": "NCR Scaffold Co",
        "availability": "available", "min_duration": "500 sqft",
        "features_en": ["Erection labour separate", "Safety nets"],
        "features_hi": ["इरेक्शन लेबर अलग", "सेफ्टी नेट"],
        "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    },
    {
        "slug": "cement-delivery-gorakhpur",
        "title": "Cement & TMT delivery fleet",
        "title_hi": "सीमेंट और TMT डिलीवरी फ्लीट",
        "category_id": "material_delivery", "service_type": "site_delivery",
        "equipment_model": "Mixed fleet", "brand": "Local", "capacity": "Up to 15 ton",
        "state": "Uttar Pradesh", "city": "Gorakhpur", "service_area": "Gorakhpur district",
        "rate": 1800, "rate_unit": "trip", "rate_label": "₹1,800/trip local",
        "operator_included": True, "verified": False, "vendor_name": "Eastern UP Transport",
        "availability": "available", "min_duration": "1 trip",
        "features_en": ["Cement, sand, brick, aggregate", "Same-day slots"],
        "features_hi": ["सीमेंट, रेत, ईंट, एग्रीगेट", "समान दिन स्लॉट"],
        "image": "https://images.unsplash.com/photo-1601584115207-0bbf79590007?w=800",
    },
    {
        "slug": "boom-lift-bengaluru",
        "title": "Boom lift / Manlift 12m",
        "title_hi": "बूम लिफ्ट / मैनलिफ्ट 12m",
        "category_id": "specialized", "service_type": "machinery_hire",
        "equipment_model": "JLG 12m", "brand": "JLG", "capacity": "12m working height",
        "state": "Karnataka", "city": "Bengaluru", "service_area": "Bengaluru",
        "rate": 6500, "rate_unit": "day", "rate_label": "₹6,500/day",
        "operator_included": True, "verified": True, "vendor_name": "BLR Aerial Works",
        "availability": "limited", "min_duration": "1 day",
        "features_en": ["Facade & MEP jobs", "Operator certified"],
        "features_hi": ["फेसाड और MEP", "प्रमाणित ऑपरेटर"],
        "image": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    },
    {
        "slug": "forklift-ahmedabad",
        "title": "3T Forklift — warehouse & site",
        "title_hi": "3T फोर्कलिफ्ट",
        "category_id": "crane_lifting", "service_type": "equipment_rental",
        "equipment_model": "Godrej 3T", "brand": "Godrej", "capacity": "3 ton",
        "state": "Gujarat", "city": "Ahmedabad", "service_area": "Ahmedabad, Gandhinagar",
        "rate": 4500, "rate_unit": "day", "rate_label": "₹4,500/day",
        "operator_included": True, "verified": True, "vendor_name": "Gujarat Lift Rentals",
        "availability": "available", "min_duration": "4 hours",
        "features_en": ["Pallet & material shift", "Diesel/CNG options"],
        "features_hi": ["पैलेट शिफ्ट", "डीज़ल/CNG"],
        "image": "https://images.unsplash.com/photo-1581094790879-aeaee3f07ae2?w=800",
    },
    {
        "slug": "rock-breaker-pune",
        "title": "Rock breaker attachment — JCB/Excavator",
        "title_hi": "रॉक ब्रेकर अटैचमेंट",
        "category_id": "specialized", "service_type": "machinery_hire",
        "equipment_model": "Montabert breaker", "brand": "Montabert", "capacity": "Attachment",
        "state": "Maharashtra", "city": "Pune", "service_area": "Western Maharashtra",
        "rate": 3500, "rate_unit": "hour", "rate_label": "₹3,500/hr + carrier",
        "operator_included": True, "verified": True, "vendor_name": "MH Earthworks",
        "availability": "available", "min_duration": "4 hours",
        "features_en": ["Hard rock & basement", "Carrier machine separate"],
        "features_hi": ["हार्ड रॉक और बेसमेंट"],
        "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    },
]


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


def _cat_meta(cid: str):
    return next((c for c in EQUIPMENT_CATEGORIES if c["id"] == cid), {})


def _svc_meta(sid: str):
    return next((s for s in SERVICE_TYPES if s["id"] == sid), {})


def _public_card(doc: dict):
    cat = _cat_meta(doc.get("category_id", ""))
    svc = _svc_meta(doc.get("service_type", ""))
    return {
        "id": doc["id"],
        "slug": doc.get("slug"),
        "title": doc.get("title"),
        "title_hi": doc.get("title_hi"),
        "category_id": doc.get("category_id"),
        "category_name": cat.get("name"),
        "category_name_hi": cat.get("name_hi"),
        "service_type": doc.get("service_type"),
        "service_type_name": svc.get("name"),
        "service_type_name_hi": svc.get("name_hi"),
        "equipment_model": doc.get("equipment_model"),
        "brand": doc.get("brand"),
        "capacity": doc.get("capacity"),
        "state": doc.get("state"),
        "city": doc.get("city"),
        "service_area": doc.get("service_area"),
        "location_label": doc.get("location_label") or ", ".join(filter(None, [doc.get("city"), doc.get("state")])),
        "rate": doc.get("rate"),
        "rate_unit": doc.get("rate_unit"),
        "rate_label": doc.get("rate_label"),
        "operator_included": doc.get("operator_included", False),
        "verified": doc.get("verified", False),
        "vendor_name": doc.get("vendor_name"),
        "availability": doc.get("availability"),
        "min_duration": doc.get("min_duration"),
        "features_en": doc.get("features_en") or [],
        "features_hi": doc.get("features_hi") or [],
        "image": doc.get("image"),
        "featured": doc.get("featured", False),
    }


class RentalRequestIn(BaseModel):
    listing_id: Optional[str] = None
    name: str = Field(min_length=2)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    state: Optional[str] = None
    category_id: Optional[str] = None
    service_type: Optional[str] = None
    start_date: Optional[str] = None
    duration: Optional[str] = None
    site_address: Optional[str] = None
    message: Optional[str] = None


@router.get("/meta")
async def rental_meta():
    rows = await _db.equipment_rentals.find({"published": True}, {"_id": 0, "state": 1, "city": 1}).to_list(500)
    states = sorted({r["state"] for r in rows if r.get("state")})
    cities_by_state = {}
    for r in rows:
        st, ct = r.get("state"), r.get("city")
        if st and ct:
            cities_by_state.setdefault(st, set()).add(ct)
    return {
        "service_types": SERVICE_TYPES,
        "equipment_categories": EQUIPMENT_CATEGORIES,
        "rate_units": RATE_UNITS,
        "states": states,
        "cities_by_state": {k: sorted(v) for k, v in cities_by_state.items()},
    }


@router.get("")
async def list_equipment_rentals(
    category_id: Optional[str] = None,
    service_type: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    logistics_only: Optional[bool] = None,
    q: Optional[str] = None,
    limit: int = 50,
):
    query = {"published": True}
    if category_id and category_id in CAT_IDS:
        query["category_id"] = category_id
    if service_type and service_type in SVC_IDS:
        query["service_type"] = service_type
    if logistics_only:
        query["service_type"] = {"$in": ["logistics", "site_delivery", "heavy_haulage"]}
    if state:
        query["state"] = state
    if city:
        query["city"] = city
    rows = await _db.equipment_rentals.find(query, {"_id": 0}).to_list(min(limit, 100))
    out = []
    for doc in rows:
        if q:
            blob = f"{doc.get('title')} {doc.get('title_hi')} {doc.get('equipment_model')} {doc.get('vendor_name')} {doc.get('city')}".lower()
            if q.lower() not in blob:
                continue
        out.append(_public_card(doc))
    out.sort(key=lambda x: (-(1 if x.get("featured") else 0), x.get("title") or ""))
    return out


@router.get("/logistics")
async def list_logistics_services(
    state: Optional[str] = None,
    city: Optional[str] = None,
    category_id: Optional[str] = None,
    q: Optional[str] = None,
):
    return await list_equipment_rentals(
        category_id=category_id, state=state, city=city, logistics_only=True, q=q, limit=50,
    )


@router.get("/{listing_id}")
async def get_equipment_listing(listing_id: str):
    doc = await _db.equipment_rentals.find_one({"id": listing_id, "published": True}, {"_id": 0})
    if not doc:
        doc = await _db.equipment_rentals.find_one({"slug": listing_id, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Listing not found")
    return _public_card(doc)


@router.post("/request")
async def submit_rental_request(body: RentalRequestIn, request: Request):
    user_id = None
    if _get_current_user:
        try:
            user = await _get_current_user(request)
            user_id = user.get("id")
        except Exception:
            pass
    listing = None
    if body.listing_id:
        listing = await _db.equipment_rentals.find_one({"id": body.listing_id}, {"_id": 0})
    now = iso(now_utc())
    doc = {
        "id": new_id("rent"),
        "user_id": user_id,
        "listing_id": body.listing_id,
        "listing_title": listing.get("title") if listing else None,
        "name": body.name,
        "phone": body.phone,
        "email": body.email,
        "city": body.city,
        "state": body.state,
        "category_id": body.category_id,
        "service_type": body.service_type,
        "start_date": body.start_date,
        "duration": body.duration,
        "site_address": body.site_address,
        "message": body.message,
        "status": "new",
        "created_at": now,
        "updated_at": now,
    }
    await _db.equipment_rental_requests.insert_one(dict(doc))
    await _db.contact_messages.insert_one({
        "id": new_id("contact"),
        "name": body.name,
        "email": body.email or f"{(body.phone or '').replace(' ', '')}@lead.2click.in",
        "phone": body.phone,
        "message": body.message or f"Equipment rental: {listing.get('title') if listing else body.category_id or 'general'}",
        "source": "equipment_rental",
        "interest": body.service_type or "equipment_rental",
        "created_at": now,
    })
    return {"ok": True, "request_id": doc["id"]}


async def ensure_indexes():
    for f in ["category_id", "service_type", "state", "city", "slug", "published", "featured"]:
        try:
            await _db.equipment_rentals.create_index(f)
        except Exception:
            pass


async def seed_equipment_rentals():
    now = iso(now_utc())
    for i, seed in enumerate(SEED_LISTINGS):
        loc = ", ".join(filter(None, [seed.get("city"), seed.get("state")]))
        doc = {
            **seed,
            "location_label": loc,
            "published": True,
            "featured": i < 6,
            "updated_at": now,
        }
        existing = await _db.equipment_rentals.find_one({"slug": seed["slug"]})
        if existing:
            await _db.equipment_rentals.update_one({"slug": seed["slug"]}, {"$set": doc})
        else:
            doc["id"] = new_id("eqr")
            doc["created_at"] = now
            await _db.equipment_rentals.insert_one(dict(doc))

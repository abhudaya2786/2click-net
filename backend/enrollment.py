"""
2Click.in — Platform enrollment: user-wise + shop-wise registration with legal agreements.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

_db = None
_get_current_user = None
_audit = None
_hash_password = None
_verify_password = None
_create_access_token = None
_set_auth_cookie = None
_clean = None
_new_id = None
_iso = None
_now_utc = None

router = APIRouter(prefix="/api/enrollment", tags=["enrollment"])
admin_router = APIRouter(prefix="/api/enrollment/admin", tags=["enrollment-admin"])

SHOP_TYPES = ["material_store", "hardware", "steel_trader", "cement_dealer", "solar_shop", "general"]
ENROLLMENT_MODES = ["user", "vendor", "shop"]


def init(db, get_current_user, helpers):
    global _db, _get_current_user, _audit, _hash_password, _verify_password
    global _create_access_token, _set_auth_cookie, _clean, _new_id, _iso, _now_utc
    _db = db
    _get_current_user = get_current_user
    _audit = helpers["audit"]
    _hash_password = helpers["hash_password"]
    _verify_password = helpers["verify_password"]
    _create_access_token = helpers["create_access_token"]
    _set_auth_cookie = helpers["set_auth_cookie"]
    _clean = helpers["clean"]
    _new_id = helpers["new_id"]
    _iso = helpers["iso"]
    _now_utc = helpers["now_utc"]


def _client_ip(request: Request):
    ip = request.headers.get("x-forwarded-for") if request else None
    if ip:
        return ip.split(",")[0].strip()
    return request.client.host if (request and request.client) else "unknown"


AGREEMENTS = [
    {
        "code": "platform_terms",
        "version": "1.0",
        "title": "2click.in Platform Terms of Service",
        "title_hi": "2click.in प्लेटफ़ॉर्म सेवा की शर्तें",
        "applies_to": ["user", "vendor", "shop", "all"],
        "required": True,
        "content": (
            "By using 2click.in you agree to use the marketplace, tenders, and tools lawfully. "
            "Listings must be accurate. Platform commission applies per category. "
            "Disputes are subject to Indian jurisdiction. We may suspend accounts for fraud or policy violations."
        ),
        "content_hi": (
            "2click.in उपयोग करने पर आप मार्केटप्लेस, टेंडर और टूल्स का कानूनी उपयोग करने के लिए सहमत हैं। "
            "लिस्टिंग सही होनी चाहिए। श्रेणी के अनुसार कमीशन लागू होता है। "
            "विवाद भारतीय क्षेत्राधिकार के अधीन हैं। धोखाधड़ी पर खाता निलंबित किया जा सकता है।"
        ),
    },
    {
        "code": "privacy_policy",
        "version": "1.0",
        "title": "Privacy Policy",
        "title_hi": "गोपनीयता नीति",
        "applies_to": ["user", "vendor", "shop", "all"],
        "required": True,
        "content": (
            "We collect name, email, phone, business details, and location to operate the platform. "
            "Data is used for orders, KYC, and support. We do not sell personal data. "
            "You may request correction of your profile data via support."
        ),
        "content_hi": (
            "हम नाम, ईमेल, फ़ोन, व्यवसाय विवरण और लोकेशन एकत्र करते हैं। "
            "डेटा ऑर्डर, KYC और सहायता के लिए उपयोग होता है। हम व्यक्तिगत डेटा नहीं बेचते।"
        ),
    },
    {
        "code": "vendor_marketplace_agreement",
        "version": "1.0",
        "title": "Vendor & Marketplace Seller Agreement",
        "title_hi": "विक्रेता और मार्केटप्लेस समझौता",
        "applies_to": ["vendor", "shop"],
        "required": True,
        "content": (
            "As a seller you must provide valid GST/PAN where applicable, honour confirmed orders, "
            "and maintain stock accuracy. Commission is deducted per order. "
            "Counterfeit or misleading listings lead to delisting. Settlement follows platform payout rules."
        ),
        "content_hi": (
            "विक्रेता के रूप में वैध GST/PAN दें, ऑर्डर पूरे करें, स्टॉक सही रखें। "
            "ऑर्डर पर कमीशन काटा जाता है। नकली या गलत लिस्टिंग पर हटाया जा सकता है।"
        ),
    },
    {
        "code": "shop_enrollment_agreement",
        "version": "1.0",
        "title": "Shop Enrollment & Listing Agreement",
        "title_hi": "दुकान पंजीकरण और लिस्टिंग समझौता",
        "applies_to": ["shop"],
        "required": True,
        "content": (
            "Each enrolled shop is a distinct business listing on 2click.in. "
            "Shop owner is responsible for shop-specific compliance, pricing, and customer service. "
            "Shop profile must match physical business. One owner may operate multiple shops with separate enrollment."
        ),
        "content_hi": (
            "हर पंजीकृत दुकान 2click.in पर एक व्यवसाय लिस्टिंग है। "
            "दुकान मालिक compliance, मूल्य और सेवा के लिए ज़िम्मेदार है। "
            "एक मालिक कई दुकानें अलग-अलग पंजीकरण से चला सकता है।"
        ),
    },
    {
        "code": "client_agreement",
        "version": "1.0",
        "title": "Client Agreement — Hiring & Services",
        "title_hi": "क्लाइंट समझौता — सेवा और हायरिंग",
        "applies_to": ["user", "customer", "contractor", "company", "employee", "other"],
        "required": True,
        "content": (
            "As a client on 2click.in you may browse freelancers, send enquiries, place orders, and hire "
            "professionals for construction, design, accounting, and related services.\n\n"
            "1. Scope: You are the client (buyer) of services listed on the platform. 2click.in is a "
            "marketplace facilitator, not the service provider unless explicitly stated.\n\n"
            "2. Payments: Agreed fees are paid through platform flows where available. Platform commission "
            "and taxes may apply. Do not pay outside the platform for bookings initiated on 2click.in "
            "unless both parties accept documented off-platform terms.\n\n"
            "3. Your responsibilities: Provide accurate project details, respond in good faith, and pay "
            "agreed amounts on time. Do not request illegal work or misuse freelancer deliverables.\n\n"
            "4. Deliverables & disputes: Quality and timelines are between you and the freelancer. "
            "Raise disputes via support within 7 days of delivery. 2click.in may mediate but does not "
            "guarantee outcomes.\n\n"
            "5. Confidentiality: Respect freelancer IP and confidential information shared during projects.\n\n"
            "6. Liability: 2click.in is not liable for freelancer performance, delays, or indirect losses. "
            "Indian law and jurisdiction apply."
        ),
        "content_hi": (
            "2click.in पर क्लाइंट के रूप में आप फ्रीलांसर ब्राउज़ कर सकते हैं, पूछताछ भेज सकते हैं, "
            "ऑर्डर दे सकते हैं और निर्माण, डिज़ाइन, लेखा आदि सेवाओं के लिए पेशेवर हायर कर सकते हैं।\n\n"
            "1. दायरा: आप सेवा का क्लाइंट (खरीदार) हैं। 2click.in मार्केटप्लेस सुविधा प्रदान करता है, "
            "सेवा प्रदाता नहीं (जब तक स्पष्ट न कहा हो)।\n\n"
            "2. भुगतान: सहमत शुल्क प्लेटफ़ॉर्म के माध्यम से। कमीशन और टैक्स लागू हो सकते हैं। "
            "प्लेटफ़ॉर्म पर शुरू की बुकिंग के लिए बिना दस्तावेज़ के बाहर भुगतान न करें।\n\n"
            "3. आपकी ज़िम्मेदारी: सही प्रोजेक्ट विवरण दें, समय पर भुगतान करें, अवैध कार्य न मांगें।\n\n"
            "4. विवाद: गुणवत्ता और समयसीमा आप और फ्रीलांसर के बीच है। डिलीवरी के 7 दिनों में सपोर्ट पर "
            "विवाद उठाएँ।\n\n"
            "5. गोपनीयता: फ्रीलांसर की IP और गोपनीय जानकारी का सम्मान करें।\n\n"
            "6. दायित्व: फ्रीलांसर प्रदर्शन के लिए 2click.in ज़िम्मेदार नहीं। भारतीय कानून लागू।"
        ),
    },
    {
        "code": "freelancer_agreement",
        "version": "1.0",
        "title": "Freelancer & Professional Services Agreement",
        "title_hi": "फ्रीलांसर और पेशेवर सेवा समझौता",
        "applies_to": ["freelancer", "architect", "engineer", "ca", "service_provider"],
        "required": True,
        "content": (
            "As a freelancer or professional on 2click.in you offer services to clients through "
            "the platform talent network, enquiries, and orders.\n\n"
            "1. Profile & listings: Your name, skills, portfolio, pricing, and categories must be accurate. "
            "You represent that you have the qualifications to perform listed services.\n\n"
            "2. Client engagements: Respond professionally to enquiries. Honour agreed scope, timeline, and "
            "fees. Deliver work to the standard described in your listing or proposal.\n\n"
            "3. Commission & payouts: Platform commission is deducted per order as shown in admin commission "
            "settings (category/product/order-wise). Net payout is credited per platform settlement rules. "
            "GST and tax compliance is your responsibility where applicable.\n\n"
            "4. Prohibited conduct: No plagiarism, fake credentials, off-platform payment solicitation for "
            "2click.in-originated leads without disclosure, or sharing client data without consent.\n\n"
            "5. IP & deliverables: Unless agreed otherwise, clients receive usage rights for paid deliverables. "
            "You retain pre-existing IP. License terms may be specified per project.\n\n"
            "6. Suspension: Misrepresentation, repeated disputes, or policy violations may lead to delisting "
            "or account suspension.\n\n"
            "7. Liability: You are independent, not an employee of 2click.in. Indian law applies."
        ),
        "content_hi": (
            "2click.in पर फ्रीलांसर/पेशेवर के रूप में आप टैलेंट नेटवर्क, पूछताछ और ऑर्डर के माध्यम से "
            "क्लाइंटों को सेवा देते हैं।\n\n"
            "1. प्रोफ़ाइल: नाम, कौशल, पोर्टफोलियो, मूल्य और श्रेणियाँ सही होनी चाहिए। "
            "आप सूचीबद्ध सेवाएँ करने के लिए योग्य हैं।\n\n"
            "2. क्लाइंट कार्य: पेशेवरता से जवाब दें। सहमत कार्य, समय और शुल्क पूरे करें।\n\n"
            "3. कमीशन: ऑर्डर पर प्लेटफ़ॉर्म कमीशन काटा जाता है (श्रेणी/उत्पाद/ऑर्डर के अनुसार)। "
            "नेट भुगतान settlement नियमों पर। GST/टैक्स आपकी ज़िम्मेदारी।\n\n"
            "4. निषिद्ध: नकली प्रमाणपत्र, बिना बताए बाहर भुगतान मांगना, क्लाइंट डेटा बिना अनुमति साझा करना।\n\n"
            "5. IP: भुगतान के बाद क्लाइंट को उपयोग अधिकार (जब तक अन्य सहमति न हो)। आप पूर्व IP रखते हैं।\n\n"
            "6. निलंबन: गलत जानकारी या उल्लंघन पर हटाया/निलंबित किया जा सकता है।\n\n"
            "7. दायित्व: आप स्वतंत्र हैं, 2click.in के कर्मचारी नहीं। भारतीय कानून लागू।"
        ),
    },
]


class ShopIn(BaseModel):
    name: str
    shop_type: str = "general"
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address_line: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    business_type: Optional[str] = None
    primary_category_id: Optional[str] = None
    category_ids: Optional[List[str]] = None


class EnrollmentCompleteIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    user_type: str = "customer"
    enrollment_mode: str = "user"
    company: Optional[str] = None
    business_type: Optional[str] = None
    phone: Optional[str] = None
    primary_category_id: Optional[str] = None
    category_ids: Optional[List[str]] = None
    state: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    service_area: Optional[str] = None
    skills: Optional[List[str]] = None
    portfolio_url: Optional[str] = None
    expected_pricing: Optional[str] = None
    availability: Optional[str] = None
    shop: Optional[ShopIn] = None
    accepted_agreements: List[str] = Field(min_length=1)


def _agreements_for_mode(mode: str, user_type: str):
    keys = {"user", user_type, mode, "all"}
    return [a for a in AGREEMENTS if keys.intersection(set(a["applies_to"]))]


def _required_codes(mode: str, user_type: str):
    return [a["code"] for a in _agreements_for_mode(mode, user_type) if a["required"]]


@router.get("/agreements")
async def list_agreements(mode: str = "user", user_type: str = "customer"):
    if mode not in ENROLLMENT_MODES:
        raise HTTPException(400, "Invalid mode")
    return _agreements_for_mode(mode, user_type)


@router.get("/agreements/{code}")
async def get_agreement(code: str):
    a = next((x for x in AGREEMENTS if x["code"] == code), None)
    if not a:
        raise HTTPException(404, "Agreement not found")
    return a


async def _user_dep():
    return await _get_current_user()


@router.post("/complete")
async def complete_enrollment(body: EnrollmentCompleteIn, request: Request, response: Response):
    import phase3a

    mode = body.enrollment_mode
    if mode not in ENROLLMENT_MODES:
        raise HTTPException(400, "Invalid enrollment mode")
    if mode in ("vendor", "shop") and body.user_type not in ("vendor", "shop", "supplier"):
        body.user_type = "shop" if mode == "shop" else "vendor"
    if mode == "shop" and not body.shop:
        raise HTTPException(400, "Shop details required for shop enrollment")

    required = set(_required_codes(mode, body.user_type))
    accepted = set(body.accepted_agreements or [])
    missing = required - accepted
    if missing:
        raise HTTPException(400, f"Missing required agreements: {', '.join(sorted(missing))}")

    email = body.email.lower()
    if await _db.users.find_one({"email": email}):
        raise HTTPException(400, detail="Email already registered")

    role = phase3a.role_for_user_type(body.user_type)
    if role == "super_admin":
        role = "customer"

    all_cat_ids = list(dict.fromkeys(
        ([body.primary_category_id] if body.primary_category_id else [])
        + (body.category_ids or [])
        + ([body.shop.primary_category_id] if body.shop and body.shop.primary_category_id else [])
        + (body.shop.category_ids or [] if body.shop else [])
    ))
    valid_ids = []
    for cid in all_cat_ids:
        if cid and await _db.categories.find_one({"id": cid, "status": "active"}, {"_id": 0}):
            valid_ids.append(cid)

    uid = _new_id("user")
    enrollment_status = "approved" if mode == "user" else "pending_review"
    doc = {
        "id": uid, "name": body.name, "email": email,
        "password_hash": _hash_password(body.password), "role": role,
        "user_type": body.user_type,
        "default_dashboard": phase3a.dashboard_for_user_type(body.user_type),
        "company": body.company or (body.shop.name if body.shop else None),
        "company_id": "company_default", "picture": None, "auth": "jwt",
        "business_type": body.business_type or (body.shop.business_type if body.shop else None),
        "phone": body.phone or (body.shop.phone if body.shop else None),
        "primary_category_id": body.primary_category_id,
        "state": body.state or (body.shop.state if body.shop else None),
        "city": body.city or (body.shop.city if body.shop else None),
        "pincode": body.pincode or (body.shop.pincode if body.shop else None),
        "district": body.district or (body.shop.district if body.shop else None),
        "service_area": body.service_area,
        "skills": body.skills or [],
        "portfolio_url": body.portfolio_url,
        "expected_pricing": body.expected_pricing,
        "availability": body.availability,
        "onboarding_completed": mode == "user",
        "enrollment_mode": mode,
        "enrollment_status": enrollment_status,
        "kyc_status": "pending",
        "wallet": 0.0,
        "created_at": _iso(_now_utc()),
    }
    await _db.users.insert_one(doc)
    if valid_ids:
        primary = body.primary_category_id or (body.shop.primary_category_id if body.shop else None)
        await phase3a.sync_user_categories(uid, primary, valid_ids)

    ip = _client_ip(request)
    now = _iso(_now_utc())
    for code in accepted:
        agr = next((a for a in AGREEMENTS if a["code"] == code), None)
        if not agr:
            continue
        await _db.agreement_acceptances.insert_one({
            "id": _new_id("aa"), "user_id": uid, "agreement_code": code,
            "version": agr["version"], "accepted_at": now, "ip": ip,
            "enrollment_mode": mode,
        })

    shop_doc = None
    if body.shop:
        if body.shop.shop_type not in SHOP_TYPES:
            raise HTTPException(400, "Invalid shop_type")
        shop_doc = {
            "id": _new_id("shop"), "owner_user_id": uid,
            "name": body.shop.name, "shop_type": body.shop.shop_type,
            "gst_number": body.shop.gst_number, "pan_number": body.shop.pan_number,
            "phone": body.shop.phone or body.phone,
            "email": (body.shop.email or email).lower(),
            "address_line": body.shop.address_line,
            "state": body.shop.state, "city": body.shop.city, "district": body.shop.district, "pincode": body.shop.pincode,
            "business_type": body.shop.business_type,
            "primary_category_id": body.shop.primary_category_id,
            "category_ids": body.shop.category_ids or [],
            "status": "pending_review",
            "enrollment_status": "under_review",
            "kyc_status": "pending",
            "created_at": now, "updated_at": now,
        }
        await _db.shops.insert_one(dict(shop_doc))
        for code in accepted:
            agr = next((a for a in AGREEMENTS if a["code"] == code), None)
            if agr:
                await _db.agreement_acceptances.insert_one({
                    "id": _new_id("aa"), "user_id": uid, "shop_id": shop_doc["id"],
                    "agreement_code": code, "version": agr["version"],
                    "accepted_at": now, "ip": ip, "enrollment_mode": mode,
                })

    token = _create_access_token(uid, email)
    _set_auth_cookie(response, token)
    user_out = {k: v for k, v in _clean(doc).items() if k != "password_hash"}
    if shop_doc:
        user_out["shop_id"] = shop_doc["id"]
    await _audit(doc, "enrollment_complete", module="enrollment", record_id=uid,
                 metadata={"mode": mode, "shop_id": shop_doc["id"] if shop_doc else None})
    return {"token": token, "user": user_out, "shop": shop_doc}


@router.get("/receipt")
async def enrollment_receipt(user=Depends(_user_dep)):
    shops = await _db.shops.find({"owner_user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    shop = shops[0] if shops else None
    acceptances = await _db.agreement_acceptances.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    agreements = []
    for acc in acceptances:
        agr = next((a for a in AGREEMENTS if a["code"] == acc.get("agreement_code")), None)
        if not agr:
            continue
        agreements.append({
            "code": agr["code"],
            "title": agr["title"],
            "title_hi": agr.get("title_hi"),
            "version": acc.get("version") or agr["version"],
            "accepted_at": acc.get("accepted_at"),
        })
    cat_ids = list(user.get("category_ids") or [])
    if user.get("primary_category_id"):
        cat_ids = list({user["primary_category_id"], *cat_ids})
    categories = []
    if cat_ids:
        categories = await _db.categories.find({"id": {"$in": cat_ids}}, {"_id": 0, "id": 1, "name": 1}).to_list(50)
    user_out = {k: v for k, v in _clean(user).items() if k != "password_hash"}
    return {
        "user": user_out,
        "shop": shop,
        "mode": user.get("enrollment_mode"),
        "enrollment_status": user.get("enrollment_status"),
        "categories": categories,
        "agreements": agreements,
    }


@router.get("/me")
async def my_enrollment(user=Depends(_user_dep)):
    shops = await _db.shops.find({"owner_user_id": user["id"]}, {"_id": 0}).to_list(50)
    acceptances = await _db.agreement_acceptances.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return {
        "user_id": user["id"],
        "enrollment_mode": user.get("enrollment_mode"),
        "enrollment_status": user.get("enrollment_status", "approved"),
        "kyc_status": user.get("kyc_status"),
        "shops": shops,
        "agreements_accepted": acceptances,
    }


@router.post("/shops")
async def create_shop(body: ShopIn, request: Request, user=Depends(_user_dep)):
    if body.shop_type not in SHOP_TYPES:
        raise HTTPException(400, "Invalid shop_type")
    now = _iso(_now_utc())
    doc = {
        "id": _new_id("shop"), "owner_user_id": user["id"],
        "name": body.name, "shop_type": body.shop_type,
        "gst_number": body.gst_number, "pan_number": body.pan_number,
        "phone": body.phone, "email": (body.email or user.get("email", "")).lower(),
        "address_line": body.address_line,
        "state": body.state, "city": body.city, "district": body.district, "pincode": body.pincode,
        "business_type": body.business_type,
        "primary_category_id": body.primary_category_id,
        "category_ids": body.category_ids or [],
        "status": "draft",
        "enrollment_status": "incomplete",
        "kyc_status": "pending",
        "created_at": now, "updated_at": now,
    }
    await _db.shops.insert_one(dict(doc))
    await _audit(user, "shop_created", module="enrollment", record_id=doc["id"])
    return doc


@router.get("/shops/me")
async def my_shops(user=Depends(_user_dep)):
    return await _db.shops.find({"owner_user_id": user["id"]}, {"_id": 0}).to_list(50)


@router.patch("/shops/{shop_id}")
async def update_shop(shop_id: str, body: ShopIn, user=Depends(_user_dep)):
    shop = await _db.shops.find_one({"id": shop_id, "owner_user_id": user["id"]}, {"_id": 0})
    if not shop:
        raise HTTPException(404, "Shop not found")
    upd = {
        "name": body.name, "shop_type": body.shop_type,
        "gst_number": body.gst_number, "pan_number": body.pan_number,
        "phone": body.phone, "email": body.email,
        "address_line": body.address_line,
        "state": body.state, "city": body.city, "district": body.district, "pincode": body.pincode,
        "business_type": body.business_type,
        "primary_category_id": body.primary_category_id,
        "category_ids": body.category_ids or [],
        "updated_at": _iso(_now_utc()),
    }
    await _db.shops.update_one({"id": shop_id}, {"$set": upd})
    return {"ok": True}


@router.post("/shops/{shop_id}/submit")
async def submit_shop(shop_id: str, body: dict, request: Request, user=Depends(_user_dep)):
    shop = await _db.shops.find_one({"id": shop_id, "owner_user_id": user["id"]}, {"_id": 0})
    if not shop:
        raise HTTPException(404, "Shop not found")
    accepted = set(body.get("accepted_agreements") or [])
    required = set(_required_codes("shop", user.get("user_type", "shop")))
    if required - accepted:
        raise HTTPException(400, "All shop agreements must be accepted")
    now = _iso(_now_utc())
    ip = _client_ip(request)
    for code in accepted:
        agr = next((a for a in AGREEMENTS if a["code"] == code), None)
        if agr:
            await _db.agreement_acceptances.insert_one({
                "id": _new_id("aa"), "user_id": user["id"], "shop_id": shop_id,
                "agreement_code": code, "version": agr["version"],
                "accepted_at": now, "ip": ip, "enrollment_mode": "shop",
            })
    await _db.shops.update_one({"id": shop_id}, {"$set": {
        "status": "pending_review", "enrollment_status": "under_review", "updated_at": now,
    }})
    await _audit(user, "shop_submitted", module="enrollment", record_id=shop_id)
    return {"ok": True, "status": "pending_review"}


@router.post("/accept")
async def accept_agreement(body: dict, request: Request, user=Depends(_user_dep)):
    code = body.get("agreement_code")
    agr = next((a for a in AGREEMENTS if a["code"] == code), None)
    if not agr:
        raise HTTPException(404, "Agreement not found")
    shop_id = body.get("shop_id")
    if shop_id:
        s = await _db.shops.find_one({"id": shop_id, "owner_user_id": user["id"]})
        if not s:
            raise HTTPException(404, "Shop not found")
    await _db.agreement_acceptances.insert_one({
        "id": _new_id("aa"), "user_id": user["id"], "shop_id": shop_id,
        "agreement_code": code, "version": agr["version"],
        "accepted_at": _iso(_now_utc()), "ip": _client_ip(request),
        "enrollment_mode": body.get("enrollment_mode", "user"),
    })
    return {"ok": True}


@admin_router.get("/shops")
async def admin_list_shops(status: Optional[str] = None, user=Depends(_user_dep)):
    if user.get("role") != "super_admin":
        raise HTTPException(403, "Forbidden")
    q = {}
    if status:
        q["status"] = status
    return await _db.shops.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)


@admin_router.patch("/shops/{shop_id}/review")
async def admin_review_shop(shop_id: str, body: dict, user=Depends(_user_dep)):
    if user.get("role") != "super_admin":
        raise HTTPException(403, "Forbidden")
    action = body.get("action")
    if action not in ("approve", "reject"):
        raise HTTPException(400, "action must be approve or reject")
    shop = await _db.shops.find_one({"id": shop_id}, {"_id": 0})
    if not shop:
        raise HTTPException(404, "Shop not found")
    now = _iso(_now_utc())
    if action == "approve":
        upd = {"status": "approved", "enrollment_status": "approved", "kyc_status": "verified", "updated_at": now}
        await _db.users.update_one({"id": shop["owner_user_id"]}, {"$set": {
            "enrollment_status": "approved", "kyc_status": "verified", "onboarding_completed": True,
        }})
    else:
        upd = {"status": "rejected", "enrollment_status": "rejected", "rejection_reason": body.get("reason", ""), "updated_at": now}
    await _db.shops.update_one({"id": shop_id}, {"$set": upd})
    await _audit(user, f"shop_{action}", module="enrollment", record_id=shop_id)
    return {"ok": True}


async def ensure_indexes():
    for coll, fields in {
        "shops": ["owner_user_id", "status", "enrollment_status"],
        "agreement_acceptances": ["user_id", "shop_id", "agreement_code"],
    }.items():
        for f in fields:
            try:
                await _db[coll].create_index(f)
            except Exception:
                pass


async def seed_agreements():
    for a in AGREEMENTS:
        await _db.enrollment_agreements.update_one(
            {"code": a["code"]},
            {"$set": {**a, "updated_at": _iso(_now_utc())}},
            upsert=True,
        )

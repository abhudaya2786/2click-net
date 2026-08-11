from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import jwt
import bcrypt
import secrets
import logging
import razorpay
import hmac
import hashlib
import requests
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
AI_PROVIDER = os.environ.get('AI_PROVIDER', 'gemini')
AI_MODEL = os.environ.get('AI_MODEL', 'gemini-3.1-pro-preview')
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')

ROLES = ["super_admin", "vendor", "customer", "contractor"]

app = FastAPI(title="2click.in Enterprise API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("buildsphere")

razor_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razor_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_utc():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": now_utc() + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str, key="access_token", days=7):
    response.set_cookie(key=key, value=token, httponly=True, secure=True,
                        samesite="none", max_age=days * 86400, path="/")


def clean(doc):
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc


async def resolve_user(request: Request) -> Optional[dict]:
    # 1) JWT access token (cookie or bearer)
    token = request.cookies.get("access_token")
    session_token = request.cookies.get("session_token")
    auth_header = request.headers.get("Authorization", "")
    bearer = auth_header[7:] if auth_header.startswith("Bearer ") else None

    # Try JWT
    for candidate in [token, bearer]:
        if candidate:
            try:
                payload = jwt.decode(candidate, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                if payload.get("type") == "access":
                    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
                    if user:
                        return user
            except jwt.PyJWTError:
                pass

    # Try Google session token (cookie or bearer)
    for candidate in [session_token, bearer]:
        if candidate:
            sess = await db.sessions.find_one({"session_token": candidate}, {"_id": 0})
            if sess:
                expires_at = sess["expires_at"]
                if isinstance(expires_at, str):
                    expires_at = datetime.fromisoformat(expires_at)
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at > now_utc():
                    user = await db.users.find_one({"id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
                    if user:
                        return user
    return None


async def get_current_user(request: Request) -> dict:
    user = await resolve_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def get_current_user_optional(request: Request) -> Optional[dict]:
    return await resolve_user(request)


def require_roles(*roles):
    async def checker(request: Request) -> dict:
        user = await get_current_user(request)
        if roles and user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker


async def audit(user, action, meta=None, module="", record_id=None, request=None,
                old_value=None, new_value=None, status="success"):
    """Backward-compatible audit writer. Existing callers keep working; new fields optional."""
    ip = ua = device = None
    if request is not None:
        ip = request.headers.get("x-forwarded-for")
        ip = ip.split(",")[0].strip() if ip else (request.client.host if request.client else None)
        ua = request.headers.get("user-agent")
        device = "mobile" if (ua and ("Mobile" in ua or "Android" in ua or "iPhone" in ua)) else "desktop"
    await db.audit_logs.insert_one({
        "id": new_id("log"), "user_id": user.get("id") if user else None,
        "user_email": user.get("email") if user else None,
        "company_id": user.get("company_id") if user else None, "department_id": None,
        "action": action, "module": module, "record_id": record_id,
        "old_value": old_value, "new_value": new_value, "status": status,
        "ip_address": ip, "user_agent": ua, "device": device,
        "meta": meta or {}, "metadata": meta or {},
        "timestamp": iso(now_utc()), "created_at": iso(now_utc()),
    })


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "customer"
    company: Optional[str] = None
    interests: Optional[List[str]] = None
    business_type: Optional[str] = None
    primary_category: Optional[str] = None
    user_type: Optional[str] = None
    primary_category_id: Optional[str] = None
    category_ids: Optional[List[str]] = None
    department_id: Optional[str] = None
    skills: Optional[List[str]] = None
    service_area: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    portfolio_url: Optional[str] = None
    expected_pricing: Optional[str] = None
    availability: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str
    access_pin: Optional[str] = None


class ProductIn(BaseModel):
    name: str
    category: str
    price: float
    unit: str = "unit"
    stock: int = 0
    description: str = ""
    image: Optional[str] = None


class TenderIn(BaseModel):
    title: str
    description: str
    category: str
    budget: float
    emd: float = 0
    closes_in_minutes: int = 60
    auction: bool = True
    subject: str = "material_supply"
    material_type: str = "general"
    quantity: Optional[float] = None
    unit: Optional[str] = "unit"
    location: Optional[str] = ""
    published: bool = True


class TenderUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    budget: Optional[float] = None
    emd: Optional[float] = None
    closes_in_minutes: Optional[int] = None
    auction: Optional[bool] = None
    subject: Optional[str] = None
    material_type: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    published: Optional[bool] = None
    status: Optional[str] = None


TENDER_SUBJECTS = [
    "material_supply", "civil_construction", "mep", "solar_epc",
    "interior_finishing", "logistics", "consultancy", "labour_services",
]

MATERIAL_TYPES = [
    "steel_tmt", "cement_concrete", "sand_aggregate", "bricks_blocks",
    "electrical", "plumbing", "tiles_flooring", "paint_chemicals",
    "plywood_wood", "solar", "waterproofing", "general",
]

SUBJECT_LABELS = {
    "material_supply": "Material Supply",
    "civil_construction": "Civil & Construction",
    "mep": "MEP (Electrical / Plumbing)",
    "solar_epc": "Solar EPC",
    "interior_finishing": "Interior & Finishing",
    "logistics": "Logistics & Transport",
    "consultancy": "Consultancy & Design",
    "labour_services": "Labour & Services",
}

MATERIAL_LABELS = {
    "steel_tmt": "Steel & TMT",
    "cement_concrete": "Cement & Concrete",
    "sand_aggregate": "Sand & Aggregate",
    "bricks_blocks": "Bricks & Blocks",
    "electrical": "Electrical",
    "plumbing": "Plumbing",
    "tiles_flooring": "Tiles & Flooring",
    "paint_chemicals": "Paint & Chemicals",
    "plywood_wood": "Plywood & Wood",
    "solar": "Solar Equipment",
    "waterproofing": "Waterproofing",
    "general": "General / Mixed",
}


def _enrich_tender(t):
    if not t.get("subject"):
        t["subject"] = "material_supply"
    if not t.get("material_type"):
        t["material_type"] = "general"
    if t.get("published") is None:
        t["published"] = True
    t["subject_label"] = SUBJECT_LABELS.get(t.get("subject"), t.get("subject", "General"))
    t["material_type_label"] = MATERIAL_LABELS.get(t.get("material_type"), t.get("material_type", "General"))
    return t


class BidIn(BaseModel):
    amount: float
    note: Optional[str] = ""


class OrderIn(BaseModel):
    items: List[dict]  # [{product_id, name, price, qty}]
    address: Optional[str] = ""
    site_location: Optional[str] = None
    architect_name: Optional[str] = None
    architect_phone: Optional[str] = None
    company_name: Optional[str] = None
    company_gst: Optional[str] = None
    contact_phone: Optional[str] = None


class SolarIn(BaseModel):
    monthly_bill: float
    roof_area_sqft: float
    state: str = "Maharashtra"
    tariff: float = 8.0


class QuotationIn(BaseModel):
    name: str
    capacity_kw: float
    total_cost: float
    payload: dict


class ProjectIn(BaseModel):
    name: str
    client: str
    budget: float
    location: str = ""
    segment: str = "new_home"
    pincode: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    plot_area_sqft: Optional[float] = None
    floors: int = 1


class BOQIn(BaseModel):
    project_id: str
    item: str
    unit: str
    quantity: float
    rate: float
    brand: Optional[str] = None
    category: Optional[str] = None
    material_id: Optional[str] = None


class DPRIn(BaseModel):
    project_id: str
    date: str
    work_done: str
    labour_count: int = 0
    weather: str = "Clear"


class AIChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None


class TenderSummaryIn(BaseModel):
    text: str


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    import phase3a
    email = body.email.lower()
    user_type = body.user_type or body.role
    role = phase3a.role_for_user_type(user_type)
    if role == "super_admin":
        role = "customer"
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    # Validate category ids on backend (never trust frontend)
    all_cat_ids = list(dict.fromkeys(([body.primary_category_id] if body.primary_category_id else [])
                                     + (body.category_ids or [])))
    valid_ids = []
    for cid in all_cat_ids:
        if await db.categories.find_one({"id": cid, "status": "active"}, {"_id": 0}):
            valid_ids.append(cid)
    uid = new_id("user")
    doc = {
        "id": uid, "name": body.name, "email": email,
        "password_hash": hash_password(body.password), "role": role,
        "user_type": user_type, "default_dashboard": phase3a.dashboard_for_user_type(user_type),
        "company": body.company, "company_id": "company_default", "picture": None, "auth": "jwt",
        "interests": body.interests or [], "business_type": body.business_type,
        "primary_category": body.primary_category, "primary_category_id": body.primary_category_id,
        "department_id": body.department_id, "skills": body.skills or [],
        "service_area": body.service_area or (f"{body.city}, {body.state}" if body.city and body.state else body.city or body.state),
        "state": body.state, "city": body.city, "pincode": body.pincode,
        "lat": body.lat, "lng": body.lng,
        "portfolio_url": body.portfolio_url,
        "expected_pricing": body.expected_pricing, "availability": body.availability,
        "onboarding_completed": True,
        "kyc_status": "pending", "wallet": 0.0, "created_at": iso(now_utc()),
    }
    await db.users.insert_one(doc)
    if valid_ids:
        await phase3a.sync_user_categories(uid, body.primary_category_id, valid_ids)
    token = create_access_token(uid, email)
    set_auth_cookie(response, token)
    await audit(doc, "register", module="users", record_id=uid)
    return {"token": token, "user": {k: v for k, v in clean(doc).items() if k != "password_hash"}}


LOCKOUT_MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
OTP_TTL_MINUTES = 10
RESET_TTL_MINUTES = 60


def _client_ip(request: Request):
    ip = request.headers.get("x-forwarded-for") if request else None
    if ip:
        return ip.split(",")[0].strip()
    return request.client.host if (request and request.client) else "unknown"


def _gen_otp():
    return f"{secrets.randbelow(1000000):06d}"


async def _record_failed_login(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    count = (rec.get("count", 0) if rec else 0) + 1
    upd = {"identifier": identifier, "count": count, "updated_at": iso(now_utc())}
    if count >= LOCKOUT_MAX_ATTEMPTS:
        upd["locked_until"] = iso(now_utc() + timedelta(minutes=LOCKOUT_MINUTES))
        upd["count"] = 0
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": upd}, upsert=True)


async def _check_lockout(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("locked_until"):
        lu = datetime.fromisoformat(rec["locked_until"])
        if lu.tzinfo is None:
            lu = lu.replace(tzinfo=timezone.utc)
        if lu > now_utc():
            mins = max(1, int((lu - now_utc()).total_seconds() // 60) + 1)
            raise HTTPException(status_code=429, detail=f"Too many failed attempts. Try again in {mins} minute(s).")


async def _issue_login_token(user: dict, response: Response):
    token = create_access_token(user["id"], user["email"])
    set_auth_cookie(response, token)
    u = clean(dict(user))
    u.pop("password_hash", None)
    return {"token": token, "user": u}


async def _send_login_otp(user: dict, purpose: str = "login"):
    import mailer
    code = _gen_otp()
    doc = {
        "id": new_id("otp"), "email": user["email"], "purpose": purpose,
        "code_hash": hash_password(code), "used": False, "attempts": 0,
        "expires_at": iso(now_utc() + timedelta(minutes=OTP_TTL_MINUTES)),
        "created_at": iso(now_utc()),
    }
    if os.environ.get("ENABLE_TEST_OTP") == "1":
        doc["dev_code"] = code
    await db.otp_codes.insert_one(doc)
    await mailer.send_email(user["email"], "Your 2click.in login code",
                            mailer.otp_email_html(user.get("name"), code))


def _admin_access_pins() -> list:
    raw = os.environ.get("ADMIN_ACCESS_PIN", "").strip()
    return [p.strip() for p in raw.split(",") if p.strip()]


def _check_admin_network(request: Request, access_pin: Optional[str]):
    pins = _admin_access_pins()
    if pins and access_pin not in pins:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    allowlist = os.environ.get("ADMIN_IP_ALLOWLIST", "").strip()
    if not allowlist:
        return
    ip = _client_ip(request)
    allowed = {a.strip() for a in allowlist.split(",") if a.strip()}
    if ip not in allowed:
        raise HTTPException(status_code=403, detail="Admin access is not allowed from this network")


@api.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower()
    identifier = f"{_client_ip(request)}:{email}"
    await _check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        await _record_failed_login(identifier)
        await audit(user or {"email": email}, "login_failed", module="auth", status="failed", request=request)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("role") == "super_admin":
        await _record_failed_login(identifier)
        await audit(user, "login_blocked_super_admin", module="auth", status="failed", request=request)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    if user.get("two_factor_enabled"):
        await _send_login_otp(user)
        await audit(user, "login_2fa_challenge", module="auth", request=request)
        return {"requires_otp": True, "email": email}
    await audit(user, "login", module="auth", request=request)
    return await _issue_login_token(user, response)


@api.post("/auth/admin/login")
async def admin_login(body: AdminLoginIn, request: Request, response: Response):
    """Secure super-admin login: hidden URL + optional access PIN + mandatory email OTP."""
    try:
        _check_admin_network(request, body.access_pin)
    except HTTPException:
        await audit({"email": body.email.lower()}, "admin_login_denied", module="auth", status="failed", request=request)
        raise
    email = body.email.lower()
    identifier = f"admin:{_client_ip(request)}:{email}"
    await _check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or user.get("role") != "super_admin" or not verify_password(body.password, user.get("password_hash", "")):
        await _record_failed_login(identifier)
        await audit(user or {"email": email}, "admin_login_failed", module="auth", status="failed", request=request)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    await db.login_attempts.delete_one({"identifier": identifier})
    if os.environ.get("ENABLE_TEST_OTP") == "1":
        await audit(user, "admin_login_test_bypass", module="auth", request=request)
        return await _issue_login_token(user, response)
    await _send_login_otp(user, purpose="admin_login")
    await audit(user, "admin_login_2fa_challenge", module="auth", request=request)
    return {"requires_otp": True, "email": email}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session id")
    r = requests.get(
        "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
        headers={"X-Session-ID": session_id}, timeout=15)
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()
    email = data["email"].lower()
    user = await db.users.find_one({"email": email})
    if not user:
        uid = new_id("user")
        user = {
            "id": uid, "name": data.get("name", email), "email": email,
            "role": "customer", "company": None, "picture": data.get("picture"),
            "auth": "google", "kyc_status": "pending", "wallet": 0.0,
            "created_at": iso(now_utc()),
        }
        await db.users.insert_one(dict(user))
    if user.get("role") == "super_admin":
        raise HTTPException(status_code=403, detail="Use the secure admin console to sign in")
    session_token = data["session_token"]
    await db.sessions.insert_one({
        "id": new_id("sess"), "user_id": user["id"], "session_token": session_token,
        "expires_at": iso(now_utc() + timedelta(days=7)), "created_at": iso(now_utc()),
    })
    set_auth_cookie(response, session_token, key="session_token")
    await audit(user, "google_login")
    u = clean(dict(user))
    u.pop("password_hash", None)
    return {"user": u, "token": session_token}


# ---------------------------------------------------------------------------
# Auth hardening: OTP 2FA, forgot/reset password
# ---------------------------------------------------------------------------
class OtpVerifyIn(BaseModel):
    email: EmailStr
    code: str


@api.post("/auth/otp/verify")
async def otp_verify(body: OtpVerifyIn, response: Response):
    email = body.email.lower()
    rec = await db.otp_codes.find_one(
        {"email": email, "purpose": {"$in": ["login", "admin_login"]}, "used": False},
        sort=[("created_at", -1)])
    if not rec:
        raise HTTPException(status_code=400, detail="No pending code. Please log in again.")
    exp = datetime.fromisoformat(rec["expires_at"])
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now_utc():
        raise HTTPException(status_code=400, detail="Code expired. Please log in again.")
    if rec.get("attempts", 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Please log in again.")
    if not verify_password(body.code, rec["code_hash"]):
        await db.otp_codes.update_one({"id": rec["id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail="Invalid code")
    await db.otp_codes.update_one({"id": rec["id"]}, {"$set": {"used": True}})
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await audit(user, "login_2fa_success", module="auth")
    return await _issue_login_token(user, response)


@api.post("/auth/otp/resend")
async def otp_resend(body: dict):
    email = (body.get("email") or "").lower()
    user = await db.users.find_one({"email": email})
    if user and (user.get("two_factor_enabled") or user.get("role") == "super_admin"):
        purpose = "admin_login" if user.get("role") == "super_admin" else "login"
        await _send_login_otp(user, purpose=purpose)
    return {"ok": True}


@api.get("/auth/dev/latest-otp")
async def dev_latest_otp(email: str):
    """Dev/test only — returns latest unused OTP when ENABLE_TEST_OTP=1."""
    if os.environ.get("ENABLE_TEST_OTP") != "1":
        raise HTTPException(status_code=404, detail="Not found")
    rec = await db.otp_codes.find_one(
        {"email": email.lower(), "used": False, "dev_code": {"$exists": True}},
        sort=[("created_at", -1)],
    )
    if not rec or not rec.get("dev_code"):
        raise HTTPException(status_code=404, detail="No OTP available")
    return {"code": rec["dev_code"]}


class ForgotIn(BaseModel):
    email: EmailStr
    origin: Optional[str] = None


@api.post("/auth/forgot-password")
async def forgot_password(body: ForgotIn):
    import mailer
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "id": new_id("prt"), "user_id": user["id"], "email": email, "token": token,
            "used": False, "expires_at": iso(now_utc() + timedelta(minutes=RESET_TTL_MINUTES)),
            "created_at": iso(now_utc()),
        })
        origin = (body.origin or "").rstrip("/")
        link = f"{origin}/reset-password?token={token}"
        await mailer.send_email(email, "Reset your 2click.in password",
                                mailer.reset_email_html(user.get("name"), link))
    return {"ok": True}


class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=6)


@api.post("/auth/reset-password")
async def reset_password(body: ResetIn):
    rec = await db.password_reset_tokens.find_one({"token": body.token, "used": False})
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid or already-used reset link")
    exp = datetime.fromisoformat(rec["expires_at"])
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now_utc():
        raise HTTPException(status_code=400, detail="Reset link expired")
    await db.users.update_one({"id": rec["user_id"]}, {"$set": {"password_hash": hash_password(body.password)}})
    await db.password_reset_tokens.update_one({"id": rec["id"]}, {"$set": {"used": True}})
    user = await db.users.find_one({"id": rec["user_id"]})
    if user:
        await audit(user, "password_reset", module="auth")
    return {"ok": True}


@api.post("/auth/2fa/toggle")
async def toggle_2fa(body: dict, user=Depends(get_current_user)):
    enabled = bool(body.get("enabled"))
    await db.users.update_one({"id": user["id"]}, {"$set": {"two_factor_enabled": enabled}})
    await audit(user, "2fa_toggle", {"enabled": enabled}, module="auth")
    return {"ok": True, "two_factor_enabled": enabled}


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    message: str
    phone: Optional[str] = None
    source: Optional[str] = "contact"
    interest: Optional[str] = None


@api.post("/contact")
async def contact_submit(body: ContactIn):
    doc = {"id": new_id("msg"), **body.model_dump(), "status": "new", "created_at": iso(now_utc())}
    await db.contact_messages.insert_one(dict(doc))
    return {"ok": True}


# ---------------------------------------------------------------------------
# Admin: users, roles, analytics, audit
# ---------------------------------------------------------------------------
@api.get("/admin/users")
async def admin_users(user=Depends(require_roles("super_admin"))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return users


@api.patch("/admin/users/{uid}/role")
async def update_role(uid: str, body: dict, user=Depends(require_roles("super_admin"))):
    role = body.get("role")
    if role not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    await db.users.update_one({"id": uid}, {"$set": {"role": role}})
    await audit(user, "update_role", {"target": uid, "role": role})
    return {"ok": True}


@api.patch("/admin/users/{uid}/kyc")
async def update_kyc(uid: str, body: dict, user=Depends(require_roles("super_admin"))):
    status = body.get("status", "verified")
    await db.users.update_one({"id": uid}, {"$set": {"kyc_status": status}})
    return {"ok": True}


@api.delete("/admin/users/{uid}")
async def delete_user(uid: str, user=Depends(require_roles("super_admin"))):
    await db.users.delete_one({"id": uid})
    await audit(user, "delete_user", {"target": uid})
    return {"ok": True}


@api.get("/admin/analytics")
async def analytics(user=Depends(require_roles("super_admin"))):
    total_users = await db.users.count_documents({})
    vendors = await db.users.count_documents({"role": "vendor"})
    customers = await db.users.count_documents({"role": "customer"})
    contractors = await db.users.count_documents({"role": "contractor"})
    products = await db.products.count_documents({})
    tenders = await db.tenders.count_documents({})
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    revenue = sum(o.get("total", 0) for o in orders if o.get("status") == "paid")
    # revenue by month (mock trend from orders)
    trend = {}
    for o in orders:
        m = (o.get("created_at") or "")[:7]
        trend[m] = trend.get(m, 0) + o.get("total", 0)
    by_role = [
        {"name": "Vendors", "value": vendors},
        {"name": "Customers", "value": customers},
        {"name": "Contractors", "value": contractors},
    ]
    return {
        "total_users": total_users, "vendors": vendors, "customers": customers,
        "contractors": contractors, "products": products, "tenders": tenders,
        "orders": len(orders), "revenue": revenue,
        "by_role": by_role,
        "revenue_trend": [{"month": k, "revenue": round(v, 2)} for k, v in sorted(trend.items())],
    }


@api.get("/admin/audit")
async def get_audit(user=Depends(require_roles("super_admin"))):
    logs = await db.audit_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return logs


# ---------------------------------------------------------------------------
# Marketplace: products, categories, orders, payments
# ---------------------------------------------------------------------------
@api.get("/products")
async def list_products(category: Optional[str] = None, q: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return products


@api.get("/products/categories")
async def categories():
    cats = await db.products.distinct("category")
    return cats


@api.get("/products/{pid}")
async def get_product(pid: str):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p


@api.post("/products")
async def create_product(body: ProductIn, user=Depends(require_roles("vendor", "super_admin"))):
    doc = body.model_dump()
    doc.update({"id": new_id("prod"), "vendor_id": user["id"],
                "vendor_name": user.get("company") or user.get("name"),
                "rating": 4.5, "created_at": iso(now_utc())})
    await db.products.insert_one(dict(doc))
    return clean(doc)


@api.delete("/products/{pid}")
async def delete_product(pid: str, user=Depends(require_roles("vendor", "super_admin"))):
    q = {"id": pid} if user["role"] == "super_admin" else {"id": pid, "vendor_id": user["id"]}
    await db.products.delete_one(q)
    return {"ok": True}


@api.get("/vendor/products")
async def vendor_products(user=Depends(require_roles("vendor", "super_admin"))):
    q = {} if user["role"] == "super_admin" else {"vendor_id": user["id"]}
    return await db.products.find(q, {"_id": 0}).to_list(200)


@api.post("/orders")
async def create_order(body: OrderIn, user=Depends(get_current_user)):
    total = sum(i["price"] * i.get("qty", 1) for i in body.items)
    tax = round(total * 0.18, 2)
    grand = round(total + tax, 2)
    # Phase 3 commission engine
    import phase3
    cfg = await phase3.get_commission_config()
    commission = 0.0
    for it in body.items:
        line = it["price"] * it.get("qty", 1)
        pct = phase3.commission_for(cfg, it.get("category"))
        commission += line * pct / 100
    commission = round(commission, 2)
    doc = {
        "id": new_id("order"), "user_id": user["id"], "user_email": user["email"],
        "user_name": user.get("name"),
        "company_id": user.get("company_id", "company_default"),
        "items": body.items, "subtotal": total, "tax": tax, "total": grand,
        "platform_commission": commission,
        "address": body.address, "status": "pending",
        "site_location": body.site_location, "architect_name": body.architect_name,
        "architect_phone": body.architect_phone, "company_name": body.company_name,
        "company_gst": body.company_gst, "contact_phone": body.contact_phone,
        "created_at": iso(now_utc()),
    }
    await db.orders.insert_one(dict(doc))
    return clean(doc)


@api.get("/orders")
async def list_orders(user=Depends(get_current_user)):
    q = {} if user["role"] == "super_admin" else {"user_id": user["id"]}
    return await db.orders.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.get("/vendor/orders")
async def vendor_orders(user=Depends(require_roles("vendor", "super_admin"))):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    if user["role"] == "super_admin":
        return orders
    my_products = await db.products.find({"vendor_id": user["id"]}, {"_id": 0, "id": 1}).to_list(1000)
    my_ids = {p["id"] for p in my_products}
    result = [o for o in orders if any(it.get("product_id") in my_ids for it in o["items"])]
    return result


@api.post("/payments/create")
async def create_payment(body: dict, user=Depends(get_current_user)):
    order_id = body.get("order_id")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    amount_paise = int(order["total"] * 100)
    if razor_client:
        ro = razor_client.order.create({"amount": amount_paise, "currency": "INR", "payment_capture": 1})
        await db.orders.update_one({"id": order_id}, {"$set": {"razorpay_order_id": ro["id"]}})
        return {"mode": "live", "key_id": RAZORPAY_KEY_ID, "razorpay_order_id": ro["id"],
                "amount": amount_paise, "currency": "INR"}
    # Demo mode fallback (no keys configured)
    return {"mode": "demo", "amount": amount_paise, "currency": "INR", "order_id": order_id}


@api.post("/payments/verify")
async def verify_payment(body: dict, user=Depends(get_current_user)):
    order_id = body.get("order_id")
    if body.get("mode") == "demo" or not razor_client:
        await db.orders.update_one({"id": order_id}, {"$set": {"status": "paid", "paid_at": iso(now_utc())}})
        await audit(user, "payment_demo", {"order_id": order_id})
        return {"ok": True, "status": "paid", "mode": "demo"}
    try:
        razor_client.utility.verify_payment_signature({
            "razorpay_order_id": body["razorpay_order_id"],
            "razorpay_payment_id": body["razorpay_payment_id"],
            "razorpay_signature": body["razorpay_signature"],
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Signature verification failed")
    await db.orders.update_one({"id": order_id}, {"$set": {"status": "paid", "paid_at": iso(now_utc())}})
    return {"ok": True, "status": "paid", "mode": "live"}


# ---------------------------------------------------------------------------
# Tenders + Reverse Auction
# ---------------------------------------------------------------------------
@api.get("/tenders/meta")
async def tender_meta():
    return {
        "subjects": [{"id": s, "label": SUBJECT_LABELS[s]} for s in TENDER_SUBJECTS],
        "material_types": [{"id": m, "label": MATERIAL_LABELS[m]} for m in MATERIAL_TYPES],
    }


@api.get("/tenders")
async def list_tenders(
    subject: Optional[str] = None,
    material_type: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    published_only: bool = True,
    mine: bool = False,
    user: Optional[dict] = Depends(get_current_user_optional),
):
    filt = {}
    if published_only and not mine:
        filt["published"] = {"$ne": False}
    if mine and user:
        filt["owner_id"] = user["id"]
    if subject:
        filt["subject"] = subject
    if material_type:
        filt["material_type"] = material_type
    if status:
        filt["status"] = status
    tenders = await db.tenders.find(filt, {"_id": 0}).sort("created_at", -1).to_list(200)
    if q:
        ql = q.lower()
        tenders = [t for t in tenders if ql in t.get("title", "").lower() or ql in t.get("description", "").lower()]
    for t in tenders:
        t["bid_count"] = await db.bids.count_documents({"tender_id": t["id"]})
        _enrich_tender(t)
    grouped = {}
    for t in tenders:
        key = t.get("material_type") or "general"
        grouped.setdefault(key, []).append(t)
    return {"tenders": tenders, "grouped_by_material": grouped, "total": len(tenders)}


@api.get("/tenders/{tid}")
async def get_tender(tid: str):
    t = await db.tenders.find_one({"id": tid}, {"_id": 0})
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    bids = await db.bids.find({"tender_id": tid}, {"_id": 0}).sort("amount", 1).to_list(200)
    for i, b in enumerate(bids):
        b["rank"] = i + 1
    t["bids"] = bids
    t["lowest_bid"] = bids[0]["amount"] if bids else None
    t["bid_count"] = len(bids)
    _enrich_tender(t)
    return t


@api.post("/tenders")
async def create_tender(body: TenderIn, user=Depends(require_roles("customer", "contractor", "super_admin"))):
    if body.subject not in TENDER_SUBJECTS:
        raise HTTPException(status_code=400, detail="Invalid subject")
    if body.material_type not in MATERIAL_TYPES:
        raise HTTPException(status_code=400, detail="Invalid material_type")
    doc = body.model_dump()
    doc.update({
        "id": new_id("tender"), "owner_id": user["id"], "owner_name": user.get("name"),
        "status": "open", "created_at": iso(now_utc()),
        "closes_at": iso(now_utc() + timedelta(minutes=body.closes_in_minutes)),
        "updated_at": iso(now_utc()),
    })
    await db.tenders.insert_one(dict(doc))
    await audit(user, "create_tender", {"tender_id": doc["id"]})
    return clean(_enrich_tender(doc))


@api.patch("/tenders/{tid}")
async def update_tender(tid: str, body: TenderUpdateIn, user=Depends(get_current_user)):
    t = await db.tenders.find_one({"id": tid}, {"_id": 0})
    if not t:
        raise HTTPException(status_code=404, detail="Tender not found")
    if user["role"] != "super_admin" and t.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Only owner or admin can edit")
    if t.get("status") in ("awarded", "closed") and user["role"] != "super_admin":
        raise HTTPException(status_code=400, detail="Cannot edit closed/awarded tender")
    upd = body.model_dump(exclude_unset=True)
    if "subject" in upd and upd["subject"] not in TENDER_SUBJECTS:
        raise HTTPException(status_code=400, detail="Invalid subject")
    if "material_type" in upd and upd["material_type"] not in MATERIAL_TYPES:
        raise HTTPException(status_code=400, detail="Invalid material_type")
    if "closes_in_minutes" in upd:
        upd["closes_at"] = iso(now_utc() + timedelta(minutes=upd.pop("closes_in_minutes")))
    upd["updated_at"] = iso(now_utc())
    await db.tenders.update_one({"id": tid}, {"$set": upd})
    doc = await db.tenders.find_one({"id": tid}, {"_id": 0})
    await audit(user, "update_tender", {"tender_id": tid, "fields": list(upd.keys())})
    return clean(_enrich_tender(doc))


@api.delete("/tenders/{tid}")
async def delete_tender(tid: str, user=Depends(get_current_user)):
    t = await db.tenders.find_one({"id": tid}, {"_id": 0})
    if not t:
        raise HTTPException(status_code=404, detail="Tender not found")
    if user["role"] != "super_admin" and t.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.tenders.update_one({"id": tid}, {"$set": {"status": "closed", "published": False, "updated_at": iso(now_utc())}})
    await audit(user, "close_tender", {"tender_id": tid})
    return {"ok": True}


@api.post("/tenders/{tid}/bids")
async def place_bid(tid: str, body: BidIn, user=Depends(require_roles("vendor", "contractor", "super_admin"))):
    t = await db.tenders.find_one({"id": tid}, {"_id": 0})
    if not t:
        raise HTTPException(status_code=404, detail="Tender not found")
    closes_at = datetime.fromisoformat(t["closes_at"])
    if closes_at.tzinfo is None:
        closes_at = closes_at.replace(tzinfo=timezone.utc)
    if closes_at < now_utc() or t["status"] != "open":
        raise HTTPException(status_code=400, detail="Tender closed")
    doc = {
        "id": new_id("bid"), "tender_id": tid, "bidder_id": user["id"],
        "bidder_name": user.get("company") or user.get("name"),
        "amount": body.amount, "note": body.note, "created_at": iso(now_utc()),
    }
    await db.bids.insert_one(dict(doc))
    await audit(user, "place_bid", {"tender_id": tid, "amount": body.amount})
    return clean(doc)


@api.post("/tenders/{tid}/award")
async def award_tender(tid: str, body: dict, user=Depends(require_roles("customer", "contractor", "super_admin"))):
    await db.tenders.update_one({"id": tid}, {"$set": {"status": "awarded", "awarded_to": body.get("bid_id")}})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Solar
# ---------------------------------------------------------------------------
@api.post("/solar/calculate")
async def solar_calc(body: SolarIn):
    monthly_units = body.monthly_bill / max(body.tariff, 1)
    daily_units = monthly_units / 30
    required_kw = round(daily_units / 4.0, 2)  # ~4 sun hours
    area_supported = round(body.roof_area_sqft / 100, 2)  # ~100 sqft per kW
    capacity = min(required_kw, area_supported) if area_supported else required_kw
    capacity = round(max(capacity, 1), 2)
    cost_per_kw = 55000
    total_cost = round(capacity * cost_per_kw, 2)
    subsidy = round(min(capacity, 3) * 18000 + max(capacity - 3, 0) * 9000, 2) if capacity <= 10 else 78000.0
    net_cost = round(total_cost - subsidy, 2)
    annual_generation = round(capacity * 4 * 365, 2)
    annual_savings = round(annual_generation * body.tariff, 2)
    payback_years = round(net_cost / max(annual_savings, 1), 2)
    co2_offset = round(annual_generation * 0.82 / 1000, 2)
    return {
        "recommended_capacity_kw": capacity, "total_cost": total_cost,
        "subsidy": subsidy, "net_cost": net_cost,
        "annual_generation_kwh": annual_generation, "annual_savings": annual_savings,
        "payback_years": payback_years, "co2_offset_tonnes": co2_offset,
        "roi_25yr": round(annual_savings * 25 - net_cost, 2),
    }


@api.post("/solar/quotations")
async def save_quote(body: QuotationIn, user=Depends(get_current_user)):
    doc = body.model_dump()
    doc.update({"id": new_id("quote"), "user_id": user["id"], "created_at": iso(now_utc())})
    await db.quotations.insert_one(dict(doc))
    return clean(doc)


@api.get("/solar/quotations")
async def list_quotes(user=Depends(get_current_user)):
    return await db.quotations.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


# ---------------------------------------------------------------------------
# Construction ERP
# ---------------------------------------------------------------------------
@api.get("/erp/projects")
async def list_projects(user=Depends(get_current_user)):
    if user["role"] == "super_admin":
        q = {}
    elif user["role"] == "customer":
        q = {"$or": [{"customer_id": user["id"]}, {"owner_id": user["id"]}]}
    else:
        q = {"owner_id": user["id"]}
    return await db.projects.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)


@api.post("/erp/projects")
async def create_project(body: ProjectIn, user=Depends(get_current_user)):
    if user["role"] not in ("contractor", "super_admin", "customer"):
        raise HTTPException(status_code=403, detail="Forbidden")
    doc = body.model_dump()
    doc.update({
        "id": new_id("proj"),
        "owner_id": user["id"],
        "customer_id": user["id"] if user["role"] == "customer" else None,
        "lifecycle_stage": "planning",
        "segment": doc.get("segment") or "new_home",
        "progress": 0,
        "status": "active",
        "created_at": iso(now_utc()),
    })
    await db.projects.insert_one(dict(doc))
    return clean(doc)


def _can_access_project(proj, user):
    if user["role"] == "super_admin":
        return True
    if proj.get("owner_id") == user["id"] or proj.get("customer_id") == user["id"]:
        return True
    if proj.get("assigned_architect_id") == user["id"] or proj.get("assigned_engineer_id") == user["id"]:
        return True
    return False


@api.get("/erp/boq/{project_id}")
async def list_boq(project_id: str, user=Depends(get_current_user)):
    proj = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if not _can_access_project(proj, user):
        raise HTTPException(status_code=403, detail="Forbidden")
    items = await db.boq.find({"project_id": project_id}, {"_id": 0}).to_list(500)
    total = sum(i["amount"] for i in items)
    return {"items": items, "total": round(total, 2)}


@api.post("/erp/boq")
async def add_boq(body: BOQIn, user=Depends(require_roles("contractor", "super_admin"))):
    proj = await db.projects.find_one({"id": body.project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "super_admin" and proj.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    doc = body.model_dump()
    doc["amount"] = round(body.quantity * body.rate, 2)
    doc.update({"id": new_id("boq"), "created_at": iso(now_utc())})
    await db.boq.insert_one(dict(doc))
    return clean(doc)


def _render_boq_pdf(proj, items, total):
    import io
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    orange = colors.HexColor("#FF5A1F")
    x = 18 * mm
    c.setFillColor(orange); c.rect(0, h - 12 * mm, w, 12 * mm, fill=1, stroke=0)
    c.setFillColor(orange); c.setFont("Helvetica-Bold", 20); c.drawString(x, h - 26 * mm, "2click.in")
    c.setFillColor(colors.black); c.setFont("Helvetica-Bold", 14)
    c.drawRightString(w - x, h - 24 * mm, "BILL OF QUANTITIES")
    c.setFont("Helvetica", 10)
    c.drawString(x, h - 34 * mm, f"Project: {proj.get('name', '-')}")
    c.drawString(x, h - 40 * mm, f"Client: {proj.get('client', '-')}   Location: {proj.get('location', '-')}")
    y = h - 52 * mm
    c.setFillColor(colors.HexColor("#111827")); c.rect(x, y, w - 2 * x, 8 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 2 * mm, y + 2.5 * mm, "ITEM / BRAND")
    c.drawRightString(w - x - 55 * mm, y + 2.5 * mm, "QTY")
    c.drawRightString(w - x - 38 * mm, y + 2.5 * mm, "UNIT")
    c.drawRightString(w - x - 20 * mm, y + 2.5 * mm, "RATE")
    c.drawRightString(w - x - 2 * mm, y + 2.5 * mm, "AMOUNT")
    c.setFillColor(colors.black); c.setFont("Helvetica", 9)
    y -= 4 * mm
    for it in items:
        y -= 7 * mm
        if y < 25 * mm:
            c.showPage(); y = h - 25 * mm; c.setFont("Helvetica", 9)
        label = it.get("item", "")
        if it.get("brand"):
            label += f"  [{it['brand']}]"
        c.drawString(x + 2 * mm, y, label[:58])
        c.drawRightString(w - x - 55 * mm, y, str(it.get("quantity", "")))
        c.drawRightString(w - x - 38 * mm, y, str(it.get("unit", "")))
        c.drawRightString(w - x - 20 * mm, y, f"{float(it.get('rate', 0)):,.2f}")
        c.drawRightString(w - x - 2 * mm, y, f"{float(it.get('amount', 0)):,.2f}")
        c.setStrokeColor(colors.HexColor("#E5E7EB")); c.line(x, y - 2 * mm, w - x, y - 2 * mm)
    y -= 12 * mm
    c.setFont("Helvetica-Bold", 13); c.setFillColor(orange)
    c.drawRightString(w - x - 20 * mm, y, "TOTAL")
    c.drawRightString(w - x - 2 * mm, y, f"Rs {float(total):,.2f}")
    c.setFillColor(colors.HexColor("#9CA3AF")); c.setFont("Helvetica", 8)
    c.drawCentredString(w / 2, 14 * mm, "Rates sourced from 2click.in Super Mart · system-generated BOQ")
    c.showPage(); c.save()
    return buf.getvalue()


@api.get("/erp/boq/{project_id}/pdf")
async def boq_pdf(project_id: str, user=Depends(require_roles("contractor", "super_admin"))):
    proj = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if user["role"] != "super_admin" and proj.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    items = await db.boq.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    total = sum(i.get("amount", 0) for i in items)
    pdf = _render_boq_pdf(proj, items, total)
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="BOQ-{project_id[:10]}.pdf"'})


@api.get("/erp/dpr/{project_id}")
async def list_dpr(project_id: str, user=Depends(require_roles("contractor", "super_admin"))):
    return await db.dpr.find({"project_id": project_id}, {"_id": 0}).sort("date", -1).to_list(200)


@api.post("/erp/dpr")
async def add_dpr(body: DPRIn, user=Depends(require_roles("contractor", "super_admin"))):
    doc = body.model_dump()
    doc.update({"id": new_id("dpr"), "created_at": iso(now_utc())})
    await db.dpr.insert_one(dict(doc))
    return clean(doc)


# ---------------------------------------------------------------------------
# AI (Emergent LLM)
# ---------------------------------------------------------------------------
def get_chat(session_id, system):
    from emergentintegrations.llm.chat import LlmChat
    return LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id,
                   system_message=system).with_model(AI_PROVIDER, AI_MODEL)


@api.post("/ai/chat")
async def ai_chat(body: AIChatIn, user=Depends(get_current_user)):
    from emergentintegrations.llm.chat import UserMessage, TextDelta, StreamDone
    session_id = body.session_id or new_id("chat")
    system = ("You are 2click.in AI, an expert assistant for a construction, tender, "
              "solar and B2B marketplace platform in India. Be concise, practical, and helpful "
              "with BOQ, tenders, solar sizing, GST, and procurement questions.")
    chat = get_chat(session_id, system)

    async def gen():
        yield f"data:{{\"session_id\":\"{session_id}\"}}\n\n"
        try:
            async for ev in chat.stream_message(UserMessage(text=body.message)):
                if isinstance(ev, TextDelta):
                    import json
                    yield f"data:{json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            import json
            yield f"data:{json.dumps({'delta': f'[AI error: {str(e)}]'})}\n\n"
        yield "data:[DONE]\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api.post("/ai/tender-summary")
async def tender_summary(body: TenderSummaryIn, user=Depends(get_current_user)):
    fallback = _demo_tender_summary(body.text)
    if not EMERGENT_LLM_KEY:
        return {"summary": fallback, "demo": True}
    try:
        from emergentintegrations.llm.chat import UserMessage
        chat = get_chat(new_id("summary"),
                        "You summarize tender/RFP documents. Return a crisp summary with: Scope, "
                        "Key Deliverables, Eligibility, EMD, Timeline, and Red Flags. Use short bullet points.")
        result = await chat.send_message(UserMessage(text=f"Summarize this tender:\n\n{body.text}"))
        return {"summary": result}
    except Exception as exc:
        logger.warning("tender-summary AI fallback: %s", exc)
        return {"summary": fallback, "demo": True}


def _demo_tender_summary(text: str) -> str:
    snippet = (text or "").strip()[:400]
    return (
        "Scope\n- " + (snippet or "Construction supply tender") + "\n\n"
        "Key Deliverables\n- Materials/services per tender document\n- GST invoice and delivery schedule\n\n"
        "Eligibility\n- Registered vendor with relevant experience\n\n"
        "EMD & Timeline\n- As stated in tender notice\n\n"
        "Red Flags\n- Verify site visit, payment terms, and penalty clauses before bidding."
    )


# ---------------------------------------------------------------------------
# Seed
# ---------------------------------------------------------------------------
async def seed():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id")

    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": new_id("user"), "name": "Platform Owner", "email": admin_email,
            "password_hash": hash_password(admin_pw), "role": "super_admin",
            "company": "2click.in", "picture": None, "auth": "jwt",
            "kyc_status": "verified", "wallet": 0.0, "two_factor_enabled": True,
            "created_at": iso(now_utc()),
        })
    else:
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_pw), "role": "super_admin",
                                            "two_factor_enabled": True}})

    # demo users
    demo = [
        ("Anil Steel Traders", "vendor@2click.in", "vendor", "Anil Steel Traders"),
        ("Priya Sharma", "customer@2click.in", "customer", None),
        ("Rajesh Constructions", "contractor@2click.in", "contractor", "Rajesh Constructions Pvt Ltd"),
        ("Aarav Mehta", "architect@2click.in", "architect", "Aarav Design Studio"),
    ]
    vendor_id = None
    for name, email, role, company in demo:
        u = await db.users.find_one({"email": email})
        extra = {}
        if role == "architect":
            extra = {
                "user_type": "architect",
                "default_dashboard": "freelancer",
                "skills": ["Architecture", "CAD", "BOQ"],
                "service_area": "Pune, Mumbai",
                "portfolio_url": "https://2click.in",
                "expected_pricing": "₹500/sqft design",
                "availability": "Available",
                "rating": 4.8,
            }
        if not u:
            uid = new_id("user")
            await db.users.insert_one({
                "id": uid, "name": name, "email": email,
                "password_hash": hash_password("Demo@12345"), "role": role,
                "company": company, "picture": None, "auth": "jwt",
                "kyc_status": "verified", "wallet": 25000.0, "created_at": iso(now_utc()),
                "user_type": extra.get("user_type", role),
                "default_dashboard": extra.get("default_dashboard", role),
                **{k: v for k, v in extra.items() if k not in ("user_type", "default_dashboard")},
            })
            if role == "vendor":
                vendor_id = uid
        else:
            patch = {"password_hash": hash_password("Demo@12345"), **extra}
            if role == "architect":
                patch["user_type"] = "architect"
                patch["default_dashboard"] = "freelancer"
            await db.users.update_one({"email": email}, {"$set": patch})
            if role == "vendor":
                vendor_id = u["id"]

    if await db.products.count_documents({}) == 0 and vendor_id:
        prods = [
            ("TMT Steel Bars Fe500D (12mm)", "Steel & TMT", 62.5, "kg", 50000,
             "https://images.unsplash.com/photo-1763926062529-1edf8664c366?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"),
            ("OPC 53 Grade Cement", "Cement", 385.0, "bag", 8000,
             "https://images.pexels.com/photos/29817952/pexels-photo-29817952.jpeg?auto=compress&cs=tinysrgb&w=800"),
            ("Red Clay Bricks (Class A)", "Bricks & Blocks", 9.0, "piece", 200000,
             "https://images.unsplash.com/photo-1762380368593-a0d4c49af47f?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"),
            ("330W Mono PERC Solar Panel", "Solar", 8900.0, "panel", 1200,
             "https://images.pexels.com/photos/9875418/pexels-photo-9875418.jpeg?auto=compress&cs=tinysrgb&w=800"),
            ("River Sand (M-Sand)", "Aggregates", 45.0, "cft", 30000,
             "https://images.unsplash.com/photo-1730627283177-f43b83c3850c?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"),
            ("PVC Pipes 4 inch (SWR)", "Plumbing", 320.0, "meter", 15000,
             "https://images.unsplash.com/photo-1763926025678-95d196d0ab28?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"),
        ]
        for name, cat, price, unit, stock, img in prods:
            await db.products.insert_one({
                "id": new_id("prod"), "name": name, "category": cat, "price": price,
                "unit": unit, "stock": stock, "description": f"Premium grade {name}. Bulk supply available with GST invoice.",
                "image": img, "vendor_id": vendor_id, "vendor_name": "Anil Steel Traders",
                "rating": 4.6, "created_at": iso(now_utc()),
            })

    if await db.tenders.count_documents({}) == 0:
        cust = await db.users.find_one({"email": "customer@2click.in"})
        tenders = [
            ("Supply of 200MT TMT Steel Bars", "Steel & TMT", 12500000, 125000,
             "Requirement of Fe500D TMT bars for a G+12 residential tower in Pune. Delivery in 3 phases over 45 days.",
             "material_supply", "steel_tmt", 200, "MT", "Pune, Maharashtra"),
            ("Rooftop Solar 500kW EPC", "Solar", 27500000, 275000,
             "Design, supply and installation of 500kW grid-tied rooftop solar plant for an industrial shed in Nashik.",
             "solar_epc", "solar", 500, "kW", "Nashik, Maharashtra"),
            ("RMC Supply for Metro Project", "Concrete", 45000000, 450000,
             "Ready mix concrete M40/M50 grade supply for metro viaduct construction. AAC certified plants only.",
             "civil_construction", "cement_concrete", 5000, "cum", "Delhi NCR"),
            ("CPVC Plumbing Package — 120 Units", "Plumbing", 3200000, 32000,
             "Complete CPVC plumbing material for a residential township. ISI marked pipes and fittings.",
             "material_supply", "plumbing", 120, "units", "Lucknow, UP"),
            ("Vitrified Tiles 45,000 sqft", "Tiles", 2800000, 28000,
             "600x600 vitrified tiles for commercial complex. Sample approval mandatory before dispatch.",
             "interior_finishing", "tiles_flooring", 45000, "sqft", "Gurugram, Haryana"),
            ("Electrical Wiring — 85,000 sqft", "Electrical", 4100000, 41000,
             "Concealed electrical wiring, MCB panel, earthing for G+8 apartment. IS 732 compliant wire.",
             "mep", "electrical", 85000, "sqft", "Gorakhpur, UP"),
        ]
        for title, cat, budget, emd, desc, subject, material_type, qty, unit, loc in tenders:
            await db.tenders.insert_one({
                "id": new_id("tender"), "title": title, "description": desc, "category": cat,
                "budget": budget, "emd": emd, "auction": True, "closes_in_minutes": 1440,
                "subject": subject, "material_type": material_type,
                "quantity": qty, "unit": unit, "location": loc, "published": True,
                "owner_id": cust["id"] if cust else None, "owner_name": "Priya Sharma",
                "status": "open", "created_at": iso(now_utc()),
                "closes_at": iso(now_utc() + timedelta(hours=24)),
                "updated_at": iso(now_utc()),
            })

    logger.info("Seed complete")


@app.on_event("startup")
async def startup():
    await seed()
    import rbac
    rbac.init(db, get_current_user)
    await rbac.ensure_indexes()
    await rbac.seed_rbac()
    import phase3
    phase3.init(db, get_current_user)
    await phase3.ensure_indexes()
    await phase3.seed_phase3()
    import phase3a
    phase3a.init(db, get_current_user)
    await phase3a.ensure_indexes()
    await phase3a.seed_phase3a()
    import phase3c
    phase3c.init(db, get_current_user)
    await phase3c.ensure_indexes()
    import mart
    mart.init(db)
    await mart.ensure_indexes()
    await mart.seed_mart()
    await mart.migrate_mart()
    import payments_stripe
    payments_stripe.init(db, get_current_user)
    await payments_stripe.ensure_indexes()
    import solar_epc
    solar_epc.init(db, get_current_user)
    await solar_epc.ensure_indexes()
    solar_epc.init_storage_safe()
    import wallet
    wallet.init(db, get_current_user)
    await wallet.ensure_indexes()
    await wallet.migrate()
    import ads
    ads.init(db, get_current_user)
    await ads.ensure_indexes()
    await ads.seed_placements()
    import site_config as _sc
    _sc.init(db)
    await _sc.ensure_indexes()
    await _sc.seed_geo()
    import enrollment as _enr
    _enr.init(db, get_current_user, {
        "audit": audit, "hash_password": hash_password, "verify_password": verify_password,
        "create_access_token": create_access_token, "set_auth_cookie": set_auth_cookie,
        "clean": clean, "new_id": new_id, "iso": iso, "now_utc": now_utc,
    })
    await _enr.ensure_indexes()
    await _enr.seed_agreements()
    await db.login_attempts.create_index("identifier")
    await db.otp_codes.create_index("email")
    await db.password_reset_tokens.create_index("token")
    logger.info("RBAC + Phase3 + Phase3A + Phase3C + Mart + Payments + Auth-hardening ready")


@app.on_event("shutdown")
async def shutdown():
    client.close()


@api.get("/")
async def root():
    return {"message": "2click.in Enterprise API", "status": "ok"}


import rbac as _rbac
_rbac.init(db, get_current_user)
import phase3 as _phase3
_phase3.init(db, get_current_user)
import phase3a as _phase3a
_phase3a.init(db, get_current_user)
import phase3c as _phase3c
_phase3c.init(db, get_current_user)
import mart as _mart
_mart.init(db)
import payments_stripe as _pstripe
_pstripe.init(db, get_current_user)
import solar_epc as _solar
_solar.init(db, get_current_user)
import wallet as _wallet
_wallet.init(db, get_current_user)
import ads as _ads
_ads.init(db, get_current_user)
import home_build as _home
_home.init(db, get_current_user)
import site_config as _site
_site.init(db)
import enrollment as _enrollment
_enrollment.init(db, get_current_user, {
    "audit": audit, "hash_password": hash_password, "verify_password": verify_password,
    "create_access_token": create_access_token, "set_auth_cookie": set_auth_cookie,
    "clean": clean, "new_id": new_id, "iso": iso, "now_utc": now_utc,
})
app.include_router(api)
app.include_router(_rbac.rbac_router)
app.include_router(_rbac.auth_perm_router)
app.include_router(_phase3.public_router)
app.include_router(_phase3.admin_router)
app.include_router(_phase3a.public_router)
app.include_router(_phase3a.admin_router)
app.include_router(_phase3c.public_router)
app.include_router(_phase3c.admin_router)
app.include_router(_mart.public_router)
app.include_router(_mart.admin_router)
app.include_router(_pstripe.router)
app.include_router(_solar.router)
app.include_router(_wallet.router)
app.include_router(_ads.router)
app.include_router(_home.router)
app.include_router(_home.admin_router)
app.include_router(_site.public_router)
app.include_router(_site.admin_router)
app.include_router(_enrollment.router)
app.include_router(_enrollment.admin_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

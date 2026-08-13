"""
buildecogroup.com — Real payments via Stripe.
Uses emergentintegrations when installed; otherwise returns a clear 503 so the
owner stack can run without Emergent packages (demo pay remains available).
"""
import os
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import rbac

logger = logging.getLogger("payments_stripe")

try:
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    HAS_EMERGENT_STRIPE = True
except ImportError:  # owner self-host without Emergent wheels
    StripeCheckout = None
    CheckoutSessionRequest = None
    HAS_EMERGENT_STRIPE = False

_db = None
_get_current_user = None


def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user


def now_utc(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat() if isinstance(dt, datetime) else dt
def new_id(p): return f"{p}_{uuid.uuid4().hex[:12]}"

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

router = APIRouter(prefix="/api", tags=["stripe-payments"])


def _client(request: Request):
    if not HAS_EMERGENT_STRIPE:
        raise HTTPException(
            503,
            "Stripe checkout package not installed on this server. "
            "Use demo pay, or install emergentintegrations / wire native Stripe.",
        )
    if not STRIPE_API_KEY:
        raise HTTPException(503, "STRIPE_API_KEY is not configured")
    webhook_url = f"{str(request.base_url)}api/webhook/stripe"
    return StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)


class InvoiceCheckoutIn(BaseModel):
    invoice_id: str
    origin_url: str


@router.post("/payments/invoice-checkout")
async def invoice_checkout(body: InvoiceCheckoutIn, request: Request):
    user = await _get_current_user(request)
    inv = await _db.invoices.find_one({"id": body.invoice_id}, {"_id": 0})
    if not inv:
        raise HTTPException(404, "Invoice not found")
    if inv["user_id"] != user["id"] and user.get("role") != "super_admin":
        raise HTTPException(403, "Forbidden")
    if inv["status"] == "paid":
        raise HTTPException(400, "Invoice already paid")
    amount = round(float(inv["total"]), 2)  # SERVER-SIDE amount, never trust client
    sc = _client(request)
    origin = body.origin_url.rstrip("/")
    req = CheckoutSessionRequest(
        amount=amount, currency="inr",
        success_url=f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{origin}/payment/cancel",
        metadata={"invoice_id": inv["id"], "user_id": user["id"], "type": "invoice"},
    )
    session = await sc.create_checkout_session(req)
    await _db.payment_transactions.insert_one({
        "id": new_id("ptx"), "session_id": session.session_id, "invoice_id": inv["id"],
        "user_id": user["id"], "amount": amount, "currency": "inr",
        "status": "initiated", "payment_status": "pending",
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    })
    return {"checkout_url": session.url, "session_id": session.session_id}


async def _mark_paid(session_id: str, rec: dict):
    r = await _db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "completed", "payment_status": "paid", "updated_at": iso(now_utc())}})
    if r.modified_count and rec.get("invoice_id"):
        inv = await _db.invoices.find_one({"id": rec["invoice_id"]}, {"_id": 0})
        if inv and inv["status"] != "paid":
            await _db.invoices.update_one({"id": inv["id"]}, {"$set": {
                "status": "paid", "paid_at": iso(now_utc()),
                "payment_ref": session_id, "mode": "stripe"}})
            if inv.get("type") == "subscription":
                sid = (inv.get("metadata") or {}).get("subscription_id")
                if sid:
                    await _db.subscriptions.update_one({"id": sid}, {"$set": {"status": "active", "updated_at": iso(now_utc())}})
    if r.modified_count and rec.get("ad_campaign_id"):
        camp = await _db.ad_campaigns.find_one({"id": rec["ad_campaign_id"]}, {"_id": 0})
        if camp and camp.get("payment_status") != "paid":
            await _db.ad_campaigns.update_one({"id": camp["id"]}, {"$set": {
                "payment_status": "paid", "status": "pending_approval",
                "paid_at": iso(now_utc()), "payment_mode": "stripe"}})


@router.get("/payments/status/{session_id}")
async def payment_status(session_id: str, request: Request):
    rec = await _db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Transaction not found")
    if rec.get("payment_status") != "paid":  # webhook fallback: ask Stripe directly
        try:
            st = await _client(request).get_checkout_status(session_id)
            if st.payment_status == "paid" or st.status == "complete":
                await _mark_paid(session_id, rec)
                rec = await _db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        except Exception:
            pass
    return {"session_id": rec["session_id"], "status": rec["status"], "payment_status": rec["payment_status"]}


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    try:
        wr = await _client(request).handle_webhook(body, sig)
    except Exception as e:
        logger.error("Stripe webhook error: %s", str(e))
        raise HTTPException(400, "Invalid webhook")
    if getattr(wr, "payment_status", None) == "paid" and getattr(wr, "session_id", None):
        rec = await _db.payment_transactions.find_one({"session_id": wr.session_id}, {"_id": 0})
        if rec:
            await _mark_paid(wr.session_id, rec)
    return {"status": "ok"}


async def ensure_indexes():
    for f in ["session_id", "invoice_id", "user_id", "payment_status"]:
        try:
            await _db.payment_transactions.create_index(f)
        except Exception:
            pass

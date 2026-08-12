"""
buildecogroup.com — Universal Payment Wallet.
Per-user wallet balance + credit/debit ledger. Only Super Admin can credit/debit
(with a mandatory reason). Users can pay marketplace orders from their wallet.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

logger = logging.getLogger("wallet")

_db = None
_get_current_user = None


def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user


def now_utc(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat() if isinstance(dt, datetime) else dt
def new_id(p): return f"{p}_{uuid.uuid4().hex[:12]}"

router = APIRouter(prefix="/api", tags=["wallet"])


async def _require_super(request: Request):
    user = await _get_current_user(request)
    if user.get("role") != "super_admin":
        raise HTTPException(403, "Only Super Admin can perform this action")
    return user


async def _balance(user_id: str) -> float:
    u = await _db.users.find_one({"id": user_id}, {"_id": 0, "wallet_balance": 1})
    return round(float((u or {}).get("wallet_balance") or 0.0), 2)


async def apply_transaction(user_id, txn_type, amount, reason, created_by=None,
                            created_by_email=None, meta=None):
    """Credit or debit a user's wallet atomically and write a ledger entry.
    Returns the transaction doc. Raises 400 on insufficient balance for debit."""
    amount = round(float(amount), 2)
    if amount <= 0:
        raise HTTPException(400, "Amount must be greater than zero")
    if txn_type not in ("credit", "debit"):
        raise HTTPException(400, "Invalid transaction type")
    delta = amount if txn_type == "credit" else -amount
    if txn_type == "debit":
        updated = await _db.users.find_one_and_update(
            {"id": user_id, "wallet_balance": {"$gte": amount}},
            {"$inc": {"wallet_balance": delta}},
            projection={"_id": 0, "wallet_balance": 1}, return_document=ReturnDocument.AFTER)
        if not updated:
            if not await _db.users.find_one({"id": user_id}, {"_id": 0, "id": 1}):
                raise HTTPException(404, "User not found")
            raise HTTPException(400, "Insufficient wallet balance")
    else:
        updated = await _db.users.find_one_and_update(
            {"id": user_id},
            {"$inc": {"wallet_balance": delta}},
            projection={"_id": 0, "wallet_balance": 1}, return_document=ReturnDocument.AFTER)
        if not updated:
            raise HTTPException(404, "User not found")
    balance_after = round(float(updated.get("wallet_balance") or 0.0), 2)
    txn = {
        "id": new_id("wtx"), "user_id": user_id, "type": txn_type,
        "amount": amount, "reason": reason or "", "balance_after": balance_after,
        "created_by": created_by, "created_by_email": created_by_email,
        "meta": meta or {}, "created_at": iso(now_utc()),
    }
    await _db.wallet_transactions.insert_one(dict(txn))
    txn.pop("_id", None)
    return txn


# --------------------------------------------------------------------------- #
# User endpoints
# --------------------------------------------------------------------------- #
@router.get("/wallet/me")
async def my_wallet(request: Request):
    user = await _get_current_user(request)
    balance = await _balance(user["id"])
    txns = await _db.wallet_transactions.find(
        {"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"balance": balance, "transactions": txns}


@router.post("/orders/{order_id}/pay-wallet")
async def pay_order_wallet(order_id: str, request: Request):
    user = await _get_current_user(request)
    order = await _db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    if order["user_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    if order.get("status") == "paid":
        raise HTTPException(400, "Order already paid")
    amount = round(float(order["total"]), 2)
    txn = await apply_transaction(
        user["id"], "debit", amount, f"Order payment · {order_id}",
        created_by=user["id"], created_by_email=user["email"],
        meta={"order_id": order_id})
    try:
        await _db.orders.update_one({"id": order_id}, {"$set": {
            "status": "paid", "paid_at": iso(now_utc()), "payment_mode": "wallet"}})
    except Exception:
        # Reverse the debit so the customer is never charged without the order flipping to paid.
        await apply_transaction(
            user["id"], "credit", amount, f"Auto-refund · order update failed · {order_id}",
            created_by=user["id"], created_by_email=user["email"],
            meta={"order_id": order_id, "rollback": True})
        raise HTTPException(500, "Payment could not be completed; wallet refunded")
    return {"ok": True, "status": "paid", "balance": txn["balance_after"], "transaction": txn}


# --------------------------------------------------------------------------- #
# Admin (super_admin only)
# --------------------------------------------------------------------------- #
class AdjustIn(BaseModel):
    user_id: str
    type: str  # credit | debit
    amount: float = Field(gt=0)
    reason: str = Field(min_length=2)


@router.get("/admin/wallet/users")
async def admin_wallet_users(request: Request):
    await _require_super(request)
    users = await _db.users.find(
        {}, {"_id": 0, "id": 1, "name": 1, "email": 1, "role": 1, "wallet_balance": 1}
    ).sort("name", 1).to_list(1000)
    for u in users:
        u["wallet_balance"] = round(float(u.get("wallet_balance") or 0.0), 2)
    return users


@router.post("/admin/wallet/adjust")
async def admin_wallet_adjust(body: AdjustIn, request: Request):
    admin = await _require_super(request)
    txn = await apply_transaction(
        body.user_id, body.type, body.amount, body.reason,
        created_by=admin["id"], created_by_email=admin["email"],
        meta={"source": "admin_adjust"})
    return {"ok": True, "transaction": txn, "balance": txn["balance_after"]}


@router.get("/admin/wallet/transactions")
async def admin_wallet_transactions(request: Request, user_id: Optional[str] = Query(None)):
    await _require_super(request)
    q = {"user_id": user_id} if user_id else {}
    txns = await _db.wallet_transactions.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    ids = list({t["user_id"] for t in txns})
    umap = {}
    if ids:
        us = await _db.users.find({"id": {"$in": ids}}, {"_id": 0, "id": 1, "name": 1, "email": 1}).to_list(1000)
        umap = {u["id"]: u for u in us}
    for t in txns:
        u = umap.get(t["user_id"], {})
        t["user_name"] = u.get("name")
        t["user_email"] = u.get("email")
    return txns


async def ensure_indexes():
    for f in ["user_id", "created_at"]:
        try:
            await _db.wallet_transactions.create_index(f)
        except Exception:
            pass


async def migrate():
    """Backfill wallet_balance from legacy `wallet` field (or 0)."""
    try:
        cursor = _db.users.find({"wallet_balance": {"$exists": False}}, {"_id": 0, "id": 1, "wallet": 1})
        async for u in cursor:
            await _db.users.update_one(
                {"id": u["id"]}, {"$set": {"wallet_balance": round(float(u.get("wallet") or 0.0), 2)}})
    except Exception as e:
        logger.warning("wallet migrate skipped: %s", str(e))

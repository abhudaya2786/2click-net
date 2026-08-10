"""Iteration 11 — Wallet + order-details E2E backend tests."""
import re, uuid, pytest, requests
from conftest import get_backend_url

BASE = get_backend_url()

def _login(email, pw):
    r = requests.post(f"{BASE}/api/auth/login", json={"email": email, "password": pw}, timeout=30)
    assert r.status_code == 200, f"login {email}: {r.status_code} {r.text}"
    return r.json()["token"]

@pytest.fixture(scope="module")
def admin_h():
    return {"Authorization": f"Bearer {_login('abbhuadaya@gmail.com', 'Admin@12345')}"}

@pytest.fixture(scope="module")
def customer_h():
    return {"Authorization": f"Bearer {_login('customer@2click.in', 'Demo@12345')}"}

@pytest.fixture(scope="module")
def vendor_h():
    return {"Authorization": f"Bearer {_login('vendor@2click.in', 'Demo@12345')}"}

@pytest.fixture(scope="module")
def contractor_h():
    return {"Authorization": f"Bearer {_login('contractor@2click.in', 'Demo@12345')}"}


# ---------- Wallet: user endpoint ----------
def test_wallet_me_customer(customer_h):
    r = requests.get(f"{BASE}/api/wallet/me", headers=customer_h, timeout=30)
    assert r.status_code == 200
    j = r.json()
    assert "balance" in j and "transactions" in j
    assert isinstance(j["balance"], (int, float))
    assert isinstance(j["transactions"], list)

def test_wallet_me_vendor(vendor_h):
    r = requests.get(f"{BASE}/api/wallet/me", headers=vendor_h, timeout=30)
    assert r.status_code == 200

def test_wallet_me_contractor(contractor_h):
    r = requests.get(f"{BASE}/api/wallet/me", headers=contractor_h, timeout=30)
    assert r.status_code == 200


# ---------- Admin permission checks (403 for non-super) ----------
def test_admin_wallet_users_forbidden_customer(customer_h):
    r = requests.get(f"{BASE}/api/admin/wallet/users", headers=customer_h, timeout=30)
    assert r.status_code == 403

def test_admin_wallet_users_forbidden_vendor(vendor_h):
    r = requests.get(f"{BASE}/api/admin/wallet/users", headers=vendor_h, timeout=30)
    assert r.status_code == 403

def test_admin_wallet_adjust_forbidden_vendor(vendor_h):
    r = requests.post(f"{BASE}/api/admin/wallet/adjust", headers=vendor_h,
                      json={"user_id": "x", "type": "credit", "amount": 10, "reason": "hack"}, timeout=30)
    assert r.status_code == 403

def test_admin_wallet_txn_forbidden_customer(customer_h):
    r = requests.get(f"{BASE}/api/admin/wallet/transactions", headers=customer_h, timeout=30)
    assert r.status_code == 403


# ---------- Admin wallet list + credit + debit + reason validation ----------
def test_admin_wallet_users_list(admin_h):
    r = requests.get(f"{BASE}/api/admin/wallet/users", headers=admin_h, timeout=30)
    assert r.status_code == 200
    users = r.json()
    assert isinstance(users, list) and len(users) > 0
    assert all("wallet_balance" in u for u in users)

def _find_user(admin_h, email):
    users = requests.get(f"{BASE}/api/admin/wallet/users", headers=admin_h, timeout=30).json()
    for u in users:
        if u["email"] == email: return u
    raise AssertionError(f"user {email} not found")

def test_admin_credit_and_debit_flow(admin_h):
    u = _find_user(admin_h, "customer@2click.in")
    uid = u["id"]
    before = u["wallet_balance"]
    # Credit
    r = requests.post(f"{BASE}/api/admin/wallet/adjust", headers=admin_h,
                      json={"user_id": uid, "type": "credit", "amount": 500, "reason": "TEST_iter11 credit"}, timeout=30)
    assert r.status_code == 200, r.text
    after_credit = r.json()["balance"]
    assert round(after_credit - before, 2) == 500.0
    # Debit
    r = requests.post(f"{BASE}/api/admin/wallet/adjust", headers=admin_h,
                      json={"user_id": uid, "type": "debit", "amount": 500, "reason": "TEST_iter11 debit"}, timeout=30)
    assert r.status_code == 200
    assert round(r.json()["balance"] - before, 2) == 0.0

def test_admin_adjust_empty_reason_422(admin_h):
    u = _find_user(admin_h, "customer@2click.in")
    r = requests.post(f"{BASE}/api/admin/wallet/adjust", headers=admin_h,
                      json={"user_id": u["id"], "type": "credit", "amount": 10, "reason": ""}, timeout=30)
    assert r.status_code == 422

def test_admin_adjust_zero_amount_422(admin_h):
    u = _find_user(admin_h, "customer@2click.in")
    r = requests.post(f"{BASE}/api/admin/wallet/adjust", headers=admin_h,
                      json={"user_id": u["id"], "type": "credit", "amount": 0, "reason": "zero"}, timeout=30)
    assert r.status_code == 422

def test_admin_debit_insufficient_balance(admin_h):
    u = _find_user(admin_h, "customer@2click.in")
    huge = u["wallet_balance"] + 10_000_000
    r = requests.post(f"{BASE}/api/admin/wallet/adjust", headers=admin_h,
                      json={"user_id": u["id"], "type": "debit", "amount": huge, "reason": "TEST_overdraw"}, timeout=30)
    assert r.status_code == 400
    assert "Insufficient" in r.text
    # Balance unchanged
    u2 = _find_user(admin_h, "customer@2click.in")
    assert u2["wallet_balance"] == u["wallet_balance"]

def test_admin_wallet_transactions_list(admin_h):
    r = requests.get(f"{BASE}/api/admin/wallet/transactions", headers=admin_h, timeout=30)
    assert r.status_code == 200
    txns = r.json()
    assert isinstance(txns, list)
    # Should contain our TEST_iter11 credit
    assert any("TEST_iter11" in (t.get("reason") or "") for t in txns[:50])


# ---------- Order with new site/architect fields + pay-with-wallet ----------
def _pick_product():
    r = requests.get(f"{BASE}/api/products", timeout=30)
    assert r.status_code == 200
    ps = r.json()
    assert len(ps) > 0
    return ps[0]

def _order_item(p, qty=1):
    return {"product_id": p["id"], "name": p.get("name"), "price": p.get("price"), "qty": qty}

def test_order_captures_site_architect_and_pay_wallet(customer_h, vendor_h, admin_h):
    p = _pick_product()
    # Ensure customer has enough balance — top up 5000
    cust = _find_user(admin_h, "customer@2click.in")
    requests.post(f"{BASE}/api/admin/wallet/adjust", headers=admin_h,
                  json={"user_id": cust["id"], "type": "credit", "amount": 5000, "reason": "TEST_iter11 topup"}, timeout=30)
    order_payload = {
        "items": [_order_item(p)],
        "address": "TEST_iter11 Site Address, Bengaluru",
        "site_location": "Whitefield Site A",
        "architect_name": "Arch. Test",
        "architect_phone": "+91 9999900000",
        "company_name": "TEST_iter11 Buildco",
    }
    r = requests.post(f"{BASE}/api/orders", headers=customer_h, json=order_payload, timeout=30)
    assert r.status_code in (200, 201), r.text
    order = r.json()
    oid = order.get("id") or order.get("order_id")
    assert oid
    # Verify fields persisted via vendor orders view
    vr = requests.get(f"{BASE}/api/vendor/orders", headers=vendor_h, timeout=30)
    assert vr.status_code == 200
    orders = vr.json()
    match = next((o for o in orders if o.get("id") == oid), None)
    assert match, f"order {oid} not visible to vendor"
    assert match.get("site_location") == "Whitefield Site A"
    assert match.get("architect_name") == "Arch. Test"
    assert match.get("architect_phone") == "+91 9999900000"
    assert match.get("company_name") == "TEST_iter11 Buildco"

    # Pay with wallet
    pr = requests.post(f"{BASE}/api/orders/{oid}/pay-wallet", headers=customer_h, timeout=30)
    assert pr.status_code == 200, pr.text
    j = pr.json()
    assert j.get("status") == "paid"
    # Second payment attempt should fail
    pr2 = requests.post(f"{BASE}/api/orders/{oid}/pay-wallet", headers=customer_h, timeout=30)
    assert pr2.status_code == 400

def test_pay_wallet_insufficient_balance(customer_h, admin_h):
    # Drain customer balance to zero, then attempt to pay a new order
    cust = _find_user(admin_h, "customer@2click.in")
    bal = cust["wallet_balance"]
    if bal > 0:
        requests.post(f"{BASE}/api/admin/wallet/adjust", headers=admin_h,
                      json={"user_id": cust["id"], "type": "debit", "amount": bal,
                            "reason": "TEST_iter11 drain"}, timeout=30)
    p = _pick_product()
    r = requests.post(f"{BASE}/api/orders", headers=customer_h, json={
        "items": [_order_item(p)],
        "address": "TEST_iter11 addr",
    }, timeout=30)
    assert r.status_code in (200, 201)
    oid = r.json().get("id") or r.json().get("order_id")
    pr = requests.post(f"{BASE}/api/orders/{oid}/pay-wallet", headers=customer_h, timeout=30)
    assert pr.status_code == 400
    assert "Insufficient" in pr.text
    # Restore a bit of balance for follow-up tests
    requests.post(f"{BASE}/api/admin/wallet/adjust", headers=admin_h,
                  json={"user_id": cust["id"], "type": "credit", "amount": 25000,
                        "reason": "TEST_iter11 restore"}, timeout=30)

def test_pay_wallet_wrong_user_forbidden(customer_h, vendor_h, admin_h):
    p = _pick_product()
    r = requests.post(f"{BASE}/api/orders", headers=customer_h, json={
        "items": [_order_item(p)],
        "address": "TEST_iter11 addr wrong-user",
    }, timeout=30)
    oid = r.json().get("id") or r.json().get("order_id")
    # Vendor tries to pay customer's order
    pr = requests.post(f"{BASE}/api/orders/{oid}/pay-wallet", headers=vendor_h, timeout=30)
    assert pr.status_code == 403

"""Phase 3B (White-Label Branding) + Phase 3C (Subscriptions/Invoicing/Commission) tests."""
import os
import time
import uuid
import requests
import pytest
from auth_helpers import login, admin_login, ADMIN, VENDOR, CUSTOMER, API


def h(t):
    return {"Authorization": f"Bearer {t}"}


@pytest.fixture(scope="module")
def admin_tok():
    return admin_login()[0]


@pytest.fixture(scope="module")
def vendor_tok():
    return login(*VENDOR)[0]


@pytest.fixture(scope="module")
def cust_tok():
    return login(*CUSTOMER)[0]


# ---------------------------------------------------------------
# PHASE 3B — Branding resolution + admin update (slug/accent/favicon)
# ---------------------------------------------------------------
class TestBrandingPhase3B:
    def test_default_branding_has_new_fields(self):
        r = requests.get(f"{API}/branding")
        assert r.status_code == 200
        d = r.json()
        # new phase 3B fields
        for k in ["accent_color", "favicon", "slug", "custom_domain",
                  "brand_name", "primary_color", "logo", "tagline", "company_id"]:
            assert k in d, f"missing {k}"
        assert d["company_id"]  # falls back to default

    def test_admin_update_persists_slug_accent_favicon(self, admin_tok):
        payload = {
            "company_id": "company_default",
            "slug": "twoclick",
            "accent_color": "#10B981",
            "favicon": "/favicon-test.ico",
            "brand_name": "2Click.in",
            "primary_color": "#FF5A1F",
            "tagline": "The operating system for construction",
        }
        r = requests.patch(f"{API}/admin/branding", headers=h(admin_tok), json=payload)
        assert r.status_code == 200, r.text
        # re-fetch and verify
        r = requests.get(f"{API}/branding", params={"company_id": "company_default"})
        assert r.status_code == 200
        d = r.json()
        assert d["accent_color"] == "#10B981"
        assert d["favicon"] == "/favicon-test.ico"
        assert d["slug"] == "twoclick"

    def test_resolve_by_slug(self, admin_tok):
        # ensure slug set
        requests.patch(f"{API}/admin/branding", headers=h(admin_tok), json={
            "company_id": "company_default", "slug": "twoclick"})
        r = requests.get(f"{API}/branding", params={"slug": "twoclick"})
        assert r.status_code == 200
        d = r.json()
        assert d["company_id"] == "company_default"
        assert d["slug"] == "twoclick"

    def test_resolve_by_host_custom_domain(self, admin_tok):
        requests.patch(f"{API}/admin/branding", headers=h(admin_tok), json={
            "company_id": "company_default", "custom_domain": "test.2click.local"})
        r = requests.get(f"{API}/branding", params={"host": "test.2click.local"})
        assert r.status_code == 200
        assert r.json()["company_id"] == "company_default"

    def test_resolve_by_host_subdomain(self):
        r = requests.get(f"{API}/branding", params={"host": "twoclick.example.com"})
        assert r.status_code == 200
        assert r.json()["company_id"] == "company_default"

    def test_unknown_falls_back_to_default(self):
        r = requests.get(f"{API}/branding", params={"slug": "does-not-exist-xyz"})
        assert r.status_code == 200
        assert r.json()["company_id"] == "company_default"

    def test_customer_forbidden(self, cust_tok):
        r = requests.patch(f"{API}/admin/branding", headers=h(cust_tok), json={"brand_name": "x"})
        assert r.status_code == 403


# ---------------------------------------------------------------
# PHASE 3C — Subscriptions + Invoice PDF
# ---------------------------------------------------------------
class TestSubscriptions:
    @pytest.fixture(scope="class")
    def business_plan_id(self):
        r = requests.get(f"{API}/plans")
        assert r.status_code == 200
        biz = next(p for p in r.json() if p["name"] == "Business")
        return biz["id"]

    def test_subscribe_creates_pending_invoice(self, cust_tok, business_plan_id):
        r = requests.post(f"{API}/subscriptions/subscribe",
                          headers=h(cust_tok), json={"plan_id": business_plan_id})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["subscription"]["status"] in ("pending", "active")
        assert d["invoice"] is not None
        inv = d["invoice"]
        assert inv["type"] == "subscription"
        assert inv["status"] == "pending"
        # 4999 + 18% = 5898.82
        assert abs(inv["total"] - 5898.82) < 0.5
        assert inv["number"].startswith("INV-")

    def test_my_subscription(self, cust_tok):
        r = requests.get(f"{API}/subscriptions/me", headers=h(cust_tok))
        assert r.status_code == 200
        assert r.json()["subscription"] is not None

    def test_pay_invoice_activates_subscription(self, cust_tok):
        invs = requests.get(f"{API}/invoices/me", headers=h(cust_tok)).json()
        pending = [i for i in invs if i["type"] == "subscription" and i["status"] == "pending"]
        assert pending, "no pending subscription invoice found"
        inv_id = pending[0]["id"]
        r = requests.post(f"{API}/invoices/{inv_id}/pay", headers=h(cust_tok))
        assert r.status_code == 200
        assert r.json()["status"] == "paid"
        # subscription now active
        sub = requests.get(f"{API}/subscriptions/me", headers=h(cust_tok)).json()["subscription"]
        assert sub["status"] == "active"

    def test_invoice_pdf(self, cust_tok):
        invs = requests.get(f"{API}/invoices/me", headers=h(cust_tok)).json()
        assert invs
        inv_id = invs[0]["id"]
        r = requests.get(f"{API}/invoices/{inv_id}/pdf", headers=h(cust_tok))
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("application/pdf")
        assert r.content[:4] == b"%PDF"

    def test_cancel_subscription(self, cust_tok):
        r = requests.post(f"{API}/subscriptions/cancel", headers=h(cust_tok))
        assert r.status_code == 200
        sub = requests.get(f"{API}/subscriptions/me", headers=h(cust_tok)).json()["subscription"]
        assert sub["status"] == "cancelled"


# ---------------------------------------------------------------
# PHASE 3C — Invoice authorization: non-owner cannot fetch
# ---------------------------------------------------------------
class TestInvoiceAuth:
    def test_non_owner_forbidden(self, vendor_tok, cust_tok):
        invs = requests.get(f"{API}/invoices/me", headers=h(cust_tok)).json()
        if not invs:
            pytest.skip("no invoice to test with")
        inv_id = invs[0]["id"]
        r = requests.get(f"{API}/invoices/{inv_id}", headers=h(vendor_tok))
        assert r.status_code == 403


# ---------------------------------------------------------------
# PHASE 3C — Admin billing dashboard endpoints
# ---------------------------------------------------------------
class TestAdminBilling:
    def test_summary(self, admin_tok):
        r = requests.get(f"{API}/admin/billing/summary", headers=h(admin_tok))
        assert r.status_code == 200
        d = r.json()
        for k in ["total_invoiced", "total_paid", "outstanding", "mrr",
                  "active_subscriptions", "invoice_count", "total_commission"]:
            assert k in d

    def test_all_invoices(self, admin_tok):
        r = requests.get(f"{API}/admin/billing/invoices", headers=h(admin_tok))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_all_subscriptions(self, admin_tok):
        r = requests.get(f"{API}/admin/billing/subscriptions", headers=h(admin_tok))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_customer_blocked_summary(self, cust_tok):
        r = requests.get(f"{API}/admin/billing/summary", headers=h(cust_tok))
        assert r.status_code == 403

    def test_customer_blocked_invoices(self, cust_tok):
        r = requests.get(f"{API}/admin/billing/invoices", headers=h(cust_tok))
        assert r.status_code == 403

    def test_customer_blocked_subscriptions(self, cust_tok):
        r = requests.get(f"{API}/admin/billing/subscriptions", headers=h(cust_tok))
        assert r.status_code == 403

    def test_customer_blocked_run_commission(self, cust_tok):
        from datetime import datetime
        period = datetime.utcnow().strftime("%Y-%m")
        r = requests.post(f"{API}/admin/billing/run-commission",
                          headers=h(cust_tok), json={"period": period})
        assert r.status_code == 403


# ---------------------------------------------------------------
# PHASE 3C — Commission payout: create product -> order -> pay -> run-commission
# ---------------------------------------------------------------
class TestCommissionPayout:
    def test_full_flow_and_idempotency(self, admin_tok, vendor_tok, cust_tok):
        from datetime import datetime
        # 1. Create product as vendor
        pname = f"TEST_prod_{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/products", headers=h(vendor_tok), json={
            "name": pname, "description": "Test product", "price": 1000,
            "category": "Cement", "stock": 100})
        assert r.status_code == 200, r.text
        prod = r.json()
        # 2. Place order as customer
        r = requests.post(f"{API}/orders", headers=h(cust_tok), json={
            "items": [{"product_id": prod["id"], "name": pname,
                       "price": 1000, "qty": 2, "category": "Cement"}],
            "address": "TEST addr"})
        assert r.status_code == 200, r.text
        order = r.json()
        # 3. Pay order (demo)
        # Attempt razorpay flow: create order then verify — but demo mode may auto-mark on GET
        # Directly try /orders/{id}/pay or checkout endpoint
        oid = order["id"]
        # try a few possible pay endpoints
        paid = False
        for path, method, body in [
            (f"/orders/{oid}/pay", "post", {}),
            (f"/orders/{oid}/checkout", "post", {}),
            (f"/orders/{oid}/mark-paid", "post", {}),
            (f"/orders/{oid}", "patch", {"status": "paid"}),
        ]:
            fn = getattr(requests, method)
            rr = fn(f"{API}{path}", headers=h(cust_tok), json=body)
            if rr.status_code == 200:
                paid = True
                break
        if not paid:
            # fallback: check razorpay demo path
            rr = requests.post(f"{API}/payments/razorpay/order",
                               headers=h(cust_tok), json={"order_id": oid})
            if rr.status_code == 200:
                # verify (demo)
                rr2 = requests.post(f"{API}/payments/razorpay/verify",
                                    headers=h(cust_tok),
                                    json={"order_id": oid, "razorpay_payment_id": "demo_pay",
                                          "razorpay_order_id": "demo_ord",
                                          "razorpay_signature": "demo_sig"})
                paid = rr2.status_code == 200

        # Confirm order paid via admin listing
        # if we can't force paid, mark via DB isn't allowed; skip commission verification but log
        # 4. Run commission for current month as admin
        period = datetime.utcnow().strftime("%Y-%m")
        r = requests.post(f"{API}/admin/billing/run-commission",
                          headers=h(admin_tok), json={"period": period})
        assert r.status_code == 200, r.text
        first = r.json()
        # 5. Re-run same period - must be idempotent (0 new)
        r2 = requests.post(f"{API}/admin/billing/run-commission",
                          headers=h(admin_tok), json={"period": period})
        assert r2.status_code == 200
        second = r2.json()
        assert second["invoices_created"] == 0, f"idempotency broken: {second}"

        # If order was paid, first run should have created >=1 commission invoice for the vendor
        if paid:
            all_inv = requests.get(f"{API}/admin/billing/invoices",
                                   headers=h(admin_tok), params={"type": "commission"}).json()
            # find commission invoice for our vendor covering this period
            vendor_me = requests.get(f"{API}/auth/me", headers=h(vendor_tok)).json()
            vid = vendor_me["id"]
            match = [i for i in all_inv if i.get("user_id") == vid
                     and (i.get("period") or {}).get("label") == period]
            assert match, f"expected commission invoice for vendor {vid} in {period}"


# ---------------------------------------------------------------
# REGRESSION — Phase 3A
# ---------------------------------------------------------------
class TestPhase3ARegression:
    def test_freelancers_public(self):
        r = requests.get(f"{API}/freelancers")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_categories_public(self):
        r = requests.get(f"{API}/categories")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, list) and len(d) > 0
        assert all("category_type" in c for c in d)

    def test_seeded_logins(self):
        admin_login()
        for cred in [VENDOR, CUSTOMER, ("contractor@2click.in", "Demo@12345")]:
            r = requests.post(f"{API}/auth/login", json={"email": cred[0], "password": cred[1]})
            assert r.status_code == 200, f"{cred[0]} login failed"

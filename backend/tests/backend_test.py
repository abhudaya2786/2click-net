"""BuildSphere Backend API tests - covers auth, RBAC, marketplace, orders/payments,
tenders/auction, solar, ERP, and AI endpoints."""
import os
import time
import json
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://wallet-vendor-mvp.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = ("abbhuadaya@gmail.com", "Admin@12345")
VENDOR = ("vendor@2click.in", "Demo@12345")
CUSTOMER = ("customer@2click.in", "Demo@12345")
CONTRACTOR = ("contractor@2click.in", "Demo@12345")


def login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text}"
    data = r.json()
    return data["token"], data["user"]


@pytest.fixture(scope="module")
def tokens():
    return {
        "admin": login(*ADMIN),
        "vendor": login(*VENDOR),
        "customer": login(*CUSTOMER),
        "contractor": login(*CONTRACTOR),
    }


def hdr(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------------------- Auth ----------------------
class TestAuth:
    def test_register_customer(self):
        email = f"TEST_user_{int(time.time()*1000)}@ex.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "Test User", "email": email, "password": "Test@1234", "role": "customer"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert "token" in d and d["user"]["email"] == email.lower()
        assert d["user"]["role"] == "customer"

    def test_login_admin_is_super_admin(self, tokens):
        _, user = tokens["admin"]
        assert user["role"] == "super_admin"

    def test_login_all_demo(self, tokens):
        assert tokens["vendor"][1]["role"] == "vendor"
        assert tokens["customer"][1]["role"] == "customer"
        assert tokens["contractor"][1]["role"] == "contractor"

    def test_me(self, tokens):
        tok, _ = tokens["customer"]
        r = requests.get(f"{API}/auth/me", headers=hdr(tok))
        assert r.status_code == 200
        assert r.json()["email"] == CUSTOMER[0]

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "x@x.com", "password": "wrong"})
        assert r.status_code == 401


# ---------------------- RBAC ----------------------
class TestRBAC:
    def test_admin_users(self, tokens):
        tok, _ = tokens["admin"]
        r = requests.get(f"{API}/admin/users", headers=hdr(tok))
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) >= 4

    def test_admin_analytics(self, tokens):
        r = requests.get(f"{API}/admin/analytics", headers=hdr(tokens["admin"][0]))
        assert r.status_code == 200
        d = r.json()
        for k in ["total_users", "vendors", "customers", "contractors", "products", "tenders", "by_role"]:
            assert k in d

    def test_admin_audit(self, tokens):
        r = requests.get(f"{API}/admin/audit", headers=hdr(tokens["admin"][0]))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_customer_forbidden_admin(self, tokens):
        r = requests.get(f"{API}/admin/users", headers=hdr(tokens["customer"][0]))
        assert r.status_code == 403

    def test_role_update_and_kyc(self, tokens):
        admin_tok = tokens["admin"][0]
        # create a target
        email = f"TEST_role_{int(time.time()*1000)}@ex.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "TR", "email": email, "password": "Test@1234", "role": "customer"})
        uid = r.json()["user"]["id"]
        r = requests.patch(f"{API}/admin/users/{uid}/role",
                           headers=hdr(admin_tok), json={"role": "vendor"})
        assert r.status_code == 200
        r = requests.patch(f"{API}/admin/users/{uid}/kyc",
                           headers=hdr(admin_tok), json={"status": "verified"})
        assert r.status_code == 200
        # verify
        r = requests.get(f"{API}/admin/users", headers=hdr(admin_tok))
        u = next((x for x in r.json() if x["id"] == uid), None)
        assert u and u["role"] == "vendor" and u["kyc_status"] == "verified"


# ---------------------- Vendor endpoints (bug fix regression) ----------------------
class TestVendorEndpoints:
    def test_vendor_products_200(self, tokens):
        tok = tokens["vendor"][0]
        r = requests.get(f"{API}/vendor/products", headers=hdr(tok), timeout=30)
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)

    def test_vendor_orders_200_no_500(self, tokens):
        """Regression: previously raised TypeError 'async_generator not iterable' -> 500."""
        tok = tokens["vendor"][0]
        r = requests.get(f"{API}/vendor/orders", headers=hdr(tok), timeout=30)
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)

    def test_customer_forbidden_vendor_orders(self, tokens):
        tok = tokens["customer"][0]
        r = requests.get(f"{API}/vendor/orders", headers=hdr(tok), timeout=30)
        assert r.status_code == 403


# ---------------------- Marketplace ----------------------
class TestMarketplace:
    def test_products_seeded(self):
        r = requests.get(f"{API}/products")
        assert r.status_code == 200
        assert len(r.json()) >= 6

    def test_categories(self):
        r = requests.get(f"{API}/products/categories")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) >= 1

    def test_search_and_filter(self):
        r = requests.get(f"{API}/products", params={"q": "Cement"})
        assert r.status_code == 200
        assert any("cement" in p["name"].lower() for p in r.json())
        cats = requests.get(f"{API}/products/categories").json()
        r = requests.get(f"{API}/products", params={"category": cats[0]})
        assert r.status_code == 200
        assert all(p["category"] == cats[0] for p in r.json())


# ---------------------- Orders + Payments ----------------------
class TestOrdersPayments:
    def test_order_create_pay_demo(self, tokens):
        tok, _ = tokens["customer"]
        prods = requests.get(f"{API}/products").json()
        item = prods[0]
        payload = {"items": [{"product_id": item["id"], "name": item["name"],
                              "price": item["price"], "qty": 2}],
                   "address": "Test address"}
        r = requests.post(f"{API}/orders", headers=hdr(tok), json=payload)
        assert r.status_code == 200, r.text
        o = r.json()
        expected_subtotal = item["price"] * 2
        assert abs(o["subtotal"] - expected_subtotal) < 0.01
        assert abs(o["tax"] - round(expected_subtotal * 0.18, 2)) < 0.01
        assert abs(o["total"] - round(expected_subtotal * 1.18, 2)) < 0.01
        oid = o["id"]

        r = requests.post(f"{API}/payments/create", headers=hdr(tok), json={"order_id": oid})
        assert r.status_code == 200
        assert r.json()["mode"] == "demo"

        r = requests.post(f"{API}/payments/verify", headers=hdr(tok),
                          json={"order_id": oid, "mode": "demo"})
        assert r.status_code == 200
        assert r.json()["status"] == "paid"

        # verify persistence
        orders = requests.get(f"{API}/orders", headers=hdr(tok)).json()
        target = next((x for x in orders if x["id"] == oid), None)
        assert target and target["status"] == "paid"


# ---------------------- Tenders + Auction ----------------------
class TestTenders:
    def test_list_seeded(self):
        r = requests.get(f"{API}/tenders")
        assert r.status_code == 200
        d = r.json()
        tenders = d["tenders"] if isinstance(d, dict) else d
        assert len(tenders) >= 3
        assert all("bid_count" in t for t in tenders)

    def test_bid_ranking(self, tokens):
        vtok = tokens["vendor"][0]
        ctok = tokens["contractor"][0]
        # Create a fresh tender as customer to isolate bids
        cust_tok = tokens["customer"][0]
        r = requests.post(f"{API}/tenders", headers=hdr(cust_tok), json={
            "title": "TEST tender", "description": "desc", "category": "Steel & TMT",
            "budget": 100000, "emd": 1000, "closes_in_minutes": 60, "auction": True})
        assert r.status_code == 200, r.text
        tid = r.json()["id"]

        r1 = requests.post(f"{API}/tenders/{tid}/bids", headers=hdr(vtok),
                           json={"amount": 90000, "note": "v"})
        assert r1.status_code == 200, r1.text
        r2 = requests.post(f"{API}/tenders/{tid}/bids", headers=hdr(ctok),
                           json={"amount": 85000, "note": "c"})
        assert r2.status_code == 200

        r = requests.get(f"{API}/tenders/{tid}")
        assert r.status_code == 200
        d = r.json()
        assert d["lowest_bid"] == 85000
        assert d["bids"][0]["rank"] == 1 and d["bids"][0]["amount"] == 85000
        assert d["bids"][1]["rank"] == 2

    def test_customer_forbidden_bid(self, tokens):
        tenders = requests.get(f"{API}/tenders").json()["tenders"]
        r = requests.post(f"{API}/tenders/{tenders[0]['id']}/bids",
                          headers=hdr(tokens["customer"][0]), json={"amount": 1})
        assert r.status_code == 403


# ---------------------- Solar ----------------------
class TestSolar:
    def test_solar_calc(self):
        r = requests.post(f"{API}/solar/calculate", json={
            "monthly_bill": 5000, "roof_area_sqft": 500, "state": "MH", "tariff": 8})
        assert r.status_code == 200
        d = r.json()
        for k in ["recommended_capacity_kw", "net_cost", "payback_years", "co2_offset_tonnes"]:
            assert k in d

    def test_quotation_save_list(self, tokens):
        tok = tokens["customer"][0]
        r = requests.post(f"{API}/solar/quotations", headers=hdr(tok), json={
            "name": "TEST quote", "capacity_kw": 5, "total_cost": 275000,
            "payload": {"tariff": 8}})
        assert r.status_code == 200
        qid = r.json()["id"]
        r = requests.get(f"{API}/solar/quotations", headers=hdr(tok))
        assert r.status_code == 200
        assert any(q["id"] == qid for q in r.json())


# ---------------------- ERP ----------------------
class TestERP:
    def test_project_boq_dpr(self, tokens):
        tok = tokens["contractor"][0]
        r = requests.post(f"{API}/erp/projects", headers=hdr(tok), json={
            "name": "TEST proj", "client": "TC", "budget": 500000, "location": "Pune"})
        assert r.status_code == 200
        pid = r.json()["id"]

        r = requests.post(f"{API}/erp/boq", headers=hdr(tok), json={
            "project_id": pid, "item": "Steel", "unit": "kg", "quantity": 100, "rate": 60})
        assert r.status_code == 200
        assert r.json()["amount"] == 6000

        r = requests.get(f"{API}/erp/boq/{pid}", headers=hdr(tok))
        assert r.status_code == 200
        d = r.json()
        assert d["total"] == 6000 and len(d["items"]) >= 1

        r = requests.post(f"{API}/erp/dpr", headers=hdr(tok), json={
            "project_id": pid, "date": "2026-01-15", "work_done": "footing",
            "labour_count": 20, "weather": "Clear"})
        assert r.status_code == 200
        r = requests.get(f"{API}/erp/dpr/{pid}", headers=hdr(tok))
        assert r.status_code == 200 and len(r.json()) >= 1


# ---------------------- AI ----------------------
class TestAI:
    def test_tender_summary(self, tokens):
        tok = tokens["customer"][0]
        r = requests.post(f"{API}/ai/tender-summary", headers=hdr(tok),
                          json={"text": "Supply of 100MT TMT bars Fe500D for a Pune tower. EMD 1L. Timeline 45 days."},
                          timeout=90)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "summary" in d and isinstance(d["summary"], str) and len(d["summary"]) > 20

    def test_ai_chat_stream(self, tokens):
        tok = tokens["customer"][0]
        with requests.post(f"{API}/ai/chat", headers=hdr(tok),
                           json={"message": "Say hello briefly."},
                           stream=True, timeout=90) as r:
            assert r.status_code == 200
            got = b""
            for chunk in r.iter_content(chunk_size=None):
                got += chunk
                if b"[DONE]" in got or len(got) > 2000:
                    break
            assert b"data:" in got

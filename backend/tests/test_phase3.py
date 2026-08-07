"""Phase 3 tests: Dynamic Categories, Smart Signup, Branding, Plans, Commission."""
import os
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://wallet-vendor-mvp.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = ("abbhuadaya@gmail.com", "Admin@12345")
CUSTOMER = ("customer@2click.in", "Demo@12345")


def _login(email, pw):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_tok():
    return _login(*ADMIN)


@pytest.fixture(scope="module")
def cust_tok():
    return _login(*CUSTOMER)


def h(t):
    return {"Authorization": f"Bearer {t}"}


# ---- Dynamic Categories ----
class TestCategories:
    def test_public_categories_list(self):
        # Phase 3A: public categories now nested/typed via category_type
        r = requests.get(f"{API}/categories")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, list) and len(d) >= 5
        assert all("category_type" in c for c in d)

    def test_public_categories_tree(self):
        r = requests.get(f"{API}/categories/tree")
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_public_categories_by_type(self):
        r = requests.get(f"{API}/categories/type/freelancer")
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_admin_list_categories(self, admin_tok):
        r = requests.get(f"{API}/admin/categories", headers=h(admin_tok))
        assert r.status_code == 200 and len(r.json()) >= 10

    def test_customer_forbidden(self, cust_tok):
        r = requests.get(f"{API}/admin/categories", headers=h(cust_tok))
        assert r.status_code == 403

    def test_crud_category_and_audit(self, admin_tok):
        name = f"TEST_cat_{int(time.time()*1000)}"
        r = requests.post(f"{API}/admin/categories", headers=h(admin_tok),
                          json={"name": name, "type": "product"})
        assert r.status_code == 200, r.text
        cid = r.json()["id"]
        # audit log module=categories
        logs = requests.get(f"{API}/admin/audit", headers=h(admin_tok)).json()
        assert any(l.get("module") == "categories" and l.get("record_id") == cid for l in logs)
        # patch
        r = requests.patch(f"{API}/admin/categories/{cid}", headers=h(admin_tok),
                           json={"icon": "star"})
        assert r.status_code == 200
        # delete (soft)
        r = requests.delete(f"{API}/admin/categories/{cid}", headers=h(admin_tok))
        assert r.status_code == 200


# ---- Smart Signup ----
class TestSmartSignup:
    def test_register_with_interests(self):
        email = f"TEST_smart_{int(time.time()*1000)}@ex.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "TS", "email": email, "password": "Test@1234", "role": "customer",
            "interests": ["Solar", "Steel & TMT"], "business_type": None,
            "primary_category": "Solar"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["interests"] == ["Solar", "Steel & TMT"]
        assert d["user"]["primary_category"] == "Solar"
        # /me reflects
        me = requests.get(f"{API}/auth/me", headers=h(d["token"])).json()
        assert me["interests"] == ["Solar", "Steel & TMT"]

    def test_register_vendor_business_type(self):
        email = f"TEST_vend_{int(time.time()*1000)}@ex.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "TV", "email": email, "password": "Test@1234", "role": "vendor",
            "business_type": "manufacturer", "primary_category": "Cement"})
        assert r.status_code == 200
        assert r.json()["user"]["business_type"] == "manufacturer"


# ---- Branding ----
class TestBranding:
    def test_public_branding(self):
        r = requests.get(f"{API}/branding")
        assert r.status_code == 200
        d = r.json()
        for k in ["brand_name", "primary_color", "logo", "tagline"]:
            assert k in d

    def test_admin_update_branding(self, admin_tok):
        r = requests.patch(f"{API}/admin/branding", headers=h(admin_tok),
                           json={"brand_name": "2Click.in", "primary_color": "#FF5A1F",
                                 "tagline": "The operating system for construction"})
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_customer_forbidden_branding(self, cust_tok):
        r = requests.patch(f"{API}/admin/branding", headers=h(cust_tok),
                           json={"brand_name": "hack"})
        assert r.status_code == 403


# ---- Pricing Plans ----
class TestPlans:
    def test_public_plans(self):
        r = requests.get(f"{API}/plans")
        assert r.status_code == 200
        d = r.json()
        assert len(d) >= 3
        names = {p["name"] for p in d}
        assert {"Starter", "Business", "Enterprise"}.issubset(names)
        starter = next(p for p in d if p["name"] == "Starter")
        business = next(p for p in d if p["name"] == "Business")
        assert starter["price"] == 0
        assert business["price"] == 4999


# ---- Commission ----
class TestCommission:
    def test_admin_get_commission(self, admin_tok):
        r = requests.get(f"{API}/admin/commission", headers=h(admin_tok))
        assert r.status_code == 200
        d = r.json()
        assert "default_percent" in d and "per_category" in d

    def test_customer_forbidden(self, cust_tok):
        r = requests.put(f"{API}/admin/commission", headers=h(cust_tok),
                         json={"default_percent": 99})
        assert r.status_code == 403

    def test_admin_set_commission(self, admin_tok):
        r = requests.put(f"{API}/admin/commission", headers=h(admin_tok),
                         json={"default_percent": 5.0,
                               "per_category": [{"category": "Solar", "percent": 3.0},
                                                {"category": "Steel & TMT", "percent": 2.5}]})
        assert r.status_code == 200
        assert r.json()["value"]["default_percent"] == 5.0

    def test_order_platform_commission_solar(self, cust_tok):
        # 2 x 10000 Solar => 3% => 600
        payload = {"items": [{"product_id": "p1", "name": "Solar Panel",
                              "price": 10000, "qty": 2, "category": "Solar"}],
                   "address": "x"}
        r = requests.post(f"{API}/orders", headers=h(cust_tok), json=payload)
        assert r.status_code == 200, r.text
        o = r.json()
        assert abs(o["platform_commission"] - 600.0) < 0.01, o

    def test_order_platform_commission_default(self, cust_tok):
        # Unknown category => default 5% ; 1000 * 1 => 50
        payload = {"items": [{"product_id": "p2", "name": "Widget",
                              "price": 1000, "qty": 1, "category": "Unknown"}],
                   "address": "x"}
        r = requests.post(f"{API}/orders", headers=h(cust_tok), json=payload)
        assert r.status_code == 200
        assert abs(r.json()["platform_commission"] - 50.0) < 0.01

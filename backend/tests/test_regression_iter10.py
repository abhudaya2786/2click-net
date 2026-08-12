"""Iteration 10 regression suite — covers auth, contact, mart, solar EPC, marketplace, billing, tenders."""
import pytest
import requests
from conftest import get_backend_url


def _load_base_url():
    return get_backend_url()


BASE_URL = _load_base_url()
API = f"{BASE_URL}/api"

CREDS = {
    "admin": ("abbhuadaya@gmail.com", "Admin@12345"),
    "customer": ("customer@buildecogroup.com", "Demo@12345"),
    "vendor": ("vendor@buildecogroup.com", "Demo@12345"),
    "contractor": ("contractor@buildecogroup.com", "Demo@12345"),
}


@pytest.fixture(scope="session")
def tokens():
    out = {}
    for role, (email, pw) in CREDS.items():
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=15)
        assert r.status_code == 200, f"login {role} failed {r.status_code}: {r.text[:200]}"
        out[role] = r.json()["token"]
    return out


def hdr(t):
    return {"Authorization": f"Bearer {t}"}


# --------- AUTH ----------
class TestAuth:
    def test_login_customer(self, tokens):
        assert tokens["customer"]

    def test_me(self, tokens):
        r = requests.get(f"{API}/auth/me", headers=hdr(tokens["customer"]))
        assert r.status_code == 200
        assert r.json()["email"] == "customer@buildecogroup.com"

    def test_forgot_password_ok_generic(self):
        r = requests.post(f"{API}/auth/forgot-password", json={"email": "customer@buildecogroup.com", "origin": BASE_URL})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_bad_login(self):
        r = requests.post(f"{API}/auth/login", json={"email": "customer@buildecogroup.com", "password": "wrong"})
        assert r.status_code in (401, 429)


# --------- CONTACT ----------
class TestContact:
    def test_contact_submit(self):
        r = requests.post(f"{API}/contact", json={
            "name": "TEST_regression",
            "email": "test_regression@example.com",
            "message": "hello from iter10",
            "phone": "+91 70072 54932",
        })
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

    def test_contact_validation(self):
        r = requests.post(f"{API}/contact", json={"name": "x", "email": "notanemail", "message": "z"})
        assert r.status_code in (400, 422)


# --------- MART ----------
class TestMart:
    def test_mart_materials(self):
        r = requests.get(f"{API}/mart/materials")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 10
        # image + rate_history keys
        assert any("image" in m or "image_url" in m for m in data)

    def test_boq_templates(self):
        r = requests.get(f"{API}/mart/boq-templates")
        assert r.status_code == 200
        assert len(r.json()) >= 3


# --------- SOLAR EPC ----------
class TestSolar:
    def test_solar_epc_config(self):
        r = requests.get(f"{API}/solar/epc/config")
        assert r.status_code == 200, r.text

    def test_solar_estimate_residential(self, tokens):
        payload = {"segment": "residential", "system_type": "on_grid", "capacity_kw": 5, "tier": "premium",
                   "state": "UP", "monthly_bill": 5000}
        r = requests.post(f"{API}/solar/epc/estimate", json=payload, headers=hdr(tokens["customer"]))
        assert r.status_code == 200, r.text
        j = r.json()
        assert "boq" in j and len(j["boq"]) > 0

    def test_solar_estimate_commercial_hybrid(self, tokens):
        payload = {"segment": "commercial", "system_type": "hybrid", "capacity_kw": 10, "tier": "standard",
                   "state": "UP", "monthly_bill": 25000, "autonomy_hours": 4}
        r = requests.post(f"{API}/solar/epc/estimate", json=payload, headers=hdr(tokens["customer"]))
        assert r.status_code == 200, r.text


# --------- MARKETPLACE ----------
class TestMarketplace:
    def test_products_list(self):
        r = requests.get(f"{API}/products")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# --------- TENDERS ----------
class TestTenders:
    def test_tenders_list(self):
        r = requests.get(f"{API}/tenders")
        assert r.status_code == 200
        d = r.json()
        assert "tenders" in d and isinstance(d["tenders"], list)


# --------- BILLING ----------
class TestBilling:
    def test_plans_list(self):
        r = requests.get(f"{API}/plans")
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_invoices_list(self, tokens):
        r = requests.get(f"{API}/invoices/me", headers=hdr(tokens["customer"]))
        assert r.status_code == 200


# --------- ADMIN ----------
class TestAdmin:
    def test_admin_users(self, tokens):
        r = requests.get(f"{API}/admin/users", headers=hdr(tokens["admin"]))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_departments(self, tokens):
        r = requests.get(f"{API}/admin/departments", headers=hdr(tokens["admin"]))
        assert r.status_code in (200, 404)

    def test_admin_categories(self, tokens):
        r = requests.get(f"{API}/admin/categories", headers=hdr(tokens["admin"]))
        assert r.status_code in (200, 404)

    def test_branding_get(self, tokens):
        r = requests.get(f"{API}/branding")
        assert r.status_code in (200, 404)

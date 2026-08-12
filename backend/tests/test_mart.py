"""Super Mart (materials catalog) + BOQ integration + PDF backend tests."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://wallet-vendor-mvp.preview.emergentagent.com").rstrip("/")


# ---------- Auth helpers ----------
def _login(email, password):
    r = requests.post(f"{BASE}/api/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_token():
    return _login("abbhuadaya@gmail.com", "Admin@12345")


@pytest.fixture(scope="module")
def contractor_token():
    return _login("contractor@buildecogroup.com", "Demo@12345")


@pytest.fixture(scope="module")
def customer_token():
    return _login("customer@buildecogroup.com", "Demo@12345")


# ---------- Public reads ----------
class TestMartPublic:
    def test_categories(self):
        r = requests.get(f"{BASE}/api/mart/categories", timeout=30)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list)
        assert len(cats) >= 10, f"expected >=10 categories, got {len(cats)}"
        assert "Cement" in cats and "Steel & TMT" in cats

    def test_brands_by_category(self):
        r = requests.get(f"{BASE}/api/mart/brands", params={"category": "Cement"}, timeout=30)
        assert r.status_code == 200
        brands = r.json()
        assert "UltraTech" in brands and "ACC" in brands

    def test_materials_filter_category_brand(self):
        r = requests.get(f"{BASE}/api/mart/materials",
                         params={"category": "Cement", "brand": "UltraTech"}, timeout=30)
        assert r.status_code == 200
        mats = r.json()
        assert len(mats) >= 1
        for m in mats:
            assert m["category"] == "Cement"
            assert m["brand"] == "UltraTech"
            assert isinstance(m["rate"], (int, float))
            assert "_id" not in m

    def test_materials_search_q(self):
        r = requests.get(f"{BASE}/api/mart/materials", params={"q": "cement"}, timeout=30)
        assert r.status_code == 200
        mats = r.json()
        assert len(mats) >= 1
        # search matches name, case-insensitive
        for m in mats:
            assert "cement" in m["name"].lower() or m["category"] == "Cement"


# ---------- Admin CRUD RBAC ----------
class TestMartAdminRBAC:
    def test_admin_list_forbidden_for_customer(self, customer_token):
        r = requests.get(f"{BASE}/api/admin/mart/materials",
                         headers={"Authorization": f"Bearer {customer_token}"}, timeout=30)
        assert r.status_code == 403

    def test_admin_list_works_for_super_admin(self, admin_token):
        r = requests.get(f"{BASE}/api/admin/mart/materials",
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


class TestMartAdminCRUD:
    created_id = None

    def test_create_material(self, admin_token):
        payload = {"category": "Cement", "name": "TEST_OPC_53_TESTING",
                   "brand": "TESTBrand", "unit": "bag", "rate": 999.5, "status": "active"}
        r = requests.post(f"{BASE}/api/admin/mart/materials", json=payload,
                          headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 200, r.text
        doc = r.json()
        assert doc["name"] == payload["name"]
        assert doc["rate"] == 999.5
        assert "id" in doc and doc["id"].startswith("mat_")
        assert "_id" not in doc
        TestMartAdminCRUD.created_id = doc["id"]

    def test_update_rate(self, admin_token):
        mid = TestMartAdminCRUD.created_id
        assert mid, "prior create must succeed"
        r = requests.put(f"{BASE}/api/admin/mart/materials/{mid}",
                         json={"rate": 1234.75},
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 200
        # verify via public search
        r2 = requests.get(f"{BASE}/api/mart/materials", params={"q": "TEST_OPC_53_TESTING"}, timeout=30)
        assert r2.status_code == 200
        rows = [m for m in r2.json() if m["id"] == mid]
        assert rows and rows[0]["rate"] == 1234.75

    def test_delete(self, admin_token):
        mid = TestMartAdminCRUD.created_id
        r = requests.delete(f"{BASE}/api/admin/mart/materials/{mid}",
                            headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 200
        # verify gone
        r2 = requests.get(f"{BASE}/api/mart/materials", params={"q": "TEST_OPC_53_TESTING"}, timeout=30)
        assert all(m["id"] != mid for m in r2.json())


# ---------- Contractor BOQ integration ----------
class TestContractorBOQ:
    project_id = None

    def _ensure_project(self, token):
        h = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE}/api/erp/projects", headers=h, timeout=30)
        assert r.status_code == 200, r.text
        projects = r.json()
        if projects:
            return projects[0]["id"]
        # create one
        r = requests.post(f"{BASE}/api/erp/projects",
                         json={"name": "TEST_BOQ_Project", "client": "TEST", "budget": 100000, "location": "TEST"},
                         headers=h, timeout=30)
        assert r.status_code == 200, r.text
        return r.json()["id"]

    def test_add_boq_from_mart(self, contractor_token):
        pid = self._ensure_project(contractor_token)
        TestContractorBOQ.project_id = pid
        h = {"Authorization": f"Bearer {contractor_token}"}

        # get a mart material to add
        mats = requests.get(f"{BASE}/api/mart/materials",
                            params={"category": "Cement", "brand": "UltraTech"}, timeout=30).json()
        assert mats
        m = mats[0]
        qty = 10
        body = {
            "project_id": pid,
            "item": m["name"],
            "unit": m["unit"],
            "quantity": qty,
            "rate": m["rate"],
            "brand": m["brand"],
            "category": m["category"],
            "material_id": m["id"],
        }
        r = requests.post(f"{BASE}/api/erp/boq", json=body, headers=h, timeout=30)
        assert r.status_code == 200, r.text
        line = r.json()
        # amount = qty * rate
        assert abs(line.get("amount", 0) - qty * m["rate"]) < 0.01
        assert line.get("brand") == m["brand"]

    def test_boq_pdf(self, contractor_token):
        pid = TestContractorBOQ.project_id
        assert pid
        h = {"Authorization": f"Bearer {contractor_token}"}
        r = requests.get(f"{BASE}/api/erp/boq/{pid}/pdf", headers=h, timeout=60)
        assert r.status_code == 200, r.text[:300]
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF"

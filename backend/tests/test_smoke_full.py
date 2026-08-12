"""Smoke tests for all major API surface areas."""
import requests
import pytest
from auth_helpers import login, admin_login, ADMIN, VENDOR, CUSTOMER, CONTRACTOR, API

ARCHITECT = ("architect@buildecogroup.com", "Demo@12345")


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="module")
def tokens():
    return {
        "admin": admin_login()[0],
        "vendor": login(*VENDOR)[0],
        "customer": login(*CUSTOMER)[0],
        "architect": login(*ARCHITECT)[0],
        "contractor": login(*CONTRACTOR)[0],
    }


class TestPublicEndpoints:
    def test_health(self):
        assert requests.get(f"{API}/", timeout=15).status_code == 200

    def test_branding(self):
        assert requests.get(f"{API}/branding", timeout=15).status_code == 200

    def test_plans(self):
        assert requests.get(f"{API}/plans", timeout=15).status_code == 200

    def test_products(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_tenders(self):
        r = requests.get(f"{API}/tenders", timeout=15)
        assert r.status_code == 200

    def test_mart(self):
        assert requests.get(f"{API}/mart/materials", timeout=15).status_code == 200

    def test_solar_calc(self):
        r = requests.post(
            f"{API}/solar/calculate",
            json={"monthly_bill": 5000, "tariff": 8, "roof_area_sqft": 800},
            timeout=15,
        )
        assert r.status_code == 200

    def test_geo(self):
        assert requests.get(f"{API}/geo/states", timeout=15).status_code == 200
        assert requests.get(f"{API}/geo/districts", params={"state": "Maharashtra"}, timeout=15).status_code == 200
        assert requests.get(f"{API}/geo/pincodes", params={"state": "Maharashtra", "limit": 5}, timeout=15).status_code == 200

    def test_landing(self):
        assert requests.get(f"{API}/landing?state=Maharashtra", timeout=15).status_code == 200

    def test_freelancers(self):
        r = requests.get(f"{API}/freelancers", timeout=15)
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_home_catalog(self):
        assert requests.get(f"{API}/home/catalog", timeout=15).status_code == 200


class TestAuthenticatedFlows:
    def test_session(self, tokens):
        r = requests.get(f"{API}/auth/me", headers=_h(tokens["customer"]), timeout=15)
        assert r.status_code == 200

    def test_wallet(self, tokens):
        r = requests.get(f"{API}/wallet/me", headers=_h(tokens["vendor"]), timeout=15)
        assert r.status_code == 200

    def test_vendor_products(self, tokens):
        r = requests.get(f"{API}/vendor/products", headers=_h(tokens["vendor"]), timeout=15)
        assert r.status_code == 200

    def test_orders(self, tokens):
        r = requests.get(f"{API}/orders", headers=_h(tokens["customer"]), timeout=15)
        assert r.status_code == 200

    def test_erp_projects(self, tokens):
        r = requests.get(f"{API}/erp/projects", headers=_h(tokens["contractor"]), timeout=15)
        assert r.status_code == 200

    def test_admin_analytics(self, tokens):
        r = requests.get(f"{API}/admin/analytics", headers=_h(tokens["admin"]), timeout=15)
        assert r.status_code == 200

    def test_backup_list(self, tokens):
        r = requests.get(f"{API}/admin/backup/list", headers=_h(tokens["admin"]), timeout=30)
        assert r.status_code == 200
        assert "backups" in r.json()

    def test_backup_create(self, tokens):
        r = requests.post(f"{API}/admin/backup/create", headers=_h(tokens["admin"]), timeout=120)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

    def test_tender_summary(self, tokens):
        r = requests.post(
            f"{API}/ai/tender-summary",
            headers=_h(tokens["customer"]),
            json={"text": "Supply 100MT TMT bars. EMD 1L. Timeline 45 days."},
            timeout=30,
        )
        assert r.status_code == 200
        assert len(r.json().get("summary", "")) > 20

    def test_architect_freelancer(self, tokens):
        r = requests.get(f"{API}/freelancers/me/enquiries", headers=_h(tokens["architect"]), timeout=15)
        assert r.status_code == 200

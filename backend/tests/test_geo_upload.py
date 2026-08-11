"""Geo pincode master — districts, lists, bulk upload."""
import requests
import pytest
from auth_helpers import admin_login, API


@pytest.fixture(scope="module")
def admin_token():
    return admin_login()[0]


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


class TestGeoPublic:
    def test_states(self):
        r = requests.get(f"{API}/geo/states", timeout=15)
        assert r.status_code == 200
        assert len(r.json().get("states", [])) >= 10

    def test_pincode_lookup(self):
        r = requests.get(f"{API}/geo/pincode/273001", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["pincode"] == "273001"
        assert data["state"] == "Uttar Pradesh"

    def test_districts(self):
        r = requests.get(f"{API}/geo/districts", params={"state": "Uttar Pradesh"}, timeout=15)
        assert r.status_code == 200
        assert "districts" in r.json()

    def test_pincodes_filter(self):
        r = requests.get(
            f"{API}/geo/pincodes",
            params={"state": "Maharashtra", "limit": 10},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json().get("count", 0) >= 1


class TestGeoAdmin:
    def test_bulk_upload(self, admin_token):
        rows = [
            {
                "pincode": "888001",
                "state": "Test State",
                "city": "Test City",
                "district": "Test District",
                "lat": 0,
                "lng": 0,
            }
        ]
        r = requests.post(
            f"{API}/admin/geo/pincodes/bulk",
            json={"rows": rows},
            headers=_h(admin_token),
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json().get("imported") == 1

    def test_summary(self, admin_token):
        r = requests.get(f"{API}/admin/geo/summary", headers=_h(admin_token), timeout=15)
        assert r.status_code == 200
        assert r.json().get("total", 0) >= 1

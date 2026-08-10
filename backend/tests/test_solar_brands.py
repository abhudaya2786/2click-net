"""Backend regression test for Solar EPC dynamic brand catalog + BOQ override."""
import requests
import pytest
from conftest import get_backend_url

BASE = get_backend_url()
API = f"{BASE}/api"

ADMIN = {"email": "abbhuadaya@gmail.com", "password": "Admin@12345"}
VENDOR = {"email": "vendor@2click.in", "password": "Demo@12345"}
CUSTOMER = {"email": "customer@2click.in", "password": "Demo@12345"}


def _login(creds):
    r = requests.post(f"{API}/auth/login", json=creds, timeout=15)
    assert r.status_code == 200, f"Login {creds['email']}: {r.status_code} {r.text}"
    return r.json().get("access_token") or r.json().get("token")


@pytest.fixture(scope="module")
def admin_hdr():
    return {"Authorization": f"Bearer {_login(ADMIN)}"}


@pytest.fixture(scope="module")
def vendor_hdr():
    return {"Authorization": f"Bearer {_login(VENDOR)}"}


@pytest.fixture(scope="module")
def customer_hdr():
    return {"Authorization": f"Bearer {_login(CUSTOMER)}"}


# --- public catalog ---
def test_components_public():
    r = requests.get(f"{API}/solar/epc/components", timeout=15)
    assert r.status_code == 200
    codes = {c["code"] for c in r.json()["components"]}
    assert "module" in codes and "inverter" in codes and "battery" in codes


def test_brands_public_active_only():
    r = requests.get(f"{API}/solar/epc/brands", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 10
    assert all(b.get("is_active") for b in data)


# --- manage endpoint scope ---
def test_manage_admin_sees_all(admin_hdr):
    r = requests.get(f"{API}/solar/epc/brands/manage", headers=admin_hdr, timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 15


def test_manage_vendor_scope(vendor_hdr):
    r = requests.get(f"{API}/solar/epc/brands/manage", headers=vendor_hdr, timeout=15)
    assert r.status_code == 200
    for b in r.json():
        assert b.get("created_by_role") == "vendor"


def test_manage_customer_forbidden(customer_hdr):
    r = requests.get(f"{API}/solar/epc/brands/manage", headers=customer_hdr, timeout=15)
    assert r.status_code == 403


# --- CRUD ---
def test_vendor_crud_flow(vendor_hdr):
    payload = {"category_code": "battery", "brand_name": "TEST_QA_Battery",
               "model": "T-1", "spec": "test", "rate": 30000, "is_active": True}
    r = requests.post(f"{API}/solar/epc/brands", headers=vendor_hdr, json=payload, timeout=15)
    assert r.status_code == 200, r.text
    bid = r.json()["id"]
    # update
    payload["rate"] = 31000
    r2 = requests.put(f"{API}/solar/epc/brands/{bid}", headers=vendor_hdr, json=payload, timeout=15)
    assert r2.status_code == 200 and r2.json()["rate"] == 31000
    # toggle
    r3 = requests.patch(f"{API}/solar/epc/brands/{bid}/status", headers=vendor_hdr, timeout=15)
    assert r3.status_code == 200 and r3.json()["is_active"] is False
    # delete
    r4 = requests.delete(f"{API}/solar/epc/brands/{bid}", headers=vendor_hdr, timeout=15)
    assert r4.status_code == 200


def test_customer_cannot_create(customer_hdr):
    r = requests.post(f"{API}/solar/epc/brands", headers=customer_hdr,
                      json={"category_code": "module", "brand_name": "x", "rate": 10}, timeout=15)
    assert r.status_code == 403


# --- BOQ override ---
def test_boq_module_brand_override_changes_total():
    # baseline
    body = {"monthly_units": 500, "tariff": 8, "segment": "residential",
            "system_type": "ongrid", "tier": "standard"}
    r = requests.post(f"{API}/solar/epc/estimate", json=body, timeout=20)
    assert r.status_code == 200
    baseline_total = r.json()["boq"]["total"]

    # find a module brand different from default (Waaree TOPCon has 20/Wp)
    brands = requests.get(f"{API}/solar/epc/brands?category_code=module", timeout=15).json()
    premium = next(b for b in brands if b["rate"] >= 18)
    body2 = dict(body, brand_selections={"module": premium["id"]})
    r2 = requests.post(f"{API}/solar/epc/estimate", json=body2, timeout=20)
    assert r2.status_code == 200
    result = r2.json()
    new_total = result["boq"]["total"]
    assert new_total != baseline_total
    module_row = next(it for it in result["boq"]["items"] if it["code"] == "module")
    assert module_row["brand"] == premium["brand_name"]


def test_super_admin_can_delete_vendor_brand(admin_hdr, vendor_hdr):
    r = requests.post(f"{API}/solar/epc/brands", headers=vendor_hdr,
                      json={"category_code": "inverter", "brand_name": "TEST_VendorInv", "rate": 4000}, timeout=15)
    assert r.status_code == 200
    bid = r.json()["id"]
    rd = requests.delete(f"{API}/solar/epc/brands/{bid}", headers=admin_hdr, timeout=15)
    assert rd.status_code == 200

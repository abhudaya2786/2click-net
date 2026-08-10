"""Iteration 15 backend regression: brand approval, package approval, freelancer enquiries unread."""
import os, time, requests, pytest
from pathlib import Path

def _load_frontend_env():
    p = Path("/app/frontend/.env")
    for line in p.read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            return line.split("=", 1)[1].strip()
    raise RuntimeError("REACT_APP_BACKEND_URL missing")

BASE = _load_frontend_env().rstrip("/") + "/api"

ADMIN = ("abbhuadaya@gmail.com", "Admin@12345")
VENDOR = ("vendor@2click.in", "Demo@12345")
CUSTOMER = ("customer@2click.in", "Demo@12345")
ARCHITECT = ("architect@2click.in", "Demo@12345")

def _login(email, pw):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": pw}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]

def _h(tok): return {"Authorization": f"Bearer {tok}"}

@pytest.fixture(scope="module")
def tokens():
    return {
        "admin": _login(*ADMIN),
        "vendor": _login(*VENDOR),
        "customer": _login(*CUSTOMER),
        "architect": _login(*ARCHITECT),
    }

# ---------- BRAND APPROVAL ----------
def test_vendor_brand_pending_hidden_then_approved(tokens):
    # Vendor creates brand
    payload = {"category_code": "inverter", "brand_name": "TEST_ITER15_Inv1", "rate": 5200, "unit": "₹/kW"}
    r = requests.post(f"{BASE}/solar/epc/brands", json=payload, headers=_h(tokens["vendor"]), timeout=30)
    assert r.status_code in (200, 201), r.text
    bid = r.json()["id"]
    assert r.json().get("status") == "pending"

    # Public list should NOT contain it
    pub = requests.get(f"{BASE}/solar/epc/brands", timeout=30).json()
    ids = [b["id"] for b in pub]
    assert bid not in ids

    # Admin approves
    ap = requests.post(f"{BASE}/solar/epc/brands/{bid}/approve", headers=_h(tokens["admin"]), timeout=30)
    assert ap.status_code == 200, ap.text
    assert ap.json()["status"] == "approved"

    # Public now sees it
    pub2 = requests.get(f"{BASE}/solar/epc/brands", timeout=30).json()
    assert bid in [b["id"] for b in pub2]

    # cleanup
    requests.delete(f"{BASE}/solar/epc/brands/{bid}", headers=_h(tokens["admin"]), timeout=30)

def test_reject_requires_reason(tokens):
    payload = {"category_code": "module", "brand_name": "TEST_ITER15_Mod1", "rate": 28, "unit": "₹/Wp", "module_wp": 550}
    r = requests.post(f"{BASE}/solar/epc/brands", json=payload, headers=_h(tokens["vendor"]), timeout=30)
    bid = r.json()["id"]

    empty = requests.post(f"{BASE}/solar/epc/brands/{bid}/reject", json={"reason": ""}, headers=_h(tokens["admin"]), timeout=30)
    assert empty.status_code in (400, 422), empty.text

    ok = requests.post(f"{BASE}/solar/epc/brands/{bid}/reject", json={"reason": "not standard"}, headers=_h(tokens["admin"]), timeout=30)
    assert ok.status_code == 200, ok.text
    assert ok.json()["status"] == "rejected"
    # verify persisted rejection_reason via manage endpoint
    mng = requests.get(f"{BASE}/solar/epc/brands/manage", headers=_h(tokens["admin"]), timeout=30).json()
    row = next((b for b in mng if b["id"] == bid), None)
    assert row and "not standard" in (row.get("rejection_reason") or "")

    requests.delete(f"{BASE}/solar/epc/brands/{bid}", headers=_h(tokens["admin"]), timeout=30)

def test_vendor_cannot_approve(tokens):
    payload = {"category_code": "battery", "brand_name": "TEST_ITER15_Bat1", "rate": 30000, "unit": "₹/kWh"}
    r = requests.post(f"{BASE}/solar/epc/brands", json=payload, headers=_h(tokens["vendor"]), timeout=30)
    bid = r.json()["id"]
    v = requests.post(f"{BASE}/solar/epc/brands/{bid}/approve", headers=_h(tokens["vendor"]), timeout=30)
    assert v.status_code == 403
    requests.delete(f"{BASE}/solar/epc/brands/{bid}", headers=_h(tokens["admin"]), timeout=30)

# ---------- PACKAGES ----------
def test_admin_package_auto_approved_public_visible(tokens):
    # Grab a couple of approved brands
    brands = requests.get(f"{BASE}/solar/epc/brands", timeout=30).json()
    mod = next(b for b in brands if b["category_code"] == "module")
    inv = next(b for b in brands if b["category_code"] == "inverter")
    pkg = {"name": "TEST_ITER15_AdminPkg", "tier_label": "Premium", "selections": {"module": mod["id"], "inverter": inv["id"]}}
    r = requests.post(f"{BASE}/solar/epc/packages", json=pkg, headers=_h(tokens["admin"]), timeout=30)
    assert r.status_code in (200, 201), r.text
    pid = r.json()["id"]
    assert r.json()["status"] == "approved"
    pub = requests.get(f"{BASE}/solar/epc/packages", timeout=30).json()
    assert pid in [p["id"] for p in pub]
    requests.delete(f"{BASE}/solar/epc/packages/{pid}", headers=_h(tokens["admin"]), timeout=30)

def test_vendor_package_pending_hidden_then_approved(tokens):
    brands = requests.get(f"{BASE}/solar/epc/brands", timeout=30).json()
    mod = next(b for b in brands if b["category_code"] == "module")
    inv = next(b for b in brands if b["category_code"] == "inverter")
    pkg = {"name": "TEST_ITER15_VendorPkg", "tier_label": "Value", "selections": {"module": mod["id"], "inverter": inv["id"]}}
    r = requests.post(f"{BASE}/solar/epc/packages", json=pkg, headers=_h(tokens["vendor"]), timeout=30)
    assert r.status_code in (200, 201), r.text
    pid = r.json()["id"]
    assert r.json()["status"] == "pending"

    pub = requests.get(f"{BASE}/solar/epc/packages", timeout=30).json()
    assert pid not in [p["id"] for p in pub]

    ap = requests.post(f"{BASE}/solar/epc/packages/{pid}/approve", headers=_h(tokens["admin"]), timeout=30)
    assert ap.status_code == 200
    pub2 = requests.get(f"{BASE}/solar/epc/packages", timeout=30).json()
    assert pid in [p["id"] for p in pub2]
    requests.delete(f"{BASE}/solar/epc/packages/{pid}", headers=_h(tokens["admin"]), timeout=30)

def test_customer_cannot_manage_packages(tokens):
    r = requests.get(f"{BASE}/solar/epc/packages/manage", headers=_h(tokens["customer"]), timeout=30)
    assert r.status_code == 403

# ---------- FREELANCER ENQUIRIES ----------
def test_freelancer_enquiry_unread_and_mark_read(tokens):
    # find architect
    fls = requests.get(f"{BASE}/freelancers", timeout=30).json()
    architect = next((f for f in fls if "Aarav" in f.get("name", "")), None)
    if not architect:
        # fall back to any freelancer that is our test architect
        me = requests.get(f"{BASE}/auth/me", headers=_h(tokens["architect"]), timeout=30).json()
        architect = {"id": me.get("id") or "user_101810beb884"}
    arch_id = architect["id"]

    # customer posts enquiry
    body = {"message": "TEST_ITER15 enquiry for architect", "category": "design"}
    r = requests.post(f"{BASE}/freelancers/{arch_id}/enquiry", json=body, headers=_h(tokens["customer"]), timeout=30)
    assert r.status_code in (200, 201), r.text

    # architect fetches
    time.sleep(1)
    e = requests.get(f"{BASE}/freelancers/me/enquiries", headers=_h(tokens["architect"]), timeout=30)
    assert e.status_code == 200
    data = e.json()
    assert "received" in data and "unread" in data
    assert data["unread"] >= 1

    # mark read
    mr = requests.post(f"{BASE}/freelancers/me/enquiries/mark-read", headers=_h(tokens["architect"]), timeout=30)
    assert mr.status_code == 200
    e2 = requests.get(f"{BASE}/freelancers/me/enquiries", headers=_h(tokens["architect"]), timeout=30).json()
    assert e2["unread"] == 0

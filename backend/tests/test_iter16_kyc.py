"""Iteration 16 backend regression: Solar KYC upload/download refactor + catalog & enquiry regressions."""
import io, requests, pytest
from auth_helpers import login, admin_login, ADMIN, VENDOR, CUSTOMER, API

ARCHITECT = ("architect@buildecogroup.com", "Demo@12345")

def _h(tok): return {"Authorization": f"Bearer {tok}"}

@pytest.fixture(scope="module")
def tokens():
    return {"admin": admin_login()[0], "vendor": login(*VENDOR)[0],
            "customer": login(*CUSTOMER)[0], "architect": login(*ARCHITECT)[0]}


# ---------- SOLAR KYC UPLOAD -> DOWNLOAD (the fix under test) ----------
_TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
    b"\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03"
    b"\x00\x01\x5c\xcd\xff\x69\x00\x00\x00\x00IEND\xaeB`\x82"
)

@pytest.fixture(scope="module")
def proposal_id(tokens):
    body = {"segment": "residential", "system_type": "ongrid", "tier": "standard",
            "monthly_bill": 5000, "tariff": 8, "roof_area_sqft": 600}
    r = requests.post(f"{API}/solar/epc/proposals", json=body, headers=_h(tokens["customer"]), timeout=60)
    assert r.status_code in (200, 201), r.text
    pid = r.json().get("id")
    assert pid, r.text
    return pid

def test_kyc_upload_then_download_returns_200_with_disposition(tokens, proposal_id):
    files = {"file": ("test_aadhaar.png", _TINY_PNG, "image/png")}
    up = requests.post(f"{API}/solar/epc/proposals/{proposal_id}/kyc",
                       params={"doc_type": "aadhaar"},
                       files=files, headers=_h(tokens["customer"]), timeout=120)
    if up.status_code == 502:
        pytest.skip(f"Object storage unavailable in test env: {up.text}")
    assert up.status_code in (200, 201), up.text
    file_id = up.json().get("id")
    assert file_id, up.text

    # Download - the refactored code path
    dl = requests.get(f"{API}/solar/epc/kyc/{file_id}/download",
                      headers=_h(tokens["customer"]), timeout=60)
    assert dl.status_code == 200, f"download failed: {dl.status_code} {dl.text[:300]}"
    assert len(dl.content) > 0, "empty download body"
    assert dl.content == _TINY_PNG, "downloaded bytes differ from uploaded"
    cd = dl.headers.get("Content-Disposition", "")
    assert "test_aadhaar.png" in cd, f"missing/incorrect Content-Disposition: {cd!r}"

def test_kyc_download_nonexistent_returns_404_not_500(tokens):
    r = requests.get(f"{API}/solar/epc/kyc/NON_EXISTENT_XYZ/download",
                     headers=_h(tokens["customer"]), timeout=30)
    assert r.status_code == 404, f"expected 404, got {r.status_code}: {r.text[:200]}"


# ---------- REGRESSION: Solar catalog public endpoints ----------
def test_solar_components_public():
    r = requests.get(f"{API}/solar/epc/components", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    # API returns {"components": [...]} — accept both shapes
    comps = data["components"] if isinstance(data, dict) else data
    assert isinstance(comps, list)
    assert len(comps) == 11, f"expected 11 components, got {len(comps)}"

def test_solar_brands_public_min_18():
    r = requests.get(f"{API}/solar/epc/brands", timeout=30)
    assert r.status_code == 200
    brands = r.json()
    assert isinstance(brands, list)
    assert len(brands) >= 18, f"expected >=18 active+approved brands, got {len(brands)}"

def test_solar_packages_public_has_seeded():
    r = requests.get(f"{API}/solar/epc/packages", timeout=30)
    assert r.status_code == 200
    pkgs = r.json()
    names = [p.get("name") for p in pkgs]
    assert "Premium Home" in names, f"Premium Home missing: {names}"
    assert "Value Home" in names, f"Value Home missing: {names}"

def test_solar_estimate_with_brand_override(tokens):
    brands = requests.get(f"{API}/solar/epc/brands", timeout=30).json()
    module_brand = next((b for b in brands if b.get("category_code") == "module"), None)
    assert module_brand, "no module brand found for override test"
    body = {"segment": "residential", "system_type": "ongrid", "tier": "standard",
            "monthly_bill": 5000, "tariff": 8, "roof_area_sqft": 600,
            "brand_selections": {"module": module_brand["id"]}}
    r = requests.post(f"{API}/solar/epc/estimate", json=body,
                      headers=_h(tokens["customer"]), timeout=60)
    assert r.status_code == 200, r.text
    js = r.json()
    boq = js.get("boq") or {}
    items = boq.get("items") if isinstance(boq, dict) else boq
    assert items, f"empty BOQ items: {js}"
    module_row = next((row for row in items if row.get("code") == "module"), None)
    assert module_row, f"no module row in BOQ: {items}"
    brand_in_row = str(module_row.get("brand") or module_row.get("brand_name") or "")
    assert module_brand["brand_name"] in brand_in_row, \
        f"override not reflected: expected {module_brand['brand_name']!r} in {brand_in_row!r}"


# ---------- REGRESSION: Brand approval access control ----------
def test_brand_approval_access_control(tokens):
    payload = {"category_code": "inverter", "brand_name": "TEST_ITER16_Inv", "rate": 5200, "unit": "₹/kW"}
    r = requests.post(f"{API}/solar/epc/brands", json=payload, headers=_h(tokens["vendor"]), timeout=30)
    assert r.status_code in (200, 201), r.text
    bid = r.json()["id"]
    assert r.json().get("status") == "pending"
    try:
        # Public hides pending
        pub_ids = [b["id"] for b in requests.get(f"{API}/solar/epc/brands", timeout=30).json()]
        assert bid not in pub_ids

        # Vendor cannot approve
        va = requests.post(f"{API}/solar/epc/brands/{bid}/approve",
                           headers=_h(tokens["vendor"]), timeout=30)
        assert va.status_code == 403, f"vendor approve should be 403, got {va.status_code}"

        # Reject with empty reason -> 422
        rej = requests.post(f"{API}/solar/epc/brands/{bid}/reject",
                            json={"reason": ""}, headers=_h(tokens["admin"]), timeout=30)
        assert rej.status_code == 422, f"empty reject reason should be 422, got {rej.status_code}: {rej.text}"

        # Admin approves
        ap = requests.post(f"{API}/solar/epc/brands/{bid}/approve",
                           headers=_h(tokens["admin"]), timeout=30)
        assert ap.status_code == 200
        assert ap.json()["status"] == "approved"
        pub_ids2 = [b["id"] for b in requests.get(f"{API}/solar/epc/brands", timeout=30).json()]
        assert bid in pub_ids2
    finally:
        requests.delete(f"{API}/solar/epc/brands/{bid}", headers=_h(tokens["admin"]), timeout=30)


def test_customer_cannot_access_packages_manage(tokens):
    r = requests.get(f"{API}/solar/epc/packages/manage", headers=_h(tokens["customer"]), timeout=30)
    assert r.status_code == 403, f"customer should get 403 on packages/manage, got {r.status_code}"


# ---------- REGRESSION: Freelancer enquiries ----------
def test_freelancer_enquiries_shape_and_mark_read(tokens):
    r = requests.get(f"{API}/freelancers/me/enquiries", headers=_h(tokens["architect"]), timeout=30)
    assert r.status_code == 200, r.text
    js = r.json()
    for k in ("received", "sent", "unread"):
        assert k in js, f"missing key {k}: {js.keys()}"
    assert isinstance(js["received"], list)
    assert isinstance(js["sent"], list)
    assert isinstance(js["unread"], int)

    # Create a fresh enquiry from customer to architect to guarantee unread >=1
    me = requests.get(f"{API}/auth/me", headers=_h(tokens["architect"]), timeout=30).json()
    arch_id = me["id"]
    payload = {"message": "TEST_ITER16 KYC regression enquiry"}
    post = requests.post(f"{API}/freelancers/{arch_id}/enquiry", json=payload,
                        headers=_h(tokens["customer"]), timeout=30)
    assert post.status_code in (200, 201), post.text

    after = requests.get(f"{API}/freelancers/me/enquiries", headers=_h(tokens["architect"]), timeout=30).json()
    assert after["unread"] >= 1, f"expected unread>=1 after new enquiry, got {after['unread']}"

    mr = requests.post(f"{API}/freelancers/me/enquiries/mark-read",
                       headers=_h(tokens["architect"]), timeout=30)
    assert mr.status_code == 200, mr.text

    final = requests.get(f"{API}/freelancers/me/enquiries", headers=_h(tokens["architect"]), timeout=30).json()
    assert final["unread"] == 0, f"expected unread=0 after mark-read, got {final['unread']}"

"""Phase 3A tests: Category Engine, User Types, Smart Signup, Session, Freelancer, Admin profile edit."""
import os
import time
import uuid
import pytest
import requests
from auth_helpers import login, admin_login, ADMIN, CUSTOMER, VENDOR, CONTRACTOR, API


def auth_h(token):
    return {"Authorization": f"Bearer {token}"}


# -------------------- Regression: existing logins --------------------
def test_regression_admin_login():
    tok = admin_login()[0]
    me = requests.get(f"{API}/auth/me", headers=auth_h(tok), timeout=15)
    assert me.status_code == 200
    assert me.json()["email"] == ADMIN[0]


@pytest.mark.parametrize("creds", [CUSTOMER, VENDOR, CONTRACTOR])
def test_regression_logins(creds):
    tok = login(*creds)[0]
    me = requests.get(f"{API}/auth/me", headers=auth_h(tok), timeout=15)
    assert me.status_code == 200
    assert me.json()["email"] == creds[0]


# -------------------- Category public reads --------------------
def test_categories_active_only():
    r = requests.get(f"{API}/categories", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) > 0
    assert all(c["status"] == "active" for c in data)


def test_categories_tree_construction():
    r = requests.get(f"{API}/categories/tree?category_type=construction", timeout=15)
    assert r.status_code == 200
    tree = r.json()
    parents = [n["name"] for n in tree]
    assert "Construction" in parents
    con = next(n for n in tree if n["name"] == "Construction")
    assert len(con["children"]) > 0


def test_categories_by_type_marketplace():
    r = requests.get(f"{API}/categories/type/marketplace", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert all(c["category_type"] == "marketplace" for c in data)


def test_category_get_by_id_and_404():
    r = requests.get(f"{API}/categories/type/freelancer", timeout=15).json()
    cid = r[0]["id"]
    g = requests.get(f"{API}/categories/{cid}", timeout=15)
    assert g.status_code == 200 and g.json()["id"] == cid
    bad = requests.get(f"{API}/categories/cat_doesnotexist_zz", timeout=15)
    assert bad.status_code == 404


# -------------------- Category RBAC --------------------
def test_category_rbac_admin_crud_and_customer_forbidden():
    admin_tok = admin_login(*ADMIN)[0]
    cust_tok = login(*CUSTOMER)[0]

    unique = uuid.uuid4().hex[:6]
    payload = {"name": f"TEST_Cat_{unique}", "category_type": "general", "description": "t"}

    # Customer forbidden on POST
    r = requests.post(f"{API}/categories", json=payload, headers=auth_h(cust_tok), timeout=15)
    assert r.status_code == 403

    # Admin creates
    r = requests.post(f"{API}/categories", json=payload, headers=auth_h(admin_tok), timeout=15)
    assert r.status_code == 200, r.text
    cid = r.json()["id"]

    # Customer forbidden PUT/PATCH/DELETE
    for method, path, body in [
        ("put", f"/categories/{cid}", payload),
        ("patch", f"/categories/{cid}/status", {"status": "disabled"}),
        ("delete", f"/categories/{cid}", None),
    ]:
        fn = getattr(requests, method)
        r = fn(f"{API}{path}", json=body, headers=auth_h(cust_tok), timeout=15) if body else fn(f"{API}{path}", headers=auth_h(cust_tok), timeout=15)
        assert r.status_code == 403, f"{method} {path} expected 403, got {r.status_code}"

    # Admin PUT
    r = requests.put(f"{API}/categories/{cid}", json={**payload, "name": f"TEST_Cat_{unique}_upd"}, headers=auth_h(admin_tok), timeout=15)
    assert r.status_code == 200

    # PATCH status
    r = requests.patch(f"{API}/categories/{cid}/status", json={"status": "disabled"}, headers=auth_h(admin_tok), timeout=15)
    assert r.status_code == 200
    r = requests.patch(f"{API}/categories/{cid}/status", json={"status": "active"}, headers=auth_h(admin_tok), timeout=15)
    assert r.status_code == 200

    # DELETE — unreferenced hard delete
    r = requests.delete(f"{API}/categories/{cid}", headers=auth_h(admin_tok), timeout=15)
    assert r.status_code == 200
    # verify gone
    assert requests.get(f"{API}/categories/{cid}", timeout=15).status_code == 404


def test_category_delete_soft_when_referenced():
    admin_tok = admin_login(*ADMIN)[0]
    # Create category + register a user referencing it
    unique = uuid.uuid4().hex[:6]
    cat = requests.post(f"{API}/categories", json={"name": f"TEST_RefCat_{unique}", "category_type": "freelancer"},
                        headers=auth_h(admin_tok), timeout=15).json()
    cid = cat["id"]
    email = f"TEST_ref_{unique}@example.com"
    reg = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "Demo@12345", "name": "TEST Ref",
        "user_type": "freelancer", "primary_category_id": cid, "category_ids": [cid],
    }, timeout=15)
    assert reg.status_code in (200, 201), reg.text

    # Delete should soft-disable
    r = requests.delete(f"{API}/categories/{cid}", headers=auth_h(admin_tok), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body.get("soft_disabled") is True
    # Verify status now disabled — call include_disabled
    lst = requests.get(f"{API}/categories?include_disabled=true", timeout=15).json()
    assert any(c["id"] == cid and c["status"] == "disabled" for c in lst)


def test_audit_log_module_categories_written():
    admin_tok = admin_login(*ADMIN)[0]
    unique = uuid.uuid4().hex[:6]
    r = requests.post(f"{API}/categories", json={"name": f"TEST_Audit_{unique}", "category_type": "general"},
                      headers=auth_h(admin_tok), timeout=15)
    assert r.status_code == 200
    # Check audit log
    audit = requests.get(f"{API}/audit-logs?module=categories&limit=10", headers=auth_h(admin_tok), timeout=15)
    if audit.status_code == 404:
        pytest.skip("Audit-logs endpoint unavailable — not part of Phase 3A spec")
    assert audit.status_code == 200
    rows = audit.json() if isinstance(audit.json(), list) else audit.json().get("items", [])
    assert any(row.get("module") == "categories" for row in rows)


# -------------------- User Types --------------------
def test_user_types_14_active():
    r = requests.get(f"{API}/user-types", timeout=15)
    assert r.status_code == 200
    types = r.json()
    codes = {t["code"] for t in types}
    expected = {"customer", "contractor", "vendor", "supplier", "shop", "freelancer",
                "architect", "engineer", "ca", "transporter", "service_provider",
                "employee", "company", "other"}
    assert expected.issubset(codes), f"missing: {expected - codes}"
    assert len(types) >= 14


# -------------------- Smart Signup --------------------
def _pick_cat(cat_type):
    cats = requests.get(f"{API}/categories/type/{cat_type}", timeout=15).json()
    assert cats, f"no cats of type {cat_type}"
    return cats


def test_register_freelancer_creates_user_categories_and_role():
    cats = _pick_cat("freelancer")
    pc, extra = cats[0]["id"], cats[1]["id"] if len(cats) > 1 else cats[0]["id"]
    email = f"TEST_free_{uuid.uuid4().hex[:6]}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "Demo@12345", "name": "TEST Freelancer",
        "user_type": "freelancer", "primary_category_id": pc, "category_ids": [pc, extra, "cat_bogus_zzzz"],
        "skills": ["autocad", "revit"], "service_area": "Mumbai",
    }, timeout=15)
    assert r.status_code in (200, 201), r.text
    tok = r.json().get("token") or login(email, "Demo@12345")[0]
    session = requests.get(f"{API}/auth/session", headers=auth_h(tok), timeout=15).json()
    assert session["user"]["user_type"] == "freelancer"
    # role for freelancer -> customer per spec
    assert session["user"]["role"] == "customer"
    assert session["default_dashboard"] == "freelancer"
    # primary category set + bogus ignored
    assert session["primary_category"] and session["primary_category"]["id"] == pc
    cat_ids = {c["id"] for c in session["categories"]}
    assert pc in cat_ids and "cat_bogus_zzzz" not in cat_ids


def test_register_contractor_dashboard():
    cats = _pick_cat("construction")
    email = f"TEST_con_{uuid.uuid4().hex[:6]}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "Demo@12345", "name": "TEST Contractor",
        "user_type": "contractor", "primary_category_id": cats[0]["id"], "category_ids": [cats[0]["id"]],
    }, timeout=15)
    assert r.status_code in (200, 201)
    tok = login(email, "Demo@12345")[0]
    s = requests.get(f"{API}/auth/session", headers=auth_h(tok), timeout=15).json()
    assert s["user"]["role"] == "contractor"
    assert s["default_dashboard"] == "contractor"


def test_register_vendor_role():
    cats = _pick_cat("marketplace")
    email = f"TEST_ven_{uuid.uuid4().hex[:6]}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "Demo@12345", "name": "TEST Vendor",
        "user_type": "vendor", "primary_category_id": cats[0]["id"], "category_ids": [cats[0]["id"]],
    }, timeout=15)
    assert r.status_code in (200, 201)
    tok = login(email, "Demo@12345")[0]
    s = requests.get(f"{API}/auth/session", headers=auth_h(tok), timeout=15).json()
    assert s["user"]["role"] == "vendor"


def test_register_escalation_protection():
    email = f"TEST_esc_{uuid.uuid4().hex[:6]}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "Demo@12345", "name": "TEST Esc",
        "user_type": "super_admin", "role": "super_admin",
    }, timeout=15)
    # Either rejected or coerced — but must NOT be super_admin
    if r.status_code in (200, 201):
        tok = login(email, "Demo@12345")[0]
        s = requests.get(f"{API}/auth/session", headers=auth_h(tok), timeout=15).json()
        assert s["user"].get("role") != "super_admin"
        assert s.get("is_super") is False


# -------------------- Session profile --------------------
def test_super_admin_session_is_super():
    tok = admin_login(*ADMIN)[0]
    s = requests.get(f"{API}/auth/session", headers=auth_h(tok), timeout=15).json()
    assert s["is_super"] is True
    for key in ("user", "company", "user_type", "categories", "departments",
                "roles", "permissions", "default_dashboard", "workspace"):
        assert key in s, f"missing session key {key}"
    assert "brand_name" in s["workspace"] and "primary_color" in s["workspace"]


# -------------------- Freelancer module --------------------
def test_freelancers_list_public_no_email():
    r = requests.get(f"{API}/freelancers", timeout=15)
    assert r.status_code == 200
    for f in r.json():
        assert "email" not in f


def test_freelancer_enquiry_requires_auth_and_writes():
    # Need a target freelancer
    frs = requests.get(f"{API}/freelancers", timeout=15).json()
    if not frs:
        # Create one
        cats = _pick_cat("freelancer")
        email = f"TEST_target_{uuid.uuid4().hex[:6]}@example.com"
        requests.post(f"{API}/auth/register", json={
            "email": email, "password": "Demo@12345", "name": "TEST Target Freelancer",
            "user_type": "freelancer", "primary_category_id": cats[0]["id"], "category_ids": [cats[0]["id"]],
        }, timeout=15)
        frs = requests.get(f"{API}/freelancers", timeout=15).json()
    assert frs, "no freelancers even after seeding"
    target = frs[0]

    # No token → 401 or 403
    r = requests.post(f"{API}/freelancers/{target['id']}/enquiry", json={"message": "test"}, timeout=15)
    assert r.status_code in (401, 403)

    # With auth → 200 & persisted
    tok = login(*CUSTOMER)[0]
    r = requests.post(f"{API}/freelancers/{target['id']}/enquiry",
                      json={"message": "Hi from TEST", "category": "Web Development"},
                      headers=auth_h(tok), timeout=15)
    assert r.status_code == 200, r.text
    enq = r.json()
    assert enq["freelancer_id"] == target["id"]

    # my enquiries as customer (sent)
    mine = requests.get(f"{API}/freelancers/me/enquiries", headers=auth_h(tok), timeout=15).json()
    assert any(e["id"] == enq["id"] for e in mine["sent"])


# -------------------- Admin edit profile --------------------
def test_admin_edit_user_profile_changes_type_and_categories():
    admin_tok = admin_login(*ADMIN)[0]
    # Create test user
    email = f"TEST_prof_{uuid.uuid4().hex[:6]}@example.com"
    reg = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "Demo@12345", "name": "TEST Profile",
        "user_type": "customer",
    }, timeout=15)
    assert reg.status_code in (200, 201)
    uid = reg.json().get("user", {}).get("id")
    if not uid:
        tok = login(email, "Demo@12345")[0]
        uid = requests.get(f"{API}/auth/me", headers=auth_h(tok), timeout=15).json()["id"]

    # Non-admin -> 403
    cust_tok = login(*CUSTOMER)[0]
    r = requests.patch(f"{API}/admin/users/{uid}/profile", json={"user_type": "vendor"},
                       headers=auth_h(cust_tok), timeout=15)
    assert r.status_code == 403

    # Admin flips to vendor + assigns marketplace category
    cats = _pick_cat("marketplace")
    r = requests.patch(f"{API}/admin/users/{uid}/profile", json={
        "user_type": "vendor", "primary_category_id": cats[0]["id"],
        "category_ids": [cats[0]["id"], cats[1]["id"] if len(cats) > 1 else cats[0]["id"]],
    }, headers=auth_h(admin_tok), timeout=15)
    assert r.status_code == 200, r.text

    tok = login(email, "Demo@12345")[0]
    s = requests.get(f"{API}/auth/session", headers=auth_h(tok), timeout=15).json()
    assert s["user"]["user_type"] == "vendor"
    assert s["user"]["role"] == "vendor"
    assert s["default_dashboard"] == "vendor"
    assert s["primary_category"]["id"] == cats[0]["id"]


def test_admin_edit_cannot_escalate_to_super_admin():
    admin_tok = admin_login(*ADMIN)[0]
    # Create user
    email = f"TEST_esc2_{uuid.uuid4().hex[:6]}@example.com"
    reg = requests.post(f"{API}/auth/register", json={
        "email": email, "password": "Demo@12345", "name": "TEST Esc2",
    }, timeout=15)
    tok = login(email, "Demo@12345")[0]
    uid = requests.get(f"{API}/auth/me", headers=auth_h(tok), timeout=15).json()["id"]
    r = requests.patch(f"{API}/admin/users/{uid}/profile", json={"user_type": "super_admin"},
                       headers=auth_h(admin_tok), timeout=15)
    # per spec: profile can never set super_admin
    s = requests.get(f"{API}/auth/session", headers=auth_h(tok), timeout=15).json()
    assert s.get("is_super") is False
    assert s["user"].get("role") != "super_admin"

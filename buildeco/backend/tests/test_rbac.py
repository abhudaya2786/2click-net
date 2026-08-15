"""Phase 1 + Phase 2 RBAC & Audit tests.

Covers:
- /api/auth/permissions for super_admin vs customer
- /api/admin/rbac/* seed data (24 depts, 4 system roles, default company)
- Role guard: customer must be 403 on RBAC endpoints
- Custom role CRUD (create/patch/soft-delete). System role delete must be 400.
- Role-Permission Matrix GET/PUT round-trip
- User assignment POST/GET/DELETE + escalation guard for sys_super_admin
- Phase 1 Audit expansion: CREATE department writes audit with module, ip, device
- Sensitive-key redaction in audit old/new value
"""
import os
import time
import requests
import pytest
from auth_helpers import login, admin_login, ADMIN, VENDOR, CUSTOMER, API


def hdr(tok):
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="module")
def toks():
    return {"admin": admin_login(), "vendor": login(*VENDOR), "customer": login(*CUSTOMER)}


# ---------------------- Effective permissions ----------------------
class TestAuthPermissions:
    def test_super_admin_permissions(self, toks):
        tok, _ = toks["admin"]
        r = requests.get(f"{API}/auth/permissions", headers=hdr(tok))
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("super") is True

    def test_customer_permissions_not_super(self, toks):
        tok, _ = toks["customer"]
        r = requests.get(f"{API}/auth/permissions", headers=hdr(tok))
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("super") is False
        perms = set(d.get("permissions", []))
        assert "marketplace:VIEW" in perms
        assert "orders:CREATE" in perms


# ---------------------- Seed data ----------------------
class TestRBACSeed:
    def test_departments_seeded(self, toks):
        tok = toks["admin"][0]
        r = requests.get(f"{API}/admin/rbac/departments", headers=hdr(tok))
        assert r.status_code == 200, r.text
        depts = r.json()
        assert len(depts) >= 24, f"expected >=24 depts got {len(depts)}"
        names = {d["name"] for d in depts}
        assert "Super Administration" in names

    def test_roles_seeded(self, toks):
        tok = toks["admin"][0]
        r = requests.get(f"{API}/admin/rbac/roles", headers=hdr(tok))
        assert r.status_code == 200
        roles = r.json()
        sys_roles = [r for r in roles if r.get("is_system_role")]
        assert len(sys_roles) >= 4
        names = {r["name"] for r in sys_roles}
        for n in ["Super Administrator", "Vendor", "Customer", "Contractor"]:
            assert n in names
        for r in sys_roles:
            assert r["perm_count"] > 0, f"role {r['name']} has 0 perms"

    def test_default_company(self, toks):
        tok = toks["admin"][0]
        r = requests.get(f"{API}/admin/rbac/companies", headers=hdr(tok))
        assert r.status_code == 200
        names = [c["name"] for c in r.json()]
        assert "buildecogroup.com" in names


# ---------------------- Guards ----------------------
class TestGuards:
    def test_customer_forbidden_rbac(self, toks):
        tok = toks["customer"][0]
        for path in ["departments", "roles", "companies", "users", "audit"]:
            r = requests.get(f"{API}/admin/rbac/{path}", headers=hdr(tok))
            assert r.status_code == 403, f"{path}: {r.status_code}"

    def test_super_admin_ok_rbac(self, toks):
        tok = toks["admin"][0]
        for path in ["departments", "roles", "companies", "users", "audit", "modules", "menus", "meta"]:
            r = requests.get(f"{API}/admin/rbac/{path}", headers=hdr(tok))
            assert r.status_code == 200, f"{path}: {r.status_code} {r.text}"


# ---------------------- Custom Role CRUD ----------------------
class TestRoleCRUD:
    def test_create_patch_delete_role(self, toks):
        tok = toks["admin"][0]
        name = f"TEST_role_{int(time.time()*1000)}"
        r = requests.post(f"{API}/admin/rbac/roles", headers=hdr(tok),
                          json={"name": name, "description": "d"})
        assert r.status_code == 200, r.text
        rid = r.json()["id"]
        assert r.json()["is_system_role"] is False

        r = requests.patch(f"{API}/admin/rbac/roles/{rid}", headers=hdr(tok),
                           json={"description": "updated"})
        assert r.status_code == 200

        r = requests.delete(f"{API}/admin/rbac/roles/{rid}", headers=hdr(tok))
        assert r.status_code == 200

        # verify soft-disabled
        r = requests.get(f"{API}/admin/rbac/roles", headers=hdr(tok))
        role = next((x for x in r.json() if x["id"] == rid), None)
        assert role and role["status"] == "disabled"

    def test_cannot_delete_system_role(self, toks):
        tok = toks["admin"][0]
        r = requests.get(f"{API}/admin/rbac/roles", headers=hdr(tok))
        sysr = next(x for x in r.json() if x.get("is_system_role"))
        r = requests.delete(f"{API}/admin/rbac/roles/{sysr['id']}", headers=hdr(tok))
        assert r.status_code == 400


# ---------------------- Role-Permission Matrix ----------------------
class TestRoleMatrix:
    def test_get_and_put_permissions(self, toks):
        tok = toks["admin"][0]
        # Create a custom role
        r = requests.post(f"{API}/admin/rbac/roles", headers=hdr(tok),
                          json={"name": f"TEST_matrix_{int(time.time()*1000)}"})
        rid = r.json()["id"]

        r = requests.get(f"{API}/admin/rbac/roles/{rid}/permissions", headers=hdr(tok))
        assert r.status_code == 200
        assert r.json()["permissions"] == []

        new_perms = ["marketplace:VIEW", "orders:CREATE", "reports:EXPORT"]
        r = requests.put(f"{API}/admin/rbac/roles/{rid}/permissions", headers=hdr(tok),
                         json={"permissions": new_perms})
        assert r.status_code == 200
        assert r.json()["count"] == 3

        r = requests.get(f"{API}/admin/rbac/roles/{rid}/permissions", headers=hdr(tok))
        assert set(r.json()["permissions"]) == set(new_perms)


# ---------------------- User Assignment ----------------------
class TestUserAssignment:
    def test_assign_and_unassign(self, toks):
        tok = toks["admin"][0]
        # Create a fresh user
        email = f"TEST_assign_{int(time.time()*1000)}@ex.com"
        rr = requests.post(f"{API}/auth/register",
                           json={"name": "TA", "email": email, "password": "Test@1234", "role": "customer"})
        uid = rr.json()["user"]["id"]

        # Create a custom role
        r = requests.post(f"{API}/admin/rbac/roles", headers=hdr(tok),
                          json={"name": f"TEST_assignrole_{int(time.time()*1000)}"})
        rid = r.json()["id"]

        r = requests.post(f"{API}/admin/rbac/user-roles", headers=hdr(tok),
                          json={"user_id": uid, "role_id": rid})
        assert r.status_code == 200
        urid = r.json()["id"]

        # Verify visible in users list
        r = requests.get(f"{API}/admin/rbac/users", headers=hdr(tok))
        u = next((x for x in r.json() if x["id"] == uid), None)
        assert u and any(a["role_id"] == rid for a in u["assignments"])

        # Unassign
        r = requests.delete(f"{API}/admin/rbac/user-roles/{urid}", headers=hdr(tok))
        assert r.status_code == 200

    def test_non_super_cannot_assign_super_role(self, toks):
        """A non-super rbac-manager user assigning sys_super_admin must 403.

        We simulate by granting a customer rbac:MANAGE via the matrix.
        """
        admin_tok = toks["admin"][0]
        cust_tok, cust_user = toks["customer"]

        # Find sys_super_admin role id and customer's system role
        r = requests.get(f"{API}/admin/rbac/roles", headers=hdr(admin_tok))
        roles = r.json()
        super_role = next(r for r in roles if r["code"] == "sys_super_admin")
        cust_role = next(r for r in roles if r["code"] == "sys_customer")

        # Grant rbac:MANAGE to customer's system role temporarily (then revert)
        current = requests.get(f"{API}/admin/rbac/roles/{cust_role['id']}/permissions",
                               headers=hdr(admin_tok)).json()["permissions"]
        try:
            requests.put(f"{API}/admin/rbac/roles/{cust_role['id']}/permissions",
                         headers=hdr(admin_tok),
                         json={"permissions": list(set(current) | {"rbac:MANAGE"})})
            # Now customer tries to assign super_admin to itself
            r = requests.post(f"{API}/admin/rbac/user-roles", headers=hdr(cust_tok),
                              json={"user_id": cust_user["id"], "role_id": super_role["id"]})
            assert r.status_code == 403, f"expected 403 got {r.status_code}: {r.text}"
        finally:
            # Revert
            requests.put(f"{API}/admin/rbac/roles/{cust_role['id']}/permissions",
                         headers=hdr(admin_tok),
                         json={"permissions": current})


# ---------------------- Phase 1 Audit expansion ----------------------
class TestAuditPhase1:
    def test_create_department_writes_audit(self, toks):
        tok = toks["admin"][0]
        name = f"TEST_dept_{int(time.time()*1000)}"
        r = requests.post(f"{API}/admin/rbac/departments", headers=hdr(tok),
                          json={"name": name, "description": "t"})
        assert r.status_code == 200, r.text
        did = r.json()["id"]

        # Fetch audit filtered by module=departments
        r = requests.get(f"{API}/admin/rbac/audit",
                         headers=hdr(tok), params={"module": "departments", "limit": 50})
        assert r.status_code == 200
        logs = r.json()
        match = next((l for l in logs if l.get("record_id") == did and l.get("action") == "CREATE"), None)
        assert match, f"no CREATE audit for dept {did}. sample: {logs[:2]}"
        for k in ["module", "record_id", "ip_address", "device", "user_agent", "timestamp"]:
            assert k in match, f"missing key {k}"
        assert match["module"] == "departments"
        assert match["device"] in ("desktop", "mobile")
        assert match["ip_address"], "ip_address should be populated"

    def test_audit_sensitive_redaction(self, toks):
        """Any audit row must not contain plain-text password/token/secret in old/new_value."""
        tok = toks["admin"][0]
        r = requests.get(f"{API}/admin/rbac/audit", headers=hdr(tok), params={"limit": 200})
        assert r.status_code == 200
        for log in r.json():
            for field in ("old_value", "new_value"):
                v = log.get(field)
                if isinstance(v, dict):
                    for k, val in v.items():
                        if k.lower() in {"password", "password_hash", "token", "secret", "api_key",
                                         "access_token", "refresh_token", "session_token", "jwt", "authorization", "key"}:
                            assert val == "***REDACTED***", f"sensitive {k} leaked: {val}"

    def test_legacy_audit_still_readable(self, toks):
        """Legacy /api/admin/audit endpoint must still be reachable and return list."""
        tok = toks["admin"][0]
        r = requests.get(f"{API}/admin/audit", headers=hdr(tok))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

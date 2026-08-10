"""
2Click.in — Enterprise RBAC + Audit module (ADDITIVE, non-destructive).
Registers on the existing /api router set. Reuses the app's db + get_current_user.
Nothing here removes or rewrites existing features.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request, Body
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Injected dependencies (set by server.py via init())
# ---------------------------------------------------------------------------
_db = None
_get_current_user = None

def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_utc():
    return datetime.now(timezone.utc)

def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt

def new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:12]}"

def slug(s):
    return "".join(c if c.isalnum() else "_" for c in s.lower()).strip("_")

# ---------------------------------------------------------------------------
# Catalogs
# ---------------------------------------------------------------------------
ACTIONS = ["VIEW", "CREATE", "EDIT", "DELETE", "APPROVE", "REJECT", "EXPORT",
           "IMPORT", "PRINT", "DOWNLOAD", "ASSIGN", "TRANSFER", "VERIFY", "AUDIT", "MANAGE"]

MODULES = [
    ("dashboard", "Dashboard"), ("companies", "Companies"), ("departments", "Departments"),
    ("roles", "Roles"), ("permissions", "Permissions"), ("rbac", "Administration"),
    ("users", "Users & Assignments"), ("audit", "Audit Logs"), ("modules", "Modules"),
    ("menus", "Menus"), ("tender", "Tender & Bidding"), ("marketplace", "Marketplace"),
    ("products", "Products"), ("orders", "Orders"), ("payments", "Payments"),
    ("solar", "Solar & Clean Energy"), ("erp", "Construction & Projects"), ("ai", "AI & Technology"),
    ("reports", "Reports & Analytics"), ("inventory", "Warehouse & Inventory"),
    ("finance", "Finance & Accounts"), ("logistics", "Logistics & Fleet"),
    ("crm", "CRM & Customers"), ("hr", "HR & Employee"), ("procurement", "Procurement"),
    ("settings", "Settings"),
]

DEPARTMENTS = [
    "Super Administration", "HR & Employee", "Tender & Bidding", "Construction & Projects",
    "Marketplace", "Vendor Management", "Sales & Business Development", "Customer Support",
    "Finance & Accounts", "GST & Taxation", "Loan & Financial Services", "Logistics & Fleet",
    "Solar & Clean Energy", "Architecture & Design", "AI & Technology", "IT & Infrastructure",
    "Data & Analytics", "Marketing", "Legal & Compliance", "Risk & Security", "Communication",
    "Procurement", "Warehouse & Inventory", "Training & Knowledge",
]

# System roles derived from the legacy users.role values (backward compatible)
SYSTEM_ROLES = {
    "super_admin": ("Super Administrator", "Super Administration"),
    "vendor": ("Vendor", "Vendor Management"),
    "customer": ("Customer", "Customer Support"),
    "contractor": ("Contractor", "Construction & Projects"),
}

# Default permission grants per system role (module -> actions)
ROLE_GRANTS = {
    "super_admin": {m[0]: list(ACTIONS) for m in MODULES},  # unrestricted
    "vendor": {
        "dashboard": ["VIEW"], "marketplace": ["VIEW", "CREATE", "EDIT", "DELETE"],
        "products": ["VIEW", "CREATE", "EDIT", "DELETE"], "orders": ["VIEW"],
        "tender": ["VIEW", "CREATE"], "solar": ["VIEW"],
    },
    "customer": {
        "dashboard": ["VIEW"], "marketplace": ["VIEW"], "orders": ["VIEW", "CREATE"],
        "payments": ["VIEW", "CREATE"], "tender": ["VIEW", "CREATE"], "solar": ["VIEW", "CREATE"],
    },
    "contractor": {
        "dashboard": ["VIEW"], "erp": ["VIEW", "CREATE", "EDIT", "DELETE"],
        "tender": ["VIEW", "CREATE"], "solar": ["VIEW", "CREATE"], "marketplace": ["VIEW"],
    },
}

DEFAULT_COMPANY_ID = "company_default"

# ---------------------------------------------------------------------------
# Audit service (Phase 1) — sensitive values never stored
# ---------------------------------------------------------------------------
SENSITIVE_KEYS = {"password", "password_hash", "token", "access_token", "refresh_token",
                  "session_token", "secret", "jwt", "authorization", "key", "api_key"}

def _redact(value):
    if isinstance(value, dict):
        return {k: ("***REDACTED***" if k.lower() in SENSITIVE_KEYS else _redact(v)) for k, v in value.items()}
    if isinstance(value, list):
        return [_redact(v) for v in value]
    return value

def _client_meta(request: Optional[Request]):
    if request is None:
        return None, None, None
    ip = request.headers.get("x-forwarded-for")
    if ip:
        ip = ip.split(",")[0].strip()
    elif request.client:
        ip = request.client.host
    ua = request.headers.get("user-agent")
    device = "mobile" if (ua and ("Mobile" in ua or "Android" in ua or "iPhone" in ua)) else "desktop"
    return ip, ua, device

async def audit_log(action, module="", record_id=None, old_value=None, new_value=None,
                    user=None, user_id=None, request=None, company_id=None,
                    department_id=None, status="success", metadata=None):
    """Reusable enterprise audit utility. Backward compatible with old audit records."""
    ip, ua, device = _client_meta(request)
    doc = {
        "id": new_id("log"),
        "user_id": user_id or (user.get("id") if user else None),
        "user_email": user.get("email") if user else None,
        "company_id": company_id or (user.get("company_id") if user else None),
        "department_id": department_id,
        "action": action, "module": module, "record_id": record_id,
        "old_value": _redact(old_value), "new_value": _redact(new_value),
        "status": status, "ip_address": ip, "user_agent": ua, "device": device,
        "metadata": metadata or {},
        "timestamp": iso(now_utc()), "created_at": iso(now_utc()),
    }
    await _db.audit_logs.insert_one(doc)
    return doc

# ---------------------------------------------------------------------------
# Effective permissions + guard (Phase 2)
# ---------------------------------------------------------------------------
async def get_effective_permissions(user: dict):
    if user.get("role") == "super_admin":
        return {"super": True, "permissions": ["*:*"], "role_ids": [], "roles": ["Super Administrator"]}
    role_ids, role_names = set(), []
    async for ur in _db.user_roles.find({"user_id": user["id"]}, {"_id": 0}):
        role_ids.add(ur["role_id"])
    # Backward-compatible fallback: map legacy users.role -> system role
    if not role_ids:
        sysrole = await _db.roles.find_one({"code": f"sys_{user.get('role')}"}, {"_id": 0})
        if sysrole:
            role_ids.add(sysrole["id"])
    perms = set()
    if role_ids:
        async for r in _db.roles.find({"id": {"$in": list(role_ids)}}, {"_id": 0}):
            role_names.append(r["name"])
        async for rp in _db.role_permissions.find({"role_id": {"$in": list(role_ids)}}, {"_id": 0}):
            perms.add(f"{rp['module_code']}:{rp['action_code']}")
    return {"super": False, "permissions": sorted(perms), "role_ids": list(role_ids), "roles": role_names}

def _has(effp, module, action):
    if effp.get("super"):
        return True
    p = set(effp["permissions"])
    return f"{module}:{action}" in p or f"{module}:MANAGE" in p or "*:*" in p

def require_permission(module: str, action: str):
    """FastAPI dependency — backend is the ultimate authority. Returns 403 if denied."""
    async def checker(request: Request):
        user = await _get_current_user(request)
        if user.get("role") == "super_admin":
            return user
        effp = await get_effective_permissions(user)
        if not _has(effp, module, action):
            raise HTTPException(status_code=403, detail=f"Permission denied: {module}:{action}")
        return user
    return checker

# RBAC-management guard (super_admin OR rbac:MANAGE). Also flags super for escalation checks.
async def rbac_admin(request: Request):
    user = await _get_current_user(request)
    if user.get("role") == "super_admin":
        return user
    effp = await get_effective_permissions(user)
    if not _has(effp, "rbac", "MANAGE"):
        raise HTTPException(status_code=403, detail="Administration access required")
    return user


async def rbac_super_admin(request: Request):
    """Platform-wide theme, branding, languages — super_admin only."""
    user = await _get_current_user(request)
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return user

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
rbac_router = APIRouter(prefix="/api/admin/rbac", tags=["rbac"])
auth_perm_router = APIRouter(prefix="/api", tags=["auth-perms"])


@auth_perm_router.get("/auth/permissions")
async def my_permissions(request: Request):
    user = await _get_current_user(request)
    effp = await get_effective_permissions(user)
    return effp


@rbac_router.get("/meta")
async def meta(user=Depends(rbac_admin)):
    return {
        "actions": ACTIONS,
        "modules": [{"code": c, "name": n} for c, n in MODULES],
    }


# ---- Companies ----
class CompanyIn(BaseModel):
    name: str
    code: Optional[str] = None
    status: str = "active"
    branding: Optional[dict] = None

@rbac_router.get("/companies")
async def list_companies(user=Depends(rbac_admin)):
    return await _db.companies.find({}, {"_id": 0}).sort("created_at", 1).to_list(200)

@rbac_router.post("/companies")
async def create_company(body: CompanyIn, request: Request, user=Depends(rbac_admin)):
    doc = {"id": new_id("company"), "name": body.name, "code": body.code or slug(body.name).upper(),
           "status": body.status, "branding": body.branding or {},
           "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
    await _db.companies.insert_one(dict(doc))
    await audit_log("CREATE", "companies", doc["id"], None, {"name": body.name}, user=user, request=request)
    doc.pop("_id", None)
    return doc

@rbac_router.patch("/companies/{cid}")
async def update_company(cid: str, body: dict, request: Request, user=Depends(rbac_admin)):
    body.pop("id", None)
    body["updated_at"] = iso(now_utc())
    await _db.companies.update_one({"id": cid}, {"$set": body})
    await audit_log("EDIT", "companies", cid, None, body, user=user, request=request)
    return {"ok": True}


# ---- Departments ----
class DepartmentIn(BaseModel):
    company_id: str = DEFAULT_COMPANY_ID
    name: str
    code: Optional[str] = None
    description: str = ""
    head_user_id: Optional[str] = None
    status: str = "active"

@rbac_router.get("/departments")
async def list_departments(company_id: Optional[str] = None, user=Depends(rbac_admin)):
    q = {"company_id": company_id} if company_id else {}
    return await _db.departments.find(q, {"_id": 0}).sort("name", 1).to_list(500)

@rbac_router.post("/departments")
async def create_department(body: DepartmentIn, request: Request, user=Depends(rbac_admin)):
    doc = {"id": new_id("dept"), "company_id": body.company_id, "name": body.name,
           "code": body.code or slug(body.name), "description": body.description,
           "head_user_id": body.head_user_id, "status": body.status,
           "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
    await _db.departments.insert_one(dict(doc))
    await audit_log("CREATE", "departments", doc["id"], None, {"name": body.name}, user=user, request=request)
    doc.pop("_id", None)
    return doc

@rbac_router.patch("/departments/{did}")
async def update_department(did: str, body: dict, request: Request, user=Depends(rbac_admin)):
    old = await _db.departments.find_one({"id": did}, {"_id": 0})
    body.pop("id", None)
    body["updated_at"] = iso(now_utc())
    await _db.departments.update_one({"id": did}, {"$set": body})
    await audit_log("EDIT", "departments", did, old, body, user=user, request=request)
    return {"ok": True}


# ---- Roles ----
class RoleIn(BaseModel):
    company_id: str = DEFAULT_COMPANY_ID
    department_id: Optional[str] = None
    name: str
    code: Optional[str] = None
    description: str = ""
    status: str = "active"

@rbac_router.get("/roles")
async def list_roles(company_id: Optional[str] = None, department_id: Optional[str] = None, user=Depends(rbac_admin)):
    q = {}
    if company_id:
        q["company_id"] = company_id
    if department_id:
        q["department_id"] = department_id
    roles = await _db.roles.find(q, {"_id": 0}).sort("name", 1).to_list(500)
    for r in roles:
        r["user_count"] = await _db.user_roles.count_documents({"role_id": r["id"]})
        r["perm_count"] = await _db.role_permissions.count_documents({"role_id": r["id"]})
    return roles

@rbac_router.post("/roles")
async def create_role(body: RoleIn, request: Request, user=Depends(rbac_admin)):
    doc = {"id": new_id("role"), "company_id": body.company_id, "department_id": body.department_id,
           "name": body.name, "code": body.code or slug(body.name), "description": body.description,
           "is_system_role": False, "status": body.status,
           "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
    await _db.roles.insert_one(dict(doc))
    await audit_log("CREATE", "roles", doc["id"], None, {"name": body.name}, user=user, request=request)
    doc.pop("_id", None)
    return doc

@rbac_router.patch("/roles/{rid}")
async def update_role(rid: str, body: dict, request: Request, user=Depends(rbac_admin)):
    role = await _db.roles.find_one({"id": rid}, {"_id": 0})
    if not role:
        raise HTTPException(404, "Role not found")
    if role.get("is_system_role") and body.get("status") == "disabled":
        raise HTTPException(400, "System roles cannot be disabled")
    body.pop("id", None); body.pop("is_system_role", None)
    body["updated_at"] = iso(now_utc())
    await _db.roles.update_one({"id": rid}, {"$set": body})
    await audit_log("EDIT", "roles", rid, role, body, user=user, request=request)
    return {"ok": True}

@rbac_router.delete("/roles/{rid}")
async def delete_role(rid: str, request: Request, user=Depends(rbac_admin)):
    role = await _db.roles.find_one({"id": rid}, {"_id": 0})
    if not role:
        raise HTTPException(404, "Role not found")
    if role.get("is_system_role"):
        raise HTTPException(400, "System roles cannot be deleted")
    await _db.roles.update_one({"id": rid}, {"$set": {"status": "disabled", "updated_at": iso(now_utc())}})
    await audit_log("DELETE", "roles", rid, role, None, user=user, request=request)
    return {"ok": True}


# ---- Role-Permission matrix ----
@rbac_router.get("/roles/{rid}/permissions")
async def get_role_perms(rid: str, user=Depends(rbac_admin)):
    rows = await _db.role_permissions.find({"role_id": rid}, {"_id": 0}).to_list(2000)
    return {"role_id": rid, "permissions": sorted(f"{r['module_code']}:{r['action_code']}" for r in rows)}

@rbac_router.put("/roles/{rid}/permissions")
async def set_role_perms(rid: str, body: dict, request: Request, user=Depends(rbac_admin)):
    role = await _db.roles.find_one({"id": rid}, {"_id": 0})
    if not role:
        raise HTTPException(404, "Role not found")
    # Escalation guard: only super_admin can modify the super system role
    if role.get("code") == "sys_super_admin" and user.get("role") != "super_admin":
        raise HTTPException(403, "Only Super Admin can modify the Super Administrator role")
    perms = body.get("permissions", [])
    old = await _db.role_permissions.find({"role_id": rid}, {"_id": 0}).to_list(2000)
    await _db.role_permissions.delete_many({"role_id": rid})
    docs = []
    for p in perms:
        if ":" not in p:
            continue
        mod, act = p.split(":", 1)
        if act not in ACTIONS:
            continue
        docs.append({"id": new_id("rp"), "role_id": rid, "company_id": role.get("company_id"),
                     "module_code": mod, "action_code": act, "created_at": iso(now_utc())})
    if docs:
        await _db.role_permissions.insert_many(docs)
    await audit_log("MANAGE", "permissions", rid,
                    {"count": len(old)}, {"count": len(docs)}, user=user, request=request,
                    metadata={"role": role.get("name")})
    return {"ok": True, "count": len(docs)}


# ---- Users & Assignments ----
@rbac_router.get("/users")
async def rbac_users(user=Depends(rbac_admin)):
    users = await _db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    for u in users:
        u["assignments"] = await _db.user_roles.find({"user_id": u["id"]}, {"_id": 0}).to_list(50)
    return users

class AssignIn(BaseModel):
    user_id: str
    role_id: str
    company_id: Optional[str] = None
    department_id: Optional[str] = None

@rbac_router.post("/user-roles")
async def assign_role(body: AssignIn, request: Request, user=Depends(rbac_admin)):
    role = await _db.roles.find_one({"id": body.role_id}, {"_id": 0})
    if not role:
        raise HTTPException(404, "Role not found")
    # Prevent privilege escalation: only super_admin can grant the super role
    if role.get("code") == "sys_super_admin" and user.get("role") != "super_admin":
        raise HTTPException(403, "Only Super Admin can assign Super Administrator")
    existing = await _db.user_roles.find_one({"user_id": body.user_id, "role_id": body.role_id}, {"_id": 0})
    if existing:
        return existing
    doc = {"id": new_id("ur"), "user_id": body.user_id, "role_id": body.role_id,
           "company_id": body.company_id or role.get("company_id"),
           "department_id": body.department_id or role.get("department_id"),
           "created_at": iso(now_utc())}
    await _db.user_roles.insert_one(dict(doc))
    await audit_log("ASSIGN", "users", body.user_id, None,
                    {"role": role.get("name")}, user=user, request=request)
    doc.pop("_id", None)
    return doc

@rbac_router.delete("/user-roles/{urid}")
async def unassign_role(urid: str, request: Request, user=Depends(rbac_admin)):
    ur = await _db.user_roles.find_one({"id": urid}, {"_id": 0})
    await _db.user_roles.delete_one({"id": urid})
    await audit_log("TRANSFER", "users", ur.get("user_id") if ur else None, ur, None, user=user, request=request)
    return {"ok": True}


# ---- Modules & Menus ----
@rbac_router.get("/modules")
async def list_modules(user=Depends(rbac_admin)):
    return await _db.modules.find({}, {"_id": 0}).sort("name", 1).to_list(200)

@rbac_router.get("/menus")
async def list_menus(user=Depends(rbac_admin)):
    return await _db.menus.find({}, {"_id": 0}).sort("module_code", 1).to_list(500)


# ---- Audit logs (rich, filterable) ----
@rbac_router.get("/audit")
async def rbac_audit(module: Optional[str] = None, action: Optional[str] = None,
                     user_id: Optional[str] = None, limit: int = 200, user=Depends(rbac_admin)):
    q = {}
    if module:
        q["module"] = module
    if action:
        q["action"] = action
    if user_id:
        q["user_id"] = user_id
    logs = await _db.audit_logs.find(q, {"_id": 0}).sort("created_at", -1).to_list(min(limit, 500))
    return logs


# ---------------------------------------------------------------------------
# Indexes (Phase 1) — additive, idempotent
# ---------------------------------------------------------------------------
async def ensure_indexes():
    idx = {
        "users": ["role", "company_id", "created_at"],
        "sessions": ["session_token", "user_id", "expires_at"],
        "products": ["vendor_id", "category", "created_at"],
        "orders": ["user_id", "status", "created_at"],
        "tenders": ["owner_id", "status", "category", "created_at"],
        "bids": ["tender_id", "bidder_id", "amount"],
        "boq": ["project_id"],
        "dpr": ["project_id", "date"],
        "projects": ["owner_id", "created_at"],
        "quotations": ["user_id", "created_at"],
        "audit_logs": ["user_id", "module", "action", "company_id", "timestamp", "created_at"],
        "companies": ["code", "status"],
        "departments": ["company_id", "code", "status"],
        "roles": ["company_id", "department_id", "code", "status"],
        "permissions": ["code"],
        "role_permissions": ["role_id", "module_code", "action_code"],
        "user_roles": ["user_id", "role_id", "company_id", "department_id"],
        "modules": ["code"],
        "menus": ["module_code", "code"],
    }
    for coll, fields in idx.items():
        for f in fields:
            try:
                await _db[coll].create_index(f)
            except Exception:
                pass


# ---------------------------------------------------------------------------
# Seed (Phase 2) — idempotent, backward-compatible
# ---------------------------------------------------------------------------
async def seed_rbac():
    # Default company
    if not await _db.companies.find_one({"id": DEFAULT_COMPANY_ID}):
        await _db.companies.insert_one({
            "id": DEFAULT_COMPANY_ID, "name": "2Click.in", "code": "2CLICK",
            "status": "active", "branding": {"primary": "#FF5A1F"},
            "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
        })

    # Departments
    dept_by_name = {}
    for name in DEPARTMENTS:
        code = slug(name)
        d = await _db.departments.find_one({"company_id": DEFAULT_COMPANY_ID, "code": code}, {"_id": 0})
        if not d:
            d = {"id": new_id("dept"), "company_id": DEFAULT_COMPANY_ID, "name": name, "code": code,
                 "description": f"{name} department", "head_user_id": None, "status": "active",
                 "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
            await _db.departments.insert_one(dict(d))
        dept_by_name[name] = d["id"]

    # Permission action catalog
    for a in ACTIONS:
        if not await _db.permissions.find_one({"code": a}):
            await _db.permissions.insert_one({"id": new_id("perm"), "code": a, "name": a.title(),
                                              "created_at": iso(now_utc())})

    # Modules + menus
    for code, name in MODULES:
        if not await _db.modules.find_one({"code": code}):
            await _db.modules.insert_one({"id": new_id("mod"), "code": code, "name": name,
                                          "status": "active", "created_at": iso(now_utc())})
        if not await _db.menus.find_one({"module_code": code, "code": code}):
            await _db.menus.insert_one({"id": new_id("menu"), "module_code": code, "code": code,
                                        "name": name, "path": f"/{code}", "order": 0,
                                        "created_at": iso(now_utc())})

    # System roles (mapped from legacy roles) + their permissions
    for legacy, (rname, dept_name) in SYSTEM_ROLES.items():
        code = f"sys_{legacy}"
        role = await _db.roles.find_one({"code": code}, {"_id": 0})
        if not role:
            role = {"id": new_id("role"), "company_id": DEFAULT_COMPANY_ID,
                    "department_id": dept_by_name.get(dept_name), "name": rname, "code": code,
                    "description": f"System role for {rname}", "is_system_role": True,
                    "status": "active", "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
            await _db.roles.insert_one(dict(role))
        # Re-seed permissions for system roles only (keeps custom roles untouched)
        await _db.role_permissions.delete_many({"role_id": role["id"]})
        grants = ROLE_GRANTS.get(legacy, {})
        docs = []
        for mod, acts in grants.items():
            for act in acts:
                docs.append({"id": new_id("rp"), "role_id": role["id"], "company_id": DEFAULT_COMPANY_ID,
                             "module_code": mod, "action_code": act, "created_at": iso(now_utc())})
        if docs:
            await _db.role_permissions.insert_many(docs)

    # Backfill user_roles for existing users (link legacy role -> system role)
    async for u in _db.users.find({}, {"_id": 0, "id": 1, "role": 1}):
        code = f"sys_{u.get('role')}"
        sysrole = await _db.roles.find_one({"code": code}, {"_id": 0})
        if not sysrole:
            continue
        exists = await _db.user_roles.find_one({"user_id": u["id"], "role_id": sysrole["id"]}, {"_id": 0})
        if not exists:
            await _db.user_roles.insert_one({
                "id": new_id("ur"), "user_id": u["id"], "role_id": sysrole["id"],
                "company_id": DEFAULT_COMPANY_ID, "department_id": sysrole.get("department_id"),
                "created_at": iso(now_utc()),
            })
        # Also backfill company_id on the user document (multi-company readiness)
        await _db.users.update_one({"id": u["id"], "company_id": {"$exists": False}},
                                   {"$set": {"company_id": DEFAULT_COMPANY_ID}})

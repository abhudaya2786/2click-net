"""
2Click.in — Phase 3A (ADDITIVE): Dynamic Category Engine, configurable User Types,
user_categories, Freelancer module, rich login session profile + dashboard routing.
Reuses rbac.audit_log / rbac.require_permission / rbac.rbac_admin / rbac.get_effective_permissions.
Non-destructive: nothing existing is removed.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import rbac

_db = None
_get_current_user = None

def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user

def now_utc(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat() if isinstance(dt, datetime) else dt
def new_id(p): return f"{p}_{uuid.uuid4().hex[:12]}"
def slug(s): return "-".join("".join(c if c.isalnum() else " " for c in s.lower()).split())

DEFAULT_COMPANY_ID = "company_default"

CATEGORY_TYPES = ["product", "service", "tender", "construction", "marketplace", "solar",
                  "architecture", "logistics", "professional_service", "freelancer", "general"]

# user_type -> (label, legacy_role, default_dashboard, allowed category_types, extra fields, sort)
USER_TYPES = [
    ("customer", "Customer", "customer", "customer", ["marketplace", "construction", "solar", "logistics", "professional_service", "freelancer"], [], 1),
    ("contractor", "Contractor", "contractor", "contractor", ["construction"], ["company", "department"], 2),
    ("vendor", "Vendor", "vendor", "vendor", ["marketplace"], ["company", "business_type"], 3),
    ("supplier", "Supplier", "vendor", "supplier", ["marketplace"], ["company", "business_type"], 4),
    ("shop", "Shop", "vendor", "shop", ["marketplace"], ["company", "business_type"], 5),
    ("freelancer", "Freelancer", "customer", "freelancer", ["freelancer", "professional_service"], ["skills", "service_area", "portfolio", "pricing", "availability"], 6),
    ("architect", "Architect", "customer", "architect", ["professional_service", "freelancer", "architecture"], ["skills", "service_area", "portfolio"], 7),
    ("engineer", "Engineer", "customer", "engineer", ["professional_service"], ["skills", "service_area"], 8),
    ("ca", "CA", "customer", "ca", ["professional_service"], ["skills", "service_area"], 9),
    ("transporter", "Transporter", "vendor", "transport", ["logistics"], ["company", "service_area"], 10),
    ("service_provider", "Service Provider", "customer", "service", ["professional_service", "freelancer", "construction"], ["skills", "service_area"], 11),
    ("interior_consultant", "Interior Consultant", "customer", "freelancer", ["professional_service", "freelancer"], ["skills", "service_area", "portfolio", "pricing", "availability"], 15),
    ("exterior_consultant", "Exterior Consultant", "customer", "freelancer", ["professional_service", "construction"], ["skills", "service_area", "portfolio", "pricing"], 16),
    ("vastu_consultant", "Vastu Consultant", "customer", "freelancer", ["professional_service", "freelancer"], ["skills", "service_area", "pricing", "availability"], 17),
    ("employee", "Employee", "customer", "employee", [], ["company", "department"], 12),
    ("company", "Company", "customer", "company", ["construction", "marketplace"], ["company", "department", "business_type"], 13),
    ("other", "Other", "customer", "customer", [], [], 14),
]
_UT_MAP = {u[0]: u for u in USER_TYPES}
FREELANCER_TYPES = {"freelancer", "architect", "engineer", "ca", "service_provider",
                    "interior_consultant", "exterior_consultant", "vastu_consultant"}

def role_for_user_type(ut):
    u = _UT_MAP.get(ut)
    return u[2] if u else "customer"

def dashboard_for_user_type(ut):
    if ut == "super_admin":
        return "admin"
    u = _UT_MAP.get(ut)
    return u[3] if u else "customer"

# Nested seed categories: parent -> (category_type, [children])
SEED_TREE = {
    "Construction": ("construction", ["Civil Work", "Plumbing", "Electrical", "Painting", "Tiles",
                                       "Flooring", "Wood Work", "Renovation", "Gardening",
                                       "Road Construction", "Building Construction", "Interior",
                                       "Interior Decoration", "False Ceiling", "PVC Work", "Fabrication"]),
    "Interior & Finishing": ("construction", ["Interior Decoration", "Vastu", "Fabrication", "Tiles",
                                              "False Ceiling", "PVC Work", "Renovation", "Gardening"]),
    "Professional Services": ("professional_service", ["Architect", "Engineer", "CA", "Legal", "Consultant", "Freelancer"]),
    "Marketplace": ("marketplace", ["Cement", "Steel", "Sand", "Aggregate", "Bricks",
                                     "Electrical Material", "Plumbing Material", "Hardware", "Paint", "Tiles"]),
    "Solar": ("solar", ["Solar Panels", "Inverters", "Batteries", "Structure", "Installation"]),
    "Logistics": ("logistics", ["Dumper", "Tipper", "JCB", "Crane", "Heavy Transport"]),
    "Freelancer Services": ("freelancer", ["Architecture", "CAD Design", "3D Design", "Estimation", "BOQ",
                                           "Quantity Surveying", "Accounting", "GST", "Digital Marketing",
                                           "Web Development", "Other Services"]),
    "Architecture": ("architecture", ["Residential", "Commercial", "Interior Design", "Vastu",
                                      "3D Visualization", "Landscape", "Renovation"]),
}


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
public_router = APIRouter(prefix="/api", tags=["phase3a-public"])
admin_router = APIRouter(prefix="/api", tags=["phase3a-admin"])


class CategoryIn(BaseModel):
    name: str
    category_type: str = "general"
    parent_id: Optional[str] = None
    description: str = ""
    icon: Optional[str] = None
    image: Optional[str] = None
    sort_order: int = 0
    metadata: Optional[dict] = None


def _clean_cat(c):
    c.pop("_id", None)
    return c


# ----- Public category reads (browsing + signup) -----
@public_router.get("/categories")
async def list_categories(category_type: Optional[str] = None, type: Optional[str] = None,
                          parent_id: Optional[str] = None, q: Optional[str] = None,
                          include_disabled: bool = False):
    query = {}
    ct = category_type or type
    if ct:
        query["category_type"] = ct
    if parent_id is not None:
        query["parent_id"] = None if parent_id in ("", "root", "null") else parent_id
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    if not include_disabled:
        query["status"] = "active"
    return await _db.categories.find(query, {"_id": 0}).sort("sort_order", 1).to_list(1000)


@public_router.get("/categories/tree")
async def categories_tree(category_type: Optional[str] = None, type: Optional[str] = None):
    ct = category_type or type
    query = {"status": "active"}
    if ct:
        query["category_type"] = ct
    all_cats = await _db.categories.find(query, {"_id": 0}).sort("sort_order", 1).to_list(2000)
    by_parent = {}
    for c in all_cats:
        by_parent.setdefault(c.get("parent_id"), []).append(c)
    def build(pid):
        return [{**c, "children": build(c["id"])} for c in by_parent.get(pid, [])]
    return build(None)


@public_router.get("/categories/type/{category_type}")
async def categories_by_type(category_type: str):
    return await _db.categories.find({"category_type": category_type, "status": "active"},
                                     {"_id": 0}).sort("sort_order", 1).to_list(1000)


@public_router.get("/categories/{cid}")
async def get_category(cid: str):
    c = await _db.categories.find_one({"id": cid}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Category not found")
    return c


# ----- Category mutations (RBAC enforced) -----
async def _validate_category(body: CategoryIn):
    if body.category_type not in CATEGORY_TYPES:
        raise HTTPException(400, f"Invalid category_type. Allowed: {', '.join(CATEGORY_TYPES)}")
    if body.parent_id:
        parent = await _db.categories.find_one({"id": body.parent_id}, {"_id": 0})
        if not parent:
            raise HTTPException(400, "Invalid parent_id")


@admin_router.post("/categories")
async def create_category(body: CategoryIn, request: Request,
                          user=Depends(rbac.require_permission("categories", "CREATE"))):
    await _validate_category(body)
    doc = {"id": new_id("cat"), "name": body.name, "slug": slug(body.name),
           "description": body.description, "parent_id": body.parent_id,
           "category_type": body.category_type, "icon": body.icon, "image": body.image,
           "status": "active", "sort_order": body.sort_order, "metadata": body.metadata or {},
           "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
           "created_by": user["id"], "updated_by": user["id"]}
    await _db.categories.insert_one(dict(doc))
    await rbac.audit_log("CREATE", "categories", doc["id"], None,
                         {"name": body.name, "type": body.category_type}, user=user, request=request,
                         metadata={"event": "CATEGORY_CREATED"})
    return _clean_cat(doc)


@admin_router.put("/categories/{cid}")
async def update_category(cid: str, body: CategoryIn, request: Request,
                          user=Depends(rbac.require_permission("categories", "EDIT"))):
    old = await _db.categories.find_one({"id": cid}, {"_id": 0})
    if not old:
        raise HTTPException(404, "Category not found")
    await _validate_category(body)
    if body.parent_id == cid:
        raise HTTPException(400, "Category cannot be its own parent")
    upd = {"name": body.name, "slug": slug(body.name), "description": body.description,
           "parent_id": body.parent_id, "category_type": body.category_type, "icon": body.icon,
           "image": body.image, "sort_order": body.sort_order, "metadata": body.metadata or {},
           "updated_at": iso(now_utc()), "updated_by": user["id"]}
    await _db.categories.update_one({"id": cid}, {"$set": upd})
    await rbac.audit_log("EDIT", "categories", cid, old, upd, user=user, request=request,
                         metadata={"event": "CATEGORY_UPDATED"})
    return {"ok": True}


@admin_router.patch("/categories/{cid}/status")
async def set_category_status(cid: str, body: dict, request: Request,
                              user=Depends(rbac.require_permission("categories", "EDIT"))):
    status = body.get("status")
    if status not in ("active", "disabled"):
        raise HTTPException(400, "status must be active|disabled")
    old = await _db.categories.find_one({"id": cid}, {"_id": 0})
    await _db.categories.update_one({"id": cid}, {"$set": {"status": status, "updated_at": iso(now_utc())}})
    await rbac.audit_log("EDIT", "categories", cid, {"status": (old or {}).get("status")},
                         {"status": status}, user=user, request=request,
                         metadata={"event": "CATEGORY_ENABLED" if status == "active" else "CATEGORY_DISABLED"})
    return {"ok": True}


@admin_router.delete("/categories/{cid}")
async def delete_category(cid: str, request: Request,
                          user=Depends(rbac.require_permission("categories", "DELETE"))):
    # Never hard-delete if referenced by user_categories → soft disable instead
    referenced = await _db.user_categories.count_documents({"category_id": cid})
    if referenced > 0:
        await _db.categories.update_one({"id": cid}, {"$set": {"status": "disabled", "updated_at": iso(now_utc())}})
        await rbac.audit_log("DELETE", "categories", cid, None, {"soft": True, "referenced": referenced},
                             user=user, request=request, metadata={"event": "CATEGORY_DISABLED", "reason": "referenced"})
        return {"ok": True, "soft_disabled": True, "referenced": referenced}
    # also block delete if it has children
    children = await _db.categories.count_documents({"parent_id": cid})
    if children > 0:
        await _db.categories.update_one({"id": cid}, {"$set": {"status": "disabled", "updated_at": iso(now_utc())}})
        return {"ok": True, "soft_disabled": True, "children": children}
    await _db.categories.delete_one({"id": cid})
    await rbac.audit_log("DELETE", "categories", cid, None, None, user=user, request=request,
                         metadata={"event": "CATEGORY_DELETED"})
    return {"ok": True}


# ---------------------------------------------------------------------------
# User Types (configurable)
# ---------------------------------------------------------------------------
@public_router.get("/user-types")
async def list_user_types():
    return await _db.user_types.find({"status": "active"}, {"_id": 0}).sort("sort_order", 1).to_list(100)


@admin_router.post("/admin/user-types")
async def create_user_type(body: dict, request: Request, user=Depends(rbac.rbac_admin)):
    code = body.get("code") or slug(body.get("label", ""))
    doc = {"id": new_id("ut"), "code": code, "label": body.get("label", code),
           "role": body.get("role", "customer"), "default_dashboard": body.get("default_dashboard", "customer"),
           "category_types": body.get("category_types", []), "fields": body.get("fields", []),
           "status": "active", "sort_order": body.get("sort_order", 99), "created_at": iso(now_utc())}
    await _db.user_types.update_one({"code": code}, {"$set": doc}, upsert=True)
    await rbac.audit_log("CREATE", "settings", code, None, {"user_type": code}, user=user, request=request)
    doc.pop("_id", None)
    return doc


# ---------------------------------------------------------------------------
# Rich session profile + dashboard routing
# ---------------------------------------------------------------------------
async def build_session(user: dict):
    company = await _db.companies.find_one({"id": user.get("company_id", DEFAULT_COMPANY_ID)}, {"_id": 0})
    effp = await rbac.get_effective_permissions(user)
    ucs = await _db.user_categories.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    cat_ids = [uc["category_id"] for uc in ucs]
    cats = await _db.categories.find({"id": {"$in": cat_ids}}, {"_id": 0}).to_list(100) if cat_ids else []
    primary = next((c for c in cats if any(uc["category_id"] == c["id"] and uc.get("is_primary") for uc in ucs)), None)
    # departments from user_roles
    dept_ids = list({ur.get("department_id") for ur in await _db.user_roles.find({"user_id": user["id"]}, {"_id": 0}).to_list(50) if ur.get("department_id")})
    depts = await _db.departments.find({"id": {"$in": dept_ids}}, {"_id": 0}).to_list(50) if dept_ids else []
    user_type = user.get("user_type") or user.get("role")
    branding = (company or {}).get("branding") or {}
    return {
        "user": {k: v for k, v in user.items() if k not in ("password_hash", "_id")},
        "company": company,
        "user_type": user_type,
        "primary_category": primary,
        "categories": cats,
        "departments": depts,
        "roles": effp.get("roles", []),
        "permissions": effp.get("permissions", []),
        "is_super": effp.get("super", False),
        "default_dashboard": user.get("default_dashboard") or dashboard_for_user_type(user_type),
        "workspace": {
            "company_id": user.get("company_id", DEFAULT_COMPANY_ID),
            "brand_name": branding.get("brand_name") or (company or {}).get("name") or "2Click.in",
            "logo": branding.get("logo", ""), "primary_color": branding.get("primary_color", "#FF5A1F"),
            "theme": branding.get("theme", "light"),
        },
        "onboarding_completed": user.get("onboarding_completed", True),
    }


@public_router.get("/auth/session")
async def auth_session(request: Request):
    user = await _get_current_user(request)
    return await build_session(user)


# ---------------------------------------------------------------------------
# Freelancer module
# ---------------------------------------------------------------------------
@public_router.get("/freelancers")
async def list_freelancers(category: Optional[str] = None, q: Optional[str] = None):
    query = {"user_type": {"$in": list(FREELANCER_TYPES)}, "status": {"$ne": "disabled"}}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    users = await _db.users.find(query, {"_id": 0, "password_hash": 0, "email": 0, "wallet": 0}).to_list(200)
    out = []
    for u in users:
        ucs = await _db.user_categories.find({"user_id": u["id"]}, {"_id": 0}).to_list(50)
        cat_ids = [x["category_id"] for x in ucs]
        cats = await _db.categories.find({"id": {"$in": cat_ids}}, {"_id": 0, "name": 1}).to_list(50) if cat_ids else []
        cat_names = [c["name"] for c in cats]
        if category and category not in cat_names:
            continue
        out.append({
            "id": u["id"], "name": u["name"], "company": u.get("company"),
            "user_type": u.get("user_type"), "categories": cat_names,
            "skills": u.get("skills", []), "service_area": u.get("service_area"),
            "portfolio_url": u.get("portfolio_url"), "expected_pricing": u.get("expected_pricing"),
            "availability": u.get("availability"), "rating": u.get("rating", 4.7),
            "business_type": u.get("business_type"),
        })
    return out


class EnquiryIn(BaseModel):
    message: str
    category: Optional[str] = None


class FreelancerOrderIn(BaseModel):
    freelancer_id: str
    service_name: str
    amount: float
    category: Optional[str] = None
    product_key: Optional[str] = None
    enquiry_id: Optional[str] = None
    notes: Optional[str] = None


class EnquiryOrderIn(BaseModel):
    amount: float
    service_name: str
    category: Optional[str] = None
    product_key: Optional[str] = None


@public_router.post("/freelancers/{fid}/enquiry")
async def freelancer_enquiry(fid: str, body: EnquiryIn, request: Request):
    user = await _get_current_user(request)  # LOGIN REQUIRED for protected action
    fr = await _db.users.find_one({"id": fid}, {"_id": 0})
    if not fr or fr.get("user_type") not in FREELANCER_TYPES:
        raise HTTPException(404, "Freelancer not found")
    doc = {"id": new_id("enq"), "freelancer_id": fid, "from_user_id": user["id"],
           "from_name": user.get("name"), "from_email": user.get("email"),
           "message": body.message, "category": body.category, "status": "new",
           "is_read": False,
           "created_at": iso(now_utc())}
    await _db.freelancer_enquiries.insert_one(dict(doc))
    await rbac.audit_log("CREATE", "crm", doc["id"], None, {"to": fid}, user=user, request=request,
                         metadata={"event": "FREELANCER_ENQUIRY"})
    doc.pop("_id", None)
    return doc


@public_router.get("/freelancers/me/enquiries")
async def my_enquiries(request: Request):
    user = await _get_current_user(request)
    received = await _db.freelancer_enquiries.find({"freelancer_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    sent = await _db.freelancer_enquiries.find({"from_user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    unread = sum(1 for e in received if e.get("is_read") is False)
    return {"received": received, "sent": sent, "unread": unread}


@public_router.post("/freelancers/me/enquiries/mark-read")
async def mark_enquiries_read(request: Request):
    user = await _get_current_user(request)
    res = await _db.freelancer_enquiries.update_many(
        {"freelancer_id": user["id"], "is_read": False}, {"$set": {"is_read": True}})
    return {"ok": True, "marked": res.modified_count}


@public_router.post("/freelancers/orders")
async def create_freelancer_order(body: FreelancerOrderIn, request: Request):
    """Customer books a freelancer service — commission split computed product/order wise."""
    user = await _get_current_user(request)
    return await _insert_freelancer_order(body, customer_user=user, request=request)


async def _insert_freelancer_order(body: FreelancerOrderIn, customer_user: dict, request: Request):
    import phase3
    fr = await _db.users.find_one({"id": body.freelancer_id}, {"_id": 0})
    if not fr or fr.get("user_type") not in FREELANCER_TYPES:
        raise HTTPException(404, "Freelancer not found")
    if body.amount <= 0:
        raise HTTPException(400, "Amount must be positive")
    cfg = await phase3.get_commission_config()
    split = phase3.split_freelancer_order(body.amount, cfg, category=body.category, product_key=body.product_key)
    doc = {
        "id": new_id("flord"),
        "type": "freelancer",
        "freelancer_id": body.freelancer_id,
        "freelancer_name": fr.get("name"),
        "customer_id": customer_user["id"],
        "customer_name": customer_user.get("name"),
        "customer_email": customer_user.get("email"),
        "service_name": body.service_name,
        "category": body.category,
        "product_key": body.product_key,
        "enquiry_id": body.enquiry_id,
        "notes": body.notes,
        "amount": round(body.amount, 2),
        "commission_percent": split["commission_percent"],
        "platform_commission": split["platform_commission"],
        "freelancer_payout": split["freelancer_payout"],
        "status": "pending",
        "created_at": iso(now_utc()),
    }
    await _db.freelancer_orders.insert_one(dict(doc))
    if body.enquiry_id:
        await _db.freelancer_enquiries.update_one(
            {"id": body.enquiry_id},
            {"$set": {"status": "ordered", "order_id": doc["id"], "quoted_amount": doc["amount"]}},
        )
    await rbac.audit_log("CREATE", "orders", doc["id"], None, {"freelancer": body.freelancer_id},
                         user=customer_user, request=request)
    doc.pop("_id", None)
    return doc


@public_router.post("/freelancers/enquiries/{eid}/create-order")
async def enquiry_to_order(eid: str, body: EnquiryOrderIn, request: Request):
    """Freelancer converts an enquiry into a billable order with fixed commission."""
    user = await _get_current_user(request)
    enq = await _db.freelancer_enquiries.find_one({"id": eid}, {"_id": 0})
    if not enq:
        raise HTTPException(404, "Enquiry not found")
    if enq.get("freelancer_id") != user["id"] and user.get("role") != "super_admin":
        raise HTTPException(403, "Only the freelancer can create order from this enquiry")
    cust = await _db.users.find_one({"id": enq["from_user_id"]}, {"_id": 0})
    if not cust:
        raise HTTPException(400, "Customer account not found")
    return await _insert_freelancer_order(
        FreelancerOrderIn(
            freelancer_id=enq["freelancer_id"],
            service_name=body.service_name,
            amount=body.amount,
            category=body.category or enq.get("category"),
            product_key=body.product_key,
            enquiry_id=eid,
        ),
        customer_user=cust,
        request=request,
    )


@public_router.get("/freelancers/me/orders")
async def my_freelancer_orders(request: Request):
    user = await _get_current_user(request)
    if user.get("user_type") in FREELANCER_TYPES or user.get("role") == "super_admin":
        as_provider = await _db.freelancer_orders.find(
            {"freelancer_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    else:
        as_provider = []
    as_customer = await _db.freelancer_orders.find(
        {"customer_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"as_freelancer": as_provider, "as_customer": as_customer}


@public_router.post("/freelancers/orders/{oid}/pay")
async def pay_freelancer_order(oid: str, request: Request):
    user = await _get_current_user(request)
    order = await _db.freelancer_orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    if order.get("customer_id") != user["id"] and user.get("role") != "super_admin":
        raise HTTPException(403, "Not your order")
    if order.get("status") == "paid":
        return {"ok": True, "status": "paid"}
    await _db.freelancer_orders.update_one(
        {"id": oid},
        {"$set": {"status": "paid", "paid_at": iso(now_utc())}},
    )
    await _db.users.update_one(
        {"id": order["freelancer_id"]},
        {"$inc": {"wallet": order.get("freelancer_payout", 0)}},
    )
    return {"ok": True, "status": "paid", "freelancer_payout": order.get("freelancer_payout")}


# ---------------------------------------------------------------------------
# Super Admin: edit user profile (user_type / categories / department)
# ---------------------------------------------------------------------------
async def sync_user_categories(user_id, primary_category_id, category_ids, company_id=DEFAULT_COMPANY_ID):
    await _db.user_categories.delete_many({"user_id": user_id})
    ids = list(dict.fromkeys(([primary_category_id] if primary_category_id else []) + (category_ids or [])))
    for cid in ids:
        exists = await _db.categories.find_one({"id": cid}, {"_id": 0})
        if not exists:
            continue
        await _db.user_categories.insert_one({
            "id": new_id("uc"), "user_id": user_id, "category_id": cid, "company_id": company_id,
            "is_primary": (cid == primary_category_id), "created_at": iso(now_utc())})


@admin_router.patch("/admin/users/{uid}/profile")
async def admin_edit_profile(uid: str, body: dict, request: Request, user=Depends(rbac.rbac_admin)):
    target = await _db.users.find_one({"id": uid}, {"_id": 0})
    if not target:
        raise HTTPException(404, "User not found")
    upd = {}
    events = []
    if "user_type" in body and body["user_type"]:
        ut = body["user_type"]
        if ut not in _UT_MAP:
            raise HTTPException(400, "Invalid user_type")
        upd["user_type"] = ut
        upd["role"] = role_for_user_type(ut)
        upd["default_dashboard"] = dashboard_for_user_type(ut)
        events.append("USER_TYPE_CHANGED")
    if "department_id" in body:
        upd["department_id"] = body["department_id"]; events.append("USER_DEPARTMENT_CHANGED")
    if "business_type" in body:
        upd["business_type"] = body["business_type"]
    if upd:
        await _db.users.update_one({"id": uid}, {"$set": upd})
    if "category_ids" in body or "primary_category_id" in body:
        await sync_user_categories(uid, body.get("primary_category_id"), body.get("category_ids", []),
                                   target.get("company_id", DEFAULT_COMPANY_ID))
        events.append("USER_CATEGORY_CHANGED")
    old = {k: target.get(k) for k in ("user_type", "role", "department_id")}
    await rbac.audit_log("EDIT", "users", uid, old, upd, user=user, request=request,
                         metadata={"events": events})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Indexes + Seed
# ---------------------------------------------------------------------------
async def ensure_indexes():
    for coll, fields in {
        "categories": ["slug", "parent_id", "category_type", "status", "sort_order"],
        "user_categories": ["user_id", "category_id", "company_id"],
        "user_types": ["code", "status"],
        "users": ["user_type", "primary_category_id", "company_id", "department_id"],
        "freelancer_enquiries": ["freelancer_id", "from_user_id"],
        "freelancer_orders": ["freelancer_id", "customer_id", "status"],
    }.items():
        for f in fields:
            try:
                await _db[coll].create_index(f)
            except Exception:
                pass


async def seed_phase3a():
    # User types (idempotent upsert)
    for code, label, role, dash, cat_types, fields, order in USER_TYPES:
        await _db.user_types.update_one({"code": code}, {"$set": {
            "id": new_id("ut"), "code": code, "label": label, "role": role,
            "default_dashboard": dash, "category_types": cat_types, "fields": fields,
            "status": "active", "sort_order": order,
        }}, upsert=True)

    # Categories — reseed the comprehensive nested tree once (config data, no txn refs by id)
    flag = await _db.app_settings.find_one({"key": "phase3a_categories_seeded"})
    if not flag:
        await _db.categories.delete_many({})  # config-only; products reference by name, not id
        order = 0
        for parent_name, (ctype, children) in SEED_TREE.items():
            order += 1
            pid = new_id("cat")
            await _db.categories.insert_one({
                "id": pid, "name": parent_name, "slug": slug(parent_name), "description": "",
                "parent_id": None, "category_type": ctype, "icon": None, "image": None,
                "status": "active", "sort_order": order, "metadata": {},
                "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                "created_by": "system", "updated_by": "system"})
            for i, child in enumerate(children):
                await _db.categories.insert_one({
                    "id": new_id("cat"), "name": child, "slug": slug(child), "description": "",
                    "parent_id": pid, "category_type": ctype, "icon": None, "image": None,
                    "status": "active", "sort_order": i + 1, "metadata": {},
                    "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                    "created_by": "system", "updated_by": "system"})
        await _db.app_settings.update_one({"key": "phase3a_categories_seeded"},
                                          {"$set": {"key": "phase3a_categories_seeded", "value": True,
                                                    "updated_at": iso(now_utc())}}, upsert=True)

    # Add architecture categories on existing deployments (additive)
    arch_flag = await _db.app_settings.find_one({"key": "phase3a_architecture_seeded"})
    if not arch_flag:
        existing = await _db.categories.count_documents({"category_type": "architecture"})
        if existing == 0:
            order = await _db.categories.count_documents({})
            parent_name, (ctype, children) = "Architecture", ("architecture", [
                "Residential", "Commercial", "Interior Design", "Vastu",
                "3D Visualization", "Landscape", "Renovation",
            ])
            pid = new_id("cat")
            await _db.categories.insert_one({
                "id": pid, "name": parent_name, "slug": slug(parent_name), "description": "",
                "parent_id": None, "category_type": ctype, "icon": None, "image": None,
                "status": "active", "sort_order": order + 1, "metadata": {},
                "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                "created_by": "system", "updated_by": "system"})
            for i, child in enumerate(children):
                await _db.categories.insert_one({
                    "id": new_id("cat"), "name": child, "slug": slug(child), "description": "",
                    "parent_id": pid, "category_type": ctype, "icon": None, "image": None,
                    "status": "active", "sort_order": i + 1, "metadata": {},
                    "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                    "created_by": "system", "updated_by": "system"})
        await _db.app_settings.update_one({"key": "phase3a_architecture_seeded"},
                                          {"$set": {"key": "phase3a_architecture_seeded", "value": True,
                                                    "updated_at": iso(now_utc())}}, upsert=True)

    # Backfill user_type + default_dashboard for existing users (map from legacy role)
    async for u in _db.users.find({}, {"_id": 0, "id": 1, "role": 1, "user_type": 1}):
        if not u.get("user_type"):
            ut = u.get("role")
            await _db.users.update_one({"id": u["id"]}, {"$set": {
                "user_type": ut, "default_dashboard": dashboard_for_user_type(ut),
                "onboarding_completed": True}})

    # Grant categories permissions to super system role (idempotent)
    sr = await _db.roles.find_one({"code": "sys_super_admin"}, {"_id": 0})
    if sr:
        for act in ["VIEW", "CREATE", "EDIT", "DELETE", "MANAGE"]:
            exists = await _db.role_permissions.find_one({"role_id": sr["id"], "module_code": "categories", "action_code": act}, {"_id": 0})
            if not exists:
                await _db.role_permissions.insert_one({"id": new_id("rp"), "role_id": sr["id"],
                                                       "company_id": DEFAULT_COMPANY_ID, "module_code": "categories",
                                                       "action_code": act, "created_at": iso(now_utc())})

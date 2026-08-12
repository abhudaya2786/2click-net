# buildecogroup.com — EXISTING SYSTEM AUDIT REPORT
Status: AUDIT ONLY. No code changed. Awaiting approval before any implementation.
Date: 2026-06

---

## 1. CURRENT ARCHITECTURE

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + CRA (craco), React Router 7 | SPA, alias `@/` → `src/` |
| Styling/UI | Tailwind CSS 3 + shadcn/ui (Radix), framer-motion, recharts, lucide-react, sonner | Industrial "Swiss" theme, light/dark |
| Backend | FastAPI (single module `server.py`, 825 lines) | All routes under `APIRouter(prefix="/api")` |
| Database | MongoDB (Motor async driver) | NoSQL — **not** PostgreSQL |
| ORM | None | Raw Motor + Pydantic models; custom string `id` (uuid), `_id` excluded |
| Auth | Custom JWT (bearer) + Emergent Google OAuth | Token in `localStorage.bs_token` |
| AI | Emergent Universal LLM key (Claude Sonnet 4.6) | Chat SSE stream + tender summary |
| Payments | Razorpay (server SDK) — **DEMO mode** (keys empty) | create/verify endpoints exist |
| Process mgmt | supervisor (backend:8001, frontend:3000) | K8s ingress routes `/api` → 8001 |

Runtime: backend binds `0.0.0.0:8001`; frontend calls `REACT_APP_BACKEND_URL`.

---

## 2. FOLDER STRUCTURE (actual)

```
backend/
  server.py            # monolith: models + all routes + seed
  requirements.txt, pytest.ini, tests/backend_test.py, .env
frontend/src/
  App.js               # router + OAuth-callback hash detection
  lib/api.js           # axios instance, Bearer interceptor
  context/AuthContext.jsx, context/ThemeContext.jsx
  components/ProtectedRoute.jsx
  components/AIAssistant.jsx
  components/marketing/ (Navbar, Footer, MarketingLayout)
  components/dashboard/DashboardLayout.jsx  (+ StatCard)
  components/ui/ (48 shadcn components)
  pages/ Home, Services, Pricing, Contact, Marketplace, Solar,
         TenderHub, TenderDetail, Login, Register, AuthCallback
  pages/dashboard/ Dashboard(role router), AdminDashboard,
         VendorDashboard, CustomerDashboard, ContractorDashboard
```

---

## 3. FEATURE INVENTORY

| Module | Page/Component | API | Collection | Auth | Role | Status |
|---|---|---|---|---|---|---|
| Auth (JWT) | Login/Register | /auth/register,/login,/me,/logout | users, sessions | Public/JWT | all | WORKING |
| Auth (Google) | AuthCallback | /auth/google/session | users, sessions | Public | all | WORKING |
| Super Admin – Users | AdminDashboard | /admin/users, .../role, .../kyc, DELETE | users | JWT | super_admin | WORKING |
| Super Admin – Analytics | AdminDashboard | /admin/analytics | users,orders,products,tenders | JWT | super_admin | WORKING |
| Super Admin – Audit | AdminDashboard | /admin/audit | audit_logs | JWT | super_admin | WORKING (basic) |
| Marketplace | Marketplace | /products, /categories, /{id} | products | Public | all | WORKING |
| Vendor Products | VendorDashboard | /products (POST), /vendor/products, DELETE | products | JWT | vendor/admin | WORKING |
| Orders | CustomerDashboard | /orders (POST/GET) | orders | JWT | all | WORKING (GST 18%) |
| Vendor Orders | VendorDashboard | /vendor/orders | orders,products | JWT | vendor/admin | WORKING (500 bug fixed) |
| Payments | CustomerDashboard | /payments/create, /verify | orders | JWT | all | PARTIAL — **DEMO/MOCKED** |
| Tenders | TenderHub | /tenders (GET/POST) | tenders | Public/JWT | customer,contractor,admin create | WORKING |
| Reverse Auction | TenderDetail | /tenders/{id}, /{id}/bids | tenders,bids | JWT to bid | vendor,contractor,admin | WORKING (polling every 4s) |
| Tender Award | TenderDetail | /tenders/{id}/award | tenders | JWT | customer,contractor,admin | PARTIAL — no ownership check |
| Solar | Solar | /solar/calculate, /quotations | quotations | calc public | all save | WORKING |
| Construction ERP | ContractorDashboard | /erp/projects,/boq,/dpr | projects,boq,dpr | JWT | contractor/admin | WORKING (basic) |
| AI Assistant | AIAssistant | /ai/chat (SSE) | none (no history) | JWT | all | WORKING, **no persistence** |
| AI Tender Summary | TenderDetail | /ai/tender-summary | none | JWT | all | WORKING |
| Public site | Home/Services/Pricing/Contact | — | — | Public | — | WORKING (Contact = mock) |

MISSING (advertised on marketing site, not built): Logistics/Fleet, Architect/3D-LiDAR, CRM/Khatabook, GST/Accounting engine, Inventory/Warehouse, Loan/Finance, Notifications (WhatsApp/SMS/Email), Reports/Export, PWA/offline, password reset/OTP/2FA.

---

## 4. DATABASE AUDIT (MongoDB — schemaless)

Collections in use: `users, sessions, products, orders, tenders, bids, boq, dpr, projects, quotations, audit_logs`.

Key shapes:
- **users**: id, name, email(unique idx), password_hash(bcrypt), role, company, picture, auth, kyc_status, wallet, created_at
- **sessions**: id, user_id, session_token, expires_at, created_at (Google OAuth)
- **products**: id, name, category, price, unit, stock, description, image, vendor_id, vendor_name, rating, created_at
- **orders**: id, user_id, user_email, items[], subtotal, tax, total, address, status, created_at, (razorpay_order_id, paid_at)
- **tenders**: id, title, description, category, budget, emd, auction, closes_at, owner_id, status, created_at
- **bids**: id, tender_id, bidder_id, bidder_name, amount, note, created_at
- **boq/dpr/projects/quotations**: linked by project_id / user_id

Indexes present: `users.email` (unique), `users.id`. **No other indexes** (bids.tender_id, orders.user_id, products.category, sessions.session_token are unindexed → will scan at scale).

Findings:
- Relationships are by string id only; no referential integrity (expected in Mongo).
- No `company_id` field anywhere → **no multi-tenant isolation**.
- No soft-delete / versioning; deletes are hard.
- `wallet` field exists but no transactions ledger.
- Datetimes stored as ISO strings (consistent).

DO NOT delete anything. Migration will be additive (new fields/collections).

---

## 5. AUTHENTICATION AUDIT

Implemented: register, login (bcrypt verify), logout (cookie clear), `/me`, Google OAuth session exchange, `resolve_user()` (JWT via cookie/bearer, then session_token lookup), `require_roles()` RBAC dependency, admin seeding on startup, 3 demo users, hidden super-admin triple-click on login page.

Security weaknesses (report only — no change yet):
- **JWT access token TTL = 7 days**, no refresh-token rotation (playbook intended 15min access + 7d refresh).
- **No brute-force lockout** (playbook `login_attempts` collection not implemented).
- **No password reset / OTP / email verification / 2FA**.
- **CORS `allow_origins=['*']` with `allow_credentials=True`** — invalid combo for cookies (works only because app uses bearer, not cookies).
- **JWT_SECRET / ADMIN_PASSWORD committed in `.env`** with weak default admin password.
- Hardcoded admin credentials inside frontend `Login.jsx` (secret triple-click) — client-exposed.
- No account disable/lock flag; deleting a user doesn't revoke live JWTs (stateless).
- `seed()` re-hashes admin password every startup.

Recommended upgrade path (later): short access + rotating refresh tokens, login-attempt lockout, password-reset + email verification (Resend), optional 2FA/OTP, move admin bootstrap fully server-side, tighten CORS to explicit origin.

---

## 6. ADMIN AUDIT

Exists: Overview (KPIs + bar/pie charts), Users & Roles (role dropdown, KYC verify, delete), Audit Logs list.
Missing: Departments, Companies/tenants, granular permission matrix, Settings, Content/CMS, Reports/export, Notifications center, Subscription/billing management, security controls (session revoke, IP allowlist), theme/branding config.

---

## 7. ENTERPRISE RBAC UPGRADE PLAN (proposed, not built)

Current: single flat `role` string on user + `require_roles()` gate. No permission granularity.

Target hierarchy: SuperAdmin → Department → Designation/Role → User → Permission → Module → Menu → Action.

Proposed additive collections:
- `companies` (tenant)
- `departments` (company_id, name, head_user_id, enabled)
- `roles` (company_id, department_id, name, is_system)
- `permissions` (role_id, module, menu, action ∈ {view,create,edit,delete,approve,reject,export,import,print,download,assign,transfer,verify,audit,manage})
- `modules` / `menus` registry (dynamic menu + module toggles)
- `user_roles` (user_id ↔ role_id, company_id) for multi-role
Backend: replace `require_roles()` with a `require_permission(module, action)` dependency that resolves user → roles → permissions, super_admin bypass. Frontend: permission-aware menu rendering + route guards. Fully backward compatible: keep legacy `role` string, map existing roles to seeded system roles/permissions during migration.

---

## 8. DEPARTMENT SYSTEM (architecture only)

Dynamic `departments` per company with CRUD + enable/disable + assign head/roles/users/permissions/menus/modules. Seed the 23 listed departments (HR, Tender & Bidding, Construction & Projects, Marketplace, Vendor Mgmt, Sales & BD, Customer Support, Finance & Accounts, GST & Taxation, Loan & Financial Services, Logistics & Fleet, Solar & Clean Energy, Architecture & Design, AI & Technology, IT & Infra, Data & Analytics, Marketing, Legal & Compliance, Risk & Security, Communication, Procurement, Warehouse & Inventory, Training & Knowledge) as data, not code.

---

## 9. MULTI-COMPANY (multi-tenant) ARCHITECTURE

Add `company_id` to every business document (users, products, orders, tenders, projects, etc.). Enforce tenant scoping in a shared query layer + a `require_company()` dependency so no query runs without a tenant filter (except super_admin cross-tenant). Per-company branding/settings collection. This is the highest-risk migration — must be phased with backfill (assign all existing data to a default company).

---

## 10. AUDIT LOG ARCHITECTURE (upgrade)

Current `audit_logs`: id, user_id, user_email, action, meta, created_at (login/register/role/bid/payment only).
Target fields: user, action, module, record_id, timestamp, ip, device/user-agent, old_value, new_value, company_id. Add a reusable middleware/decorator so all create/update/delete/approve/reject/config actions are captured uniformly (currently only a handful call `audit()`).

---

## SECURITY FINDINGS (summary)
1. 7-day JWT, no refresh rotation. 2. No brute-force protection. 3. CORS wildcard+credentials. 4. Secrets & weak admin password in `.env`. 5. Client-side hardcoded admin shortcut. 6. No tenant isolation. 7. No password reset/verification/2FA. 8. Hard deletes, no session revocation.

## PERFORMANCE FINDINGS
1. Missing indexes (bids.tender_id, orders.user_id, sessions.session_token, products.category). 2. Reverse auction uses 4s client polling (not websockets) — fine for demo, not for scale. 3. `admin/analytics` loads all orders into memory. 4. `vendor/orders` filters in Python (could be `$in`). 5. `seed()` re-hashes admin each boot.

## TECHNICAL DEBT
1. Backend is one 825-line module → split into routers/models. 2. No shared query/tenant layer. 3. AI chat has no persisted history (playbook requires it). 4. Contact form is mock (no email backend). 5. No automated frontend test harness beyond QA agent.

## RISK ASSESSMENT
- **High**: multi-tenant `company_id` backfill (data-wide), RBAC replacement of `require_roles`.
- **Medium**: auth hardening (token/refresh change affects all sessions), audit middleware.
- **Low**: adding indexes, departments CRUD, splitting modules, AI history.

## RECOMMENDED DEVELOPMENT ORDER (phased, additive, non-destructive)
1. Add DB indexes + audit-log field expansion (zero user impact).
2. RBAC core: companies/departments/roles/permissions collections + `require_permission` (keep legacy role mapping).
3. Super Admin UI: Departments, Roles & Permissions matrix, Companies.
4. Multi-tenant `company_id` backfill + tenant-scoped query guard.
5. Auth hardening: refresh rotation, lockout, password reset/verification (Resend), optional 2FA.
6. Enterprise audit middleware everywhere + Reports/Export.
7. New business modules (GST/Accounting, Inventory, Logistics, CRM, Notifications) one department at a time.

## GUARANTEES
No rebuild. No feature removal. All migrations additive with backfill. Existing pages/APIs preserved. STOP — awaiting your approval to begin Phase 1.

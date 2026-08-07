# BuildSphere — Enterprise Construction SaaS (PRD)

## Original Problem Statement
A 30-step enterprise B2B/B2C construction & infrastructure SaaS platform combining tender management + reverse auction, multi-vendor marketplace, construction ERP, solar portal, super admin + RBAC, AI features, payments, and multi-role dashboards. User prioritized v1: Solar Portal, Construction ERP, Marketplace, Tender+Reverse Auction, Super Admin+RBAC. Roles: super_admin, vendor, customer, contractor. Auth: JWT + Google. AI assistant + tender summary. Payments: Razorpay.

## Architecture
- Frontend: React 19 + React Router + Tailwind + shadcn/ui + framer-motion + recharts. Industrial Swiss design system (Cabinet Grotesk / IBM Plex Sans / JetBrains Mono, Safety Orange #FF5A1F), light/dark mode.
- Backend: FastAPI (single server.py) + MongoDB (motor). Bearer-token auth (JWT + Emergent Google session), RBAC via require_roles.
- Integrations: Emergent Universal LLM key (Claude Sonnet 4.6) for AI chat (SSE) + tender summary; Razorpay (DEMO mode until keys added); Emergent Google OAuth.

## User Personas
- Super Admin (platform owner): manage users/roles/KYC, analytics, audit logs.
- Vendor: list products, view orders, bid on tenders.
- Customer/Buyer: browse marketplace, cart+checkout, post tenders, solar quotes.
- Contractor: manage projects, BOQ, DPR.

## Implemented (2026-06 — v1)
- Auth: register/login/me/logout (JWT bearer) + Google OAuth session; admin + 3 demo users seeded.
- RBAC + Super Admin: users table with role change + KYC verify + delete, analytics (bar/pie charts), audit logs.
- Marketplace: 6 seeded products, category filter + search, add-to-cart (localStorage).
- Orders + Payments: order creation w/ 18% GST, Razorpay create/verify (DEMO mode marks paid).
- Tenders + Reverse Auction: 3 seeded tenders, live countdown, place bid, live ascending rank + lowest bid, create tender, AI summary.
- Solar Portal: capacity/subsidy/ROI/payback/CO2 calculator + save quotations.
- Construction ERP: projects, BOQ (auto amount+total), DPR daily logs.
- AI: floating streaming assistant + tender summarization.
- Public site: Home, Services, Pricing, Contact, Marketplace, Solar, Tender Hub.
- Testing: 22/22 backend tests pass; frontend E2E 100%.

## Backlog / Remaining (P1/P2)
- P1: Vendor KYC document upload (object storage), invoices/GST PDF export, wallet transactions, real Razorpay keys.
- P1: Tender award ownership check; EMD payment flow; document uploads for tenders.
- P2: Logistics/Fleet, Architect/3D-LiDAR, CRM/Khatabook, WhatsApp/SMS/email automation, PWA/offline, advanced reports/predictive analytics.
- Tech debt: split server.py into routers/models; tighten CORS in prod; abort AI SSE fetch on unmount.

## Next Tasks
- Add real Razorpay keys to go live on payments.
- Object storage for KYC/vendor documents.
- GST invoice generation + PDF export.

## Phase 1 + Phase 2 — Delivered (2026-06, additive & non-destructive)
- **DB backup** taken via mongodump at `/app/backups/dump_*` before changes.
- **Phase 1 – DB foundation**: added indexes across all collections (`rbac.ensure_indexes`); expanded `audit_logs` schema (module, record_id, ip_address, user_agent, device, old_value/new_value, status, metadata, timestamp) — backward compatible; reusable `audit_log()` utility in `backend/rbac.py` with sensitive-key redaction (passwords/tokens/secrets never stored).
- **Phase 2 – Enterprise RBAC** (`backend/rbac.py`, additive): new collections `companies, departments, roles, permissions, role_permissions, user_roles, modules, menus`. Seeds default company "2Click.in", 24 departments (incl. Super Administration), 26 modules/menus, 15 permission actions, 4 system roles mapped from legacy `users.role`, and backfills `user_roles` + `company_id` for existing users. Legacy `role` field preserved.
- **Guards**: `require_permission(module, action)` dependency (backend is authority, 403 on deny) + `rbac_admin` guard; escalation guard prevents non-super users from assigning/editing the super role. Endpoints under `/api/admin/rbac/*`; `/api/auth/permissions` returns effective perms.
- **Frontend**: `PermissionContext` + `usePermission` hook + `PermissionGate`; Super Admin → Administration panel (`AdminRBAC.jsx`) with tabs Companies, Departments, Roles, Permission Matrix (module×action grid, select-all/clear, save), Users & Assignments, Modules, Menus, Audit Logs.
- **Testing**: 40/40 backend tests pass (15 new RBAC/audit), frontend E2E 100%.
- **NOT YET DONE (approved future phases)**: multi-company data-scoping enforcement on business queries, auth hardening (refresh rotation/lockout/reset/2FA), audit middleware on all business writes, new business modules (GST/Accounting, Inventory, Logistics, CRM, Notifications).

## Phase 3 — Delivered (2026-06, additive & non-destructive)
- **Dynamic Categories** (`categories` collection, typed product/service/tender, nested-ready): public `GET /api/categories`; Super-Admin CRUD `/api/admin/categories`; used in marketplace + smart signup.
- **Smart Signup**: `RegisterIn` extended with `interests[]`, `business_type`, `primary_category` (all optional, backward compatible); `/register` shows role selector + interest chips + business-type field.
- **Personalized Workspace**: `PersonalBanner` in `DashboardLayout` (greeting + role + interest chips) driven by the user's stored interests.
- **White-Label Branding** (`companies.branding`): public `GET /api/branding`; Super-Admin `PATCH /api/admin/branding`; `BrandingContext` applies primary color (hex→HSL on `--primary`/`--ring`) + brand name across Navbar/Dashboard + document title.
- **Pricing Plans** (`plans` collection): public `GET /api/plans` (Starter/Business/Enterprise) renders `/pricing` dynamically; Super-Admin CRUD.
- **Commission Engine** (`app_settings.commission`): global default % + per-category overrides (Solar 3%, Steel 2.5%); `create_order` computes `platform_commission` per line item.
- **Super Admin UI**: Administration panel now 11 tabs incl. Categories, White Label, Plans & Commission.
- **Testing**: 57/57 backend tests pass (17 new Phase 3), frontend E2E 100%.

## Phase 3A — Delivered + Verified (2026-06, additive & non-destructive)
- **Dynamic Category Engine** (`categories`, nested via `parent_id`, typed via `category_type`): public `GET /api/categories`, `/api/categories/tree`, `/api/categories/type/{type}`, `/api/categories/{id}`; Super-Admin CRUD via `/api/categories` (POST/PUT), `PATCH /categories/{id}/status`, `DELETE /categories/{id}` (soft-disable if referenced, hard-delete otherwise). Seeded 8-group nested tree.
- **Smart Signup Wizard** (`/register`, 4 steps): 14 user types (freelancer/architect/engineer/ca/contractor/vendor/customer/etc.), category chips, business fields, account. `role`/`default_dashboard` derived from user_type; escalation to super_admin blocked.
- **Personalized Workspace Routing**: dashboard routes by user_type (Freelancer/Vendor/Contractor/Customer/Super Admin). Super admin via secret triple-click on `/login` title.
- **Freelancers Module**: public `GET /api/freelancers` (email omitted); `POST /api/freelancers/{id}/enquiry` (auth required; target must be a freelancer type); `GET /api/freelancers/me/enquiries`.
- **Stabilization fixes (from iteration_5.json)**: FE Categories null-safety + empty state; legacy `/api/admin/categories` migrated to `category_type` schema (no more collection pollution); freelancer-enquiry target validation (404); admin profile invalid user_type rejected (400); seed-if-empty semantics for category tree.
- **Testing**: backend 77 passed / 1 skipped (full suite); Phase 3A 20/21; FE Categories tab verified crash-free. See `/app/memory/PHASE3A_VERIFICATION_REPORT.md`.

## Next (approved backlog, priority order)
- **P1 Phase 3B**: White-Label Engine — domain mapping + per-company custom themes.
- **P1 Phase 3C**: Pricing & Commission Engine full build — subscriptions, invoicing.
- **P1 Auth hardening**: password reset, OTP, email verification, 2FA, JWT refresh rotation, brute-force lockout.
- **P1 Multi-tenant isolation**: `company_id` backfill + query guards across orders/products/users.
- **P2**: Logistics/Fleet, Architect/3D-LiDAR, CRM/Khatabook, GST/Accounting/E-Way, WhatsApp/SMS/Push, PWA, CI/CD.

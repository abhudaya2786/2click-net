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

## Phase 3B — White-Label Engine — Delivered + Verified (2026-06, additive)
- **Multi-tenant branding** (`companies.branding` + company-root `slug`/`custom_domain`): public `GET /api/branding` resolves tenant by `company_id` → `slug` → `custom_domain`/subdomain(host) → falls back to default. New fields: `accent_color`, `favicon`.
- **Admin White Label tab** (`AdminRBAC.jsx` → Branding): company selector, edit brand name/tagline/primary+accent color/logo/favicon/slug/custom_domain, live preview. `PATCH /api/admin/branding` persists all.
- **Frontend theming** (`BrandingContext`): resolves tenant via `?company=<slug>` or hostname, applies primary→`--primary/--ring`, accent→`--brand-accent`, favicon + document title.
- ⚠️ Real custom-domain DNS is a post-deploy infra step (slug/subdomain + `?company=` work in-app now).

## Phase 3C — Subscriptions + Invoicing + Commission — Delivered + Verified (2026-06, additive; DEMO payments)
- **Subscriptions** (`subscriptions`): `POST /api/subscriptions/subscribe`, `GET /subscriptions/me`, `POST /subscriptions/cancel`. Free plan active immediately; paid plans create a pending invoice.
- **Invoices** (`invoices`, number `INV-YYYY-NNNN`, 18% GST): `GET /invoices/me`, `GET /invoices/{id}` (owner/admin), `POST /invoices/{id}/pay` (DEMO mark-paid + activates subscription), `GET /invoices/{id}/pdf` (reportlab PDF).
- **Commission payouts**: `POST /api/admin/billing/run-commission {period}` aggregates platform commission from paid orders per vendor → one commission invoice/vendor/month (idempotent). Admin dashboards: `/billing/summary` (MRR, invoiced, collected, outstanding, commission), `/billing/invoices`, `/billing/subscriptions`.
- **Frontend**: shared `BillingSection` (Billing tab on Vendor/Customer/Contractor dashboards) + `AdminBilling` (admin Billing tab) + Pricing `/pricing` Subscribe CTA.
- **Testing**: backend 24/24 (`test_phase3bc.py`), frontend 100% (see `/app/test_reports/iteration_6.json`). Payments are DEMO/MOCKED.

## Super Mart (Construction Materials) — Delivered + Verified (2026-06, additive)
- **Catalog** (`materials` collection, admin-managed, editable rates): category-wise + brand-wise, 82 seeded rows across 10 categories (Cement, Steel & TMT, Bricks & Blocks, Sand & Aggregate, Paint, Tiles, Plumbing, Electrical, Plywood & Wood, Waterproofing) with real brands (UltraTech/ACC/Ambuja, TATA/JSW/SAIL, Asian/Berger, Kajaria/Somany, Havells/Polycab, etc.).
- **Public page** `/mart`: category chips + brand dropdown + search, brand-wise rate cards. Navbar "Super Mart" link.
- **Material Calculator** (`MaterialCalculator.jsx`) on Customer + Contractor dashboards: pick category→material→brand (rate auto), qty → line items + live estimated total.
- **BOQ integration** (Contractor): "Add from Super Mart" dialog adds a BOQ line at the brand rate (amount = qty × rate, brand stored); manual add validated; **BOQ PDF export** via `GET /api/erp/boq/{pid}/pdf` (reportlab).
- **Admin management**: Administration → Super Mart tab (`AdminMaterials.jsx`) — add/edit-rate/toggle/delete (schema-validated `MaterialUpdate`).
- **Hardening**: BOQ list/add + PDF now enforce project ownership (403/404 on foreign project).
- **Endpoints**: `GET /api/mart/categories|brands|materials`, admin CRUD `/api/admin/mart/materials`. **Testing**: backend 11/11 (`test_mart.py`), frontend 100% — see `/app/test_reports/iteration_7.json`.

## PAUSED — Phase 3D (Auth hardening + Tenant isolation + Real Stripe payments)
Started, then paused for Super Mart. Built but **NOT yet wired into server.py** (inert, app unaffected):
- `mailer.py` (Resend email), `payments_stripe.py` (Stripe invoice checkout, INR verified). `.env` has EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME, STRIPE_API_KEY. `phase3c` commission run has optional `company_id` scope.
- TODO to complete: login brute-force lockout + email OTP 2FA + forgot/reset password endpoints in server.py; mount payments_stripe (checkout/status/webhook) + frontend Pay-with-card + /payment/success page; tenant `company_id` scoping across products/orders/tenders/ERP + backfill.

## Phase 3D + Super Mart Enhancements — Delivered + Verified (2026-06, additive)
- **Super Mart material images**: category-wise photos on `/mart` cards + calculator. `mart.py` `CATEGORY_IMAGES` map; `migrate_mart()` idempotently backfills `image` on existing docs. Card shows image header + brand + rate.
- **Rate History (price-trend)**: each material has a 6-point monthly `rate_history` (seeded via `_gen_history`, appended on every admin rate change). `/mart` card → "Rate trend" opens a Recharts LineChart dialog with % change badge + buy-timing note.
- **1-click BOQ templates**: `SEED_TEMPLATES` = 3BHK Villa (12 items, ~₹9.06L), 2BHK Flat (8), Boundary Wall (5). Public `GET /api/mart/boq-templates` + `GET /api/mart/boq-templates/{id}` resolve each item to the cheapest active brand at live rate. UI: MaterialCalculator "Generate BOQ" (customer+contractor) and Contractor BOQ "Generate from template" (posts lines to /erp/boq) + PDF export.
- **Auth hardening (server.py)**: brute-force lockout (5 fails → 15-min lock, `login_attempts`); email OTP 2FA (`two_factor_enabled` user flag; login returns `{requires_otp}`; `POST /api/auth/otp/verify|resend`, hashed `otp_codes`, 10-min TTL); forgot/reset password (`POST /api/auth/forgot-password|reset-password`, `password_reset_tokens`, 1-hr TTL). Emails via Resend (`mailer.py`, EMERGENT_EMAIL_KEY). `POST /api/auth/2fa/toggle`.
- **Real Stripe payments**: `payments_stripe.py` mounted. `POST /api/payments/invoice-checkout` (server-side amount) → Stripe Checkout (INR, test-mode `sk_test_emergent`), `GET /api/payments/status/{sid}`, `POST /api/webhook/stripe`. Frontend: BillingSection "Pay with card" → redirect; `/payment/success` polls status; `/reset-password` page.
- **Frontend routes added**: `/reset-password`, `/payment/success`, `/payment/cancel`. Login rewritten with login|otp|forgot stages.
- **Testing**: backend verified via curl (lockout 429, Stripe real checkout URL, 2FA requires_otp, templates resolve, images+history, Resend send=True). Frontend 5/5 flows pass — see `/app/test_reports/iteration_8.json`. Stripe is TEST-MODE (real checkout, no live charge).

## Next (approved backlog, priority order)
- **P1 Multi-tenant isolation**: `company_id` backfill + query guards across orders/products/users; scope `run-commission` by tenant `company_id` (marketplace stays cross-company by design).
- **P1 Auth extras**: JWT refresh rotation, email verification on signup, 2FA setup UI in account settings.
- **P1 Payments**: go live (claim Stripe account) + `/erp/boq/bulk` batch endpoint to speed up template loading.
- **P2**: Logistics/Fleet, Architect/3D-LiDAR, CRM/Khatabook, GST/Accounting/E-Way, WhatsApp/SMS/Push, PWA, CI/CD.

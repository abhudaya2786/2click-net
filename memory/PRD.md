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

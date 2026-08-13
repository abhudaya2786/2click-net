# buildecogroup.com — Complete User & Admin Manual
_Enterprise Construction SaaS · React + FastAPI + MongoDB_

Live app: https://www.buildecogroup.com · Owner API: https://api.buildecogroup.com · All API calls are prefixed with `/api`.  
See `docs/OWNER_CONTROL.md` to run the API yourself (no Emergent required).

---

## 1. Full Application Navigation & UI Map

### 1.1 Public site (top Navbar — visible to everyone)
Logo (→ Home) · **Marketplace** · **Super Mart** · **Tender Hub** · **Freelancers** · **Solar** · **Services** · **Pricing** · **Contact** · Theme toggle (light/dark) · **Log in** / **Get Started** (guests) OR **Dashboard** (logged-in).

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Hero, value props, CTAs |
| `/marketplace` | Marketplace | Browse & add products to cart |
| `/mart` | Super Mart | Construction-material rate catalog (brand-wise) + rate trends + BOQ templates |
| `/tenders` , `/tenders/:id` | Tender Hub / Tender Detail | Live tenders + reverse-auction bidding |
| `/freelancers` | Freelancers | Directory of architects/engineers/CAs + enquiry |
| `/solar` | Solar | Solar savings calculator + EPC proposal engine |
| `/services` , `/pricing` , `/contact` | Marketing pages | Info, dynamic plans, contact form |
| `/login` | Login | Password / Google / OTP / Forgot-password stages |
| `/register` | Register | 4-step smart signup wizard |
| `/reset-password` | Reset password | Set new password from email link |
| `/payment/success` , `/payment/cancel` | Payment result | Stripe checkout return page |
| `/dashboard` | Dashboard (role-routed) | Protected; renders the right workspace per role |

### 1.2 Dashboard sidebar menus (per role)
The dashboard picks a workspace based on your role/user_type:

- **Customer** → Overview · Cart & Checkout · My Orders · Solar Quotes · Solar EPC · Material Calc · **Wallet** · Billing
- **Vendor** → Overview · My Products · Orders · **Wallet** · Billing
- **Contractor** → Overview · Projects · BOQ · Daily Report · Material Calc · **Wallet** · Billing
- **Freelancer/Architect/Engineer/CA** → Overview · My Services · Enquiries · Portfolio · **Wallet**
- **Super Admin** → Overview · Users & Roles · **Administration** · Audit Logs

**Administration panel tabs (Super Admin):** Companies · Departments · Roles · Permission Matrix · Users & Assignments · Categories · White Label · Plans & Commission · Billing · **Wallet** · Super Mart · Modules · Menus · Audit Logs.

Top bar inside dashboard: page title · View-site globe · theme toggle · user chip. Bottom of sidebar: **Log out**.

### 1.3 Modals / popups
- Marketplace/Mart: "Rate trend" chart dialog (Mart).
- Vendor: "Add Product" dialog; **order "View" expand row** (site/architect/company + items).
- Contractor: "New Project" dialog, "Add from Super Mart" dialog, "Generate from template".
- Toaster notifications (top-right) for every success/error.
- Login: OTP stage + Forgot-password stage (inline, not separate pages).

---

## 2. User Workflow (Click-by-Click)

### 2.1 Register (Smart Signup Wizard) — `/register`
- **a) Screen:** 4 steps — (1) pick account type card, (2) pick categories (search + star a primary), (3) business details (company/skills/pricing — fields vary by type), (4) name/email/password + accept terms → **Create account**. Language toggle EN/हिन्दी top-right.
- **b) Backend:** `GET /api/user-types` (step 1), `GET /api/categories/type/{type}` (step 2), then `POST /api/auth/register` with the full profile payload → returns `{token, user}`.
- **c) DB & screen:** a new doc is inserted into `users` (hashed password, role/default_dashboard derived from user_type, `company_id`, `wallet_balance: 0`, interests). Token is saved to `localStorage.bs_token`; you're routed to `/dashboard`.

### 2.2 Login — `/login`
- **a) Screen:** enter Email + Password → **Log in**. Options: **Continue with Google**, **Forgot password?**, demo-account quick-fill buttons.
- **b) Backend:** `POST /api/auth/login {email,password}`. If the account has 2FA on, response is `{requires_otp:true, email}` and the UI switches to the OTP stage; otherwise `{token, user}`.
  - OTP stage: `POST /api/auth/otp/verify {email, code}` (or `/otp/resend`).
  - Google: redirects to Emergent Auth; on return the `#session_id=` is exchanged (AuthCallback → `POST /api/auth/google/session`).
- **c) DB & screen:** on success token+user cached in `localStorage`; every later request sends `Authorization: Bearer <token>`. Wrong password increments `login_attempts`; **5 fails → 15-min lockout (HTTP 429)**.

### 2.3 Browse Marketplace & add to cart — `/marketplace`
- **a) Screen:** category sidebar + search box; product cards with price and a cart (+) button.
- **b) Backend:** `GET /api/products?category=&q=` and `GET /api/products/categories`.
- **c) DB & screen:** cart is stored client-side in `localStorage.bs_cart` (a `cart-updated` event refreshes the dashboard cart). Nothing hits the DB until checkout. Guests are redirected to `/login`.

### 2.4 Cart & Checkout (Customer dashboard → Cart & Checkout)
- **a) Screen:** line items with quantity + remove; right panel **Delivery & Site Details**: `Site location / delivery address *` (required), `Architect name`, `Architect phone`, `Company name`; live **Subtotal / GST 18% / Total**; two buttons — **Pay with Razorpay** and **Pay with Wallet**.
- **b) Backend:** `POST /api/orders {items, address, site_location, architect_name, architect_phone, company_name}`.
  - Razorpay path: then `POST /api/payments/create {order_id}` → `POST /api/payments/verify {order_id, mode}` (DEMO mode marks paid).
  - Wallet path: `POST /api/orders/{order_id}/pay-wallet`.
- **c) DB & screen:** a doc is inserted into `orders` with computed `subtotal`, `tax` (18%), `total`, `platform_commission`, plus the architect/site/company fields and `company_id`. On success the cart clears, a toast confirms, and you land on **My Orders**.

### 2.5 View Wallet & Transaction History (any role → Wallet tab)
- **a) Screen:** orange **Wallet Balance** card (₹) + a **Transaction Ledger** table: Type (credit/debit), Amount, Reason, Balance After, Date.
- **b) Backend:** `GET /api/wallet/me` → `{balance, transactions[]}`.
- **c) DB & screen:** balance is read from `users.wallet_balance`; rows come from `wallet_transactions` (newest first). This screen is read-only for users — only a Super Admin can change a balance.

### 2.6 Pay an order with Wallet
- **a) Screen:** in Cart, after filling the required address, click **Pay with Wallet**.
- **b) Backend:** `POST /api/orders/{id}/pay-wallet` — atomically debits the wallet and marks the order paid. (If the order-update step were to fail, the debit is auto-refunded so you're never charged without a paid order.)
- **c) DB & screen:** `users.wallet_balance` decreases; a `debit` row (`reason: "Order payment · <id>"`) is added to `wallet_transactions`; the order flips to `status:"paid"`, `payment_mode:"wallet"`. Toast shows the new balance and you're taken to My Orders.

### 2.7 Other user actions (quick reference)
- **Solar Quotes / Solar EPC:** `POST /api/solar` (savings calc, saved to `solar_quotations`); EPC engine builds a full proposal (`solar_proposals`) + KYC document upload/download (object storage).
- **Material Calc (Customer/Contractor):** `GET /api/mart/categories|materials`; **Generate BOQ** from a template `GET /api/mart/boq-templates/{id}` (resolves cheapest live brand rates).
- **Contractor Projects/BOQ/DPR:** `/api/erp/projects`, `/api/erp/boq` (+ `Add from Super Mart`, template generate, PDF `GET /api/erp/boq/{pid}/pdf`), `/api/erp/dpr`.
- **Vendor Products:** `POST /api/products`, `DELETE /api/products/{id}`; **Orders → View** expands site/architect/company + items via `GET /api/vendor/orders`.
- **Billing (Vendor/Customer/Contractor):** choose a plan → `POST /api/subscriptions/subscribe`; invoices via `GET /api/invoices/me`; **Pay with card** → `POST /api/payments/invoice-checkout` → Stripe checkout; **PDF** via `GET /api/invoices/{id}/pdf`.
- **Freelancers directory:** `GET /api/freelancers`; send enquiry `POST /api/freelancers/{id}/enquiry`; freelancer sees them under **Enquiries** (`GET /api/freelancers/me/enquiries`).
- **Tenders:** browse `GET /api/tenders`, open detail, **place bid** (live reverse-auction rank), create tender, AI summary.

---

## 3. Admin / Super-Admin Workflow (Click-by-Click)

Enter via `/dashboard` as a super_admin (or on `/login` triple-click the "Log in" heading for the seeded owner account).

### 3.1 Overview / Users & Roles / Audit
- **Overview:** KPI cards (Revenue, Users, Products, Tenders) + role bar & pie charts — `GET /api/admin/analytics`.
- **Users & Roles:** table with inline **role dropdown** (`PATCH /api/admin/users/{id}/role`), **Verify KYC** (`PATCH /api/admin/users/{id}/kyc`), **Delete** (`DELETE /api/admin/users/{id}`). Data from `GET /api/admin/users`.
- **Audit Logs:** `GET /api/admin/audit` / RBAC audit with module/action filters.

### 3.2 Administration tabs
- **Companies / Departments / Roles / Permission Matrix / Users & Assignments:** full enterprise RBAC (`/api/admin/rbac/*`). The Matrix is a module×action grid — toggle cells, **Save** → `PUT /api/admin/rbac/roles/{id}/permissions`.
- **Categories:** create/toggle/delete typed & nested categories (`/api/categories`, `/api/admin/categories`).
- **White Label:** per-company brand name/colors/logo/favicon/slug/domain with live preview → `PATCH /api/admin/branding`.
- **Plans & Commission:** view plans + edit default/per-category commission → `PUT /api/admin/commission`.
- **Billing:** MRR/invoiced/collected/outstanding + run monthly commission payouts.
- **Super Mart:** add/edit-rate/toggle/delete materials → `/api/admin/mart/materials`.

### 3.3 Manual Wallet Credit / Debit (Administration → **Wallet**)
Only a Super Admin can change balances, and a **reason is mandatory**.

1. **Open:** click **Administration** in the sidebar, then the **Wallet** tab. You see two panels: **Adjust Wallet Balance** (left) and **Wallet Ledger — all users** (right). Below the form is a scrollable **User Balances** list.
   - Backend on load: `GET /api/admin/wallet/users` + `GET /api/admin/wallet/transactions`.
2. **Pick the user:** open the **User** dropdown and select the person (each option shows name/email + current balance).
3. **Choose the action:** set **type** to `Credit (+)` or `Debit (−)`.
4. **Enter the amount:** type a positive number in **Amount (₹)**.
5. **Enter the reason (required):** type a reason in **Reason (mandatory)** — e.g. "Refund for order #123" or "Promotional credit".
6. **Confirm:** click **Apply Adjustment**.
   - Backend: `POST /api/admin/wallet/adjust {user_id, type, amount, reason}` (guarded by super-admin check; validates `amount > 0` and `reason` length ≥ 2).
   - DB: atomically `$inc`s `users.wallet_balance` (debit uses a `$gte` guard so it can't go negative) and inserts a row into `wallet_transactions` with `balance_after`, `created_by`, and the reason.
   - Screen: a success toast shows the new balance; the **User Balances** list and the **Wallet Ledger** on the right refresh automatically. The affected user sees the new balance + ledger row instantly on their own Wallet tab.

---

## 4. System Edge Cases & Feedback

All feedback appears as a **top-right toast** (green-ish for success, red for error) or as an inline banner on auth screens.

- **Empty required field at checkout:** clicking Pay with an empty **Site location** shows _"Site location / delivery address is required"_ and no order is created.
- **Insufficient wallet funds:** Pay-with-Wallet or an admin over-debit is blocked server-side (`400 — "Insufficient wallet balance"`); the balance is **not** changed and a red toast explains why.
- **Wallet reason missing (admin):** the form blocks with _"Reason is mandatory"_; if bypassed, the API returns **422** (validation error).
- **Non-admin hitting admin wallet APIs:** returns **403 — "Only Super Admin can perform this action"**.
- **Paying an already-paid order:** returns **400 — "Order already paid"**.
- **Paying someone else's order:** returns **403 — Forbidden**.
- **Wrong login password:** inline red error; after **5 failed attempts** the account locks for **15 minutes** (**429**). 2FA accounts require the emailed 6-digit OTP; a wrong/expired code shows an inline error with a **Resend code** option.
- **Forgot password:** always shows a neutral "if an account exists, a link was emailed" message (no account enumeration); the link opens `/reset-password?token=…` (token valid 1 hour).
- **Card payment (Stripe, test mode):** redirects to Stripe Checkout; `/payment/success` polls `GET /api/payments/status/{session_id}` until paid. No live charge until the account is claimed.
- **Loading states:** spinners render while any tab/section fetches; tables show friendly empty states ("No transactions yet.", "No orders yet.", etc.).
- **Session expiry / not logged in:** protected `/dashboard` redirects guests to `/login`.

> Note: Razorpay marketplace checkout runs in **DEMO mode** (orders are marked paid without a real gateway). Stripe subscription/invoice payments are **real test-mode** checkouts.

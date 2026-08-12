# BuildEco Group (buildecogroup.com) — Complete Website Source Code

Construction super-app: Store, Super Mart, Full BOQ, Interior BOQ, Tenders, Solar, Consultants, Upcoming Projects, Property Advisory, Enrollment, Mera Ghar ERP, and more.

**Live site:** https://www.buildecogroup.com  
**Brand:** BuildEco Group (formerly 2click.in)

> GitHub repository folder may still be named `2click-net`; product branding is **buildecogroup.com**.

---

## Get the full source code

### Option 1 — GitHub (recommended)

```bash
# Latest branch (all recent features)
git clone https://github.com/abhudaya2786/2click-net.git
cd 2click-net
git checkout cursor/upcoming-projects-4cd6
```

**ZIP download (no git):**

https://github.com/abhudaya2786/2click-net/archive/refs/heads/cursor/upcoming-projects-4cd6.zip

**Stable `main` branch:**

https://github.com/abhudaya2786/2click-net/archive/refs/heads/main.zip

**Open PR (merge for latest on main):** https://github.com/abhudaya2786/2click-net/pull/29

### Option 2 — GitHub Releases

After merging PR #29, download the latest zip from the repository page → **Code** → **Download ZIP**.

---

## Project structure

```
2click-net/
├── backend/                 # FastAPI + MongoDB API
│   ├── server.py            # Main app entry
│   ├── mart.py              # Super Mart, Store, BOQ builder, fabrication
│   ├── upcoming_projects.py # Upcoming land/projects by location
│   ├── property_advisory.py   # Expert guidance by property type
│   ├── consultants.py       # Architect, vastu, real estate advisors
│   ├── enrollment.py        # User/shop enrollment + agreements
│   ├── home_build.py        # Mera Ghar lifecycle
│   ├── phase3.py / phase3a.py / phase3c.py  # Tenders, freelancers
│   ├── solar_epc.py         # Solar calculator + KYC
│   ├── wallet.py            # Wallet & billing
│   ├── site_config.py       # Geo, branding, locales
│   ├── rbac.py              # Roles & permissions
│   └── requirements.txt
├── frontend/                # React (CRA + Craco + Tailwind)
│   ├── src/
│   │   ├── App.js           # All routes
│   │   ├── pages/           # Home, Store, BOQ, Tenders, Dashboard…
│   │   ├── components/      # UI, marketing, dashboard, demo
│   │   └── lib/             # api.js, demoData.js, homeCopy.js
│   ├── public/              # sitemap, manifest, index.html
│   └── package.json
├── vercel.json              # Frontend deploy (Vercel)
├── scripts/                 # Utility scripts
└── docs/                    # Extra documentation
```

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, React Router, Tailwind, Framer Motion, Capacitor (Android APK) |
| Backend | Python 3.12, FastAPI, Motor (MongoDB) |
| Database | MongoDB |
| Deploy | Vercel (frontend), backend on your server / Emergent host |

---

## Local setup

### Prerequisites

- Node.js 20+
- Python 3.12+
- MongoDB running locally (or Mongo Atlas URL)

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edit MONGO_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

API docs: http://localhost:8001/docs

### 2. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env        # REACT_APP_BACKEND_URL=http://localhost:8001
npm start
```

Open: http://localhost:3000

### 3. Production build (frontend)

```bash
cd frontend
npm run build
# Output: frontend/build/
```

---

## Main pages (routes)

| Path | Feature |
|------|---------|
| `/` | Home, regional landing, upcoming projects |
| `/store` | Construction store (Myntra-style) |
| `/mart` | Super Mart + brand rates |
| `/boq-builder` | Full home BOQ (kitchen, bath, plumber…) |
| `/interior-boq` | Interior / fabrication / tiles calculators |
| `/interior-boq/fabrication` | Fabrication work types + materials |
| `/upcoming-projects` | Projects by location & BHK |
| `/property-advisory` | Expert guidance + consultant match |
| `/equipment-rental` | JCB, crane, tipper, logistics rental |
| `/tenders` | Tender hub + reverse auction |
| `/consultants` | Architects, vastu, real estate |
| `/solar` | Solar EPC calculator |
| `/enroll` | Enrollment forms |
| `/dashboard` | Customer / vendor / contractor ERP |
| `/register`, `/login` | Auth |

---

## Environment variables

See `backend/.env.example` and `frontend/.env.example`.

**Required for backend:** `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

---

## Deploy

- **Frontend:** Connect repo to Vercel; uses `vercel.json` (builds `frontend/`).
- **Backend:** Deploy `backend/` with `uvicorn server:app`; set env vars; point `REACT_APP_BACKEND_URL` on Vercel to your API URL.

---

## Demo accounts (seeded on backend startup)

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@buildecogroup.com | Demo@12345 |
| Vendor | vendor@buildecogroup.com | Demo@12345 |
| Contractor | contractor@buildecogroup.com | Demo@12345 |

---

## Owner / Super Admin login

**Do not use** the regular `/login` page for the site owner — super admin is blocked there.

| Step | Detail |
|------|--------|
| **URL** | https://www.buildecogroup.com/sys/console (local: http://localhost:3000/sys/console) |
| **Email** | Value of `ADMIN_EMAIL` in backend `.env` (production default: `abbhuadaya@gmail.com`) |
| **Password** | Value of `ADMIN_PASSWORD` in backend `.env` |
| **Access PIN** | Optional — `ADMIN_ACCESS_PIN` in backend `.env` if enabled |
| **OTP** | After password, a 6-digit code is emailed to the admin email |

After login you reach **Dashboard** with full Super Admin controls (users, RBAC, site customization, pincodes, backup, analytics).

**Regular users** (customer, vendor, contractor): `/login` with demo emails above or registered accounts.

---

## License

Private project — buildecogroup.com / repository owner.

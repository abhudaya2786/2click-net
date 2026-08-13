# Owner control — BuildEco Group off Emergent

Goal: **poora platform control aapke paas** — frontend Vercel (aapke account), API + Mongo aapke server pe, admin `/sys/console` se.

Emergent `wallet-vendor-mvp.emergent.host` pe depend mat karo.

---

## Architecture (owner-owned)

| Layer | Where | Who controls |
|--------|--------|----------------|
| Website | Vercel → `www.buildecogroup.com` | Owner GitHub + Vercel |
| API | `api.buildecogroup.com` → Docker / VPS / Railway | Owner |
| Database | Mongo on same VPS or MongoDB Atlas | Owner |
| Super admin | `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_ACCESS_PIN` in API `.env` | Owner |
| Email OTP | `RESEND_API_KEY` (Resend.com) | Owner |
| Branding | Admin console after login | Owner |

`vercel.json` ab `/api/*` ko **`https://api.buildecogroup.com`** pe rewrite karta hai (Emergent nahi).

---

## 1) API apne server pe chalao

### Option A — Docker (recommended)

VPS (Hostinger / DigitalOcean / AWS Lightsail) pe:

```bash
git clone https://github.com/abhudaya2786/2click-net.git
cd 2click-net
cp backend/.env.example backend/.env
# Edit backend/.env — JWT_SECRET, ADMIN_*, RESEND_API_KEY, CORS_ORIGINS
chmod +x scripts/owner-up.sh
./scripts/owner-up.sh
```

Local check:

```bash
curl -s http://127.0.0.1:8001/api/
# Expect: {"message":"BuildEco Group Enterprise API","status":"ok"}
```

### Option B — Manual

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.owner.txt
# Mongo running + .env filled
uvicorn server:app --host 0.0.0.0 --port 8001
```

---

## 2) DNS — `api.buildecogroup.com`

Hostinger DNS:

| Type | Name | Value |
|------|------|--------|
| A | `api` | your VPS public IP |

VPS pe HTTPS (Caddy / Nginx + Let's Encrypt) → proxy `https://api.buildecogroup.com` → `127.0.0.1:8001`.

Verify:

```bash
curl -s https://api.buildecogroup.com/api/
```

---

## 3) Vercel frontend (already owner project)

1. GitHub `main` deploy (is PR merge ke baad)
2. Domains: `www.buildecogroup.com` + apex redirect
3. Rewrite destination already: `api.buildecogroup.com`

Agar API kisi aur host pe hai, `vercel.json` + `frontend/vercel.json` mein destination badlo.

---

## 4) Super admin (owner)

`backend/.env`:

```bash
ADMIN_EMAIL=you@yourdomain.com
ADMIN_PASSWORD=<strong-password>
ADMIN_ACCESS_PIN=<6-digit>
ENABLE_TEST_OTP=1          # pehli baar; baad mein 0 + RESEND
CORS_ORIGINS=https://buildecogroup.com,https://www.buildecogroup.com
```

API restart → seed super_admin banata / password update karta hai.

Login: https://www.buildecogroup.com/sys/console

Admin console se branding (`BuildEco Group`), users, rates — **aapke Mongo** pe save.

---

## 5) Email (OTP) — Emergent se hatao

1. https://resend.com pe account  
2. Domain `buildecogroup.com` verify  
3. API key → `RESEND_API_KEY=`  
4. `EMAIL_FROM=noreply@buildecogroup.com`  
5. `ENABLE_TEST_OTP=0`

---

## 6) Emergent band

Jab `api.buildecogroup.com` healthy ho aur `/sys/console` chal jaye:

- Emergent project pause / delete (optional)
- Purane `EMERGENT_*` keys hata sakte ho (AI/payments jab tak alag setup na ho)

AI / Stripe jo Emergent packages pe the, owner Docker mein optional hain — core store, login, admin, BOQ bina unke chalte hain. Sales MoM `OPENAI_API_KEY` se chal sakta hai.

---

## Verify checklist

```bash
curl -s https://api.buildecogroup.com/api/
# BuildEco Group Enterprise API

curl -s https://www.buildecogroup.com/api/
# same JSON via Vercel rewrite (not SPA HTML)

curl -s -X POST https://www.buildecogroup.com/api/auth/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"YOUR_ADMIN","password":"YOUR_PASSWORD","access_pin":"YOUR_PIN"}'
# 200 token or requires_otp — NOT 404
```

Browser navbar: **BuildEco Group** (not 2Click.in).

---

## Short Hindi

1. Apne VPS pe Docker API + Mongo chalao  
2. `api.buildecogroup.com` DNS + HTTPS  
3. Vercel pe latest code deploy  
4. `.env` mein apna admin email/password/PIN  
5. `/sys/console` se poora control — Emergent ki zarurat nahi  

# Owner control — BuildEco Group off Emergent

**Goal:** poora platform control **aapke paas** — frontend Vercel (aapke account), API + Mongo aapke server pe, admin `/sys/console` se.

Emergent `wallet-vendor-mvp.emergent.host` pe depend **mat** karo.

---

## Cutover order (zaroori — pehle API, phir Vercel)

1. **Pehle** VPS pe Docker API + Mongo chalao  
2. **Phir** Hostinger pe `api.buildecogroup.com` DNS + HTTPS  
3. Verify: `curl -s https://api.buildecogroup.com/api/` → `BuildEco Group Enterprise API`  
4. **Tab** PR merge / Vercel Production deploy (rewrite → `api.buildecogroup.com`)  
5. `/sys/console` se login — branding, users, rates **aapke Mongo** pe  

Agar step 4 pehle kar doge aur DNS ready nahi → site `/api` toot jayegi.

---

## Architecture (owner-owned)

| Layer | Where | Who controls |
|--------|--------|----------------|
| Website | Vercel → `www.buildecogroup.com` | Owner GitHub + Vercel |
| API | `api.buildecogroup.com` → Docker / VPS | Owner |
| Database | Mongo on same VPS (or Atlas) | Owner |
| Super admin | `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_ACCESS_PIN` in API `.env` | Owner |
| Email OTP | `RESEND_API_KEY` (Resend.com) | Owner |
| Branding | Admin console after login | Owner |

`vercel.json` `/api/*` → **`https://api.buildecogroup.com`** (Emergent nahi).

Google login via Emergent **band** hai — email/password use karo.

---

## 1) Hostinger / any VPS pe API

### Option A — Docker (recommended)

```bash
# Ubuntu VPS pe Docker install ke baad:
git clone https://github.com/abhudaya2786/2click-net.git
cd 2click-net
git checkout main   # ya owner-control PR merge ke baad
cp backend/.env.example backend/.env
nano backend/.env   # ADMIN_*, JWT_SECRET, CORS_ORIGINS, RESEND_API_KEY
chmod +x scripts/owner-up.sh
./scripts/owner-up.sh
```

Local / VPS check:

```bash
curl -s http://127.0.0.1:8001/api/
# Expect: {"message":"BuildEco Group Enterprise API","status":"ok"}
```

### Option B — Manual (no Docker)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.owner.txt
# Mongo running + .env filled
uvicorn server:app --host 0.0.0.0 --port 8001
```

---

## 2) DNS — `api.buildecogroup.com`

Hostinger DNS (domain **buildecogroup.com**):

| Type | Name | Value |
|------|------|--------|
| A | `api` | your VPS public IP |

### HTTPS with Caddy

```bash
# On VPS
sudo apt install -y caddy
sudo cp /path/to/2click-net/deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

`deploy/Caddyfile` proxies `api.buildecogroup.com` → `127.0.0.1:8001` (auto Let's Encrypt).

Verify:

```bash
curl -s https://api.buildecogroup.com/api/
```

---

## 3) Vercel frontend (owner project)

1. GitHub `main` deploy **after** API DNS works  
2. Domains: `www.buildecogroup.com` + apex → www  
3. Rewrite already: `api.buildecogroup.com`

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
JWT_SECRET=<long-random-string>
```

API restart → `seed()` super_admin banata / password update karta hai.

Login: https://www.buildecogroup.com/sys/console

Admin console se branding (`BuildEco Group`), users, rates — **aapke Mongo** pe save. Emergent dashboard ki zarurat nahi.

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

- Emergent project pause / delete  
- Purane `EMERGENT_*` keys hatao (AI/payments jab tak alag setup na ho)

Core store, login, admin, BOQ **bina Emergent** chalte hain. Sales MoM ke liye optional `OPENAI_API_KEY`.

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

## Short Hindi — aapko kya karna hai

1. Hostinger/VPS pe Docker se API + Mongo chalao (`scripts/owner-up.sh`)  
2. DNS: `api` → VPS IP, Caddy se HTTPS  
3. `.env` mein apna admin email / password / PIN  
4. Jab `curl https://api.buildecogroup.com/api/` OK ho → Vercel pe latest code deploy  
5. `/sys/console` se poora control — **Emergent ki zarurat nahi**  

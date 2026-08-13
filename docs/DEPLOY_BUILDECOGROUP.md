# Fix www.buildecogroup.com (Vercel DEPLOYMENT_NOT_FOUND)

> **Full owner control (API off Emergent):** see [`OWNER_CONTROL.md`](./OWNER_CONTROL.md) — Docker API on `api.buildecogroup.com`, then Vercel.

Agar browser / curl pe ye error aaye:

```text
x-vercel-error: DEPLOYMENT_NOT_FOUND
HTTP 404
```

Matlab DNS Vercel tak pahunch raha hai, lekin **kisi live Production deployment se domain link nahi** hai.

---

## GitHub check (already done in repo)

- Brand / SEO / sitemap → `buildecogroup.com`
- `vercel.json` → frontend build + `/api` proxy to backend
- `api.js` → `www.buildecogroup.com` as frontend host (uses `/api` rewrite)
- CORS example → `https://buildecogroup.com,https://www.buildecogroup.com`

Repo: `main` branch latest rebrand commit.

---

## Vercel pe ye exact steps (zaroori)

### 1) Sahi project kholo
1. https://vercel.com/dashboard  
2. Jo project **GitHub `abhudaya2786/2click-net`** se linked hai, wahi open karo  
3. **Settings → Git** → confirm: Production Branch = **`main`**

### 2) Production deploy exist kare
1. **Deployments** tab  
2. Latest **Production** deploy from `main` → status **Ready**  
3. Agar koi Ready deploy nahi:
   - **Deployments → … → Redeploy**  
   - ya GitHub pe empty commit / “Redeploy” from Vercel

### 3) Domain dubara add (2click hata chuke ho — theek hai)
1. **Settings → Domains**  
2. Ensure **sirf**:
   - `www.buildecogroup.com`  
   - `buildecogroup.com` (redirect → www recommended)  
3. **2click.in / www.2click.in yahan na hon**  
4. Add ke baad Vercel **Assign to Production** / Valid dikhe

### 4) Hostinger DNS (confirm)
Domain **buildecogroup.com** → DNS:

| Type | Name | Value |
|------|------|--------|
| A | `@` | Vercel A IP (often `76.76.21.21`) |
| CNAME | `www` | `cname.vercel-dns.com` |

Vercel Domains page pe jo exact values dikhen, wahi use karo.

### 5) Purana 2click.in
- Vercel se remove (aapne kar diya) ✓  
- Hostinger pe 2click.in ke purane A/CNAME (Vercel wale) delete rakho  
- Baad mein naya project ke liye khali chhod sakte ho  

---

## Backend CORS + super admin (API server)

Emergent host: `https://wallet-vendor-mvp.emergent.host`

Agar `/sys/console` pe **"Not Found"** aaye → password galat nahi hai. Live API abhi bhi purana `"2click.in Enterprise API"` hai aur `/api/auth/admin/login` route missing hai.

### Fix (Emergent pe)

1. Emergent pe is GitHub repo ka **latest `main`** backend redeploy karo  
2. Backend `.env` mein set karo:

```bash
ADMIN_EMAIL=admin@buildecogroup.com
ADMIN_PASSWORD=<your-strong-password>
ADMIN_ACCESS_PIN=<6-digit-pin>
ENABLE_TEST_OTP=1
CORS_ORIGINS=https://buildecogroup.com,https://www.buildecogroup.com,http://localhost:3000
```

3. API restart / redeploy complete hone do  
4. Verify:

```bash
curl -s https://wallet-vendor-mvp.emergent.host/api/
# Expect: "buildecogroup" (not "2click.in")

curl -s -o /tmp/admin.json -w "%{http_code}\n" -X POST https://www.buildecogroup.com/api/auth/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"YOUR_ADMIN_EMAIL","password":"YOUR_PASSWORD","access_pin":"YOUR_PIN"}'
# Expect: HTTP 200 with token OR requires_otp — NOT 404 {"detail":"Not Found"}
```

5. Browser: https://www.buildecogroup.com/sys/console → same email / password / PIN

Server start pe `seed()` `ADMIN_EMAIL` se super_admin create/update karta hai.

### Navbar pe "2Click.in" dikhe to

Domain theek hai — API `/branding` Mongo se purana `brand_name: "2Click.in"` bhej raha hota hai. Frontend ab isko sanitize karta hai; backend seed bhi migrate karta hai. Vercel pe latest frontend deploy karo (hard refresh / cache clear). Emergent API redeploy se DB bhi BuildEco pe update ho jayegi.

---

## Verify checklist

```bash
curl -sI https://www.buildecogroup.com | head
# Expect: HTTP 200 (not DEPLOYMENT_NOT_FOUND)

curl -s https://www.buildecogroup.com/api/
# Expect: JSON ok from backend via Vercel rewrite (not SPA HTML)
```

Browser:
- Title / navbar: **BuildEco Group** (not 2Click.in)
- Footer: buildecogroup.com / sales@buildecogroup.com

---

## Common mistakes

| Mistake | Result |
|---------|--------|
| Domain dusre / empty Vercel project pe | DEPLOYMENT_NOT_FOUND |
| Git not connected / no Production deploy | DEPLOYMENT_NOT_FOUND |
| DNS theek, domain project se remove | DEPLOYMENT_NOT_FOUND |
| Manual upload alag project mein | GitHub `main` sync nahi |
| Sirf Vercel frontend update, Emergent API purana | `/sys/console` → **Not Found** |

**Fix formula:** GitHub `main` → Vercel project Production Ready → Domains add `www.buildecogroup.com` on **same** project → Emergent backend redeploy with `ADMIN_*` env.

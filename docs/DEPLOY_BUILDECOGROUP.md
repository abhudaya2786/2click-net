# Fix www.buildecogroup.com (Vercel DEPLOYMENT_NOT_FOUND)

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

## Backend CORS (API server)

Emergent / API host `.env`:

```bash
CORS_ORIGINS=https://buildecogroup.com,https://www.buildecogroup.com,http://localhost:3000
```

API restart.

### Navbar pe "2Click.in" dikhe to

Domain theek hai — API `/branding` Mongo se purana `brand_name: "2Click.in"` bhej raha hota hai. Frontend ab isko sanitize karta hai; backend seed bhi migrate karta hai. Vercel pe latest frontend deploy karo (hard refresh / cache clear). Emergent API redeploy se DB bhi BuildEco pe update ho jayegi.

---

## Verify checklist

```bash
curl -sI https://www.buildecogroup.com | head
# Expect: HTTP 200 (not DEPLOYMENT_NOT_FOUND)

curl -s https://www.buildecogroup.com/api/branding
# After backend redeploy: brand_name should be BuildEco Group (not 2Click.in)
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
| Purana API branding DB (`2Click.in`) | Navbar pe 2Click dikhe (frontend sanitize + API redeploy se fix) |

**Fix formula:** GitHub `main` → Vercel project Production Ready → Domains add `www.buildecogroup.com` on **same** project → Emergent backend redeploy.

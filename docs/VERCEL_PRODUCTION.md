# Vercel Production — 2Click.in

**Canonical domain:** `https://2click.in`  
**Also serve:** `https://www.2click.in` → redirect to apex  
**Repo:** `abhudaya2786/2click-net`  
**Do not delete any existing Vercel project.**  
**Do not change DNS from automation** — only follow records Vercel shows after domain attach.

---

## 1. Verified repository config (ready)

| Setting | Value | File |
|---------|-------|------|
| Build command | `npm run build:vercel` | `vercel.json` |
| Output directory | `public` | `vercel.json` |
| API entry | `api/index.js` (Express via `scripts/vercel-api-entry.ts`) | build script |
| SPA fallback | Non-API routes → `/index.html` | `vercel.json` rewrites |
| API rewrite | `/api/(.*)` → `/api` (serverless function) | `vercel.json` |
| Assets | Vite hashed files under `/assets/*` (excluded from SPA catch-all) | rewrite negative lookahead |

Local verification already green: `npm run build:vercel` produces `public/` + `api/index.js`.

---

## 2. Current live status (probed 2026-08-15)

| URL | Result |
|-----|--------|
| `https://2click.in` | `404` + `x-vercel-error: DEPLOYMENT_NOT_FOUND` |
| `https://www.2click.in` | same |
| `https://temporary-flying-cygnus-dou4esu.vercel.app` | `200` HTML + `/api/health` OK (older preview) |

**Meaning:** DNS already reaches Vercel, but the **project those hostnames are linked to has no active Production deployment** (or domains point at a removed/empty project). Fix by attaching domains to the **canonical 2click-net project** and creating a Production deployment — not by rebuilding the app architecture.

---

## 3. Identify the canonical Vercel project

In [vercel.com/dashboard](https://vercel.com/dashboard):

1. Find the project connected to GitHub **`abhudaya2786/2click-net`**.  
2. Prefer the project that already has preview URL like `temporary-flying-cygnus-dou4esu` **or** the primary project named for 2click / voice-mom.  
3. **Do not delete** other projects — leave them; only change domain assignment.  
4. Open that project → **Settings → Git** and confirm production branch is `main` (or the branch you merge PRs into).

If no project is linked yet:

1. **Add New… → Project**  
2. Import `abhudaya2786/2click-net`  
3. Framework preset: Other  
4. Confirm Build Command / Output Directory match `vercel.json` (Vercel reads the file automatically)  
5. Click **Deploy**

---

## 4. Exact dashboard actions — Production deploy

1. Open the canonical project.  
2. **Deployments** → ensure latest Production deployment from `main` (or merge PR `#68` / `#67` first) succeeded.  
3. If needed: **Deployments → … → Redeploy** on the latest successful commit (**Use existing Build Cache** optional).  
4. **Settings → Environment Variables** (Production):

   | Name | Required | Notes |
   |------|----------|-------|
   | `GEMINI_API_KEY` | Optional | Live STT/MoM |
   | `OPENAI_API_KEY` | Optional | Prefer when set |
   | `AI_PROVIDER` | Optional | `gemini` / `openai` |
   | `GEMINI_MODEL` | Optional | default `gemini-2.5-flash` |
   | `PUBLIC_BASE_URL` | Recommended | `https://2click.in` |
   | WhatsApp vars | Optional | mock if empty |
   | `BILLING_PROVIDER` | Optional | keep `mock` |
   | `DATABASE_URL` | Later | **not required for first HTML/API bring-up**; required before SaaS auth |

5. **Settings → Deployment Protection** → for **Production**, disable Vercel Authentication / SSO gate so public users are not blocked.  
6. Redeploy after env changes.

---

## 5. Exact dashboard actions — Domains

1. Project → **Settings → Domains**.  
2. Add **`2click.in`**.  
3. Add **`www.2click.in`**.  
4. Set **`2click.in` as primary / canonical**.  
5. For `www`, choose **Redirect to `2click.in`** (308/301).  
6. Vercel will show DNS records. **If DNS already points at Vercel**, status should become **Valid** after the Production deployment exists.  
7. If Vercel shows a mismatch, copy **exactly** the A/CNAME (or nameservers) it displays — change Hostinger DNS only if Vercel says invalid. **Do not invent records.**

Common Vercel patterns (confirm in UI):

- Apex: `A` → `76.76.21.21` **or** Vercel nameservers  
- `www`: `CNAME` → `cname.vercel-dns.com`  

---

## 6. Post-deploy verification checklist

```bash
# HTTPS + apex
curl -sSI https://2click.in/ | head -20
# Expect: 200, server Vercel, no DEPLOYMENT_NOT_FOUND

# www → canonical
curl -sSI https://www.2click.in/ | head -20
# Expect: 307/308/301 to https://2click.in/  OR 200 if configured as alias

# SPA shell
curl -sS https://2click.in/ | grep -o 'src="/assets/[^"]*"'
# Expect: /assets/index-XXXX.js  (NOT /src/main.tsx)

# Deep links (SPA must return index.html 200)
for p in / /meetings /mom /signin /signup /inbox /field-talk /settings/voice /for-real-estate /phone; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' "https://2click.in$p")
  echo "$p $code"
done

# API
curl -sS https://2click.in/api/health
# Expect: {"ok":true,"app":"2click-voice-mom",...}

# Static
curl -sSI https://2click.in/robots.txt | head -10
curl -sSI https://2click.in/sitemap.xml | head -10
curl -sSI https://2click.in/manifest.webmanifest | head -10
```

Browser smoke:

- `/` landing  
- `/meetings`, `/mom`  
- `/api/health`  
- Hard refresh; confirm no white screen  

---

## 7. Agent limitation

This Cloud Agent is **logged out of Vercel CLI** (`npx vercel whoami` → Logged out).  
Production attach/redeploy must be done in the Vercel dashboard (or by providing a Vercel token to the environment). DNS was **not** modified by the agent.

---

## 8. After domain is green

Durable DB is still required before multi-instance SaaS auth/org — see `docs/DATABASE_AUDIT.md`.  
First Production bring-up can ship demo MoM without `DATABASE_URL`; do not claim multi-company SaaS login until DB cutover.

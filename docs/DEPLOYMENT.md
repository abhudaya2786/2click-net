# Deployment — 2Click.in

**Canonical:** https://2click.in  
**Alias:** https://www.2click.in → redirect to apex  

For the full Production runbook (dashboard clicks, env vars, curl checks), see **`docs/VERCEL_PRODUCTION.md`**.  
For persistence readiness, see **`docs/DATABASE_AUDIT.md`**.

---

## Repository config (verified)

| Item | Value |
|------|-------|
| `vercel.json` buildCommand | `npm run build:vercel` |
| outputDirectory | `public` |
| API | `/api/*` → serverless `api/index.js` (Express) |
| SPA | all other non-asset routes → `/index.html` |

```bash
npm run build:vercel   # must succeed before Production redeploy
npm test
```

---

## Live status

| Host | Status |
|------|--------|
| `2click.in` / `www.2click.in` | DNS → Vercel, but **`DEPLOYMENT_NOT_FOUND`** until Production exists on the linked project |
| Preview example | `temporary-flying-cygnus-dou4esu.vercel.app` responds 200 (older build) |

---

## Manual Vercel actions (summary)

1. Open the Vercel project linked to `abhudaya2786/2click-net` (**do not delete other projects**).  
2. Merge latest main-ready PR → **Redeploy Production**.  
3. Set Production env vars (`GEMINI_API_KEY` optional, `PUBLIC_BASE_URL=https://2click.in`).  
4. Disable Deployment Protection for Production.  
5. **Settings → Domains:** add `2click.in` + `www.2click.in`; make apex primary; redirect www → apex.  
6. Only adjust Hostinger DNS if Vercel marks records Invalid — use Vercel’s displayed records.  

**This agent does not change DNS automatically.**

---

## Hostinger static (UI only)

```bash
npm run build && npm run pack:hostinger
```

API will not run on plain Hostinger.

---

## Docker / VPS

```bash
npm run build && npm start
```

File-backed `data/` auth/org is more reliable on a single VPS than on Vercel until Postgres is wired.

# Final Upgrade Report — 2Click.in

**Branch:** `cursor/audit-repair-upgrade-972e`  
**Date:** 2026-08-15

## What was broken

- Production domain returned Vercel `DEPLOYMENT_NOT_FOUND`
- Incomplete merges previously left missing Auth/company imports (fixed on related branch lineage)
- Hard-coded personal email + temporary Vercel API host in client
- Unauthenticated AI / field dump risk
- Any user could rewrite company org
- Billing webhooks falsely acknowledged
- No public landing page (`/` → meetings)
- No recording consent / ownership facade
- Missing robots/sitemap; zoom blocked; weak SEO
- MoM TXT/DOCX exports not wired in UI

## What was repaired

- Rate limiting + auth-when-live-AI on expensive routes
- Owner-only company org updates; field visits/PDFs require auth
- Body size 12mb; sanitized errors; org phones hidden when anonymous
- Billing config honesty + webhook 501 until verified
- Removed hard-coded email; API base → `2click.in` for native fallback
- PII preprocess on `/api/minutes/generate`
- Gemini model via env (`gemini-2.5-flash` default)
- APK CI default empty server URL (bundled)

## What was upgraded

- Public landing page at `/` (honest feature claims)
- `RecordingService` + consent banner + RECORDING ACTIVE HUD
- TXT / Transcript / DOCX-XML export buttons on MoM header
- Phone Call module page with clear unsupported messaging
- SEO: robots.txt, sitemap.xml, Twitter/OG, accessible zoom
- Docs: COMPLETE_AUDIT, SECURITY_AUDIT, ARCHITECTURE, DEPLOYMENT, VOICE_COMMANDS, PRIVACY, MOBILE, TROUBLESHOOTING

## Already working (preserved)

- Demo transcript → MoM
- Auth signup/signin
- Field talk → owner inbox
- Command-session Instant Save + redaction
- PWA + Capacitor packaging
- Hostinger pack script
- 32-assertion smoke suite

## Intentionally unchanged

- Vite/React (no Next.js migration)
- Simulated BillingProvider (no fake live charges)
- Hinglish FastAPI sidecar (optional)
- Full multi-tenant DB (architecture ready, not invented)

## Remaining limitations

- Durable DB required for true Vercel multi-instance auth/org
- Meta WhatsApp signature verification still TODO
- Route-level React.lazy not fully applied (bundle still large)
- Dual MoM vs Meetings storage remains (consolidation next)
- Always-on wake word / phone call recording not available on web

## Required env

See `.env.example`. Critical: `GEMINI_API_KEY` / `OPENAI_API_KEY` (optional for demo), WhatsApp vars for live WA.

## Manual Vercel / DNS

See `docs/VERCEL_PRODUCTION.md` (dashboard steps) and `docs/DEPLOYMENT.md`.  
Database readiness: `docs/DATABASE_AUDIT.md` — **no multi-tenant SaaS auth until durable Postgres**.  
Do not change DNS from CI agents automatically.

## Verification run

```text
npm run lint  → pass
npm test      → 32 passed
npm run build → pass
npm run build:vercel → pass
```

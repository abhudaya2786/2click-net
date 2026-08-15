# 2Click.in — AI Voice Meeting & Office Intelligence

Voice → Transcript → AI Minutes → Tasks → Export / Share

> React 19 · Vite 6 · Express · Gemini/OpenAI · Capacitor · PWA · Vercel

BuildEco Group (`buildecogroup.com`) lives in `buildeco/` (Hostinger SPA + option fallbacks). Canonical GitHub copy: `abhudaya2786/new-website-buildecogroup-`.

## Quick start

```bash
npm install
cp .env.example .env.local
# optional: GEMINI_API_KEY=...
npm run dev
```

Open http://localhost:3000 — public landing at `/`, app at `/meetings`.

Without API keys the server runs in **demo mode** (paste transcript → MoM).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Vite+Express |
| `npm test` | Typecheck + API smoke |
| `npm run build` | Client + Node server |
| `npm run build:vercel` | Static `public/` + `api/index.js` |
| `npm run pack:hostinger` | Hostinger upload zip |
| `npm run android:apk` | Debug APK |

## Production

Canonical domain: **https://2click.in**

See `docs/DEPLOYMENT.md` and `docs/COMPLETE_AUDIT.md`.

## Docs

- `docs/ARCHITECTURE.md`
- `docs/SECURITY_AUDIT.md`
- `docs/VOICE_COMMANDS.md`
- `docs/PRIVACY.md`
- `docs/MOBILE.md`
- `docs/TROUBLESHOOTING.md`
- `docs/FINAL_UPGRADE_REPORT.md`

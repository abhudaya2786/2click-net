# Troubleshooting — 2Click.in

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Domain `DEPLOYMENT_NOT_FOUND` | No Vercel Production for project | Redeploy + attach domain |
| White screen on Hostinger | Serving Vite `src/main.tsx` | Upload `pack:hostinger` build |
| Mic won't start | Permission / consent | Allow mic; accept consent dialog |
| Audio MoM 503 | No AI keys | Set `GEMINI_API_KEY` or paste transcript |
| Auth lost on Vercel | Ephemeral FS | Use VPS or add durable DB |
| Field visits 401 | Auth required | Sign in |
| Org update 403 | Not owner | Sign in as owner |
| APK blank | Live URL down | Build with empty `CAPACITOR_SERVER_URL` (bundled) |
| Billing “paid” confusion | Simulated checkout | Read `/api/billing/config` — `liveCharges: false` |

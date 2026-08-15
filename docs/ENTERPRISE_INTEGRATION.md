# Enterprise Field Workforce & Voice MoM — Verification Checklist

## Local
1. `cp .env.example .env.local` and set `GEMINI_API_KEY` (optional for privacy/PDF/WhatsApp mock).
2. `npm install`
3. `npm run lint`
4. `npm run test:enterprise` (or `node scripts/enterprise-smoke.mjs`)
5. `npm run dev` → open `/settings/location`
6. Use **Field session** Start/Pause/Stop (mic permission required).
7. `curl -X POST http://127.0.0.1:3000/api/field/privacy/preview -H 'content-type: application/json' -d '{"transcriptText":"Call me at 9876543210 PAN ABCDE1234F"}'`
8. `curl -X POST http://127.0.0.1:3000/api/field/process -H 'content-type: application/json' -d '{"transcriptText":"Site review: slab casting tomorrow. Owner will share kal subah 11 baje. Phone 9876543210.","siteName":"Client Site","notifyWhatsApp":true,"generatePdf":true}'`
9. Download PDF from returned `visit.pdfDownloadPath`.
10. WhatsApp verify: `curl "http://127.0.0.1:3000/webhook?hub.mode=subscribe&hub.verify_token=2click-mom-verify&hub.challenge=123"` → `123`

## Production (Render / Hostinger VPS)
1. Set all env vars from `.env.example` (especially `PUBLIC_BASE_URL`, WhatsApp tokens, `GEMINI_API_KEY`).
2. `npm run build && npm start`
3. Point Meta webhook to `https://<host>/webhook` (or `/api/webhook/whatsapp`) with verify token.
4. Confirm `GET /api/enterprise/health` shows modules.
5. Confirm zero-audio: responses never echo `audioBase64` when `ZERO_AUDIO_RETENTION=true`.

## Non-destructive merge notes
- Existing `/api/generate-mom`, meetings, privacy, billing routes unchanged in path.
- New code lives under `server/{config,controllers,services,routes}` and `src/utils/audioDspRecorder.ts`, `offlineAudioQueue.ts`, `components/field/`.

# Architecture — 2Click.in Voice MoM

## Stack

- **Client:** React 19 + Vite 6 + TypeScript (`src/`)
- **Server:** Express (`server.ts` + `server/`)
- **AI:** `AIProvider` — Gemini / OpenAI / Demo (`server/ai/`)
- **Speech:** `SpeechProvider` — Gemini / OpenAI / Demo (`server/speech/`)
- **Mobile:** Capacitor + Android (`android/`), PWA (`static-pwa/`)
- **Deploy:** Vercel (`vercel.json`, `build:vercel`) or Docker / VPS

## Request flow

```
Browser / APK
  → Vite UI (SPA routes via history.pushState)
  → /api/* Express
       → Auth (optional / required when live AI)
       → Rate limit
       → AI / Speech / Org / Field / Billing stubs
```

## Canonical services

| Concern | Canonical module |
|---------|------------------|
| Recording state | `src/utils/recordingService.ts` |
| Command sessions | `src/utils/commandSessionController.ts` |
| Field chunked audio | `src/utils/audioDspRecorder.ts` |
| Studio float32 | `src/utils/audioFloat32.ts` |
| MoM generation | `POST /api/generate-mom` (+ `/api/minutes/generate`) |
| Instant Save | `POST /api/v1/conversations` |
| Company work-talk | `server/org/` |
| Field PDF | `server/services/pdfService.ts` |

## Public vs private routes

- **Public SEO:** `/`, `/for-real-estate`, `/signup`, `/signin`
- **App (noindex via robots.txt):** `/meetings`, `/mom`, `/inbox`, `/settings`, …

## Intentionally unchanged

- Vite/React (not Next.js)
- Capacitor Android packaging scripts
- Demo AI provider for offline MoM
- Hinglish FastAPI sidecar (optional; not on Vercel)

# 2Click.in — Voice Minutes of Meeting AI

This repository now hosts **Voice MoM** (from [`abhudaya2786/voice-mom`](https://github.com/abhudaya2786/voice-mom)).

> **BuildEco Group (`buildecogroup.com`) is a separate product/repo and is not affected by this app.**

## Features

- Record or upload meeting audio
- Speech transcription (Gemini / OpenAI)
- Structured Minutes of Meeting, decisions, action items
- Meeting chat copilot, email draft, privacy & schedule tools

## Deploy (Vercel)

1. Import GitHub repo `abhudaya2786/2click-net` in [vercel.com/new](https://vercel.com/new)
2. Set env `GEMINI_API_KEY` (optional — demo MoM works without it)
3. Deploy — Express entry is `server.ts` (default export); UI builds into `public/`
4. Project → Settings → Deployment Protection → **disable** Vercel Authentication for Production (otherwise public users get login wall)
5. Domains → add `2click.in` + `www` → update Hostinger DNS:
   - `A` / nameservers as shown by Vercel (remove Hostinger website pointing)

```bash
npx vercel --prod
```

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
cp .env.example .env.local
# optional: set GEMINI_API_KEY=... for live AI / audio transcription
npm run dev
```

Open http://localhost:3000

Without an API key the server runs in **demo mode**: paste a transcript to generate MoM; live audio transcription still needs a key.

## Test

```bash
npm test          # typecheck + API smoke suite (spawns its own server)
npm run test:smoke
```

## Production (Docker / VPS)

```bash
npm run build
npm start
```

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Optional (demo without it) | Live transcription + MoM |
| `OPENAI_API_KEY` | Optional | Prefer OpenAI when set |
| `PORT` | Optional | Default `3000` |

## Source

Application UI: `src/`  
AI / speech / billing adapters: `server/`  
HTTP entry: `server.ts`

# 2Click.in — Voice Minutes of Meeting AI

This repository now hosts **Voice MoM** (from [`abhudaya2786/voice-mom`](https://github.com/abhudaya2786/voice-mom)).

> **BuildEco Group (`buildecogroup.com`) is a separate product/repo and is not affected by this app.**

## Features

- Record or upload meeting audio
- Speech transcription (Gemini / OpenAI)
- Structured Minutes of Meeting, decisions, action items
- Meeting chat copilot, email draft, privacy & schedule tools

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
cp .env.example .env.local
# set GEMINI_API_KEY=...
npm run dev
```

Open http://localhost:3000

## Production

```bash
npm run build
npm start
```

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Recommended | Transcription + MoM |
| `OPENAI_API_KEY` | Optional | Prefer OpenAI when set |
| `PORT` | Optional | Default `3000` |

## Source

Application UI: `src/`  
AI / speech / billing adapters: `server/`  
HTTP entry: `server.ts`

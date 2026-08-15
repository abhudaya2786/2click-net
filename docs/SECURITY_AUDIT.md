# Security Audit — 2Click.in

**Date:** 2026-08-15  
**Scope:** Repository secrets, authZ, AI cost exposure, webhooks, uploads

## Summary

| Area | Status |
|------|--------|
| Client-bundled API secrets | **Pass** — no GEMINI/OPENAI/WhatsApp secrets in `src/` |
| AI route abuse | **Mitigated** — rate limits + require auth when live keys present |
| Company org privilege | **Mitigated** — only owner (or first claim) can PUT |
| Field visit list / notify | **Mitigated** — require auth |
| Field PDF download | **Capability URL** — opaque visit-id filenames + rate limit (shareable after process) |
| Field analytics | **Mitigated** — require auth when live AI keys present; open in demo |
| Billing webhooks | **Hardened** — return 501 until signature verification is configured |
| Multi-tenant isolation | **Open** — single org file; not SaaS-grade yet |
| Durable auth on Vercel | **Open** — file store ephemeral on serverless |

## Secrets scan

- No hard-coded live API keys found in source.
- Removed hard-coded personal email from privacy defaults.
- Default WhatsApp verify token in `.env.example` must be rotated in production.
- Native API base now defaults to `https://2click.in` (not a temporary preview host).

## Controls added

1. `server/security/middleware.ts` — IP rate limiting, `requireAuth`, `requireAuthWhenLiveAi`, error sanitization  
2. Body JSON limit reduced **40mb → 12mb**  
3. Org phones hidden for anonymous GET  
4. Stripe/Razorpay webhook endpoints no longer claim `received: true` without verification  

## Remaining P1+

- Persist users/org/meetings in a real database before multi-instance Vercel production.
- Meta WhatsApp `X-Hub-Signature-256` verification.
- Enforce plan quotas on MoM/STT.
- CSRF for cookie sessions if cookies are introduced (current auth is bearer token).

## Reporting

Do not paste production secrets into issues or chat. Rotate any key that may have been shared.

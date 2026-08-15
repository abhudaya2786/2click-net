# 2Click.in — Complete Repository Audit

**Date:** 2026-08-15  
**Repo:** `abhudaya2786/2click-net`  
**Stack:** React 19 · Vite 6 · TypeScript · Express · Gemini/OpenAI · PDFKit · Capacitor · PWA · Vercel  
**Audit mode:** Read-only inspection first; repairs tracked in follow-up commits.

**Severity:** P0 = production blocker · P1 = critical · P2 = important · P3 = enhancement

---

## Executive verdict

The codebase is a **working Voice MoM + real-estate field-talk product** with demo AI fallback, PWA, and Android packaging. It is **not yet production-safe for commercial SaaS**:

- Custom domain `https://2click.in` returns Vercel `DEPLOYMENT_NOT_FOUND`.
- Incomplete merges previously left `main` unable to typecheck (auth/company imports missing) — repaired on related branches.
- Most AI/data APIs are **unauthenticated**; billing is **simulated**; persistence is **in-memory / local JSON / localStorage**.
- Multiple parallel recording stacks and dual MoM vs Meetings UIs create maintenance and privacy risk.

**Do not rebuild.** Repair in place, consolidate duplicates, harden security, upgrade UX.

---

## 1. Architecture

| Layer | Path | Status |
|-------|------|--------|
| Client | `src/` Vite + React 19 | Working |
| HTTP | `server.ts` Express monolith | Working (demo) |
| AI | `server/ai/` | Gemini / OpenAI / Demo |
| Speech | `server/speech/` | Gemini / OpenAI / Demo |
| Auth | `server/auth/` | File JSON sessions |
| Org | `server/org/` | Single-tenant JSON |
| Enterprise | `server/routes/enterpriseRoutes.ts` | Field / WhatsApp / PDF |
| Hinglish | `hinglish-normalizer/` | Separate FastAPI (not wired to Vercel) |
| Mobile | Capacitor + `android/` | Debug APK scripts |
| Deploy | `vercel.json` + `Dockerfile` | Config OK; domain broken |

**Findings**

| ID | Sev | Finding |
|----|-----|---------|
| A-P0-1 | P0 | `2click.in` / `www` → Vercel `DEPLOYMENT_NOT_FOUND` |
| A-P0-2 | P0 | Vercel serverless + local FS (`data/auth`, PDFs) = ephemeral prod data |
| A-P1-1 | P1 | Dual product surfaces: `/mom` (localStorage) vs `/meetings` (`meetingDb`) |
| A-P1-2 | P1 | Hinglish sidecar duplicates `/api/v1/conversations` path |
| A-P2-1 | P2 | `App.tsx` ~1300-line god component / custom history router |
| A-P3-1 | P3 | Dockerfile installs all deps including dev |

---

## 2. Frontend

**Routes (custom `pushState`):**  
`/meetings`, `/meetings/new`, `/meetings/:id`, `/mom`, `/signin`, `/signup`, `/account`, `/inbox`, `/field-talk`, `/for-real-estate`, `/settings/*`, `/recordings`, `/company`

**Findings**

| ID | Sev | Finding |
|----|-----|---------|
| F-P0-1 | P0 | Hard-coded API base `temporary-flying-cygnus-dou4esu.vercel.app` in `src/utils/apiBase.ts` |
| F-P0-2 | P0 | Hard-coded email `shrinet.info@gmail.com` in PrivacyContext / meetingDatabase / TranscriptViewer |
| F-P1-1 | P1 | Duplicate `TranscriptViewer`, action-items, decisions components |
| F-P1-2 | P1 | Dual privacy + dual schedule state machines |
| F-P1-3 | P1 | No public marketing landing at `/` (defaults to `/meetings`) |
| F-P2-1 | P2 | ~84 `console.*` calls; 0 TODO/FIXME |
| F-P2-2 | P2 | Unused `downloadAsMarkdown` / `downloadAsJSON` |
| F-P3-1 | P3 | Mobile “More” jumps to company settings, not overflow menu |

---

## 3. Backend

**Core routes:** health, generate-mom, conversations, transcribe, minutes, chat, email, meetings CRUD, schedules, privacy stubs, billing stubs  
**Auth:** signup/signin/me/signout  
**Org:** company org + work-talk  
**Enterprise:** WhatsApp webhook, field process, PDF static, analytics

| ID | Sev | Finding |
|----|-----|---------|
| B-P0-1 | P0 | AI/STT/field routes unauthenticated — key burn / cost sink |
| B-P0-2 | P0 | Auth does not gate meetings / MoM / privacy / billing |
| B-P0-3 | P0 | Any signed-in user can `PUT /api/v1/company/org` (no owner check) |
| B-P0-4 | P0 | Public `GET /api/field/visits` + static PDFs |
| B-P1-1 | P1 | No rate limit; `express.json({ limit: '40mb' })` |
| B-P1-2 | P1 | WhatsApp webhook no Meta signature verify |
| B-P1-3 | P1 | Conversations IDOR via `user_id` query |
| B-P1-4 | P1 | `/api/minutes/generate` skips PII preprocess used by generate-mom |
| B-P2-1 | P2 | Duplicate MoM paths (generate-mom vs minutes vs domain MoM) |
| B-P2-2 | P2 | Model ID inconsistency (`gemini-3.7-flash` vs `gemini-2.5-flash`) |
| B-P2-3 | P2 | Stub privacy purge/export/signed-url always succeed |

---

## 4. AI

| Provider | Path | Notes |
|----------|------|-------|
| Gemini | `server/ai/GeminiAIProvider.ts` | Structured minutes |
| OpenAI | `server/ai/OpenAIProvider.ts` | Prefer when key set |
| Demo | `server/ai/DemoAIProvider.ts` | Heuristic offline |
| Domain | `server/services/geminiDomainService.ts` | Field MoM |

| ID | Sev | Finding |
|----|-----|---------|
| AI-P1-1 | P1 | Client `meetingDatabase` silent mock minutes on API failure |
| AI-P1-2 | P1 | Chat/email hardcode Gemini, bypass `getAIProvider` |
| AI-P2-1 | P2 | No shared “never invent facts” system prompt enforcement across all paths |
| AI-P3-1 | P3 | No confidence / uncertainty field in all schemas |

---

## 5. Speech-to-text

| Provider | Path |
|----------|------|
| Gemini | `server/speech/GeminiSpeechProvider.ts` |
| OpenAI Whisper | `server/speech/OpenAISpeechProvider.ts` |
| Demo | fails closed without key for audio |

| ID | Sev | Finding |
|----|-----|---------|
| STT-P1-1 | P1 | No chunked long-meeting server orchestration for `/api/transcribe` (client field path has chunking) |
| STT-P2-1 | P2 | Speaker labels heuristic / not diarization-guaranteed |
| STT-P3-1 | P3 | Confidence rarely surfaced to UI |

---

## 6. Recording

| Stack | Canonical for |
|-------|---------------|
| `commandSessionController` | Wake/command sessions |
| `audioDspRecorder` + `offlineAudioQueue` | Field Talk |
| `StudioAudioRecorder` (`audioFloat32`) | Meeting studio |
| `AudioRecorder` / `LiveMeetingMonitor` | Legacy `/mom` |

| ID | Sev | Finding |
|----|-----|---------|
| REC-P0-1 | P0 | Five mic stacks can contend; no single RecordingService ownership |
| REC-P1-1 | P1 | Consent UI inconsistent across MoM / studio / field |
| REC-P1-2 | P1 | Visible “RECORDING ACTIVE” not universal |
| REC-P2-1 | P2 | Duplicate `blobToBase64` helpers |

---

## 7. Voice commands

`VoiceContext` → `wakeWordProvider` + `voiceCommandProvider` + settings at `/settings/voice`

| ID | Sev | Finding |
|----|-----|---------|
| VC-P1-1 | P1 | Browser cannot guarantee always-on background wake word (docs must say so) |
| VC-P2-1 | P2 | Command aliases need Hindi/English/Hinglish completeness pass |
| VC-P3-1 | P3 | Native Android wake-word architecture not stubbed |

---

## 8. Wake word

| ID | Sev | Finding |
|----|-----|---------|
| WW-P1-1 | P1 | Works only while app open + mic permission |
| WW-P2-1 | P2 | Banner can overlap mobile bottom nav |
| WW-P3-1 | P3 | Prepare Capacitor plugin interface for future native |

---

## 9. Scheduling

`ScheduleContext` (READY windows) vs App `scheduledEvents` / `AutoScheduleModal`

| ID | Sev | Finding |
|----|-----|---------|
| SCH-P1-1 | P1 | Dual schedule models |
| SCH-P1-2 | P1 | READY must never auto-open mic without consent (verify all paths) |
| SCH-P2-1 | P2 | Sample schedules auto-seeded |

---

## 10. Privacy

Server `piiFilterService` + client `privacyUtils` + `PrivacyContext` + MoM `PrivacyShieldModal`

| ID | Sev | Finding |
|----|-----|---------|
| PR-P0-1 | P0 | Hard-coded user email in privacy defaults |
| PR-P1-1 | P1 | Dual privacy systems |
| PR-P1-2 | P1 | Retention auto-purge API is stub |
| PR-P2-1 | P2 | Zero-audio retention is response stripping only |
| PR-P3-1 | P3 | Separate audio vs MoM retention UX incomplete |

---

## 11. PDF / export

Server PDFKit for field visits; client MoM uses `window.print()`; markdown helpers unused

| ID | Sev | Finding |
|----|-----|---------|
| PDF-P1-1 | P1 | No professional MoM PDF via PDFKit for core meetings |
| PDF-P1-2 | P1 | No DOCX / dedicated TXT export wired in UI |
| PDF-P2-1 | P2 | Field PDF static path unauthenticated |
| PDF-P3-1 | P3 | Company logo/branding in PDF incomplete |

---

## 12. PWA

`static-pwa/` manifest + `sw.js`; registered in `main.tsx` (skipped on native)

| ID | Sev | Finding |
|----|-----|---------|
| PWA-P2-1 | P2 | SW cache-first may stale hashed assets |
| PWA-P2-2 | P2 | Icons very small file size / combined maskable purpose |
| PWA-P3-1 | P3 | Manifest missing `id` / `scope` |

---

## 13. Android

`in.twoclick.mom`; RECORD_AUDIO declared; LOCATION missing despite geofence UI

| ID | Sev | Finding |
|----|-----|---------|
| AND-P1-1 | P1 | CI default `CAPACITOR_SERVER_URL=https://2click.in` points at dead deploy |
| AND-P1-2 | P1 | No LOCATION permission while GeofenceContext uses GPS |
| AND-P1-3 | P1 | `file_paths.xml` path="." overly broad |
| AND-P2-1 | P2 | Unused Capacitor App / Splash / StatusBar JS usage |
| AND-P3-1 | P3 | `android:allowBackup="true"` |

---

## 14. Vercel

`build:vercel` → `public/` + `api/index.js`; rewrites `/api/*` → `/api`

| ID | Sev | Finding |
|----|-----|---------|
| V-P0-1 | P0 | Production deployment missing for domain |
| V-P1-1 | P1 | No durable store for auth/org on serverless |
| V-P2-1 | P2 | Body size vs serverless payload limits |
| V-P3-1 | P3 | Deployment Protection must be disabled for public users |

---

## 15. SEO

| ID | Sev | Finding |
|----|-----|---------|
| SEO-P1-1 | P1 | No `robots.txt` / `sitemap.xml` |
| SEO-P2-1 | P2 | No `og:image` / Twitter cards |
| SEO-P2-2 | P2 | Private app routes not noindex |
| SEO-P3-1 | P3 | Structured data absent |

---

## 16. Performance

| ID | Sev | Finding |
|----|-----|---------|
| PERF-P1-1 | P1 | ~1 MB JS monolith; no route lazy loading |
| PERF-P2-1 | P2 | Long transcript rendering not virtualized |
| PERF-P3-1 | P3 | Large Capacitor/pdfkit surface on server only (OK) |

---

## 17. Accessibility

| ID | Sev | Finding |
|----|-----|---------|
| A11Y-P1-1 | P1 | ~352 buttons vs ~4 `aria-label` |
| A11Y-P1-2 | P1 | `user-scalable=no` blocks zoom |
| A11Y-P2-1 | P2 | Many dialogs lack `role="dialog"` / focus trap |
| A11Y-P3-1 | P3 | Color contrast audit incomplete |

---

## 18. Security

| ID | Sev | Finding |
|----|-----|---------|
| SEC-P0-1 | P0 | Unauthenticated AI cost endpoints |
| SEC-P0-2 | P0 | Org privilege escalation |
| SEC-P0-3 | P0 | Public field visit + PDF dump |
| SEC-P1-1 | P1 | No CORS/helmet/rate-limit |
| SEC-P1-2 | P1 | Billing webhooks always accept |
| SEC-P1-3 | P1 | Token via `?token=` query allowed |
| SEC-P2-1 | P2 | Password min length 6; scrypt defaults |
| SEC-P3-1 | P3 | Error messages may leak internal detail |

**Good:** No GEMINI/OPENAI keys in client bundle. `.env` / `data/` gitignored.

---

## 19. Mobile UX

| ID | Sev | Finding |
|----|-----|---------|
| MUX-P1-1 | P1 | Voice banner vs bottom nav collision |
| MUX-P2-1 | P2 | Safe-area mostly present |
| MUX-P3-1 | P3 | Install banner OK |

---

## 20. Commercial SaaS readiness

| Capability | Reality |
|------------|---------|
| Multi-tenant | No (single org file) |
| Roles | Soft (client-supplied) |
| Billing | Simulated adapters |
| Quotas | Not enforced |
| Durable DB | Not present |

| ID | Sev | Finding |
|----|-----|---------|
| SaaS-P0-1 | P0 | Fake live Stripe checkout IDs |
| SaaS-P1-1 | P1 | Plan limits not enforced on MoM/STT |
| SaaS-P2-1 | P2 | BillingProvider abstraction exists — keep, don’t fake success |
| SaaS-P3-1 | P3 | Future roles Super Admin → Employee not modeled in DB |

---

## Already working (preserve)

- Demo-mode MoM from transcript without API keys  
- `/api/generate-mom` structured minutes  
- Auth signup/signin (file store)  
- Field Talk → owner inbox flow  
- Command-session Instant Save + trigger redaction  
- PWA install + Capacitor APK scripts  
- Hostinger production pack script  
- Smoke test suite (32 assertions)  
- Enterprise field PDF + WhatsApp mock path  

---

## Repair priority order

1. **P0 build/runtime + domain docs**  
2. **Remove hard-coded email / stabilize API base**  
3. **Auth + rate limit on AI routes; owner-only org PUT**  
4. **Public landing page at `/`**  
5. **RecordingService facade + consent + RECORDING ACTIVE**  
6. **MoM PDF/TXT/DOCX exports**  
7. **Privacy retention UI truthfulness**  
8. **SEO robots/sitemap; lazy routes; a11y labels**  
9. **Security + architecture docs**  
10. **Tests expansion; final report**

---

## Out of scope / intentional non-claims

- Always-on background wake word on web  
- Universal phone-call recording  
- Real Stripe/Razorpay charge flow without merchant credentials  
- Automatic DNS changes  
- Migrating to Next.js  

---

*End of Phase 1 audit. Implementation continues in subsequent commits.*

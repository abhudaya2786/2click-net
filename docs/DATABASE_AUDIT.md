# Database Audit — 2Click.in

**Date:** 2026-08-15  
**Status:** Audit only — **no migration implemented**  
**Rule:** Do not implement multi-tenant SaaS auth until durable persistence is ready.

---

## 1. Current persistence

| Layer | Mechanism | Location | Survives serverless cold start? | Multi-instance safe? |
|-------|-----------|----------|----------------------------------|----------------------|
| Auth users/sessions | Local JSON files | `data/auth/users.json`, `sessions.json` | No on Vercel | No |
| Company org + work-talk | Local JSON files | `data/company/org.json`, `reports.json` | No on Vercel | No |
| Field visits | Local JSON file | `data/field-visits/visits.json` | No on Vercel | No |
| Field PDFs | Local filesystem | `data/field-pdfs/` | No on Vercel | No |
| Instant Save conversations | In-memory array | `instantConversations` in `server.ts` | No | No |
| Meetings / schedules / consents / audit (API) | In-memory object | `memory` in `server.ts` | No | No |
| MoM meetings (legacy `/mom`) | Browser `localStorage` | `voice_mom_saved_meetings_v1` etc. | N/A (client) | Per-browser only |
| Meetings studio DB | Browser `localStorage` | `voice_mom_db_*_v2` keys via `meetingDatabase.ts` | N/A | Per-browser only |
| Auth token/user | Browser `localStorage` | `voice_mom_auth_*` | N/A | Per-browser only |
| Recording blobs | IndexedDB + Capacitor Filesystem | `recordingFileStore.ts` | N/A | Per-device only |
| Offline field chunks | IndexedDB | `offlineAudioQueue.ts` | N/A | Per-device only |
| Billing subscription state | Stub / in-memory | `server.ts` billing routes | No | No |
| Rate-limit buckets | In-memory `Map` | `server/security/middleware.ts` | No | No (OK for soft limit) |
| Hinglish sidecar | Optional Postgres | `hinglish-normalizer` `DATABASE_URL` | Separate service | Only if configured |

**There is no production PostgreSQL/Supabase wired into the main Express app today.**

---

## 2. Data currently stored

### Server (file / memory)

- Users: `userId`, password hash/salt, display name, timestamps  
- Sessions: bearer token, expiry  
- Company org: name, owner, phones, report recipients, work hours  
- Work-talk reports: employee text, delivery metadata  
- Field visits: transcript summary, decisions, PDF path, geo metadata  
- Instant conversations: user-scoped voice notes (memory, max 500)  
- Meetings API stubs: title/body blobs in RAM  

### Client (browser / device)

- MoM list + privacy + schedule + theme  
- Full meeting graph: participants, recordings metadata, transcripts, minutes, decisions, action items, schedules  
- Auth token + public user profile  
- Audio blobs in IndexedDB / native filesystem  

---

## 3. Data that must become durable

**Before multi-instance SaaS auth / org:**

| Priority | Entity | Why |
|----------|--------|-----|
| P0 | `users` | Login must survive redeploys |
| P0 | `sessions` | Tokens must validate across instances |
| P0 | `companies` / `org_members` | Isolation + owner RBAC |
| P0 | `work_talk_reports` | Owner inbox cannot be RAM/file-on-lambda |
| P1 | `meetings`, `minutes`, `action_items`, `decisions` | Core product history |
| P1 | `transcripts` (text) | Audit + MoM regeneration |
| P1 | `field_visits` + PDF object storage | Enterprise field path |
| P2 | `conversations` Instant Save | Command-session notes |
| P2 | `consents`, `audit_logs`, `retention_policies` | Privacy compliance claims |
| P2 | `subscriptions`, `usage_events` | When billing goes live |
| P3 | Audio blobs | Prefer object storage (S3/R2); short retention |

---

## 4. Multi-instance problems (Vercel today)

1. **Ephemeral filesystem** — `data/auth`, `data/company`, PDFs disappear between invocations / instances.  
2. **In-memory meetings & conversations** — each lambda has its own empty store.  
3. **Auth split-brain** — signup on instance A, signin on instance B → 401.  
4. **Org PUT ownership** — owner claim stored in a file that may not exist on next cold start.  
5. **Client-only meetings** — different browsers/devices never sync.  
6. **PDF URLs** — `/api/field/pdfs/*` broken when file not on that instance.  

**Conclusion:** Domain can go live for demo MoM (transcript → AI) without DB, but **durable DB is a hard gate** for SaaS auth + company isolation.

---

## 5. Authentication requirements (post-DB)

- Password hashes remain server-side (scrypt or Argon2)  
- Sessions or JWT with revocation list in DB  
- Stop accepting `?token=` query long-term  
- Optional: refresh tokens, device sessions  
- Do **not** invent multi-tenant auth until `users` + `sessions` + `company_members` exist  

---

## 6. Organization / company isolation requirements

Required model (future):

- `companies` (id, name, settings)  
- `company_members` (company_id, user_id, role: owner|admin|manager|employee)  
- Row-level filters: every work-talk / meeting / field visit scoped by `company_id`  
- Owner-only org settings (already partially enforced in code — needs durable owner id)  

**Current gap:** single shared `org.json` — not multi-tenant.

---

## 7. Recommended PostgreSQL / Supabase architecture

### Option A — Supabase Postgres (recommended for speed)

- Managed Postgres + Auth optional later  
- Storage bucket for PDFs / audio  
- Env: `DATABASE_URL` (or Supabase URL + service role **server-only**)  

### Option B — Neon / Railway Postgres

Same schema; object storage via Cloudflare R2 or S3.

### Suggested schema (v1)

```text
users(id, user_id unique, display_name, password_hash, password_salt, created_at)
sessions(token hash PK, user_id FK, expires_at)
companies(id, name, industry, settings jsonb, created_at)
company_members(company_id, user_id, role, created_at) PK(company_id,user_id)
meetings(id, company_id, owner_user_id, title, state, payload jsonb, created_at)
minutes(id, meeting_id, summary, provider, model, created_at)
action_items(id, meeting_id, task, owner, deadline, priority, status)
decisions(id, meeting_id, text)
transcripts(id, meeting_id, segments jsonb)
work_talk_reports(id, company_id, employee_user_id, text, summary, created_at)
field_visits(id, company_id, payload jsonb, pdf_object_key)
conversations(id, user_id, company_id nullable, raw_text, summary, created_at)
audit_logs(id, company_id, actor_user_id, action, meta jsonb, created_at)
```

Use **service role only on Express**; never expose service keys to `VITE_*`.

---

## 8. Migration plan (do not execute yet)

### Phase M0 — Document & freeze (this doc)

- No multi-tenant auth rewrite  
- Keep file/memory/localStorage working for demo  

### Phase M1 — Provision DB

- Create Supabase/Neon project  
- Add `DATABASE_URL` to Vercel Production env  
- Add migration runner (e.g. `node-pg-migrate` or Supabase SQL)  

### Phase M2 — Dual-write adapters

- Implement `UserStore` / `OrgStore` interfaces  
- File store remains fallback when `DATABASE_URL` unset  
- Postgres adapters when set  
- Feature flag: `PERSISTENCE_DRIVER=file|postgres`  

### Phase M3 — Cut over auth + org

- Migrate any existing `data/auth` JSON once (one-shot script)  
- Sessions only in DB  
- Company members table enforces isolation  

### Phase M4 — Meetings & field

- Move meetings API off in-memory  
- PDFs → object storage; DB stores keys  
- Client `meetingDb` gradually syncs to API instead of localStorage-only  

### Phase M5 — Soft-delete local-only claims

- Privacy purge / retention becomes real SQL jobs  
- Billing usage events durable  

**Stop condition:** Until M3 is complete, do **not** market multi-company SaaS login as production-ready.

---

## 9. What stays browser-local (OK)

- Theme preference  
- Recording consent acknowledgement cache  
- Draft audio blobs before upload  
- Offline queue until sync  

---

## 10. Verification checklist before SaaS auth launch

- [ ] `DATABASE_URL` set on Vercel Production  
- [ ] Signup → redeploy → signin still works  
- [ ] Two concurrent instances share sessions  
- [ ] Company A cannot read Company B work-talk  
- [ ] Field PDF fetch works after cold start  
- [ ] Backup / point-in-time recovery enabled  

---

*End of database audit. No schema migration was applied in this change.*

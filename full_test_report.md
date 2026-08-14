# Full test report — Voice MoM (2026-08-14)

## Automated (repo)

| Check | Result |
|------|--------|
| `npm test` (tsc + API smoke 32) | PASS |
| `npm run build` | PASS |
| `pack:hostinger` (built `/assets/*.js` + `.htaccess`) | PASS |
| APK `in.twoclick.mom` present (bundled debug) | PASS |

## Live sites

| URL | Result | Notes |
|-----|--------|-------|
| https://www.2click.in | FAIL — blank white | Hostinger serves source `index.html` → `/src/main.tsx` as `Content-Type: text/plain` |
| https://2click.in | FAIL — same | No Node API (`/api/health` returns HTML) |
| https://temporary-flying-cygnus-dou4esu.vercel.app | PASS | UI + `/api/health` + generate-mom OK |
| https://voice-mom-2click.vercel.app | FAIL for public | Vercel SSO / Deployment Protection |
| http://127.0.0.1:3000 | PASS | Local MoM UI + API OK |

## www.2click.in root cause

- `platform: hostinger`
- Script: `src="/src/main.tsx"` (not built assets)
- `GET /src/main.tsx` → `content-type: text/plain` → browser blocks module → white screen

## Fix for www.2click.in

Upload `hostinger-mom-upload.tar.gz` contents into `public_html` (replace old files), **or** point DNS to Vercel.

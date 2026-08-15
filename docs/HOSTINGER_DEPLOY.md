# Fix blank white screen on www.2click.in (Hostinger)

## Root cause

Hostinger was serving the **Vite source** `index.html`:

```html
<script type="module" src="/src/main.tsx"></script>
```

`GET /src/main.tsx` returns `Content-Type: text/plain`, so Chrome blocks the module and the page stays white.

## Current status (2026-08-15)

`https://2click.in` and `https://www.2click.in` DNS point at **Vercel**, but return `DEPLOYMENT_NOT_FOUND` (no live production deployment for the linked project).

- Working full-stack app (UI + `/api`): https://temporary-flying-cygnus-dou4esu.vercel.app
- Local: `npm run dev` → http://127.0.0.1:3000

### Restore the custom domain

1. In Vercel: import/link `abhudaya2786/2click-net`, set `GEMINI_API_KEY` (optional), deploy Production
2. Project → Settings → Domains → ensure `2click.in` + `www.2click.in` are assigned to that project
3. Disable Deployment Protection (Vercel Authentication) for Production so public users are not blocked
4. Hard refresh — HTML must load `/assets/index-*.js`, never `/src/main.tsx`

If you prefer Hostinger static hosting instead, use the pack below (API will not run on plain Hostinger).

## Fix (Hostinger static upload)

Hostinger white-screen root cause: `public_html` was serving Vite **dev** HTML:

```html
<script type="module" src="/src/main.tsx"></script>
```

`.tsx` is served as `text/plain` → Chrome blocks the module → blank page.

Upload a **production Vite build** (hashed `/assets/*.js` + `/assets/*.css`) — never upload `/src`.

```bash
npm run build
npm run pack:hostinger
```

Then upload **everything inside** `dist/hostinger-upload/` into Hostinger `public_html` (replace old `index.html` and remove any leftover `/src` folder).

Or extract:

```bash
tar -xzf dist/hostinger-mom-upload.tar.gz -C /path/to/public_html
```

Artifacts also include `hostinger-mom-upload.zip` for File Manager.

The pack includes `.htaccess` that:

- Sets JS/CSS MIME types
- SPA-rewrites unknown routes to `index.html`
- 404s `/src/*.tsx` so source modules cannot load by mistake

### Minimal workaround (no zip)

Replace `public_html/index.html` with a redirect to the Vercel app (see `hostinger_index_redirect.html` artifact).

## API note

Static Hostinger hosting does **not** run the Node `/api/*` server. For Instant Save / Gemini MoM:

- Prefer deploying the full app on **Vercel**, **or**
- Point `2click.in` DNS to Vercel, **or**
- Put a Node backend on a VPS and proxy `/api`.

## Verify after upload

```bash
curl -sS https://www.2click.in/ | grep -o 'src="[^"]*"'
# Must show /assets/index-XXXX.js — NOT /src/main.tsx
curl -sSI https://www.2click.in/assets/index-XXXX.js | grep -i content-type
# Expect application/javascript (or text/javascript)
```

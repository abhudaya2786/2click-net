# Hostinger — fix www.2click.in white screen

## Root cause
`public_html/index.html` still contains Vite **dev** entry:

```html
<script type="module" src="/src/main.tsx"></script>
```

Hostinger serves `.tsx` as `Content-Type: text/plain` → browser blocks the module → **white screen**.

Google “Construction Super App” is **old SEO cache**, separate from the white screen.

## Fix (do this in Hostinger File Manager)

1. Open domain **public_html** (www.2click.in root).
2. **Delete** old files: especially `index.html`, any `src/` folder, old construction app files.
3. Upload **`hostinger-mom-upload.zip`** from artifacts / `dist/` and extract **into** `public_html` (so you see `public_html/index.html` + `public_html/assets/`).
4. Open `public_html/index.html` and confirm it has `/assets/....js` — **not** `/src/main.tsx`.
5. Browser hard refresh: `Ctrl+Shift+R` (or mobile clear cache).

### Temporary 1-file fix
Upload `REPLACE_public_html_index.html` as `public_html/index.html` only — redirects to working Vercel app.

## Build locally
```bash
npm run build
npm run pack:hostinger
```

## Google title still old?
After live HTML title changes to Voice MoM, use Google Search Console → URL Inspection → Request indexing for `https://www.2click.in/`.

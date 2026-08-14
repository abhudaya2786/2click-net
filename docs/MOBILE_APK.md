# Mobile app & APK — 2Click Voice MoM

## Why you saw a blank white screen on 2click.in

Hostinger was serving the **Vite source** `index.html` (`<script src="/src/main.tsx">`).  
Browsers refuse that module (wrong MIME / no bundler) → **empty white page**.

**Fix:** upload the **built** files from `npm run pack:hostinger` into `public_html`  
(or point the domain to Vercel). Never upload the repo root / `src/` as the website.

## Mobile website (PWA)

- Bottom navigation on phones
- Safe-area padding
- Installable PWA (`manifest.webmanifest` + service worker)

## Android APK (Capacitor)

Package ID: `in.twoclick.mom`

**Default mode = bundled UI** (assets inside the APK) so the app is not white when Hostinger is broken.  
`/api` calls are rewritten to `VITE_API_BASE_URL`.

```bash
export VITE_API_BASE_URL=https://your-working-mom-host.example
npm run android:apk
# → dist/2click-mom.apk
```

Optional live WebView wrapper (only if that URL already shows the UI, not white):

```bash
export CAPACITOR_SERVER_URL=https://your-working-mom-host.example
npm run android:apk
```

### GitHub Actions

**Actions → Build Android APK → Run workflow**

## Hostinger static upload

```bash
export VITE_API_BASE_URL=https://your-vercel-mom.example
npm run pack:hostinger
# upload dist/hostinger-upload/* → public_html
```

Shared Hostinger still cannot run Node APIs — use Vercel/VPS for the backend, or point DNS fully to Vercel.

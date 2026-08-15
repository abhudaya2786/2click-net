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
App name: **2Click MoM**

**Default mode = bundled UI** (assets inside the APK) so the app works even when `2click.in` Production is not live yet.  
`/api` calls are rewritten to `VITE_API_BASE_URL` (baked at build time).

```bash
# Bundled APK (recommended while Production domain is DEPLOYMENT_NOT_FOUND)
export VITE_API_BASE_URL=https://temporary-flying-cygnus-dou4esu.vercel.app
unset CAPACITOR_SERVER_URL
npm run android:apk
# → dist/2click-mom.apk  (~4–5 MB debug)
```

After Production is live on `https://2click.in`:

```bash
export VITE_API_BASE_URL=https://2click.in
unset CAPACITOR_SERVER_URL
npm run android:apk
```

Optional live WebView wrapper (only if that URL already shows the UI, not white):

```bash
export CAPACITOR_SERVER_URL=https://2click.in
export VITE_API_BASE_URL=https://2click.in
npm run android:apk
```

### Install on phone

1. Copy `2click-mom.apk` to the Android device  
2. Enable **Install unknown apps** for Files/Chrome  
3. Open the APK and install  
4. Allow **Microphone** when prompted  

### GitHub Actions

**Actions → Build Android APK → Run workflow**  
Leave `server_url` empty for bundled assets.
## Hostinger static upload

```bash
export VITE_API_BASE_URL=https://your-vercel-mom.example
npm run pack:hostinger
# upload dist/hostinger-upload/* → public_html
```

Shared Hostinger still cannot run Node APIs — use Vercel/VPS for the backend, or point DNS fully to Vercel.

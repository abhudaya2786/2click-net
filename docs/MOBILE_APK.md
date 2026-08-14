# Mobile app & APK — 2Click Voice MoM

## Mobile website (PWA)

The web app is phone-ready:

- Bottom navigation on small screens
- Safe-area padding for notches
- Installable PWA (`manifest.webmanifest` + service worker)

**Install without APK:** open the live site in Chrome → **Install app** / **Add to Home screen**.

## Android APK (Capacitor)

Package ID: `in.twoclick.mom`

The APK is a native WebView shell. **Live URL mode** (default) loads your deployed MoM site so `/api` works.

### Option A — GitHub Actions

1. Merge to `main` or run **Actions → Build Android APK → Run workflow**
2. Download artifact `2click-mom-android-apk` (`app-debug.apk`)
3. Optional workflow input: `server_url` (defaults to `https://2click.in`)

### Option B — Local

Requirements: Node 20+, Java **21**+, Android SDK.

```bash
export CAPACITOR_SERVER_URL=https://your-deployed-mom.example
npm run android:apk
```

Output: `dist/2click-mom.apk`

### Open Android Studio

```bash
npm run cap:sync
npm run cap:open
```

## Notes

- Microphone permission is declared for in-app recording.
- Point `CAPACITOR_SERVER_URL` at a working Vercel/VPS deploy (not Hostinger shared `public_html` source).
- For Play Store release signing, configure `android/app/build.gradle` and run `assembleRelease`.

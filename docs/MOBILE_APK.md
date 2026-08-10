# Mobile app & APK

## Mobile website (PWA)

The site is mobile-friendly with:

- Bottom navigation on phones
- Safe-area padding for notched devices
- Install banner + `/download-app` page
- Service worker for offline shell caching

**Install on phone (no APK):** Open https://www.2click.in in Chrome → Menu → **Install app** / **Add to Home screen**.

## Android APK

### Option A — GitHub Actions (recommended)

1. Merge to `main` or run **Actions → Build Android APK → Run workflow**
2. Download artifact `2click-android-apk` (`app-debug.apk`)
3. Optional: set `REACT_APP_APK_URL` on Vercel to a hosted APK URL

### Option B — Local build

Requirements: Node 20+, Java 17+, Android SDK.

```bash
chmod +x scripts/build-apk.sh
./scripts/build-apk.sh
```

Output: `frontend/public/2click.apk`

### Live-site wrapper (small APK, always latest UI)

```bash
cd frontend
CAPACITOR_SERVER_URL=https://www.2click.in npm run cap:sync
cd android && ./gradlew assembleDebug
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `REACT_APP_BACKEND_URL` | API base (required for production build) |
| `REACT_APP_APK_URL` | Custom APK download link (default `/2click.apk`) |
| `CAPACITOR_SERVER_URL` | Load live site in WebView instead of bundled build |

## Play Store

For release builds, configure signing in `android/app/build.gradle` and run `npm run android:release`.

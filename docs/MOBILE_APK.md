# Mobile app & APK

## Mobile website (PWA) — works like an app

Phone pe site open karte hi:

- **Bottom tabs:** Home · Store · Estimate · More · Profile
- **More sheet:** Mart, BOQ, Tenders, Solar, Consultants, Rental, Install…
- Safe-area padding (notch / home indicator)
- Sticky compact header + brand name
- Install banner + `/download-app`
- Service worker (`sw.js` v2) — offline shell + `/offline.html`
- Standalone / Capacitor mode hides install banner and uses app chrome

**Install on phone (no APK):**  
Chrome → https://www.buildecogroup.com → Menu (⋮) → **Install app** / **Add to Home screen**.

iPhone: Safari → Share → **Add to Home Screen**.

## Android APK

### Option A — GitHub Actions (recommended)

1. Merge to `main` or run **Actions → Build Android APK → Run workflow**
2. Download artifact `buildecogroup-android-apk` (`app-debug.apk`)
3. Optional: set `REACT_APP_APK_URL` on Vercel to a hosted APK URL

### Option B — Local build

Requirements: Node 20+, Java 17+, Android SDK.

```bash
chmod +x scripts/build-apk.sh
./scripts/build-apk.sh
```

Output: `frontend/public/buildecogroup.apk`

### Live-site wrapper (small APK, always latest UI)

```bash
cd frontend
CAPACITOR_SERVER_URL=https://www.buildecogroup.com npm run cap:sync
cd android && ./gradlew assembleDebug
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `REACT_APP_BACKEND_URL` | API base (required for production build) |
| `REACT_APP_APK_URL` | Custom APK download link (default `/buildecogroup.apk`) |
| `CAPACITOR_SERVER_URL` | Load live site in WebView instead of bundled build |

## Play Store

For release builds, configure signing in `android/app/build.gradle` and run `npm run android:release`.

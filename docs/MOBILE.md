# Mobile — 2Click.in

## PWA

- Manifest + icons: `static-pwa/`
- Service worker registered in `src/main.tsx` (skipped on Capacitor native)
- Install banner: `MobileInstallBanner`

## Android APK

```bash
# Bundled assets (recommended until production domain is healthy)
npm run android:apk

# Or live WebView
export CAPACITOR_SERVER_URL=https://2click.in
npm run android:apk
```

App id: `in.twoclick.mom`

## Permissions

Declared: `INTERNET`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`  
Geofence UI uses browser geolocation; add Android LOCATION permissions before relying on native GPS.

## Limitations

- Background recording / wake-word not guaranteed
- Phone-call recording not supported on standard WebView / Android without OS APIs — see `/phone`

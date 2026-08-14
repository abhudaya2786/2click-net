#!/usr/bin/env bash
# Build a debug APK for 2Click Voice MoM (Capacitor + Android).
# Default: BUNDLED UI (fixes white screen when 2click.in Hostinger is broken).
# Optional live wrapper: CAPACITOR_SERVER_URL=https://working-host
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Do NOT default to https://2click.in — Hostinger currently serves Vite source → blank white.
export CAPACITOR_SERVER_URL="${CAPACITOR_SERVER_URL:-}"
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://temporary-flying-cygnus-dou4esu.vercel.app}"

echo "==> Web build (dist/client) API_BASE=$VITE_API_BASE_URL"
npm run build:client

if [ -n "$CAPACITOR_SERVER_URL" ]; then
  echo "==> Capacitor sync android (LIVE URL: $CAPACITOR_SERVER_URL)"
else
  echo "==> Capacitor sync android (BUNDLED assets — no live URL)"
fi
npx cap sync android

echo "==> Gradle assembleDebug"
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon

APK_SRC="app/build/outputs/apk/debug/app-debug.apk"
APK_OUT="$ROOT/dist/2click-mom.apk"
mkdir -p "$ROOT/dist" "$ROOT/dist/client"
cp "$APK_SRC" "$APK_OUT"
cp "$APK_SRC" "$ROOT/dist/client/2click-mom.apk"

echo ""
echo "APK ready: $APK_OUT"
ls -lh "$APK_OUT"

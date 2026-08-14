#!/usr/bin/env bash
# Build a debug APK for 2Click Voice MoM (Capacitor + Android).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export CAPACITOR_SERVER_URL="${CAPACITOR_SERVER_URL:-https://2click.in}"

echo "==> Web build (dist/client)"
npm run build:client

echo "==> Capacitor sync android (live URL: $CAPACITOR_SERVER_URL)"
npx cap sync android

echo "==> Gradle assembleDebug"
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon

APK_SRC="app/build/outputs/apk/debug/app-debug.apk"
APK_OUT="$ROOT/dist/2click-mom.apk"
mkdir -p "$ROOT/dist"
cp "$APK_SRC" "$APK_OUT"
cp "$APK_SRC" "$ROOT/dist/client/2click-mom.apk" 2>/dev/null || true

echo ""
echo "APK ready:"
echo "  $APK_OUT"
ls -lh "$APK_OUT"

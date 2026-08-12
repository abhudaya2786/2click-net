#!/usr/bin/env bash
# Build a debug Android APK for buildecogroup.com
set -euo pipefail
cd "$(dirname "$0")/../frontend"

export REACT_APP_BACKEND_URL="${REACT_APP_BACKEND_URL:-https://wallet-vendor-mvp.emergent.host}"
export CI=false

echo "→ npm ci"
npm ci

echo "→ npm run build"
npm run build

echo "→ cap sync android"
npx cap add android 2>/dev/null || true
npx cap sync android

echo "→ gradle assembleDebug"
cd android
chmod +x gradlew
./gradlew assembleDebug

APK="app/build/outputs/apk/debug/app-debug.apk"
cp "$APK" ../public/buildecogroup.apk
echo "✓ APK ready: frontend/public/buildecogroup.apk"
echo "  Install: adb install -r public/buildecogroup.apk"

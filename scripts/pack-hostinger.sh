#!/usr/bin/env bash
# Pack production static files for Hostinger public_html (fixes blank white screen).
# NOTE: Hostinger shared hosting cannot run the Node API — UI will load;
# set VITE_API_BASE_URL to your Vercel/VPS MoM URL before packing, or point DNS to Vercel instead.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://temporary-flying-cygnus-dou4esu.vercel.app}"

npm run build:client

OUT="$ROOT/dist/hostinger-upload"
rm -rf "$OUT"
mkdir -p "$OUT"
cp -R dist/client/. "$OUT/"

# SPA + correct JS MIME on Apache/LiteSpeed (Hostinger)
cat > "$OUT/.htaccess" <<'HTA'
# 2Click MoM — Hostinger static shell
<IfModule mod_mime.c>
  AddType application/javascript js mjs
  AddType text/css css
  AddType application/wasm wasm
  AddType application/manifest+json webmanifest
</IfModule>

Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
HTA

# Guard: never ship Vite source entry (causes white screen)
if grep -q '/src/main.tsx' "$OUT/index.html"; then
  echo "ERROR: index.html still points at /src/main.tsx — refusing pack" >&2
  exit 1
fi
if ! grep -q '/assets/.*\.js' "$OUT/index.html"; then
  echo "ERROR: built index.html missing /assets/*.js" >&2
  exit 1
fi

(
  cd "$OUT"
  # zip if available, else tar
  if command -v zip >/dev/null 2>&1; then
    zip -r "$ROOT/dist/hostinger-mom-upload.zip" . >/dev/null
  else
    tar -czf "$ROOT/dist/hostinger-mom-upload.tar.gz" .
  fi
)

echo "Hostinger pack ready:"
echo "  $OUT"
ls -lh "$ROOT/dist"/hostinger-mom-upload.* 2>/dev/null || true
echo ""
echo "Upload ALL contents of hostinger-upload/ into public_html (replace old index.html)."
echo "API base baked in: $VITE_API_BASE_URL"

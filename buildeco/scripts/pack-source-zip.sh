#!/usr/bin/env bash
# Pack the full 2click-net monorepo (BuildEco + 2Click) without node_modules / git / build junk.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if git -C "$SCRIPT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
  ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
else
  ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi
OUT_DIR="${1:-$ROOT/dist}"
mkdir -p "$OUT_DIR"
STAMP="$(date -u +%Y%m%d)"
ZIP="$OUT_DIR/2click-net-full-source-${STAMP}.zip"

cd "$ROOT"
rm -f "$ZIP"

zip -r "$ZIP" . \
  -x '*/node_modules/*' \
  -x 'node_modules/*' \
  -x '.git/*' \
  -x '*/.git/*' \
  -x '*/build/*' \
  -x '*/dist/*' \
  -x 'dist/*' \
  -x '*/__pycache__/*' \
  -x '*/.venv/*' \
  -x '.venv/*' \
  -x '*/coverage/*' \
  -x 'buildeco/frontend/build/*' \
  -x 'buildeco/frontend/node_modules/*' \
  -x 'buildeco/backend/.pytest_cache/*' \
  -x '*.apk' \
  -x 'android/.gradle/*' \
  -x 'android/app/build/*' \
  -x '.cursor/*' \
  -x '.tmp/*' \
  >/dev/null

ls -lh "$ZIP"
echo "$ZIP"

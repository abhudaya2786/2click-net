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
export PACK_ROOT="$ROOT"
export PACK_ZIP="$ZIP"

python3 - <<'PY'
import os, zipfile, sys
root = os.environ["PACK_ROOT"]
out = os.environ["PACK_ZIP"]
skip_parts = {
    "node_modules", ".git", "build", "dist", "__pycache__", ".venv",
    "coverage", ".pytest_cache", ".gradle", ".cursor", ".tmp",
}
skip_suffixes = (".apk",)

def skip(rel: str) -> bool:
    parts = rel.split(os.sep)
    if any(p in skip_parts for p in parts):
        return True
    if rel.endswith(skip_suffixes):
        return True
    return False

count = 0
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in skip_parts]
        for name in filenames:
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root)
            if skip(rel):
                continue
            try:
                zf.write(full, rel)
            except ValueError:
                info = zipfile.ZipInfo(filename=rel, date_time=(2020, 1, 1, 0, 0, 0))
                with open(full, "rb") as fh:
                    zf.writestr(info, fh.read())
            count += 1
print(f"packed {count} files", file=sys.stderr)
PY

ls -lh "$ZIP"
echo "$ZIP"

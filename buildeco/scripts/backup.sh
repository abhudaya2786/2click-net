#!/usr/bin/env bash
# Full backup: MongoDB dump + config snapshot + compressed archive
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
STAMP="$(date -u +%Y%m%d_%H%M%S)"
NAME="dump_${STAMP}"
DUMP_DIR="$BACKUP_DIR/$NAME"
ARCHIVE="$BACKUP_DIR/${NAME}.tar.gz"

MONGO_URL="${MONGO_URL:-mongodb://127.0.0.1:27017}"
DB_NAME="${DB_NAME:-test_database}"

mkdir -p "$BACKUP_DIR"
echo "→ mongodump $DB_NAME → $DUMP_DIR"
mongodump --uri="$MONGO_URL" --db="$DB_NAME" --out="$DUMP_DIR"

mkdir -p "$DUMP_DIR/_config"
for f in backend/.env frontend/.env; do
  [ -f "$ROOT/$f" ] && cp "$ROOT/$f" "$DUMP_DIR/_config/$(basename "$f")"
done

echo "→ archive $ARCHIVE"
tar -czf "$ARCHIVE" -C "$BACKUP_DIR" "$NAME"

python3 - <<PY
import json, os
from datetime import datetime, timezone
from pathlib import Path

root = Path("$BACKUP_DIR")
manifest = root / "manifest.json"
entries = json.loads(manifest.read_text()) if manifest.exists() else []
db_path = root / "$NAME" / "$DB_NAME"
entries.insert(0, {
    "id": "$NAME",
    "created_at": datetime.now(timezone.utc).isoformat(),
    "database": "$DB_NAME",
    "dump_path": "$NAME",
    "archive": "$(basename "$ARCHIVE")",
    "collections": len(list(db_path.glob("*.bson"))) if db_path.exists() else 0,
    "size_bytes": os.path.getsize("$ARCHIVE"),
})
manifest.write_text(json.dumps(entries[:50], indent=2))
PY

echo "✓ Backup complete: $ARCHIVE"
ls -lh "$ARCHIVE"

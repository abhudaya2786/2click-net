#!/usr/bin/env bash
# Restore MongoDB from a backup folder or .tar.gz archive
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_ID="${1:?Usage: restore-backup.sh dump_YYYYMMDD_HHMMSS}"

export BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
MONGO_URL="${MONGO_URL:-mongodb://127.0.0.1:27017}"
DB_NAME="${DB_NAME:-test_database}"

DUMP_DIR="$BACKUP_DIR/$BACKUP_ID"
ARCHIVE="$BACKUP_DIR/${BACKUP_ID}.tar.gz"

if [ ! -d "$DUMP_DIR" ] && [ -f "$ARCHIVE" ]; then
  echo "→ extracting $ARCHIVE"
  tar -xzf "$ARCHIVE" -C "$BACKUP_DIR"
fi

DB_PATH="$DUMP_DIR/$DB_NAME"
if [ ! -d "$DB_PATH" ]; then
  echo "ERROR: backup not found at $DB_PATH" >&2
  exit 1
fi

echo "→ mongorestore --drop $DB_NAME from $DB_PATH"
mongorestore --uri="$MONGO_URL" --db="$DB_NAME" --drop "$DB_PATH"
echo "✓ Restore complete"

#!/usr/bin/env bash
set -euo pipefail

MONGO_DB_PATH="${MONGO_DB_PATH:-/data/db}"
MONGO_LOG_PATH="${MONGO_LOG_PATH:-/var/log/mongodb/mongod.log}"

mkdir -p "${MONGO_DB_PATH}" "$(dirname "${MONGO_LOG_PATH}")"

if id mongodb >/dev/null 2>&1; then
  chown -R mongodb:mongodb "${MONGO_DB_PATH}" "$(dirname "${MONGO_LOG_PATH}")" 2>/dev/null || true
fi

if ! pgrep -x mongod >/dev/null; then
  if id mongodb >/dev/null 2>&1; then
    sudo -u mongodb mongod \
      --dbpath "${MONGO_DB_PATH}" \
      --logpath "${MONGO_LOG_PATH}" \
      --fork \
      --bind_ip 127.0.0.1
  else
    mongod \
      --dbpath "${MONGO_DB_PATH}" \
      --logpath "${MONGO_LOG_PATH}" \
      --fork \
      --bind_ip 127.0.0.1
  fi
fi

for _ in $(seq 1 30); do
  if mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
done

echo "MongoDB failed to become ready" >&2
exit 1

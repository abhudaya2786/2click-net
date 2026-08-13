#!/usr/bin/env bash
# Boot the owner-controlled API stack (Docker Compose). No Emergent required.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if [[ ! -f backend/.env ]]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env from .env.example — edit ADMIN_EMAIL / ADMIN_PASSWORD / JWT_SECRET before production."
fi

# Ensure Mongo points at compose service when using Docker
if grep -q '^MONGO_URL=mongodb://127.0.0.1' backend/.env 2>/dev/null; then
  echo "Note: docker-compose overrides MONGO_URL to mongodb://mongo:27017 for the api container."
fi

docker compose up -d --build
echo
echo "API health:"
sleep 3
curl -fsS "http://127.0.0.1:8001/api/" || true
echo
echo "Owner login path (after pointing Vercel /api rewrite here): /sys/console"
echo "Set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_ACCESS_PIN in backend/.env"

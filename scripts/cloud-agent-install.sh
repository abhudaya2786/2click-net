#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXTRA_INDEX_URL="https://d33sy5i8bnduwe.cloudfront.net/simple/"

write_backend_env() {
  cat > "${ROOT_DIR}/backend/.env" <<'EOF'
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=test_database
JWT_SECRET=dev-jwt-secret-change-in-production
ADMIN_EMAIL=abbhuadaya@gmail.com
ADMIN_PASSWORD=Admin@12345
ADMIN_ACCESS_PIN=274831
ENABLE_TEST_OTP=1
CORS_ORIGINS=http://localhost:3000
EOF
}

write_frontend_env() {
  cat > "${ROOT_DIR}/frontend/.env" <<'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
EOF
}

install_backend() {
  cd "${ROOT_DIR}/backend"
  if [[ ! -d .venv ]]; then
    python3 -m venv .venv
  fi
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install --upgrade pip
  pip install emergentintegrations==0.2.0 --extra-index-url "${EXTRA_INDEX_URL}"
  pip install -r requirements.txt --extra-index-url "${EXTRA_INDEX_URL}" || {
    pip install \
      aiohappyeyeballs==2.7.1 aiohttp==3.14.3 aiosignal==1.4.0 bcrypt==4.1.3 black==26.5.1 boto3==1.43.64 \
      dnspython==2.8.0 ecdsa==0.19.2 email-validator==2.3.0 execnet==2.1.2 flake8==7.3.0 fastapi==0.110.1 \
      isort==8.0.1 jq==1.12.0 motor==3.3.1 mypy==2.3.0 numpy==2.4.6 pandas==3.0.5 passlib==1.7.4 \
      pillow==12.3.0 pytest==9.1.1 pytest-xdist==3.8.0 pymongo==4.6.3 PyJWT==2.13.0 python-jose==3.5.0 \
      python-multipart==0.0.32 razorpay==2.0.1 reportlab==5.0.0 requests==2.34.2 s5cmd==0.2.0 uvicorn==0.25.0 \
      --extra-index-url "${EXTRA_INDEX_URL}"
  }
}

install_frontend() {
  cd "${ROOT_DIR}/frontend"
  if ! command -v npm >/dev/null 2>&1; then
    echo "npm is required but was not found on PATH. Ensure Node.js (>=20) is installed in the environment Dockerfile." >&2
    exit 1
  fi
  node -v
  npm -v
  if [[ -f package-lock.json ]]; then
    npm ci --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi
  npm install ajv@^8.17.1 --save-dev --no-audit --no-fund
}

write_backend_env
write_frontend_env
install_backend
install_frontend

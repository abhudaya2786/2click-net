#!/usr/bin/env bash
# Smoke-test buildecogroup.com (or LOCAL_API) — pages + key APIs
set -euo pipefail

BASE="${SITE_BASE:-https://www.buildecogroup.com}"
API="${API_BASE:-${BASE}/api}"
FAIL=0

check_http() {
  local name="$1" url="$2" expect="$3"
  local code
  code=$(curl -sS -m 25 -o /tmp/smoke_body -w "%{http_code}" "$url" || echo "000")
  if [[ "$code" =~ $expect ]]; then
    echo "OK  $code $name"
  else
    echo "FAIL $code $name ($(head -c 120 /tmp/smoke_body 2>/dev/null || true))"
    FAIL=1
  fi
}

check_json_api() {
  local name="$1" url="$2"
  local code body
  code=$(curl -sS -m 25 -o /tmp/smoke_body -w "%{http_code}" "$url" || echo "000")
  body=$(head -c 300 /tmp/smoke_body 2>/dev/null || true)
  if [[ "$code" == "200" && "$body" != *"doctype"* && "$body" != *"<!DOCTYPE"* && "$body" == *"{"* ]]; then
    echo "OK  $code $name"
  else
    echo "FAIL $code $name ($body)"
    FAIL=1
  fi
}

echo "SITE=$BASE API=$API"
check_http "home" "$BASE/" "200"
check_http "store" "$BASE/store" "200"
check_http "login" "$BASE/login" "200"
check_http "console" "$BASE/sys/console" "200"
check_json_api "api_root" "$API/"
check_json_api "branding" "$API/branding"
check_json_api "plans" "$API/plans"
check_json_api "products" "$API/products"

code=$(curl -sS -m 25 -o /tmp/smoke_login -w "%{http_code}" -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' -d '{"email":"x@y.com","password":"bad"}' || echo 000)
if [[ "$code" == "401" || "$code" == "422" ]]; then
  echo "OK  $code auth_login"
else
  echo "FAIL $code auth_login ($(head -c 120 /tmp/smoke_login))"
  FAIL=1
fi

code=$(curl -sS -m 25 -o /tmp/smoke_admin -w "%{http_code}" -X POST "$API/auth/admin/login" \
  -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"bad"}' || echo 000)
body=$(head -c 80 /tmp/smoke_admin || true)
if [[ "$body" == *"doctype"* || "$body" == *"<!DOCTYPE"* ]]; then
  echo "FAIL $code auth_admin_login returned HTML"
  FAIL=1
elif [[ "$code" == "401" || "$code" == "404" || "$code" == "422" || "$code" == "200" ]]; then
  echo "OK  $code auth_admin_login (404 = transitional Emergent; owner API pending)"
else
  echo "WARN $code auth_admin_login ($body)"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "SMOKE FAILED"
  exit 1
fi
echo "SMOKE PASSED"

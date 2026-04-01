#!/usr/bin/env bash

set -euo pipefail

if [ "${1:-}" = "--" ]; then
  shift
fi

BASE_URL="${1:-http://localhost:4000}"
HEALTH_PATH="${HEALTH_PATH:-/api/v1/health}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-10}"
SLEEP_SECONDS="${SLEEP_SECONDS:-3}"

HEALTH_URL="${BASE_URL%/}${HEALTH_PATH}"
API_DOCS_URL="${API_DOCS_URL:-${BASE_URL%/}/api-docs}"

infer_web_verify_url() {
  case "${BASE_URL}" in
    http://localhost:*|http://127.0.0.1:*|https://*.run.app|https://*.a.run.app)
      printf '%s' "${WEB_VERIFY_URL:-}"
      ;;
    *)
      printf '%s' "${WEB_VERIFY_URL:-$BASE_URL}"
      ;;
  esac
}

WEB_URL="$(infer_web_verify_url)"

fetch_headers() {
  local url="$1"
  curl --silent --show-error --fail --dump-header - --output /dev/null "$url"
}

header_value() {
  local header_name="$1"
  local headers="$2"
  printf '%s\n' "$headers" | tr -d '\r' | awk -F': ' -v key="$(printf '%s' "$header_name" | tr '[:upper:]' '[:lower:]')" '
    BEGIN { IGNORECASE = 1 }
    tolower($1) == key {
      sub(/^[^:]+: /, "", $0)
      print $0
      exit
    }
  '
}

require_header_value() {
  local surface="$1"
  local url="$2"
  local header_name="$3"
  local expected_value="$4"
  local headers="$5"
  local actual_value
  actual_value="$(header_value "$header_name" "$headers")"

  if [ -z "$actual_value" ]; then
    printf 'Missing required header %s on %s (%s)\n' "$header_name" "$surface" "$url" >&2
    exit 1
  fi

  if [ "$actual_value" != "$expected_value" ]; then
    printf 'Unexpected value for %s on %s (%s)\n' "$header_name" "$surface" "$url" >&2
    printf '  expected: %s\n' "$expected_value" >&2
    printf '  actual:   %s\n' "$actual_value" >&2
    exit 1
  fi
}

verify_headers() {
  local surface="$1"
  local url="$2"
  shift 2

  local headers
  if ! headers="$(fetch_headers "$url")"; then
    printf 'Header check failed for %s (%s)\n' "$surface" "$url" >&2
    exit 1
  fi

  while [ "$#" -gt 0 ]; do
    require_header_value "$surface" "$url" "$1" "$2" "$headers"
    shift 2
  done

  printf 'Verified headers on %s: %s\n' "$surface" "$url"
}

attempt=1
while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  if response="$(curl --silent --show-error --fail "$HEALTH_URL")"; then
    printf 'Health check succeeded: %s\n' "$HEALTH_URL"
    printf '%s\n' "$response"
    break
  fi

  if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
    printf 'Health check attempt %s/%s failed for %s. Retrying in %ss...\n' \
      "$attempt" "$MAX_ATTEMPTS" "$HEALTH_URL" "$SLEEP_SECONDS" >&2
    sleep "$SLEEP_SECONDS"
  fi

  attempt=$((attempt + 1))
done
if [ "$attempt" -gt "$MAX_ATTEMPTS" ]; then
  printf 'Health check failed after %s attempts: %s\n' "$MAX_ATTEMPTS" "$HEALTH_URL" >&2
  exit 1
fi

verify_headers \
  "api health" \
  "$HEALTH_URL" \
  "Content-Security-Policy" "default-src 'none'; base-uri 'none'; connect-src 'self'; font-src 'none'; form-action 'none'; frame-ancestors 'none'; img-src 'none'; object-src 'none'; script-src 'none'; style-src 'none'" \
  "Permissions-Policy" "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" \
  "Strict-Transport-Security" "max-age=31536000" \
  "X-Frame-Options" "DENY"

verify_headers \
  "api docs" \
  "$API_DOCS_URL" \
  "Content-Security-Policy" "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'" \
  "Permissions-Policy" "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" \
  "Strict-Transport-Security" "max-age=31536000" \
  "X-Frame-Options" "DENY"

if [ -n "$WEB_URL" ]; then
  verify_headers \
    "web root" \
    "$WEB_URL" \
    "Content-Security-Policy" "default-src 'self'; base-uri 'self'; connect-src 'self' https://dev.mastersrunners.com https://mastersrunners.com https://www.mastersrunners.com https://*.run.app https://*.a.run.app https://*.r2.cloudflarestorage.com; font-src 'self' https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: blob: https:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com" \
    "Permissions-Policy" "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" \
    "Strict-Transport-Security" "max-age=31536000" \
    "X-Frame-Options" "DENY"
else
  printf 'Skipping web-root header verification because WEB_VERIFY_URL was not provided for %s\n' "$BASE_URL"
fi

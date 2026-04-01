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
  curl --silent --show-error --fail --location --dump-header - --output /dev/null "$url"
}

require_header() {
  local surface="$1"
  local url="$2"
  local header_name="$3"
  local headers="$4"
  local normalized_headers
  normalized_headers="$(printf '%s' "$headers" | tr -d '\r' | tr '[:upper:]' '[:lower:]')"

  if ! printf '%s\n' "$normalized_headers" | grep -q "^$(printf '%s' "$header_name" | tr '[:upper:]' '[:lower:]'):"; then
    printf 'Missing required header %s on %s (%s)\n' "$header_name" "$surface" "$url" >&2
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

  for header_name in "$@"; do
    require_header "$surface" "$url" "$header_name" "$headers"
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
  "Content-Security-Policy" \
  "Permissions-Policy" \
  "Strict-Transport-Security" \
  "X-Frame-Options"

verify_headers \
  "api docs" \
  "$API_DOCS_URL" \
  "Content-Security-Policy" \
  "Permissions-Policy" \
  "Strict-Transport-Security" \
  "X-Frame-Options"

if [ -n "$WEB_URL" ]; then
  verify_headers \
    "web root" \
    "$WEB_URL" \
    "Content-Security-Policy" \
    "Permissions-Policy" \
    "Strict-Transport-Security" \
    "X-Frame-Options"
else
  printf 'Skipping web-root header verification because WEB_VERIFY_URL was not provided for %s\n' "$BASE_URL"
fi

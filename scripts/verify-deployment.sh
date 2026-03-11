#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-http://localhost:4000}"
HEALTH_PATH="${HEALTH_PATH:-/health}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-10}"
SLEEP_SECONDS="${SLEEP_SECONDS:-3}"

HEALTH_URL="${BASE_URL%/}${HEALTH_PATH}"

attempt=1
while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  if response="$(curl --silent --show-error --fail "$HEALTH_URL")"; then
    printf 'Health check succeeded: %s\n' "$HEALTH_URL"
    printf '%s\n' "$response"
    exit 0
  fi

  if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
    printf 'Health check attempt %s/%s failed for %s. Retrying in %ss...\n' \
      "$attempt" "$MAX_ATTEMPTS" "$HEALTH_URL" "$SLEEP_SECONDS" >&2
    sleep "$SLEEP_SECONDS"
  fi

  attempt=$((attempt + 1))
done

printf 'Health check failed after %s attempts: %s\n' "$MAX_ATTEMPTS" "$HEALTH_URL" >&2
exit 1

#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

paths=(
  "apps/web/.next"
  "apps/web/dist"
  "apps/api/dist"
  "packages/database/generated"
)

failures=0

for path in "${paths[@]}"; do
  matches="$(git ls-files -- "$path" "$path/**")"
  if [ -n "$matches" ]; then
    printf 'Generated artifact path is tracked in git: %s\n' "$path" >&2
    printf '%s\n' "$matches" >&2
    failures=1
  fi
done

exit "$failures"

#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

find_knip_bin() {
  local root candidate
  root="$(pnpm root)"

  candidate="$(find "$root" -path '*/knip/bin/knip.js' -print -quit 2>/dev/null || true)"
  if [ -n "$candidate" ]; then
    printf '%s\n' "$candidate"
    return 0
  fi

  candidate="$(find "$ROOT_DIR" -path '*/node_modules/knip/bin/knip.js' -print -quit 2>/dev/null || true)"
  if [ -n "$candidate" ]; then
    printf '%s\n' "$candidate"
    return 0
  fi

  return 1
}

KNIP_BIN="$(find_knip_bin || true)"

if [ -z "$KNIP_BIN" ]; then
  printf 'Unable to locate knip. Run pnpm install before invoking pnpm knip.\n' >&2
  exit 1
fi

node "$KNIP_BIN" --no-progress --config knip.json "$@"

#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mapfile -t staged_files < <(git diff --cached --name-only --diff-filter=ACMR)

if [ "${#staged_files[@]}" -gt 0 ]; then
  mapfile -t prettier_files < <(
    printf '%s\n' "${staged_files[@]}" |
      rg -N '\.(css|html|js|json|jsx|md|mjs|ts|tsx|yaml|yml)$' ||
      true
  )

  if [ "${#prettier_files[@]}" -gt 0 ]; then
    pnpm exec prettier --check --ignore-unknown "${prettier_files[@]}"
  fi
fi

pnpm lint

#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mapfile -t staged_files < <(git diff --cached --name-only --diff-filter=ACMR)

should_run_typecheck=0

if [ "${#staged_files[@]}" -gt 0 ]; then
  mapfile -t prettier_files < <(
    printf '%s\n' "${staged_files[@]}" |
      rg -N '\.(css|html|js|json|jsx|md|mjs|ts|tsx|yaml|yml)$' ||
      true
  )

  if [ "${#prettier_files[@]}" -gt 0 ]; then
    pnpm exec prettier --check --ignore-unknown "${prettier_files[@]}"
  fi

  mapfile -t typecheck_trigger_files < <(
    printf '%s\n' "${staged_files[@]}" |
      rg -N '(^package\.json$|^pnpm-lock\.yaml$|(^|/)tsconfig(\.[^/]+)?\.json$|\.d\.ts$|\.(ts|tsx|cts|mts)$|^packages/database/prisma/schema\.prisma$)' ||
      true
  )

  if [ "${#typecheck_trigger_files[@]}" -gt 0 ]; then
    should_run_typecheck=1
  fi
fi

pnpm lint

if [ "$should_run_typecheck" -eq 1 ]; then
  bash scripts/run-typecheck.sh
fi

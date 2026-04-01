#!/usr/bin/env bash

set -euo pipefail

# Local approximation of the core GitHub Actions CI signal.
#
# Assumptions:
# - Run from a workspace with pnpm installed.
# - Dependencies are already installed, or set CI_LOCAL_INSTALL=1 to run
#   `pnpm install --frozen-lockfile` first.
# - PostgreSQL for API tests is reachable at DATABASE_URL.
# - Redis is reachable at REDIS_URL if the API test suite requires it.
# - Generated/build artifacts must not be tracked in git.
# - This script intentionally omits the separate Docker image build job from CI.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CI_LOCAL_INSTALL="${CI_LOCAL_INSTALL:-0}"

DATABASE_URL="${DATABASE_URL:-postgresql://masters:masters@localhost:5432/masters_runners_test}"
JWT_SECRET="${JWT_SECRET:-test-secret}"
JWT_ACCESS_TTL="${JWT_ACCESS_TTL:-900}"
JWT_REFRESH_TTL="${JWT_REFRESH_TTL:-604800}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
VITE_API_URL="${VITE_API_URL:-http://localhost:4000}"
export VITE_API_URL

run_step() {
  local name="$1"
  shift

  printf '\n==> %s\n' "$name"
  "$@"
}

run_step "Check harness structure" bash -c '
  set -euo pipefail
  test -f AGENTS.md
  test -d design
  test -d docs
  test -d tasks
  bash scripts/check-generated-artifacts.sh
'

if [ "$CI_LOCAL_INSTALL" = "1" ]; then
  run_step "Install dependencies" pnpm install --frozen-lockfile
else
  printf 'Skipping dependency install. Set CI_LOCAL_INSTALL=1 to include it.\n'
fi

run_step "Run format check" pnpm format:check

run_step "Run lint" pnpm lint

run_step "Run explicit typecheck" bash scripts/run-typecheck.sh

run_step "Check deterministic active-task closeout state" bash scripts/check-active-task-closeout.sh

run_step "Check dependency boundaries and cycles" pnpm depcruise

run_step "Check dead code baseline" pnpm knip

run_step "Build packages" pnpm -r run build

run_step "Run API coverage" env \
  DATABASE_URL="$DATABASE_URL" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_ACCESS_TTL="$JWT_ACCESS_TTL" \
  JWT_REFRESH_TTL="$JWT_REFRESH_TTL" \
  REDIS_URL="$REDIS_URL" \
  pnpm --filter @masters/api test:cov

run_step "Build web" env \
  VITE_API_URL="$VITE_API_URL" \
  pnpm --filter @masters/web build

printf '\nLocal CI mirror completed successfully.\n'

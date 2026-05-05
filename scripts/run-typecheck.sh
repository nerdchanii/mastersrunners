#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pnpm --filter @masters/database db:generate
pnpm --filter @masters/database exec tsc -p tsconfig.json --noEmit
pnpm --filter @masters/types exec tsc -p tsconfig.json --noEmit
pnpm --filter @masters/api exec tsc -p tsconfig.build.json --noEmit
pnpm --filter @masters/web exec tsc -p tsconfig.json --noEmit

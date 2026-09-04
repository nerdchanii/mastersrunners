# Proposed Classification Inventory

This file captures the current proposed inventory derived from the `CLASSIFY2_DONE` callback.
It is not an approved final inventory until the reporting and scope decisions in `prompts/ai-slop/contract-open-questions.md` are settled.

## Included Surface

- `AGENTS.md`
- `tasks/README.md`
- `tasks/active/**`
- `tasks/todo/**`
- `tasks/_templates/**`
- `tasks/reviews/**`
- `tasks/archive/**` as secondary historical evidence only
- `design/initiatives/**`
- `design/architecture/**`
- `design/frontend/**`
- `design/backend/**`
- `design/adr/**`
- `design/operating-rules/**`
- `docs/domain/**`
- `docs/runbooks/**`
- `docs/guides/**`
- `docs/reports/README.md` plus report files marked live by that index
- `docs/reports/history/**` only when referenced by current docs, design, or tasks
- `prompts/ai-slop/**`
- `.github/workflows/**`
- `.github/dependabot.yml`
- `.github/PULL_REQUEST_TEMPLATE.md` as lower-priority process surface
- `scripts/**`
- `scripts/check-size-budgets.targets.json`
- `.husky/commit-msg`
- `.husky/pre-commit`
- `.husky/pre-push`
- `apps/api/src/**`
- `apps/api/test/**`
- `apps/api/*.config.ts`
- `apps/api/Dockerfile`
- `apps/api/package.json`
- `apps/api/.swcrc`
- `apps/api/nest-cli.json`
- `apps/api/tsconfig*.json`
- `apps/web/src/**`
- `apps/web/e2e/**`
- `apps/web/public/_headers`
- `apps/web/public/_redirects`
- `apps/web/*.config.ts`
- `apps/web/package.json`
- `apps/web/index.html`
- `apps/web/components.json`
- `apps/web/tsconfig*.json`
- `apps/web/public` binary/static assets only when referenced by behavior or docs
- `apps/ops-web/src/**`
- `apps/ops-web/public/_headers`
- `apps/ops-web/public/_redirects`
- `apps/ops-web/*.config.ts`
- `apps/ops-web/package.json`
- `apps/ops-web/index.html`
- `apps/ops-web/components.json`
- `apps/ops-web/tsconfig*.json`
- `packages/database/src/**`
- `packages/database/prisma/**`
- `packages/database/package.json`
- `packages/database/prisma.config.ts`
- `packages/database/tsup.config.ts`
- `packages/database/tsconfig.json`
- `packages/types/src/**`
- `packages/types/package.json`
- `packages/types/tsconfig.json`
- Root config files such as `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig*.json`, `eslint.config.mjs`, `commitlint.config.mjs`, `playwright.config.ts`, `knip.json`, `.dependency-cruiser.cjs`, `.prettierrc.json`, `.prettierignore`, `.editorconfig`, `.npmrc`, `docker-compose*.yml`, `.dockerignore`, `.env.production.example`
- Lower-truth orientation and duplicate-guidance surfaces: `README.md`, `DEPLOYMENT.md`, `CLAUDE.md`, `docs/README.md`, `design/README.md`, `.codex/config.toml`, `.codex/hooks.json`, `.agents/skills/**`

## Excluded Surface

- `**/node_modules/**`
- `apps/web/dist/**`
- `apps/web/out/**`
- `apps/web/.next/**`
- `apps/web/playwright-report/**`
- `apps/web/test-results/**`
- `apps/ops-web/dist/**`
- `apps/api/dist/**`
- `packages/*/dist/**`
- `packages/database/generated/**`
- `apps/api/src/coverage/**`
- `**/coverage/**`
- `**/*.tsbuildinfo`
- `next-env.d.ts`
- `.git/**`
- `.git/_nested_git_backup_*/**`
- `.husky/_/**`
- `.codex/environments/**`
- `.claude/commands/**`
- `apps/api/.omc/**`
- `.playwright-cli/**`
- `.DS_Store`
- `.mypy_cache/**`
- `scripts/__pycache__/**`
- `**/*.pyc`
- local `.env*` files except tracked examples
- `dev.db`
- `packages/database/dev.db`
- `data/*.fit`
- `data/*.gpx`
- `prompts/user_requst.md`
- `.worktrees/**`
- generated report artifacts under playwright, test-results, or coverage trees

## Review Ordering

1. Evaluation orchestration contract
2. Root governance and task contract
3. Current execution state
4. Architecture and durable decisions
5. Domain truth
6. Frontend app truth
7. Backend/API truth
8. Ops-web truth
9. Data and shared contracts
10. Operations and automation
11. Historical and duplicate-guidance evidence

## Borderline Resolution Rules

- `docs/reports/**`: include the index and live ledgers first; history only when referenced.
- `README.md`, `DEPLOYMENT.md`, `CLAUDE.md`, `docs/README.md`, `design/README.md`: duplication/staleness checks only.
- `.agents/skills/**`, `.codex/config.toml`, `.codex/hooks.json`: compare against AGENTS/tasks/design, never treat as higher truth.
- `.github/PULL_REQUEST_TEMPLATE.md`: low-priority process drift checks only.
- `tasks/archive/**`: sampled or linked contradiction evidence, not exhaustive primary scoring.
- `apps/ops-web/**`: included source/config/public surface; `dist` stays excluded.
- `apps/web/public/**` and `apps/ops-web/public/**`: `_headers` and `_redirects` included by default; other static assets only when referenced.
- `docker-compose*.yml` and env examples: evaluate against deployment and environment runbooks first.

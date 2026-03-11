# AGENTS

This repository is being reshaped into an agent-friendly engineering harness for `mastersrunners`, a Korean running community platform.

## Start Here

Read in this order:

1. `AGENTS.md`
2. `tasks/` for the active initiative or assigned task
3. `design/` for technical design and architecture
4. `docs/domain/` for business rules
5. `docs/runbooks/` for operational procedures

## Source of Truth Map

- Product and business rules: `docs/domain/`
- Technical design: `design/frontend/`, `design/backend/`, `design/architecture/`
- Architectural decisions: `design/adr/`
- Large change framing: `design/initiatives/`
- Execution state: `tasks/`
- Operational guidance: `docs/runbooks/`
- Executable deployment/test automation: `.github/workflows/`, `scripts/`

## Repo Summary

- Web: Vite + React 19 SPA with React Router v7
- API: NestJS 11
- Data: Prisma + PostgreSQL
- Shared packages: `packages/database`, `packages/types`
- Storage: Cloudflare R2 with local disk fallback in development paths

## Working Rules

- Do not use `README.md` as the only source of truth for feature status. Check `design/`, `docs/domain/`, and `tasks/`.
- Status lives in task folder location, not in duplicated `status:` metadata inside task files.
- One task file should represent one executable unit of work.
- One initiative file should represent one large change, not one commit.
- When changing technical behavior, update the relevant design or domain document in the same task.
- When changing workflows or scripts, update the matching runbook in the same task.
- Every task needs at least one specialist review before commit.
- Every task also needs a PO review before commit, including docs-only work.
- Multi-scope changes need the union of the relevant specialist reviewers, not just one reviewer.
- Review requirements live in the task file. Do not treat a task as done until review and verify are both complete.

## Task Workflow

Task path pattern:

```text
tasks/<initiative-slug>/{todo,active,archive}/<initiative-id>-<order>-<scope>-<slug>.md
```

Example:

```text
tasks/I-0002-harness-verification/todo/I-0002-010-meta-eslint-repair.md
```

Lifecycle:

1. Move a task from `todo/` to `active/` when work starts
2. Update the task notes while working
3. Run the task's `verify` commands
4. Get the required specialist review
5. Get PO review
6. Move the task from `active/` to `archive/` in the same changeset that finalizes the work
7. Commit only after review and verify gates are satisfied

## Review Routing

- `docs` scope: `docs-reviewer` + `po-reviewer`
- `web` scope: `frontend-reviewer` + `po-reviewer`
- user-facing UI changes: `frontend-reviewer` + `ui-ux-reviewer` + `po-reviewer`
- `api` or `db` scope: `backend-reviewer` + `po-reviewer`
- `ci`, `repo`, `meta`, or deployment workflow changes: `harness-reviewer` + `po-reviewer`
- cross-cutting changes: include every matching specialist reviewer plus `po-reviewer`

## Common Commands

- Install dependencies: `pnpm install`
- Run dev: `pnpm dev`
- Build workspace: `pnpm build`
- Run workspace lint: `pnpm lint`
- Run local CI approximation: `pnpm ci:local`
- Run API tests: `pnpm --filter @masters/api test`
- Run API e2e tests: `pnpm --filter @masters/api test:e2e`
- Run a single API spec: `pnpm --filter @masters/api test -- --runTestsByPath src/auth/auth.service.spec.ts`
- Build web only: `pnpm --filter @masters/web build`
- Verify deployment target: `pnpm deploy:verify -- http://localhost:4000`

## Gotchas

- Frontend is a SPA, not an active Next.js app, even though old `.next` artifacts exist.
- Canonical workout units are meters, seconds, and seconds per kilometer.
- Public health endpoint is `GET /health`, not `/api/v1/health`.
- Generated or build output must not be treated as editable source:
  - `apps/web/dist`
  - `apps/web/out`
  - `apps/web/.next`
  - `apps/web/playwright-report`
  - `apps/web/test-results`
  - `apps/api/dist`
  - `packages/*/dist`
  - `packages/database/generated`
  - `apps/api/src/coverage`

## Current Harness Initiatives

- Foundation: `design/initiatives/I-0001-harness-foundation.md`
- Verification: `design/initiatives/I-0002-harness-verification.md`
- Review: `design/initiatives/I-0003-review-harness.md`

## Current Limitation

- Lint and CI hardening are not fully complete yet. Track that work in `I-0002-harness-verification`.
- `pnpm lint` is green, but web still has tracked `react-hooks/exhaustive-deps` warnings under `I-0002-060`.

# AGENTS

This repository is being reshaped into an agent-friendly engineering harness for `mastersrunners`, a Korean running community platform.

## Start Here

Read in this order:

1. `AGENTS.md`
2. `tasks/` for the active initiative or assigned task
3. `design/` for technical design and architecture
4. `docs/domain/` for business rules
5. `docs/runbooks/environment-and-settings.md`
6. `docs/runbooks/harness-diagnostics.md`
7. `docs/runbooks/` for operational procedures

## Source of Truth Map

- Product and business rules: `docs/domain/`
- Technical design: `design/frontend/`, `design/backend/`, `design/architecture/`
- Architectural decisions: `design/adr/`
- Harness diagnostics workflow: `docs/runbooks/harness-diagnostics.md`
- External blockers and proof: `design/operating-rules/exceptions.md`
- Readability budget registry: `scripts/check-size-budgets.targets.json`
- Operating rules and exceptions: `design/operating-rules/`
- Large change framing: `design/initiatives/`
- Execution state: `tasks/`
- Operational guidance: `docs/runbooks/`
- Runtime environment and settings index: `docs/runbooks/environment-and-settings.md`
- Executable deployment/test automation: `.github/workflows/`, `scripts/`

## Repo Summary

- Web: Vite + React 19 SPA with React Router v7
- API: NestJS 11
- Data: Prisma + PostgreSQL
- Shared packages: `packages/database`, `packages/types`
- Storage: Cloudflare R2 with local disk fallback in development paths

## Working Rules

- Do not use `README.md` as the only source of truth for feature status. Check `design/`, `docs/domain/`, and `tasks/`.
- Use on-demand `harness-diagnostics` runs instead of maintaining a standing in-repo score snapshot.
- If a blocker cannot be fully proven or closed inside the repository, track it in `design/operating-rules/exceptions.md` with a durable `EX-xxxx` id.
- Readability budget exceptions live in `scripts/check-size-budgets.targets.json`, not in ad hoc notes.
- Status lives in task folder location, not in duplicated `status:` metadata inside task files.
- One task file should represent one executable unit of work.
- One initiative file should represent one large change, not one commit.
- When changing technical behavior, update the relevant design or domain document in the same task.
- When changing workflows or scripts, update the matching runbook in the same task.
- Every task needs at least one specialist review before commit.
- Every task also needs a PO review before commit, including docs-only work.
- Multi-scope changes need the union of the relevant specialist reviewers, not just one reviewer.
- Review requirements live in the task file. Do not treat a task as done until review and verify are both complete.
- Pull requests are optional collaboration artifacts. Do not treat PR state, comments, or approvals as the repository's completion truth.
- Do not commit free-floating `TODO` or `FIXME` markers. Link them to a task as described in `docs/guides/todo-fixme-policy.md`.

## Coding Conventions

- Frontend coding conventions live in `design/frontend/conventions.md`.
- Backend coding conventions live in `design/backend/conventions.md`.
- Repository-wide commit conventions live in `design/operating-rules/commit-conventions.md`.
- If those docs are stricter than current implementation, keep the design truth and track the gap with tasks instead of weakening the convention.
- Agent self-review guidance lives in `docs/guides/agent-self-review.md`.
- Reviewer-role guidance lives in `docs/guides/reviewer-taxonomy.md`.
- Commit message subjects are validated in the `commit-msg` hook, not the `pre-commit` hook.
- Parallel split and merge workflow lives in `design/operating-rules/parallel-worktree-lifecycle.md` and `docs/guides/parallel-worktree-workflow.md`.

## Design Divergence Handling

- Do not downgrade approved design or domain docs to match weak or incomplete implementation.
- If code diverges from approved design, record the gap as a `Current Divergence` note or task note, then create a follow-up task.
- The default resolution path is delegated agent work, not direct human patching outside the task system.
- A commit message should describe change intent, not replace intent with a task ID. Put task tracking in trailers.
- If the current worktree already has unrelated dirty changes, preserve them and run new parallel work in dedicated git worktrees.

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
3. Run the self-review checklist in `docs/guides/agent-self-review.md`
4. Run the task's `verify` commands
5. Get the required specialist review
6. Get PO review
7. Move the task from `active/` to `archive/` in the same changeset that finalizes the work
8. Commit only after review and verify gates are satisfied

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
- Create a new task by copying `tasks/_templates/TASK-TEMPLATE.md` into the right initiative and state folder
- Run workspace lint: `pnpm lint`
- Run explicit workspace typecheck: `pnpm typecheck`
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
- Start env/config lookup at `docs/runbooks/environment-and-settings.md`, then follow the linked runbooks and example env files instead of searching old plans.
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

## Current Limitation

- A few guardrail and readability items still rely on external exceptions or follow-up tasks. Check `design/operating-rules/exceptions.md`, `scripts/check-size-budgets.targets.json`, and run `harness-diagnostics` on demand when you need a fresh audit.
- Initiative inventory lives under `design/initiatives/`; avoid duplicating a separate live list here.

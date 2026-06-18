# AGENTS

This repository is the source of truth for `mastersrunners`, a Korean running community platform.

## Start Here

Read in this order:

1. `AGENTS.md`
2. `tasks/README.md` for the task system, then `tasks/active/` for in-flight work or `tasks/` to inspect the queue
3. `design/initiatives/` when the work is larger than one task
4. `design/` for technical design and architecture
5. `docs/domain/` for business rules
6. `docs/runbooks/environment-and-settings.md`
7. `docs/runbooks/harness-diagnostics.md`
8. `docs/runbooks/` for operational procedures

## Source of Truth Map

- Product and business rules: `docs/domain/`
- Technical design: `design/frontend/`, `design/backend/`, `design/architecture/`
- Architectural decisions: `design/adr/`
- External blockers and proof: `design/operating-rules/exceptions.md`
- Readability budget registry: `scripts/check-size-budgets.targets.json`
- Operating rules and exceptions: `design/operating-rules/`
- Large change framing: `design/initiatives/`
- Execution state: `tasks/todo/`, `tasks/active/`, `tasks/archive/`
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
- If a blocker cannot be fully proven or closed inside the repository, track it in `design/operating-rules/exceptions.md` with a durable `EX-xxxx` id.
- Readability budget exceptions live in `scripts/check-size-budgets.targets.json`, not in ad hoc notes.
- Status lives in task folder location, not in duplicated `status:` metadata inside task files.
- One task file should represent one executable unit of work.
- One initiative file should represent one large change, not one commit.
- When changing technical behavior, update the relevant design or domain document in the same task.
- When changing workflows or scripts, update the matching runbook in the same task.
- Review is optional. If a task needs a second reader, record the requested focus in the task file.
- When the work is repository workflow maintenance, keep changes repo-scoped and do not modify production code.
- Pull requests are optional collaboration artifacts. Do not treat PR state, comments, or approvals as the repository's completion truth.
- Do not commit free-floating `TODO` or `FIXME` markers. Link them to a task as described in `docs/guides/todo-fixme-policy.md`.

## Coding Conventions

- Frontend coding conventions live in `design/frontend/conventions.md`.
- Backend coding conventions live in `design/backend/conventions.md`.
- Repository-wide commit conventions live in `design/operating-rules/commit-conventions.md`.
- If those docs are stricter than current implementation, keep the design truth and track the gap with tasks instead of weakening the convention.
- Agent self-review guidance lives in `docs/guides/agent-self-review.md`.
- Commit message subjects are validated in the `commit-msg` hook, not the `pre-commit` hook.
- Parallel split and merge workflow lives in `design/operating-rules/parallel-worktree-lifecycle.md` and `docs/guides/parallel-worktree-workflow.md`.

## Design Divergence Handling

- Do not downgrade approved design or domain docs to match weak or incomplete implementation.
- If code diverges from approved design, record the gap as a `Current Divergence` note or task note, then create a follow-up task.
- The default resolution path is a linked follow-up task, not ad hoc patching outside the task system.
- A commit message should describe change intent, not replace intent with a task ID. Put task tracking in trailers.
- If a bad change has already been pushed or merged, preserve that signal with a follow-up `fix` or `revert` commit plus a linked task instead of silently replacing shared history.
- If the current worktree already has unrelated dirty changes, preserve them and run new parallel work in dedicated git worktrees.
- If the current worktree is clean and no parallel split is needed, in-place task work is acceptable.

## Task Workflow

Task path pattern:

```text
tasks/<status>/<initiative-id>-<order>-<scope>-<slug>.md
```

Example:

```text
tasks/todo/I-0002-010-meta-eslint-repair.md
```

Lifecycle:

1. Create a task in `tasks/todo/`
2. Move the task to `tasks/active/` when work starts
   - For parallel work or dirty-main-worktree cases, prefer `pnpm worktree:bootstrap -- --path <path> --task-file tasks/todo/<task>.md`.
3. Keep the matching initiative document's `Task Breakdown` in sync with the task path
4. Update the task notes while working
5. Run the self-review checklist in `docs/guides/agent-self-review.md`
6. Run the task's `verify` commands
7. Run optional task-specific review if the task file calls for it
8. Move the task from `tasks/active/` to `tasks/archive/` in the same changeset that finalizes the work
9. Commit only after implementation and mechanical verification gates are satisfied

Initiative and ADR order:

1. Create or update a matching file in `design/initiatives/` when the change is larger than one task
2. Create tasks under `tasks/todo/` and link them from the initiative's `Task Breakdown`
3. Update `design/` docs as current technical truth while implementing
4. Update `docs/domain/` or `docs/runbooks/` when business or operational truth changes
5. Add an ADR in `design/adr/` only when a technical choice needs a durable decision record

## Common Commands

- Install dependencies: `pnpm install`
- Run dev: `pnpm dev`
- Build workspace: `VITE_API_URL=http://localhost:4000/api/v1 pnpm build`
- Create a new task by copying `tasks/_templates/TASK-TEMPLATE.md` into `tasks/todo/`
- Bootstrap an isolated task worktree: `pnpm worktree:bootstrap -- --path /tmp/<worktree> --task-file tasks/todo/<task>.md`
- Run workspace lint: `pnpm lint`
- Run explicit workspace typecheck: `pnpm typecheck`
- Run local CI approximation: `pnpm ci:local`
- Run API tests: `pnpm --filter @masters/api test`
- Run API e2e tests: `pnpm --filter @masters/api test:e2e`
- Run a single API spec: `pnpm --filter @masters/api test -- --runTestsByPath src/auth/auth.service.spec.ts`
- Build web only: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
- Verify deployment target: `pnpm deploy:verify -- http://localhost:4000`

## Gotchas

- Canonical workout units are meters, seconds, and seconds per kilometer.
- Canonical deploy verification health endpoint is `GET /api/v1/health`; legacy `GET /health` remains available for compatibility.
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

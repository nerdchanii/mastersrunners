---
doc_state: current
owner: harness
last_verified: 2026-03-12
sources:
  - AGENTS.md
  - git log --oneline -20
---

# Commit Conventions

Use commit subjects to describe change intent. Use trailers to link the change back to the task system.

## Subject Format

```text
<type>(<scope>): <imperative summary>
```

Examples:

- `feat(web): add direct message entry points`
- `fix(repo): remove duplicated task file`
- `refactor(api-crews): split membership and activity orchestration`
- `docs(frontend): define route composition conventions`
- `ci(repo): update workflow guardrails`

## Allowed Types

- `feat`: user-visible capability added
- `fix`: incorrect behavior corrected
- `refactor`: internal structural improvement without intended behavior change
- `docs`: documentation-only change
- `test`: test-only change
- `ci`: workflow, hook, or automation change
- `build`: dependency, toolchain, or build pipeline change
- `perf`: performance-oriented change
- `revert`: explicit rollback of an existing commit

## Scope Rules

- Prefer the narrowest stable boundary that explains the change:
  - `web`
  - `api`
  - `db`
  - `repo`
  - `docs`
  - `ci`
  - domain scopes such as `auth`, `crews`, `events`, `profile`
- Do not use a task ID as the commit scope.

## Task Linkage

Commit subjects should not use `task(...)` as the intent signal.

Bad:

```text
task(I-0007-040 ci): remove duplicated todo copy
```

Good:

```text
fix(repo): remove duplicated I-0007 todo copy
```

Add task linkage in trailers instead.

Recommended trailers:

```text
Task: I-0007-040
Initiative: I-0007
Verify: bash scripts/check-size-budgets.sh
```

## Commit Cadence

- Prefer one validated commit per executable unit of work.
- If a task is too broad to produce a coherent reviewed commit quickly, split the task instead of banking a long-lived hidden diff.
- Do not push half-finished work to shared history just to create more commits; correction history starts once a bad commit is actually shared.

Correction commits should add one of these linkage trailers as well:

```text
Fixes: <commit_sha>
```

or

```text
Reverts: <commit_sha>
```

Use the shortest clear SHA that resolves in the repository. Add a short reason in the body or a `Reason:` trailer when the correction would otherwise be ambiguous.

## Correction History

- Before a change is pushed or merged, keep fixing it inside the current task branch until it is ready for integration.
- After a bad commit exists in shared history, do not hide it with force-push, silent replacement, or an unrelated follow-up task.
- Use a follow-up `fix` commit when the intended change should stay but the implementation needs correction.
- Use a `revert` commit when the fastest safe path is to roll back to the last known good state.
- A correction to shared history should get its own task so the original mistake and the recovery remain understandable in `git log`, task archives, and review notes.
- If you revert first and re-land later, the re-landing should be a new `fix` or `feat` task rather than an amendment of the reverted commit.

## Enforcement

- Repository automation validates commit subjects in the `commit-msg` hook.
- `pre-commit` is for file-content checks. Commit message validation belongs in `commit-msg`.
- `pre-commit` escalates to `bash scripts/run-typecheck.sh` when staged changes touch TypeScript-sensitive files or configs.
- `pre-push` runs `pnpm ci:local` so the full local CI mirror executes before changes leave the workstation.
- The enforced rules currently cover:
  - allowed commit `type`
  - required non-empty `scope`
  - required non-empty `subject`
  - header length
  - scope must not be a task ID
- Trailer structure is still documented policy first. It is not fully machine-enforced yet.

## Notes

- Historical commits may predate this policy. Do not rewrite existing history just to match the convention.
- `revert` commits should still explain the operational signal in the body or trailers.
- See `docs/runbooks/correction-commit-flow.md` for the operating procedure that chooses between `fix` and `revert`.

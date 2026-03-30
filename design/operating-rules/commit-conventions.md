---
doc_state: current
owner: harness
last_verified: 2026-03-12
sources:
  - AGENTS.md
  - git log --oneline -20
  - docs/guides/review-harness.md
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
- `ci(repo): enforce task review metadata`

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
Reviewers: harness-reviewer, po-reviewer
Verify: bash scripts/check-size-budgets.sh
```

## Enforcement

- Repository automation validates commit subjects in the `commit-msg` hook.
- `pre-commit` is for file-content checks. Commit message validation belongs in `commit-msg`.
- `pre-commit` escalates to `bash scripts/run-typecheck.sh` when staged changes touch TypeScript-sensitive files or configs.
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

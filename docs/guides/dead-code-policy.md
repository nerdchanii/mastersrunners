---
doc_state: current
owner: harness
last_verified: 2026-03-12
sources:
  - knip.json
  - package.json
  - .github/workflows/ci.yml
  - scripts/ci-local.sh
---

# Dead Code Policy

Use this policy to keep dead-code drift from re-entering the repository.

## Guardrail

- `pnpm knip` is the blocking dead-code check.
- CI and `pnpm ci:local` both run the same guard.
- The committed `knip.json` is the baseline contract for current debt.

## Baseline Rules

- Baseline ignores must be explicit and path-scoped.
- Do not add blanket globs such as `apps/**` or `**/*.ts`.
- If a new ignore is needed, the same task must explain why the item is intentionally retained and when it should be revisited.
- Remove baseline entries when the touched code is cleaned up. Do not let the ignore list grow silently.

## Cleanup Cadence

- Any task that materially edits a file already listed in `knip.json` should try to remove the matching ignore entry in the same task.
- If a cleanup is too large for the current task, keep the code change scoped and create a follow-up task instead of weakening the guard.
- Harness maintenance tasks should review the baseline on every scorecard push that touches `OPS-001` or `OPS-002`.

## Current Intentional Baseline

The current baseline covers three categories only:

- legacy e2e/support files that are not yet wired into the active Jest entry graph
- UI and hook exports that remain intentionally wider than current imports while route/readability work is still landing
- workspace/runtime dependencies that are required indirectly or by external tooling even when static import analysis cannot prove usage

This baseline is transitional debt, not a permanent exemption.

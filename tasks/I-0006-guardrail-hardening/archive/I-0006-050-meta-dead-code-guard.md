---
id: I-0006-050
title: Add dead-code guard
parent: I-0006-guardrail-hardening
scope: ci
owner: harness
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0006-010
blocked_by: []
verify:
  - pnpm knip
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - knip.json
  - package.json
  - scripts/run-knip.sh
  - scripts/ci-local.sh
  - .github/workflows/ci.yml
  - docs/guides/dead-code-policy.md
---

## Goal

Introduce a dead-code detector with an explicit ignore policy.

## Done Criteria

- knip config exists
- CI blocks new dead code according to the committed policy

## Notes

- Ignore list must be justified, not blanket.

## Self Review

- [x] Scope stayed inside dead-code tooling, CI wiring, and policy only.
- [x] The baseline is explicit and path-scoped instead of using broad ignore globs.
- [x] Existing debt was not silently deleted or hidden in design/docs; it remains visible in `knip.json` and policy docs.
- [x] Local and CI execution paths use the same `pnpm knip` entrypoint.

## Review Focus

- Specialist reviewer should check:
  - the ignore baseline is path-scoped and not a blanket escape hatch
  - `pnpm knip` is the single execution path reused by CI and local CI
- PO reviewer should check:
  - the guardrail improves repository safety without forcing unrelated cleanup into this task

## Handoff

- Readability refactors should use knip output as a cleanup aid, not as a behavior spec.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: ran `knip` baseline, captured the current debt set, and converted it into an explicit config plus maintenance policy instead of a blanket exclusion.
- 2026-03-12: `pnpm knip`, `pnpm format:check`, and `bash scripts/check-task-review-metadata.sh` all passed after wiring the new guard.

## Review Notes

- Specialist review: `harness-reviewer` internal role review passed. Checked that the config is path-scoped, CI/local CI share one entrypoint, and the guard blocks new debt without rewriting existing code.
- PO review: `po-reviewer` internal role review passed. Checked that the new guard raises harness safety without forcing unrelated cleanup into this task.

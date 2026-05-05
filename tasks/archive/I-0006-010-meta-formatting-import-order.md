---
id: I-0006-010
title: Add formatting and import-order guardrails
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-010
blocked_by: []
verify:
  - pnpm format:check
  - pnpm lint
artifacts:
  - .prettierrc.json
  - .editorconfig
  - eslint.config.mjs
---

## Goal

Lock formatting and import-order behavior with committed configuration and blocking checks.

## Done Criteria

- formatting config is explicit
- import sorting is enforced automatically

## Notes

- This task should not introduce boundary tooling yet.

## Review Focus

- Specialist reviewer should check: formatter config is explicit, import order is blocking, and no boundary-specific behavior leaked into this task.
- PO reviewer should check: the guardrail is proportionate and improves harness reliability without widening scope.

## Handoff

- Boundary/cycle tooling should assume this base lint shape exists.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: Added explicit Prettier and EditorConfig files, wired `simple-import-sort` into the root ESLint config, and ran autofix across api/web/packages.
- 2026-03-12: Verified with `pnpm format:check`, `pnpm --filter @masters/api lint`, and `pnpm --filter @masters/web lint`.

## Review Notes

- Specialist review: `harness-reviewer` approved. Formatting and import-order rules are explicit, enforced locally, and exercised against the workspace.
- PO review: approved. The guardrail is proportionate to the churn it prevents and does not expand product scope.

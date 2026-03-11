---
id: I-0002-010
title: Repair workspace ESLint configuration
parent: I-0002-harness-verification
scope: ci
owner: codex
reviewers:
  - backend-reviewer
  - frontend-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api lint
  - pnpm --filter @masters/web lint
  - pnpm lint
artifacts:
  - apps/api/package.json
  - apps/web/eslint.config.mjs
  - package.json
---

## Goal

Make linting executable again for both API and web packages.

## Done Criteria

- API lint has a valid ESLint config
- Web lint matches the actual Vite/React architecture
- root `pnpm lint` passes

## Notes

- Current state is broken and blocks reliable harness verification
- Added a root flat ESLint config for the workspace and removed the stale web Next.js config.
- `pnpm --filter @masters/api lint`, `pnpm --filter @masters/web lint`, and `pnpm lint` now complete successfully.
- Web lint still reports `react-hooks/exhaustive-deps` warnings that should be burned down in follow-up work.

## Handoff

- If warnings need to become failures later, fix the remaining hook dependency warnings before tightening the rule level.

## Attempt Log

- 2026-03-11: installed ESLint workspace dependencies, replaced the stale web-only Next config with a root flat config, and cleaned the initial unused-variable errors that blocked lint execution

## Review Notes

- Specialist review: backend-reviewer - restored the explicit `userSubRegion` repository contract and confirmed the API-side edits are otherwise lint-only cleanups.
- Specialist review: frontend-reviewer - no runtime regressions were found in the changed web files, but web lint still depends on the root ESLint config and leaves tracked hook warnings.
- Specialist review: harness-reviewer - lint is executable again, but warning-free enforcement is still a follow-up rather than part of the current gate.
- PO review: accepted with follow-up - the task restores a working lint loop, while warning burn-down remains tracked separately in `I-0002-060`.

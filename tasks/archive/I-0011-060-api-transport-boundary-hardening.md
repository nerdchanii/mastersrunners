---
id: I-0011-060
title: Harden API transport boundaries around controllers and DTOs
parent: I-0011-domain-truth-and-boundary-hardening
scope: api
owner: codex
reviewers:
  - backend-reviewer
  - architecture-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - pnpm lint
  - pnpm --filter @masters/api test
  - 'bash -lc ''if rg -n "@Body\\(\\) body: \\{|@Body\\(\"|@Query\\(\".*\"\\) .*\\?: string" apps/api/src/*controller.ts apps/api/src/**/*controller.ts -g "!**/*.spec.ts"; then exit 1; else exit 0; fi'''
artifacts:
  - design/backend/conventions.md
  - apps/api/src/
---

## Goal

Make controller transport rules concrete by replacing inline request-shape shortcuts with DTO-driven transport boundaries.

## Done Criteria

- controllers accept DTOs or clearly typed transport contracts instead of inline object bodies and ad hoc field extraction
- controller-level branching that belongs to service or policy logic is pushed down behind the transport boundary
- backend conventions describe the enforced controller shape clearly enough for future review and follow-up work

## Notes

- Focus on representative hotspots first, especially modules where inline body/query handling currently hides business-rule branching.
- Do not mix unrelated service refactors into this task unless the transport boundary cannot be restored otherwise.

## Self Review

- Scope and intent: Replaced inline controller request-shape shortcuts with DTO/query objects across challenge, conversation, crew-board, crew, event, feed, notification, post, upload, workout, and workout-social endpoints.
- Source of truth: `design/backend/conventions.md`, the updated controller/DTO files under `apps/api/src/**`, and the passing Jest controller/service suite.
- Design divergence: None. This task intentionally stops at controller transport cleanup and leaves persistence/logging boundary work to `I-0011-070`.
- Verification: `bash scripts/check-task-review-metadata.sh`; `pnpm lint`; `pnpm --filter @masters/api test`; `bash -lc 'if rg -n "@Body\\(\\) body: \\{|@Body\\(\"|@Query\\(\".*\"\\) .*\\?: string" apps/api/src/*controller.ts apps/api/src/**/*controller.ts -g "!**/*.spec.ts"; then exit 1; else exit 0; fi'`
- Review routing: `backend-reviewer`, `architecture-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: controllers are cleaner transport boundaries and the DTO rule is more enforceable after the change.
- PO reviewer should check: the structural cleanup reduces contract ambiguity without introducing behavior drift.

## Handoff

- Follow-on backend work should assume DTO-driven controller boundaries are the default and treat inline request shapes as debt, not style preference.

## Design Divergence

- None.

## Attempt Log

- 2026-03-30: created after controller review found repeated inline body/query shapes and controller-owned branching in current API modules.
- 2026-03-30: completed DTO/query-object adoption across representative controller hotspots, updated backend conventions, and cleaned spec import ordering so lint, tests, and banned-pattern grep all pass together.

## Review Notes

- Specialist review: 2026-03-30 `backend-reviewer` and `architecture-reviewer` pass. Confirmed controllers now accept DTOs/query objects instead of inline field extraction, and the banned inline transport patterns are absent across controller files.
- PO review: 2026-03-30 `po-reviewer` pass. Confirmed the contract cleanup preserves behavior and reduces ambiguity; `pnpm --filter @masters/api test` passed with 53/53 suites green.

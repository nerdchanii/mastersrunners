---
id: I-0011-070
title: Clarify API persistence and runtime logging boundaries
parent: I-0011-domain-truth-and-boundary-hardening
scope: api
owner: codex
reviewers:
  - backend-reviewer
  - architecture-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0011-060
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - pnpm lint
  - pnpm --filter @masters/api test
  - 'bash -lc ''if rg -n "console\\.(log|error|warn|info)" apps/api/src -g "!**/*.spec.ts"; then exit 1; else exit 0; fi'''
  - rg -n "DatabaseService|StructuredLoggerService|MonitoringService" design/backend/conventions.md apps/api/src/profile apps/api/src/block apps/api/src/crew-boards apps/api/src/common/logging apps/api/src/common/monitoring
artifacts:
  - design/backend/conventions.md
  - apps/api/src/profile/
  - apps/api/src/block/
  - apps/api/src/crew-boards/
  - apps/api/src/common/logging/
  - apps/api/src/common/monitoring/
---

## Goal

Define and enforce where direct persistence access and runtime logging belong in API modules so the service layer stops drifting into unstructured DB and console usage.

## Done Criteria

- direct `DatabaseService` usage is limited to documented boundary owners such as repositories or explicit persistence services
- hotspot feature services that currently bypass the boundary are refactored or explicitly tracked as follow-up debt
- runtime `console.*` usage is removed from API code in favor of structured logging and documented failure-handling policy
- backend conventions record the allowed persistence and logging boundaries clearly

## Notes

- Keep the first pass focused on the confirmed hotspot modules rather than attempting a full API-wide repository rewrite.
- If a side effect cannot be made fully reliable yet, document the failure contract and remaining follow-up instead of leaving silent console-based handling in place.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: persistence access and runtime logging now happen in explicit, reviewable boundaries rather than opportunistically inside feature services.
- PO reviewer should check: the structural hardening meaningfully lowers operational risk without masking remaining refactor debt.

## Handoff

- Future API modules should treat direct DB access in feature services and runtime `console.*` calls as exceptions that require explicit justification and tracking.

## Design Divergence

- If any hotspot still needs temporary direct persistence access or nonstandard logging after this task, record it here and link the follow-up task.

## Attempt Log

- 2026-03-30: created after backend review found feature services still injecting `DatabaseService` directly and API runtime code still relying on ad hoc console logging.

## Review Notes

- Specialist review:
- PO review:

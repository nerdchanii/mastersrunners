---
id: I-0006-070
title: Add API logging and monitoring scaffold
parent: I-0006-guardrail-hardening
scope: api
owner: codex
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-050
blocked_by: []
verify:
  - pnpm --filter @masters/api build
  - pnpm lint
artifacts:
  - apps/api/src/
  - design/operating-rules/exceptions.md
  - docs/checklists/harness-scorecard.md
  - design/initiatives/I-0006-guardrail-hardening.md
---

## Goal

Introduce structured logging and env-gated monitoring scaffolding without pretending live vendor hookup is complete in-repo.

## Done Criteria

- structured logging baseline is implemented
- monitoring scaffold exists behind env flags
- live vendor hookup remains tracked as an exception until externally proven

## Notes

- Actual DSN/project hookup is not part of this task.

## Self Review

- Scope and intent: limited the runtime change to structured request/error logging plus an env-gated monitoring stub, without claiming live vendor hookup.
- Source of truth: kept `EX-0002` as the live-monitoring exception and only marked the in-repo scaffold as complete.
- Design divergence: none; this task adds the missing scaffold to match the scorecard target instead of weakening the exception model.
- Verification: `pnpm --filter @masters/api build` and `pnpm lint` are the required gates for the touched runtime files.
- Review routing: `backend-reviewer` covers runtime wiring, `harness-reviewer` covers exception/scorecard integrity, and `po-reviewer` checks that the scaffold is proportionate.

## Review Focus

- Specialist reviewer should check: the request interceptor, exception filter, bootstrap wiring, and env gating all behave like a scaffold rather than a fake full monitoring integration.
- PO reviewer should check: the task raises observability quality without overstating production readiness.

## Handoff

- Follow-up ops work can remove the exception when external proof exists.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: implemented structured JSON logging, request-id logging, bootstrap logging, and an env-gated monitoring stub wired into the exception filter.

## Review Notes

- Specialist review:
  - `backend-reviewer` pass on 2026-03-12: request logging, exception logging, and monitoring stub wiring match the current Nest runtime boundaries.
  - `harness-reviewer` pass on 2026-03-12: the task closes the in-repo scaffold without claiming the external monitoring exception is resolved.
- PO review:
  - `po-reviewer` pass on 2026-03-12: accepted as the right level of observability hardening for repository-controlled scope.

---
id: I-0011-080
title: Restore status-aware event result validation
parent: I-0011-domain-truth-and-boundary-hardening
scope: api
owner: codex
reviewers:
  - backend-reviewer
po_review: required
depends_on:
  - I-0011-060
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - pnpm --filter @masters/api test -- --runTestsByPath src/events/events.service.spec.ts
  - rg -n "resultTime|DNS|DNF" apps/api/src/events/dto/submit-event-result.dto.ts apps/api/src/events/events.service.ts apps/web/src/pages/events
artifacts:
  - apps/api/src/events/dto/submit-event-result.dto.ts
  - apps/api/src/events/events.service.ts
  - apps/api/src/events/events.service.spec.ts
  - apps/web/src/pages/events/[id]/index.tsx
---

## Goal

Fix the event result submission contract so DNS/DNF can still be submitted without a fake finish time while `COMPLETED` keeps its required timing rule.

## Done Criteria

- `DNS` and `DNF` submissions are accepted without `resultTime`
- `COMPLETED` submissions still reject missing `resultTime` at validation or service boundary
- the current web payload shape remains compatible with the API contract
- tests cover the status-aware validation behavior explicitly

## Notes

- The current event detail form only includes `resultTime` when the runner actually types a time.
- This follow-up exists because DTO hardening made `resultTime` globally required and introduced a 400 regression for DNS/DNF result submission.
- Prefer status-aware validation over simply making `resultTime` blindly optional with no guard for `COMPLETED`.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the API contract now matches the actual frontend payload shapes for `COMPLETED`, `DNS`, and `DNF`.
- PO reviewer should check: runners can still record non-finish states without inventing fake timing data.

## Handoff

- If event result states later gain richer constraints, encode them as explicit status-based contract rules instead of flat field-required assumptions.

## Design Divergence

- The transport-layer DTO currently overstates a flat required-field rule that the product flow does not follow. This task should restore the contract to the implemented user flow without weakening the completed-result rule.

## Attempt Log

- 2026-03-30: created after review found that `SubmitEventResultDto` made `resultTime` globally required and broke the existing DNS/DNF submission flow used by the event detail page.

## Review Notes

- Specialist review:
- PO review:

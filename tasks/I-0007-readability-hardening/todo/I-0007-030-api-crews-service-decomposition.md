---
id: I-0007-030
title: Decompose crews service by responsibility
parent: I-0007-readability-hardening
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
po_review: required
depends_on:
  - I-0005-050
  - I-0006-020
blocked_by: []
verify:
  - bash scripts/check-size-budgets.sh
  - pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts
artifacts:
  - apps/api/src/crews/crews.service.ts
---

## Goal

Split the oversized crew service into smaller documented responsibilities without changing its public module boundary.

## Done Criteria

- `crews.service.ts` is under the size budget or has a scorecard exception
- extracted helpers/services follow the documented backend boundary rules
- existing crew service tests still pass

## Notes

- This is a responsibility split, not a behavior redesign.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Keep public controller/service behavior stable while moving internal logic.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

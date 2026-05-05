---
id: I-0007-030
title: Decompose crews service by responsibility
parent: I-0007-readability-hardening
scope: api
owner: codex
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

- Specialist reviewer should check: internal responsibility splits stay inside the crews module and preserve controller-facing behavior.
- PO reviewer should check: no product behavior drift was introduced while shrinking the service boundary.

## Handoff

- Keep public controller/service behavior stable while moving internal logic.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: moved to active. Splitting `CrewsService` into internal responsibility services while keeping the public Nest service boundary stable.
- 2026-03-12: extracted membership, tags, activities, and read/chat responsibilities into route-local internal services. Reduced `apps/api/src/crews/crews.service.ts` to 325 lines and added `restoreRsvp` repository seam to preserve cancelled RSVP recovery.
- 2026-03-12: verify passed with `bash scripts/check-size-budgets.sh`, `pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts`, `pnpm --filter @masters/api exec eslint src/crews/crews.service.ts src/crews/internal/crew-membership.service.ts src/crews/internal/crew-tags.service.ts src/crews/internal/crew-activities.service.ts src/crews/internal/crew-read.service.ts src/crews/repositories/crew-activity.repository.ts`, and `pnpm format:check`.

## Review Notes

- Specialist review: `backend-reviewer` pass. The public `CrewsService` boundary remains stable, the main hotspot is below the 350 line budget, and cancelled RSVP recovery still uses an explicit repository seam instead of ad hoc Prisma in the facade.
- PO review: `po-reviewer` pass. This change stays within readability hardening scope, keeps crew management/activity behavior stable, and does not introduce product-scope redesign.

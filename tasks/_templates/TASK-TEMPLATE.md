---
id: I-XXXX-010
title: Short task title
parent: I-XXXX-short-name
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/example.spec.ts
artifacts:
  - apps/api/src/example.ts
---

## Goal

Describe the single unit of work.

## Done Criteria

- Observable outcome
- Observable outcome

## Notes

- Constraints
- relevant links
- For user-facing consumer web work, cite the relevant UX docs under `design/frontend/` in `artifacts` or here in `Notes`.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- What the next task should know

## Design Divergence

- Record any gap between approved design and current implementation.
- If a gap remains after this task, link the follow-up task here.
- Do not rewrite approved design docs downward just to match unfinished code.

## Attempt Log

- YYYY-MM-DD: note an attempt, failure, or important choice

## Review Notes

- Specialist review:
- PO review:

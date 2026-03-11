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

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- What the next task should know

## Attempt Log

- YYYY-MM-DD: note an attempt, failure, or important choice

## Review Notes

- Specialist review:
- PO review:

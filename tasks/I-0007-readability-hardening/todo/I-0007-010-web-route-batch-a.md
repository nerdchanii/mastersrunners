---
id: I-0007-010
title: Refactor web route batch A
parent: I-0007-readability-hardening
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - I-0005-020
  - I-0006-020
blocked_by: []
verify:
  - bash scripts/check-size-budgets.sh
artifacts:
  - apps/web/src/pages/events/[id]/index.tsx
  - apps/web/src/pages/challenges/[id]/index.tsx
  - apps/web/src/pages/messages/[id]/index.tsx
---

## Goal

Make the first three route hotspots smaller and remove direct page-side `api.fetch` from them.

## Done Criteria

- each target route is under the size budget or has a scorecard exception
- direct page-side `api.fetch` is zero in these route files
- smoke checks for events/challenges/messages pass

## Notes

- No allowlist is permitted inside these three files.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- The smoke matrix command and pass result must be recorded in the task attempt log.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

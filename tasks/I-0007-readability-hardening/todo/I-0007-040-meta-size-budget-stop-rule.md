---
id: I-0007-040
title: Add size budget and readability stop-rule checks
parent: I-0007-readability-hardening
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-010
blocked_by: []
verify:
  - bash scripts/check-size-budgets.sh
artifacts:
  - scripts/check-size-budgets.sh
  - docs/checklists/harness-scorecard.md
---

## Goal

Make the readability stop rule machine-checkable for the first-wave hotspot list.

## Done Criteria

- a size-budget script exists
- it checks only the agreed first-wave file list
- exceptions are handled through the scorecard rather than ad hoc notes

## Notes

- This task should not expand the scope beyond the first-wave targets.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Route/service refactor tasks should satisfy this check or add explicit scorecard exceptions.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

---
id: I-0007-040
title: Add size budget and readability stop-rule checks
parent: I-0007-readability-hardening
scope: ci
owner: codex
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
  - scripts/check-size-budgets.targets.json
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

- Specialist reviewer should check: the script only targets the agreed first-wave hotspots and uses the scorecard as the sole exception register.
- PO reviewer should check: the stop rule is strict enough to prevent sprawl while still allowing explicitly tracked temporary exceptions.

## Handoff

- Route/service refactor tasks should satisfy this check or add explicit scorecard exceptions.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: Added `scripts/check-size-budgets.sh` with a fixed first-wave file list and a 350-line stop rule.
- 2026-03-12: Added scorecard-backed temporary exceptions for the current over-budget hotspot set so follow-up refactor tasks have a machine-checkable target.

## Review Notes

- Specialist review: `harness-reviewer` approved. The stop-rule script targets only the agreed first-wave hotspots and uses the scorecard as the exception registry.
- PO review: approved. The stop rule is proportionate and keeps the readability lane constrained to explicit first-wave cleanup.

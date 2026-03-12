---
id: I-0006-060
title: Add PR template and test stability docs
parent: I-0006-guardrail-hardening
scope: docs
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0004-010
blocked_by: []
verify:
  - test -f .github/PULL_REQUEST_TEMPLATE.md
  - test -f docs/runbooks/test-stability.md
  - test -f docs/reports/flaky-tests.md
artifacts:
  - .github/PULL_REQUEST_TEMPLATE.md
  - docs/runbooks/test-stability.md
  - docs/reports/flaky-tests.md
---

## Goal

Document how PRs and test stability are evaluated, including blocking vs advisory suites and flaky test tracking.

## Done Criteria

- PR template exists
- test stability runbook exists
- flaky test ledger exists

## Notes

- This task is about the process contract, not fixing every flaky test immediately.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Future failing tests should reference the stability docs and flaky ledger rather than ad hoc notes.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

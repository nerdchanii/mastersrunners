---
id: I-0006-060
title: Add PR template, test stability docs, and TODO cleanup policy
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
  - test -f docs/guides/todo-fixme-policy.md
artifacts:
  - .github/PULL_REQUEST_TEMPLATE.md
  - docs/runbooks/test-stability.md
  - docs/reports/flaky-tests.md
  - docs/guides/todo-fixme-policy.md
  - AGENTS.md
---

## Goal

Document how PRs and test stability are evaluated, and define the cleanup rule for TODO/FIXME markers.

## Done Criteria

- PR template exists
- test stability runbook exists
- flaky test ledger exists
- TODO/FIXME policy exists and requires task linkage

## Notes

- This task is about the process contract, not fixing every flaky test immediately.
- The TODO/FIXME rule should stay lightweight and task-linked, not turn into a broad code cleanup campaign.

## Self Review

- Scope and intent: limited to repo process docs and templates that close the PR template and TODO/FIXME policy gaps.
- Source of truth: AGENTS, the PR template, and the new docs agree on task-linked TODO/FIXME markers and test stability recording.
- Design divergence: no design downgrade needed; this is a pure guardrail/doc task.
- Verification: file-presence checks, task review metadata validation, and formatting checks were run before archive.
- Review routing: `harness-reviewer`, `docs-reviewer`, and `po-reviewer` cover this scope.

## Review Focus

- Specialist reviewer should check: the PR template, flaky-test ledger, and TODO/FIXME rule are lightweight but enforceable within normal task flow.
- PO reviewer should check: the added process increases traceability without creating excessive ceremony.

## Handoff

- Future failing tests should reference the stability docs and flaky ledger rather than ad hoc notes.
- Future TODO/FIXME markers should reference task IDs instead of floating indefinitely.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: expanded to cover TODO/FIXME cleanup policy because the latest audit tied `SOT-004` and `SOT-010` to the same repo-process lane.

## Review Notes

- Specialist review:
  - `harness-reviewer` pass on 2026-03-12: verified the PR template and TODO/FIXME policy tighten repository process without crossing into dead-code enforcement scope.
  - `docs-reviewer` pass on 2026-03-12: verified the runbook, guide, and ledger are concise, linked, and remain source-of-truth aligned.
- PO review:
  - `po-reviewer` pass on 2026-03-12: accepted the added process as proportionate and useful for traceability without creating unnecessary ceremony.

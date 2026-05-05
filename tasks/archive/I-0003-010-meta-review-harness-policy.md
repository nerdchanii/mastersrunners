---
id: I-0003-010
title: Define specialist review and PO review policy
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - test -f docs/guides/review-harness.md
  - rg -n "PO review|specialist review" AGENTS.md tasks/README.md tasks/_templates/TASK-TEMPLATE.md
artifacts:
  - AGENTS.md
  - docs/guides/review-harness.md
  - tasks/README.md
  - tasks/_templates/TASK-TEMPLATE.md
  - design/initiatives/INITIATIVE-TEMPLATE.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Define the repository review gate so specialist review and PO review are mandatory before commit.

## Done Criteria

- reviewer roles are documented
- PO review is explicitly required for all tasks
- task and initiative templates carry review expectations

## Notes

- This task defines the process contract only. It does not automate reviewer assignment yet.

## Review Focus

- Specialist reviewer should check: the review routing matrix is consistent with current task scopes and harness boundaries.
- PO reviewer should check: the workflow enforces product acceptance before commit, including docs-only tasks.

## Handoff

- The next step is to add machine-checkable enforcement for required review metadata in task files.

## Attempt Log

- 2026-03-11: added review routing, PO gate rules, and task template metadata for specialist review requirements

## Review Notes

- Specialist review: harness-reviewer - the routing matrix and task template changes fit the current scope taxonomy, with metadata enforcement tracked as the next step.
- PO review: accepted with follow-up - the lifecycle is clearer and more disciplined, but commit-readiness is still not fully closed until `I-0003-020` lands.

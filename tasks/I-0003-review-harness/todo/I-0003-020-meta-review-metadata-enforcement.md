---
id: I-0003-020
title: Add machine-checkable enforcement for review metadata
parent: I-0003-review-harness
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0003-010
blocked_by: []
verify:
  - test -f scripts/check-task-review-metadata.sh
artifacts:
  - scripts/check-task-review-metadata.sh
  - .github/workflows/ci.yml
---

## Goal

Prevent new task files from omitting reviewer requirements and PO review metadata.

## Done Criteria

- a script checks required review metadata for non-archived task files
- CI runs the script
- failures point to the offending task files clearly

## Notes

- This should validate task metadata shape, not human review quality itself.

## Review Focus

- Specialist reviewer should check: the enforcement is strict enough to protect the harness but not so brittle that it breaks archived history.
- PO reviewer should check: the added gate supports delivery quality without creating avoidable busywork.

## Handoff

- If this lands, the next natural follow-up is commit message structure tied to task and review completion.

## Attempt Log

- 2026-03-11: task created as follow-up after review policy scaffolding

## Review Notes

- Specialist review:
- PO review:

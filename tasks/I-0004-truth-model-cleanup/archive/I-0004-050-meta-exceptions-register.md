---
id: I-0004-050
title: Add exception register for out-of-repo proof
parent: I-0004-truth-model-cleanup
scope: docs
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0004-010
blocked_by: []
verify:
  - test -f design/operating-rules/exceptions.md
  - rg -n "EX-0001|EX-0002|EX-0003" design/operating-rules/exceptions.md
artifacts:
  - design/operating-rules/exceptions.md
---

## Goal

Track which checklist gaps cannot be proven or closed inside the repository alone.

## Done Criteria

- exception IDs exist with owner, external proof, and revisit rules
- scorecard rows can reference exception IDs deterministically

## Notes

- Exceptions do not count as pass.

## Review Focus

- Specialist reviewer should check: exception criteria are narrow and auditable.
- PO reviewer should check: exceptions reflect real external blockers rather than convenient deferrals.

## Handoff

- Guardrail and ops tasks should only add new exceptions if they meet this schema.

## Attempt Log

- 2026-03-12: created the exception register and linked baseline scorecard rows to explicit exception IDs.

## Review Notes

- Specialist review: harness-reviewer caught the `EX-0003` mislink and the register now cleanly maps live exception IDs to the scorecard rows they justify.
- PO review: accepted after exception handling was narrowed to true out-of-repo blockers instead of being used as a convenience deferral bucket.

---
id: I-0001-020
title: Scaffold design and docs map
parent: I-0001-harness-foundation
scope: docs
owner: unassigned
reviewers:
  - docs-reviewer
po_review: required
depends_on:
  - I-0001-010
blocked_by: []
verify:
  - test -f design/README.md
  - test -f docs/README.md
artifacts:
  - design/README.md
  - design/frontend/README.md
  - design/backend/README.md
  - design/architecture/README.md
  - docs/README.md
  - docs/runbooks/README.md
---

## Goal

Define the top-level boundaries between design docs, supporting docs, and runbooks.

## Done Criteria

- `design/` folders have clear ownership rules
- `docs/` folders have clear ownership rules
- existing `docs/domain` can coexist with the new structure without ambiguity

## Notes

- This is structure scaffolding, not full migration

## Handoff

- Future tasks should migrate legacy documents gradually instead of bulk-moving everything

## Attempt Log

- 2026-03-11: added design/docs indexes and folder-level guidance

## Review Notes

- Specialist review: docs-reviewer - design, docs, and runbook ownership boundaries are explicit enough for future migrations.
- PO review: accepted - the document map improves navigation without forcing a risky bulk migration.

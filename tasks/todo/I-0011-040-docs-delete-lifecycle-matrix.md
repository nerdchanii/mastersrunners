---
id: I-0011-040
title: Document delete and restore lifecycles by entity
parent: I-0011-domain-truth-and-boundary-hardening
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0011-010
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-doc-frontmatter.sh
  - rg -n "soft delete|hard delete|restore|deletedAt" docs/domain/business-rules.md docs/domain/event.md docs/domain/workout.md docs/domain/post-feed.md docs/domain/crew.md docs/domain/dm.md packages/database/prisma/schema.prisma
artifacts:
  - docs/domain/business-rules.md
  - docs/domain/event.md
  - docs/domain/workout.md
  - docs/domain/post-feed.md
  - docs/domain/crew.md
  - docs/domain/dm.md
  - docs/domain/README.md
---

## Goal

Replace blanket deletion statements with an explicit entity-by-entity delete and restore matrix grounded in schema and runtime behavior.

## Done Criteria

- `docs/domain/business-rules.md` states which entities are soft-deleted, hard-deleted, or not restorable in current implementation
- cascade, detach, counter, and visibility side effects are documented for the main entities affected by delete operations
- linked domain docs that mention delete behavior no longer contradict the central matrix

## Notes

- The current repo mixes `deletedAt` models with hard-delete flows such as event removal.
- This task should prefer accuracy over elegance. If the implementation is inconsistent, say so and open a follow-up task instead of smoothing it over.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: delete and restore behavior is grounded in schema and runtime code, not inferred from older blanket rules.
- PO reviewer should check: the matrix makes operational and user-visible consequences of delete actions understandable.

## Handoff

- If the delete model itself should change after this task, create API or DB follow-up work rather than weakening the accuracy of the docs.

## Design Divergence

- Record every entity whose implemented delete behavior still conflicts with desired product rules, then link the follow-up task here.

## Attempt Log

- 2026-03-30: created after review found that current delete rules overstated soft-delete coverage and hid hard-delete cases such as events.

## Review Notes

- Specialist review:
- PO review:

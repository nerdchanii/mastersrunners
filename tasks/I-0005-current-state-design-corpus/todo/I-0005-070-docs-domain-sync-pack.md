---
id: I-0005-070
title: Sync stale domain docs with code and schema
parent: I-0005-current-state-design-corpus
scope: docs
owner: unassigned
reviewers:
  - docs-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0005-050
blocked_by: []
verify:
  - rg -n "WebSocket|FOLLOWERS_ONLY|EventCategory|OfficialResult|userShoeId|ShoeModel|UserShoe|ShoeReview" docs/domain
artifacts:
  - docs/domain/shoe.md
  - docs/domain/event.md
  - docs/domain/dm.md
  - docs/domain/post-feed.md
  - docs/domain/workout.md
  - docs/domain/crew.md
  - docs/domain/glossary.md
---

## Goal

Remove the known stale domain terminology and contradictions that currently drag down the design/source-of-truth score.

## Done Criteria

- known stale terms are removed or explicitly marked as historical
- domain docs align with current design corpus and schema

## Notes

- This task should not invent new future-state concepts.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Later feature work should update these domain docs in the same changeset as behavior changes.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

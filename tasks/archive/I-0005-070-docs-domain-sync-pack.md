---
id: I-0005-070
title: Sync stale domain docs with code and schema
parent: I-0005-current-state-design-corpus
scope: docs
owner: codex
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

## Self Review

- Scope and intent: limited to current canonical domain terminology, stale-term cleanup, and the domain index.
- Source of truth: the updates were grounded in `packages/database/prisma/schema.prisma`, current frontend/backend design docs, and current route/API behavior.
- Design divergence: none; stale legacy terms were removed instead of being preserved as canonical concepts.
- Verification: `rg -n "WebSocket|FOLLOWERS_ONLY|EventCategory|OfficialResult|userShoeId|ShoeModel|UserShoe|ShoeReview" docs/domain` and `bash scripts/check-doc-frontmatter.sh` were run.
- Review routing: `docs-reviewer`, `backend-reviewer`, and `po-reviewer` are required because the task changes canonical business vocabulary.

## Review Focus

- Specialist reviewer should check: the synced domain docs match the current schema and current-state design corpus without leaving stale model names behind.
- PO reviewer should check: the cleaned domain docs are clear enough to serve as the durable product/business reference.

## Handoff

- Later feature work should update these domain docs in the same changeset as behavior changes.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
  - `docs-reviewer` pass on 2026-03-12: confirmed the domain pack now reads as current canonical vocabulary rather than a mix of archived phase terms.
  - `backend-reviewer` pass on 2026-03-12: confirmed the event, shoe, workout, crew, post, and messaging docs align with the Prisma schema and current API/runtime model.
- PO review:
  - `po-reviewer` pass on 2026-03-12: accepted the synced domain docs as the product/business source of truth for future work.

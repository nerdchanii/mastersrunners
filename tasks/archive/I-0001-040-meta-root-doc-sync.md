---
id: I-0001-040
title: Sync root docs with current product and harness structure
parent: I-0001-harness-foundation
scope: docs
owner: mendel
reviewers:
  - docs-reviewer
po_review: required
depends_on:
  - I-0001-010
  - I-0001-020
blocked_by: []
verify:
  - rg -n "Phase 1|서비스 준비 중" README.md
artifacts:
  - README.md
  - DEPLOYMENT.md
---

## Goal

Bring root-level docs in line with the current product state and the new harness layout.

## Done Criteria

- root README no longer advertises an outdated Phase 1-only state
- root-level doc index points readers to the correct design/docs/tasks structure
- root docs do not conflict with current Phase 7-era capabilities

## Notes

- Current README is stale relative to implemented features
- Root README now describes the implemented product areas and the harness entry points.
- Phase 1-only language was removed so root docs no longer conflict with the current repository state.

## Handoff

- Use `docs/domain/` and the initiative/task structure as references while rewriting
- Keep root docs aligned when major initiative structure or top-level runbooks change.

## Attempt Log

- 2026-03-11: rewrote `README.md` to reflect the current product scope, stack, quickstart, and harness entry points

## Review Notes

- Specialist review: docs-reviewer - the root docs now reflect current product scope and point readers to the correct harness entry points.
- PO review: accepted - outdated Phase 1 messaging is removed and the repo now presents the right product state.

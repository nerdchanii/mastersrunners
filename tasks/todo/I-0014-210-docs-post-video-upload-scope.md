---
id: I-0014-210
title: Define the first supported scope for post video uploads
parent: I-0014-ui-bug-board-and-stabilization
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - frontend-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - design/backend/upload-ingestion.md
  - docs/reports/i-0014-ui-bug-board.md
  - tasks/todo/I-0014-210-docs-post-video-upload-scope.md
---

## Goal

Decide whether post video upload is in scope, and if so, define the smallest supported first release before any UI promises are made.

## Done Criteria

- the repo records whether post video is out of scope, exploratory, or approved for a first release
- supported formats, limits, and storage implications are explicitly captured
- post-composer work no longer has to guess whether video is expected

## Notes

- Execution mode: requires product checkpoint before implementation.
- This is a scoping task, not a media-upload implementation task.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the upload boundary is grounded in current storage and ingestion reality.
- PO reviewer should check: the chosen scope matches product intent before UI work advertises video support.

## Handoff

- If video is approved later, create a dedicated implementation task instead of folding it into image-composer work.

## Design Divergence

- The current composer does not confirm video support, but product has already started asking about it.

## Attempt Log

- 2026-04-01: created after product asked whether video upload is supported in the post flow.

## Review Notes

- Specialist review:
- PO review:

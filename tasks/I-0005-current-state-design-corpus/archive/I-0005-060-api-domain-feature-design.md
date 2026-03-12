---
id: I-0005-060
title: Write backend feature design docs
parent: I-0005-current-state-design-corpus
scope: docs
owner: unassigned
reviewers:
  - backend-reviewer
po_review: required
depends_on:
  - I-0005-050
blocked_by: []
verify:
  - bash scripts/check-doc-frontmatter.sh
artifacts:
  - design/backend/social-feed-notifications.md
  - design/backend/messaging-realtime.md
  - design/backend/crew-platform.md
  - design/backend/events-challenges.md
---

## Goal

Document the current backend feature contracts for social/feed, messaging, crews, events, and challenges.

## Done Criteria

- all feature docs exist with current-state frontmatter
- known stale domain terminology is reconciled in the same wave

## Notes

- Group chat and SSE behavior must be documented as current, not future.

## Self Review

- Scope and intent: limited to current-state backend design docs plus boundary-map updates and scorecard alignment.
- Source of truth: docs were grounded in current controllers, services, repositories, and adapter seams already present in the repo.
- Design divergence: none; this task documented current implementation rather than lowering target conventions.
- Verification: `bash scripts/check-doc-frontmatter.sh`, `bash scripts/check-task-review-metadata.sh`, and `prettier --check` on changed files were run.
- Review routing: `backend-reviewer` and `po-reviewer` were sufficient for this docs-only backend scope.

## Review Focus

- Specialist reviewer should check: backend feature docs correctly reflect controller, service, repository, and adapter boundaries without inventing future architecture.
- PO reviewer should check: the new docs make backend work easier to route and reason about without broadening scope.

## Handoff

- These docs should become the primary reference for backend feature behavior.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
  - `backend-reviewer` pass on 2026-03-12: verified the new feature docs and backend boundary map match the current Nest modules and the upload adapter seam.
- PO review:
  - `po-reviewer` pass on 2026-03-12: accepted the docs as execution-oriented current-state references that reduce ambiguity for future tasks.

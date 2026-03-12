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

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- These docs should become the primary reference for backend feature behavior.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

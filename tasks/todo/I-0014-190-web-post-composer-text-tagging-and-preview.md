---
id: I-0014-190
title: Unify post text input with hashtag-mention parsing and preview
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/posts/new/post-composer-steps.tsx
  - apps/web/src/pages/posts/new/use-post-composer.ts
  - apps/web/src/components/feed/PostFeedCard.tsx
---

## Goal

Replace the split content-vs-hashtag fields with one text composer that can extract hashtags and mentions while showing a stronger preview state.

## Done Criteria

- post composition uses one primary text input instead of separate content and hashtag fields
- hashtags are parsed from text and surfaced in a predictable way
- mentions, if supported in the first pass, use a consistent extraction and preview model
- selected media remains visible while the user writes

## Notes

- Execution mode: autonomous unless mention semantics become broader than lightweight parsing and preview.
- Keep this task on authoring and preview behavior, not on video uploads.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the text composer is simpler to use and parsing behavior is understandable.
- PO reviewer should check: the new authoring flow matches the intended Instagram-like composition model.

## Handoff

- If full mention-tagging later needs search-backed autocomplete, build on the same single-input model instead of re-splitting fields.

## Design Divergence

- Current post composition still separates hashtags from the main text flow.

## Attempt Log

- 2026-04-01: created after product requested a single input for content, hashtags, and mention-friendly authoring.

## Review Notes

- Specialist review:
- PO review:

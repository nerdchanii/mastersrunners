---
id: I-0014-180
title: Rework mobile post media selection around a gallery-first picker
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
---

## Goal

Make mobile post media selection feel more like a gallery-first social flow instead of a plain file-input prompt.

## Done Criteria

- image selection feels image-led and mobile-first
- selected media stays visible through the rest of the composition flow
- the uploader still respects browser capability limits and failure states

## Notes

- Execution mode: autonomous.
- Keep this task scoped to still-image selection UX; video support has a separate scoping task.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the image-selection step feels more natural on mobile and remains robust in the browser.
- PO reviewer should check: the media picker is closer to the intended social-post composition flow.

## Handoff

- Text parsing and preview tasks should build on the selected-media state from this task.

## Design Divergence

- Current media selection still reads as a generic click-to-upload step rather than a social gallery flow.

## Attempt Log

- 2026-04-01: created after product requested a more gallery-like mobile media picker and persistent media visibility during composition.

## Review Notes

- Specialist review:
- PO review:

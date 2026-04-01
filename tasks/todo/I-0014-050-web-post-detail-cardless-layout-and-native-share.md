---
id: I-0014-050
title: Flatten post detail and switch sharing to native-first behavior
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
  - apps/web/src/components/post/PostCard.tsx
  - apps/web/src/components/feed/PostFeedCard.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - design/frontend/conventions.md
---

## Goal

Flatten the post detail surface into a cardless layout and switch post sharing to native share-first behavior on supported devices.

## Done Criteria

- `/posts/:id` no longer reads like stacked generic cards
- attached workouts, comments, and post body share one coherent document-style layout
- post sharing uses `navigator.share` when available and falls back gracefully when it is not
- the detail page remains compatible with the separate post-media visibility task

## Notes

- Execution mode: autonomous.
- Keep this task scoped to post detail and post share behavior, not an app-wide card sweep.
- Coordinate with `I-0014-030` so media does not disappear during the layout cleanup.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: post detail hierarchy improved without harming readability, responsiveness, or action clarity.
- PO reviewer should check: the updated post detail feels cleaner and the share action behaves the way mobile users expect.

## Handoff

- Later cardless tasks should reuse the post-detail decisions that work well here instead of reintroducing stacked cards on adjacent social surfaces.

## Design Divergence

- The current post detail route still stacks card wrappers and clipboard-first share behavior even though product direction now rejects that pattern.
- Remove that drift by implementation rather than weakening the design direction to match the current page.

## Attempt Log

- 2026-04-01: created after product review called out stacked card UI and clipboard-only sharing on post detail.

## Review Notes

- Specialist review:
- PO review:

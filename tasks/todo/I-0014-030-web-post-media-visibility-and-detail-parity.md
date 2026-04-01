---
id: I-0014-030
title: Restore post-image visibility on detail routes
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
  - pnpm --filter @masters/api test -- --runTestsByPath src/posts/posts.service.spec.ts
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/components/feed/PostFeedCard.tsx
  - apps/web/src/components/post/PostCard.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/src/hooks/usePosts.ts
  - design/frontend/workout-experience.md
---

## Goal

Make post media visible consistently on post detail routes so image-bearing posts do not lose their primary content after navigation.

## Done Criteria

- a post with attached images shows those images on `/posts/:id`
- feed and detail surfaces keep the same underlying image order and visibility rules
- detail media presentation still works with comments, attached workouts, and later cardless cleanup
- verification covers image parity between feed and detail

## Notes

- Execution mode: autonomous.
- `usePost()` already returns `images`; the current gap is in the detail rendering path.
- Keep this task narrow: restore media parity first, then let broader layout cleanup build on it.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: image-bearing posts render correctly on detail routes and the media layout behaves on mobile.
- PO reviewer should check: the fix matches the expected social-post viewing flow.

## Handoff

- Coordinate with later post-detail cardless work so images remain first-class content instead of being dropped during layout refactors.

## Design Divergence

- Current detail composition fetches post images but does not render them.
- Fix the rendering path rather than rewriting docs to imply feed-only media is acceptable.

## Attempt Log

- 2026-04-01: created from product follow-up after a report that uploaded post images were not visible.

## Review Notes

- Specialist review:
- PO review:

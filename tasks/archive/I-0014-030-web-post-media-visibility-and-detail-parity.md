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
  - apps/web/src/components/post/PostImageGallery.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/e2e/post-detail.spec.ts
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

- Scope and intent: kept the fix narrow to post media parity by wiring detail rendering to the same gallery behavior the feed now uses.
- Source of truth: followed the existing `usePost()` contract, current post detail route, and feed rendering behavior instead of inventing a new media model.
- Design divergence: closed the known gap where detail fetched `images` but dropped them from the page.
- Verification: ran `pnpm --filter @masters/web build`, `pnpm --filter @masters/api test -- --runTestsByPath src/posts/posts.service.spec.ts`, `bash scripts/check-task-review-metadata.sh`, and `VITE_PORT=3000 VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web exec playwright test e2e/post-detail.spec.ts --project=chromium`.
- Review routing: kept `frontend-reviewer` and `ui-ux-reviewer` because the bug is user-visible and the shared gallery behavior affects mobile detail presentation.

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
- 2026-04-01: confirmed the root cause was `PostCard` not accepting or rendering `images`, extracted a shared `PostImageGallery`, and added a targeted post-detail Playwright regression.

## Review Notes

- Specialist review: reviewed the fix against feed/detail parity and mobile rendering behavior. No blocking issues remained after consolidating gallery rendering into one shared component.
- PO review: accepted because image-bearing posts now keep their primary media when navigating into `/posts/:id`, even when attached workouts are present.

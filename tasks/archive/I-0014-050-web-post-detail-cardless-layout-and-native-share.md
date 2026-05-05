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

- Scope and intent: `/posts/:id` 상세를 stacked card에서 section/divider 기반 document layout으로 바꾸고, post 공유를 native-first helper로 통일하는 범위만 다뤘다.
- Source of truth: `design/frontend/conventions.md`, `design/frontend/workout-experience.md`, 현재 post detail/feed 구현을 함께 맞췄다.
- Design divergence: 없음. 기존 clipboard-first 및 stacked-card drift를 구현으로 해소했다.
- Verification: `pnpm --filter @masters/web build`, `VITE_PORT=3000 VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web exec playwright test e2e/post-detail.spec.ts --project=chromium`, `bash scripts/check-task-review-metadata.sh`
- Review routing: user-facing UI 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

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
- 2026-04-01: flattened post detail into one divided document, added native-share-first helper, and kept feed/detail post sharing behavior aligned.

## Review Notes

- Specialist review: post detail now reads as one flow with section dividers, attached workouts deep-link cleanly, and post share prefers the native share sheet before clipboard fallback.
- PO review: `/posts/:id` no longer feels like “게시글 카드 + 훈련 카드 + 댓글 카드” stacked together, and mobile share behavior matches expectation better.

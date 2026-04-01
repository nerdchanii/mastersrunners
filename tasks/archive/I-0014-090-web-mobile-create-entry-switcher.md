---
id: I-0014-090
title: Move the mobile create action into navigation and add a post-workout switcher
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
  - apps/web/src/components/common/BottomNav.tsx
  - apps/web/src/pages/posts/new/index.tsx
  - apps/web/src/pages/workouts/new/index.tsx
  - design/frontend/app-shell-routing.md
---

## Goal

Replace the detached mobile create FAB with a navigation-native create entry that lets runners choose between post and workout creation.

## Done Criteria

- the primary mobile shell owns the create action instead of a detached floating control
- tapping create presents a clear choice between post and workout flows
- the new entry feels consistent with the rest of the mobile navigation model

## Notes

- Execution mode: autonomous.
- Keep this task on the entry point and flow switcher only; composer internals are separate tasks.

## Self Review

- Scope and intent: mobile GNB의 detached post-only FAB를 nav-owned create trigger로 바꾸고, post/workout 선택 및 route 간 전환만 추가했다.
- Source of truth: `design/frontend/app-shell-routing.md`와 현재 `BottomNav`, `posts/new`, `workouts/new` 흐름을 함께 맞췄다.
- Design divergence: 없음. 기존 detached FAB drift를 bottom-nav owned create sheet로 정리했다.
- Verification: `pnpm --filter @masters/web build`, `bash scripts/check-task-review-metadata.sh`
- Review routing: user-facing UI 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: the create action is easier to discover and does not crowd the mobile nav.
- PO reviewer should check: the switcher matches the intended “post or workout” branching model.

## Handoff

- Composer-shell tasks should assume this create entry exists and should not reintroduce route-specific floating buttons.

## Design Divergence

- Current mobile creation entry is post-only and visually detached from the main nav model.

## Attempt Log

- 2026-04-01: created after product requested the mobile plus action move into GNB with a post-vs-workout choice.
- 2026-04-01: replaced the floating post FAB with a center create trigger in the mobile nav, added a bottom-sheet chooser, and exposed a lightweight post/workout switch inside both creation routes.

## Review Notes

- Specialist review: the create action now belongs to the mobile nav model, and the switcher keeps post/workout branching clear without dragging composer internals into this task.
- PO review: tapping the mobile plus action now clearly answers “게시글이냐 운동기록이냐” instead of forcing a post-first path.

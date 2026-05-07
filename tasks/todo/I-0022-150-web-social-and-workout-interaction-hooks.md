---
id: I-0022-150
title: Social like와 workout visibility interaction hooks를 분리한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0022-020-web-query-cache-mutation-conventions.md
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/social/__tests__/social-workout-interaction-hooks.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R5-social-interaction-hooks.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/components/social/LikeButton.tsx
  - apps/web/src/components/workout/ShareToggle.tsx
  - apps/web/src/hooks
---

## 목표

`LikeButton`과 `ShareToggle`의 endpoint, optimistic state, mutation policy를 domain interaction hooks로 옮긴다.

## 완료 기준

- like toggle mutation은 exact entity/feed key를 업데이트하거나 invalidates하고 failure 시 optimistic rollback을 수행한다.
- workout visibility update mutation은 workout detail/list/feed stale state를 제거한다.
- UI components는 표시 상태와 event callback만 소유한다.
- mutation error는 route boundary가 아니라 toast 또는 inline surface로 표현된다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R5-social-interaction-hooks.md`.
- TDD: like optimistic rollback, workout visibility success freshness, mutation failure surface를 focused tests로 먼저 고정한다.
- Comment migration은 CC-130에서 별도로 진행한다.

## 셀프 리뷰

- 범위와 의도: like/workout visibility interaction hook 분리만 다룬다.
- source of truth: I-0022 R3/R5/R8.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 optimistic rollback과 mutation boundary를 확인한다.
- Optional review: `ui-ux-reviewer`가 failure/pending state가 사용자-facing interaction을 해치지 않는지 확인한다.

## 핸드오프

- CC-300에서 social and workout interaction regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- button-local count state나 select-local PATCH가 남으면 divergence로 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

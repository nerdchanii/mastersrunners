---
id: I-0022-220
title: ProfileTabs interaction과 pane rendering을 분해한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/profile/__tests__/profile-tabs-decomposition.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R2-slap-layering-and-route-composition.md
  - docs/initiatives/I-0022-cool-code/details/R7-profile-tabs-composition-and-profile-query.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/components/profile/ProfileTabs.tsx
  - apps/web/src/components/profile
---

## 목표

`ProfileTabs`의 sticky, swipe, tab safety, pane rendering 책임을 분해하고 profile route query migration과 UI interaction regression을 분리한다.

## 완료 기준

- `useProfileTabsInteraction` 또는 동등한 hook이 active tab safety, sticky visibility, swipe gesture를 소유한다.
- tab bar와 posts/workouts/crews pane rendering이 작은 단위로 분리된다.
- profile route fetch/query migration을 이 task에 섞지 않는다.
- sticky tab scroll, mobile swipe threshold, tab switch rendering behavior가 유지된다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R7-profile-tabs-composition-and-profile-query.md`.
- TDD: sticky visibility, swipe threshold, posts/workouts/crews tab rendering을 focused component tests로 먼저 고정한다.
- CC-140은 이 decomposition 이후에 진행한다.

## 셀프 리뷰

- 범위와 의도: ProfileTabs UI decomposition만 다룬다.
- source of truth: I-0022 R2/R7/R8.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 component split과 data contract 불변을 확인한다.
- Optional review: `ui-ux-reviewer`가 sticky/swipe/tab interaction이 기존 사용자 경험을 보존하는지 확인한다.

## 핸드오프

- CC-140은 이 task에서 정리된 pane/rendering boundary 위에서 profile route query migration을 진행한다.

## 설계 divergence

- profile route의 direct fetch/local state divergence는 이 task에서 고치지 않고 CC-140으로 넘긴다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

---
id: I-0022-140
title: Profile route를 domain query hooks로 migration한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0022-020-web-query-cache-mutation-conventions.md
  - tasks/todo/I-0022-220-web-profile-tabs-decomposition.md
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/pages/profile/__tests__/profile-route-query-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R7-profile-tabs-composition-and-profile-query.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/components/profile
  - apps/web/src/hooks
---

## 목표

Profile route의 profile/stats/follower preview/tab data 직접 fetch와 local server state를 profile domain query hooks로 옮긴다.

## 완료 기준

- profile route는 auth redirect와 navigation orchestration만 소유한다.
- profile detail, stats, follower preview, tab data가 domain query options/key factory를 사용한다.
- active tab은 query key 또는 `enabled` condition에 참여해 stale cross-tab render를 막는다.
- unauthenticated profile redirect, posts/workouts/crews tab switch behavior가 유지된다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R7-profile-tabs-composition-and-profile-query.md`.
- TDD: unauthenticated redirect, profile stats refresh, tab-specific cache behavior를 focused tests로 먼저 고정한다.
- 이 task는 CC-220의 ProfileTabs decomposition 이후 진행한다.

## 셀프 리뷰

- 범위와 의도: profile route query migration만 다룬다.
- source of truth: I-0022 R3/R7/R8.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 route/domain hook boundary와 tab query key behavior를 확인한다.
- Optional review: `ui-ux-reviewer`가 tab switch 결과가 사용자에게 stale하게 보이지 않는지 확인한다.

## 핸드오프

- CC-300에서 profile route auth redirect와 tab cache regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- profile route local server state가 남으면 승인된 query migration contract와의 divergence를 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

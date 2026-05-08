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
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web exec vitest run src/pages/profile/__tests__/profile-route-query-migration.test.tsx
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - design/initiatives/I-0022-cool-code/details/R7-profile-tabs-composition-and-profile-query.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/components/profile
  - apps/web/src/hooks
---

## 실제 개선 요약

- profile route에서 직접 `fetch*`와 local server state를 관리하던 코드를 제거하고, profile/stats/follower preview/tab data를 `useProfile` domain query hooks와 query option factory로 옮겼다.
- active tab이 query key와 enabled condition에 참여하도록 바꿔 posts/workouts/crews 전환 시 stale cross-tab render가 남지 않게 했다.
- header auxiliary data 실패는 비치명적 retry notice로, tab data 실패는 tab pane inline retry state로 분리해 empty state와 오류 상태가 섞이지 않도록 정리했다.

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
- 설계 divergence: 없음. route는 auth redirect/navigation orchestration만 유지하고 query key/endpoint ownership은 domain hook으로 이동했다.
- 검증:
  - PASS: `pnpm --filter @masters/web exec vitest run src/pages/profile/__tests__/profile-route-query-migration.test.tsx` 통과, 1 file / 8 tests.
  - PASS: `pnpm lint` 통과.
  - PASS: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` 통과. 기존 large chunk warning만 남는다.
  - PASS: `bash scripts/check-active-task-closeout.sh` 통과.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 route/domain hook boundary와 tab query key behavior를 확인한다.
- Optional review: `ui-ux-reviewer`가 tab switch 결과가 사용자에게 stale하게 보이지 않는지 확인한다.

## 핸드오프

- CC-300에서 profile route auth redirect와 tab cache regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- profile route local server state가 남으면 승인된 query migration contract와의 divergence를 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: Worker A가 task를 `tasks/active/`로 이동하고 profile route query migration TDD red spec 작성을 시작했다. Production migration은 아직 구현하지 않는다.
- 2026-05-08: profile route가 `useProfile`, `useProfileStats`, `useProfileFollowersPreview`, `useProfileCrews`, `useProfileTab` query hooks를 사용하도록 전환했다.
- 2026-05-08: `ProfileTabs`에 tab-scoped error/retry surface를 추가하고 auxiliary header query failures는 non-fatal notice로 분리했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

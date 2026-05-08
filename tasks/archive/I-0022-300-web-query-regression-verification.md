---
id: I-0022-300
title: Query와 UI refactor regression bundle을 검증한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0022-010-web-route-layout-query-reset-recovery.md
  - tasks/todo/I-0022-020-web-query-cache-mutation-conventions.md
  - tasks/todo/I-0022-030-web-router-loader-query-contract.md
  - tasks/todo/I-0022-110-web-event-detail-query-migration.md
  - tasks/todo/I-0022-120-web-challenge-detail-query-migration.md
  - tasks/todo/I-0022-130-web-comment-query-mutation-migration.md
  - tasks/todo/I-0022-140-web-profile-route-query-migration.md
  - tasks/todo/I-0022-150-web-social-and-workout-interaction-hooks.md
  - tasks/todo/I-0022-210-web-crew-board-list-decomposition.md
  - tasks/todo/I-0022-220-web-profile-tabs-decomposition.md
  - tasks/todo/I-0022-230-web-funnel-abstraction-history.md
  - tasks/todo/I-0022-231-web-post-composer-funnel-migration.md
  - tasks/todo/I-0022-232-web-onboarding-funnel-migration.md
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web exec vitest run src/pages/profile/__tests__/profile-route-query-migration.test.tsx
  - pnpm --filter @masters/web exec vitest run src/pages/posts/new/__tests__/post-composer-funnel-migration.test.tsx
  - pnpm --filter @masters/web exec vitest run src/pages/onboarding/__tests__/onboarding-funnel-migration.test.tsx
  - pnpm lint
  - pnpm typecheck
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - design/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - design/initiatives/I-0022-cool-code/details/R4-detail-page-query-migration-contract.md
  - design/initiatives/I-0022-cool-code/details/R5-social-interaction-hooks.md
  - design/initiatives/I-0022-cool-code/details/R6-crew-board-and-crew-detail-composition.md
  - design/initiatives/I-0022-cool-code/details/R7-profile-tabs-composition-and-profile-query.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - design/initiatives/I-0022-cool-code/details/R9-router-loader-query-contract.md
  - design/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - apps/web/src
---

## 실제 개선 요약

- I-0022의 남아 있던 profile route query migration, post composer funnel migration, onboarding funnel migration focused suites를 최종 regression bundle로 재검증했다.
- workspace lint와 typecheck, env-configured web build까지 통과시켜 query/mutation UI refactor와 history-aware funnel refactor가 현재 web baseline에서 함께 성립함을 확인했다.
- initiative README와 task breakdown을 archive 기준으로 동기화해 I-0022의 실행 상태를 `complete`로 닫을 수 있게 정리했다.

## 목표

I-0022 implementation task 완료 후 route recovery, query invalidation, UI decomposition, funnel history regression bundle을 최종 검증한다.

## 완료 기준

- route recovery는 query reset 우선 retry와 inline retry scope를 모두 검증한다.
- event/challenge/comment/social/workout/profile mutation invalidation이 stale UI를 남기지 않는지 확인한다.
- crew board, profile tabs, post composer, onboarding의 사용자-facing interaction regression을 확인한다.
- lint, typecheck, web build, focused regression tests가 통과한다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R8-regression-metrics-and-verification.md`.
- 이 closeout에서는 별도 meta test 파일 대신 task-owned focused suites를 묶어 representative regression bundle로 사용한다.
- implementation set 전체의 설계 truth는 `design/initiatives/I-0022-cool-code/README.md`와 R1-R10 detail docs가 유지한다.

## 셀프 리뷰

- 범위와 의도: I-0022 implementation set의 최종 web regression verification만 다룬다.
- source of truth: I-0022 R1/R3/R4/R5/R6/R7/R8/R9/R10.
- 설계 divergence: 없음. 남은 dirty change는 docs/protocol closeout과 archived task bookkeeping 뿐이며 implementation residual은 새 follow-up 없이 닫을 수 있다.
- 검증:
  - PASS: `pnpm --filter @masters/web exec vitest run src/pages/profile/__tests__/profile-route-query-migration.test.tsx`
  - PASS: `pnpm --filter @masters/web exec vitest run src/pages/posts/new/__tests__/post-composer-funnel-migration.test.tsx`
  - PASS: `pnpm --filter @masters/web exec vitest run src/pages/onboarding/__tests__/onboarding-funnel-migration.test.tsx`
  - PASS: `pnpm lint`
  - PASS: `pnpm typecheck`
  - PASS: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
  - PASS: `bash scripts/check-active-task-closeout.sh`

## 리뷰 계획

- Optional review: `frontend-reviewer`가 route/query/UI regression coverage와 남은 stale UI risk를 확인한다.
- Optional review: `harness-reviewer`가 verification command set과 task closeout readiness를 확인한다.
- Optional review: `ui-ux-reviewer`는 user-facing interaction regression이 발견되거나 funnel/profile/crew behavior가 바뀐 경우에만 요청한다.

## 핸드오프

- I-0022는 이 task archive와 initiative README 동기화 이후 완료로 간주한다.

## 설계 divergence

- implementation set 완료 후에도 승인 설계와 다른 부분이 남으면 이 task에서 숨기지 말고 follow-up task를 생성한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-08: focused migration suites와 workspace lint/typecheck/build를 묶어 final regression bundle을 재검증했다.
- 2026-05-08: initiative README task roadmap을 archive status 기준으로 동기화하고 completion summary를 추가했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

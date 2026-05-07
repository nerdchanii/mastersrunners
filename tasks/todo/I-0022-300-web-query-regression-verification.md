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
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/__tests__/i0022-query-regression.test.tsx
  - pnpm lint
  - pnpm typecheck
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R4-detail-page-query-migration-contract.md
  - docs/initiatives/I-0022-cool-code/details/R5-social-interaction-hooks.md
  - docs/initiatives/I-0022-cool-code/details/R6-crew-board-and-crew-detail-composition.md
  - docs/initiatives/I-0022-cool-code/details/R7-profile-tabs-composition-and-profile-query.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - docs/initiatives/I-0022-cool-code/details/R9-router-loader-query-contract.md
  - docs/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - apps/web/src
---

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
- TDD: 각 implementation task에서 만든 focused tests를 이 task에서 regression bundle로 묶거나 대표 route tests를 추가한다.
- 이 task는 README roadmap의 implementation set 완료 후 진행하며 추가 funnel tasks를 dependency에 포함하지 않는다.

## 셀프 리뷰

- 범위와 의도: I-0022 implementation set의 최종 web regression verification만 다룬다.
- source of truth: I-0022 R1/R3/R4/R5/R6/R7/R8/R9/R10.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 route/query/UI regression coverage와 남은 stale UI risk를 확인한다.
- Optional review: `harness-reviewer`가 verification command set과 task closeout readiness를 확인한다.
- Optional review: `ui-ux-reviewer`는 user-facing interaction regression이 발견되거나 funnel/profile/crew behavior가 바뀐 경우에만 요청한다.

## 핸드오프

- 이 task가 통과하면 I-0022 implementation set의 residual risk와 남은 divergence를 initiative docs 또는 후속 task에 정리한다.

## 설계 divergence

- implementation set 완료 후에도 승인 설계와 다른 부분이 남으면 이 task에서 숨기지 말고 follow-up task를 생성한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

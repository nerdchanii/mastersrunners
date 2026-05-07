---
id: I-0022-120
title: Challenge detail route를 domain query hooks로 migration한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0022-010-web-route-layout-query-reset-recovery.md
  - tasks/todo/I-0022-020-web-query-cache-mutation-conventions.md
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R4-detail-page-query-migration-contract.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/pages/challenges/[id]/useChallengeDetailPage.ts
  - apps/web/src/hooks
---

## 목표

`useChallengeDetailPage`의 직접 fetch, local server state, manual mutation refresh를 challenge domain query/mutation hooks로 옮긴다.

## 완료 기준

- challenge detail route hook은 `api-client`를 직접 import하지 않는다.
- detail과 leaderboard 보조 query가 challenge query options/key factory를 사용한다.
- join/leave/progress/delete mutation success가 exact invalidation 또는 cache update를 사용한다.
- detail failure는 route/page recovery와 연결되고 leaderboard failure는 inline retry/empty state로 표현된다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R4-detail-page-query-migration-contract.md`.
- TDD: challenge detail failure, leaderboard inline failure, mutation invalidation을 focused test로 먼저 고정한다.
- Event detail migration은 CC-110에서 별도로 진행한다.

## 셀프 리뷰

- 범위와 의도: challenge detail query/mutation migration만 다룬다.
- source of truth: I-0022 R1/R3/R4/R8.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 challenge route hook과 domain hook 경계, inline failure UX를 확인한다.

## 핸드오프

- CC-300에서 challenge route recovery와 leaderboard regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- 남은 local server state 또는 silent failure가 있으면 승인된 migration contract와의 divergence를 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

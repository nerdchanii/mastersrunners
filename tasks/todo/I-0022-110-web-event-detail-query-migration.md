---
id: I-0022-110
title: Event detail route를 domain query hooks로 migration한다
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
  - pnpm --filter @masters/web test -- --run src/pages/events/__tests__/event-detail-query-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R4-detail-page-query-migration-contract.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/pages/events/[id]/useEventDetailPage.ts
  - apps/web/src/hooks
---

## 목표

`useEventDetailPage`의 직접 fetch, local server state, manual refetch mutation flow를 event domain query/mutation hooks로 옮긴다.

## 완료 기준

- event detail route hook은 `api-client`를 직접 import하지 않는다.
- 필수 detail, my result, results query가 event query options/key factory를 사용한다.
- register/cancel/result/link/delete mutation success가 local `fetchEvent()` 대신 exact invalidation 또는 cache update를 사용한다.
- 필수 detail failure는 route/page recovery와 연결되고 보조 query failure는 inline retry state를 노출한다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R4-detail-page-query-migration-contract.md`.
- TDD: mutation success 후 `eventKeys.detail`, `eventKeys.myResult`, `eventKeys.results` 갱신을 focused test로 고정한다.
- Challenge detail migration은 CC-120에서 별도로 진행한다.

## 셀프 리뷰

- 범위와 의도: event detail query/mutation migration만 다룬다.
- source of truth: I-0022 R1/R3/R4/R8.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 route hook, domain hook, inline recovery 책임 분리를 확인한다.

## 핸드오프

- CC-300에서 event route recovery와 mutation invalidation regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- 남은 local server state가 있으면 승인된 migration contract와의 divergence를 기록하고 follow-up을 연결한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

---
id: I-0022-010
title: Route layout query reset recovery를 구축한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/router-query-recovery.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - docs/initiatives/I-0022-cool-code/details/R2-slap-layering-and-route-composition.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/router.tsx
  - apps/web/src/app
---

## 목표

Route/layout composite root에 query-aware recovery를 추가해 route fallback의 다시 시도가 full reload보다 `QueryErrorResetBoundary` reset을 우선 호출하게 한다.

## 완료 기준

- `AppProviders`는 provider graph만 소유하고 route recovery 정책을 갖지 않는다.
- route/layout boundary가 `QueryErrorResetBoundary` reset과 router error reset을 연결한다.
- 다시 시도 동작은 query reset을 먼저 호출하고 full reload는 마지막 수단으로만 남긴다.
- 필수 route 데이터 failure와 보조 section failure의 recovery 범위가 섞이지 않는다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R1-query-error-recovery.md`, `R2-slap-layering-and-route-composition.md`, `R8-regression-metrics-and-verification.md`.
- TDD: route error fallback에서 reset callback이 호출되는 focused test를 먼저 추가한 뒤 구현한다.
- 구현 중 승인 설계와 코드가 다르면 승인 설계를 낮추지 말고 divergence 또는 follow-up task로 남긴다.

## 셀프 리뷰

- 범위와 의도: route/layout query recovery만 다룬다.
- source of truth: I-0022 R1/R2/R8.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 provider/layout 책임 분리와 reset 동작을 확인한다.
- Optional review: `harness-reviewer`는 build/lint/test verification이 task scope에 충분한지 확인한다.

## 핸드오프

- CC-110, CC-120은 이 recovery surface를 전제로 detail route query migration을 진행한다.

## 설계 divergence

- 현재 route retry가 full reload 또는 route-level fallback에 치우쳐 있으면 이 task에서 query reset 우선 구조로 정리한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

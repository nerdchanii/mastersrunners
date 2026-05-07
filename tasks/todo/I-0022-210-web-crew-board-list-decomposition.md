---
id: I-0022-210
title: CrewBoardList를 feature composite 단위로 분해한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/crew/__tests__/crew-board-list-decomposition.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R2-slap-layering-and-route-composition.md
  - docs/initiatives/I-0022-cool-code/details/R6-crew-board-and-crew-detail-composition.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/components/crew
---

## 목표

`CrewBoardList`를 query migration 없이 navigation hook과 feature composite roots로 분해해 board UI 회귀와 data/cache migration 회귀를 분리한다.

## 완료 기준

- `useCrewBoardNavigation` 또는 동등한 hook이 selected board/post, routed defaults, composer nonce handling을 소유한다.
- feed/posts/detail/composer entry가 작은 composite/presentational 단위로 분리된다.
- endpoint, query key, invalidation policy 변경을 이 task에 섞지 않는다.
- direct routed board post, board switch, composer nonce, auth-gated access 동작이 유지된다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R6-crew-board-and-crew-detail-composition.md`.
- TDD: routed post open, board switch preservation, composer nonce opens-once behavior를 focused tests로 먼저 고정한다.
- 이 task는 UI decomposition task이며 query/cache migration은 별도 task로 남긴다.

## 셀프 리뷰

- 범위와 의도: CrewBoardList decomposition만 다룬다.
- source of truth: I-0022 R2/R6/R8.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 component boundary와 query policy 불변을 확인한다.
- Optional review: `ui-ux-reviewer`가 board navigation, composer, auth dialog interaction이 유지되는지 확인한다.

## 핸드오프

- 후속 crew detail hardening task가 필요하면 이 task의 설계 divergence에 연결한다.

## 설계 divergence

- crew detail route root의 business state/context shaping 문제가 남으면 후속 task로 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

---
id: I-0022-030
title: Router loader와 Query cache contract를 구축한다
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
  - pnpm --filter @masters/web test -- --run src/router-loader-query-contract.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - docs/initiatives/I-0022-cool-code/details/R9-router-loader-query-contract.md
  - apps/web/src/router.tsx
  - apps/web/src/hooks
---

## 목표

React Router loader가 direct `api.fetch` 대신 domain query option을 `queryClient.ensureQueryData()`로 prefetch하는 계약을 만든다.

## 완료 기준

- loader convention은 `ensureQueryData(domainQueries.detail(id))` 형태를 사용한다.
- component는 같은 query option을 `useQuery`로 읽어 router data와 TanStack Query cache split을 만들지 않는다.
- loader는 route-critical data prefetch와 error boundary trigger만 담당한다.
- auxiliary tab/widget data와 mutation state는 loader로 올리지 않는다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R9-router-loader-query-contract.md`.
- TDD: loader가 query option factory를 호출하고 direct `api-client` import를 갖지 않는 focused test 또는 lint-style assertion을 추가한다.
- 이 task는 contract/pilot foundation이며 event/challenge/profile loader adoption은 별도 구현 task에서 다룬다.

## 셀프 리뷰

- 범위와 의도: router-loader/query-cache contract만 다룬다.
- source of truth: I-0022 R3/R8/R9.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 loader, layout, domain hook 책임이 섞이지 않았는지 확인한다.
- Optional review: `harness-reviewer`가 direct loader fetch 방지 검증이 충분한지 확인한다.

## 핸드오프

- Detail migration task는 loader를 도입할 때 이 contract를 재사용하고, loader result를 별도 cache로 취급하지 않는다.

## 설계 divergence

- 기존 router loader가 direct fetch를 사용하면 승인된 contract로 migration하거나 남은 부분을 follow-up으로 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

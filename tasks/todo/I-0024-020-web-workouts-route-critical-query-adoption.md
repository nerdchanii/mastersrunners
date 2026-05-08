---
id: I-0024-020
title: workouts route를 route-critical query contract로 이관한다
parent: I-0024-route-critical-query-boundary-adoption
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0024-010-web-route-critical-query-policy-and-audit.md
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web exec eslint src/pages/workouts/index.tsx src/hooks/useWorkouts.ts src/router.tsx src/router-loaders.ts
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - apps/web/src/pages/workouts/index.tsx
  - apps/web/src/hooks/useWorkouts.ts
  - apps/web/src/router.tsx
  - apps/web/src/router-loaders.ts
  - design/frontend/conventions.md
---

## 목표

`/workouts` route-critical initial query를 `queryOptions + ensureQueryData + boundary-owned recovery` 구조로 옮기고, page top-level loading/error branching을 제거한다.

## 완료 기준

- `useWorkouts`가 shared query option contract를 제공한다.
- `/workouts` route에 loader prefetch가 연결된다.
- route entry는 query/boundary ownership만 갖고 immediate view/composite에는 props 전달을 기본으로 사용한다.

## 노트

- small route-scoped context는 many-sibling route data/action 공유가 실제로 발생할 때만 고려한다.
- auxiliary section이 추가되면 page 내부의 smaller boundary 또는 inline recovery를 허용한다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 `/workouts` migration이 route-critical vs auxiliary recovery scope를 제대로 나누는지 확인한다.

## 핸드오프

- broader adoption task는 `/workouts` implementation 결과를 기준 패턴으로 재사용한다.

## 설계 divergence

- migration 과정에서 background refetch indicator와 auxiliary section recovery는 route-critical initial failure와 분리되어야 한다.

## 시도 로그

- 2026-05-09: seed task created from the I-0024 initiative after user requested `/workouts` as the first concrete surface.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

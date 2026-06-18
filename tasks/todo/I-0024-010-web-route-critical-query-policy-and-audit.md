---
id: I-0024-010
title: route-critical query policy와 남은 surface audit를 정리한다
parent: I-0024-route-critical-query-boundary-adoption
scope: web
owner: unassigned
depends_on: []
blocked_by: []
verify:
  - git diff --check -- design/frontend/conventions.md design/initiatives/I-0024-route-critical-query-boundary-adoption.md tasks/todo/I-0024-010-web-route-critical-query-policy-and-audit.md
  - rg -n "if \\(isLoading\\)|if \\(error\\)|if \\(isPending\\)|if \\(.*isError.*\\)" apps/web/src/pages -g 'index.tsx'
artifacts:
  - design/frontend/conventions.md
  - design/initiatives/I-0024-route-critical-query-boundary-adoption.md
  - apps/web/src/pages/workouts/index.tsx
  - apps/web/src/router.tsx
  - apps/web/src/app/query-client.ts
---

## 목표

route-critical initial query에 대한 loader/query/boundary 규칙을 문서화하고, `apps/web`에서 남아 있는 top-level loading/error branching surfaces를 audit한다.

## 완료 기준

- `design/frontend/conventions.md`에 route-critical query recovery 규칙이 추가된다.
- `/workouts`를 포함한 대표 남은 surface가 audit 대상으로 기록된다.
- follow-up implementation task가 바로 이어질 수 있게 task breakdown이 initiative에 반영된다.

## 노트

- source of truth는 `I-0022`의 `R1`, `R2`, `R9`와 `design/frontend/conventions.md`다.
- blanket suspense 금지가 아니라, unrelated query를 같은 fallback/error scope에 묶는 high boundary를 피하는 규칙을 명시한다.
- route entry에서 immediate view로의 props 전달을 기본값으로 두고, many-sibling route에서만 small route-scoped context를 허용한다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: route-critical wording, suspense/boundary scope, props-vs-context default를 확인한다.

## 핸드오프

- `I-0024-020`은 `/workouts` route를 첫 migration pilot로 삼고, `queryOptions + ensureQueryData + boundary-owned recovery` 패턴을 적용한다.

## 설계 divergence

- 이번 task는 policy와 audit만 다룬다. production route migration은 후속 task에서 수행한다.

## 시도 로그

- 2026-05-09: user requested the route-critical loading/error boundary rule be added to frontend conventions and tracked as follow-up work rather than being left as ad hoc discussion.

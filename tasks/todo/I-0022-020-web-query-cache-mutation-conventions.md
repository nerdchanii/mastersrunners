---
id: I-0022-020
title: Query key와 mutation cache conventions를 고정한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/hooks/query-conventions.test.ts
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/hooks
  - apps/web/src/lib
---

## 목표

Domain별 query key factory, query option, mutation invalidation ownership convention을 코드와 문서 기준에 맞게 고정한다.

## 완료 기준

- event, challenge, comment, social, workout, profile 관련 key shape와 invalidation rule이 한 위치에서 재사용된다.
- `createAppQueryClient` 외부에서 중복 global `defaultOptions`가 생기지 않는다.
- mutation hook이 endpoint, exact invalidation, optimistic rollback 소유권을 갖는다.
- route/component는 endpoint와 query key를 직접 조합하지 않는 방향으로 후속 migration이 가능하다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R3-query-key-cache-invalidation-matrix.md`.
- TDD: key factory shape, fetch-changing params 포함, mutation invalidation target을 focused unit test로 먼저 고정한다.
- 이 task는 convention 기반을 만드는 작업이며 detail route migration은 CC-110/CC-120/CC-130/CC-140/CC-150에서 분리한다.

## 셀프 리뷰

- 범위와 의도: cache/query convention foundation만 다룬다.
- source of truth: I-0022 R1/R3/R8.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 hook boundary, query key exactness, optimistic rollback ownership을 확인한다.
- Optional review: `harness-reviewer`가 regression task(CC-300)로 넘길 검증 항목이 충분한지 확인한다.

## 핸드오프

- CC-030, CC-110, CC-120, CC-130, CC-140, CC-150은 이 task의 key/query/mutation convention을 사용한다.

## 설계 divergence

- 기존 implementation이 local refetch나 broad invalidation에 의존하면 승인된 convention을 낮추지 말고 migration 대상 note로 남긴다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

# I-0024: Route-Critical Query Boundary Adoption

## Summary

`I-0022`가 만든 query recovery, loader/query contract, layering 규칙을 남은 web route-critical surface에 일관되게 적용하고, top-level loading/error branching 기준을 frontend convention에 고정한다.

## Problem

`I-0022`는 event/challenge/profile/funnel 중심으로 query-first 구조를 닫았지만, `/workouts` 같은 route는 여전히 page top-level `if (isLoading)` / `if (error)` 패턴을 유지한다. 이 상태는 route-critical initial data와 auxiliary query의 recovery scope를 구분하지 못하게 만들고, 구현자가 loader/query/boundary 규칙을 다시 추론하게 만든다.

## Goals

- route-critical initial query의 boundary ownership 규칙을 `design/frontend/conventions.md`에 명시한다.
- `apps/web`에서 남아 있는 top-level loading/error branching surface를 audit한다.
- `/workouts` 같은 남은 route-critical surface를 `queryOptions + ensureQueryData + boundary-owned recovery` 구조로 이관할 작업 단위를 만든다.

## Non-Goals

- auxiliary widget, tab, background refetch의 inline loading/error를 blanket하게 금지하지 않는다.
- 모든 route를 한 task에서 일괄 migration하지 않는다.
- provider graph나 전역 app shell ownership을 다시 설계하지 않는다.

## Scope

- `apps/web/src/pages/**` route entry의 top-level route-critical loading/error branching audit
- route-critical query contract과 boundary ownership rule 문서화
- `/workouts`를 포함한 후속 migration task 분해

## Design References

- `design/frontend/conventions.md`
- `design/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md`
- `design/initiatives/I-0022-cool-code/details/R2-slap-layering-and-route-composition.md`
- `design/initiatives/I-0022-cool-code/details/R9-router-loader-query-contract.md`

## Review Plan

- `frontend-reviewer`: route-critical boundary wording과 route/page ownership이 `I-0022` 설계와 맞는지 확인
- `harness-reviewer`: audit/task decomposition이 repo task workflow와 충돌하지 않는지 확인

## Task Breakdown

- `tasks/todo/I-0024-010-web-route-critical-query-policy-and-audit.md`
- `tasks/todo/I-0024-020-web-workouts-route-critical-query-adoption.md`
- `tasks/todo/I-0024-030-web-route-critical-query-adoption-followups.md`

## Success Criteria

- frontend convention만 읽어도 route-critical initial query의 loader/query/boundary 규칙과 allowed exceptions를 이해할 수 있다.
- `/workouts`를 포함한 남은 route-critical surfaces가 audit artifact와 task breakdown에 명시된다.
- follow-up implementation task가 `I-0022` 재해석 없이 바로 실행 가능한 수준으로 분해된다.

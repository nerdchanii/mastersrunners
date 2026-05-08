---
id: I-0022-010
title: Route layout query reset recovery를 구축한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web exec vitest run src/router-query-recovery.test.tsx
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000 pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - design/initiatives/I-0022-cool-code/details/R2-slap-layering-and-route-composition.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/router.tsx
  - apps/web/src/app
---

## Archive Summary

Route fallback retry now resets React Query error state before remounting route content, and the root router `errorElement` retry now runs query reset before revalidating/replacing the current route. `AppProviders` stays limited to provider composition, full reload remains the explicit last-resort action, and focused coverage now locks both the layout boundary and root route fallback to the query-first recovery path.

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

- 범위와 의도: route/layout query recovery에만 한정했다. `AppProviders`는 건드리지 않고 provider graph 소유권을 유지했으며, events/challenges/profile/query hook migration은 I-0022-020 이후 범위로 남겼다.
- source of truth: I-0022 R1/R2/R8의 query-first route recovery 계약을 구현했다. 승인 설계 자체는 낮추지 않았고, task closeout에 실제 적용 범위와 잔여 scope를 기록했다.
- 설계 divergence: 알려진 divergence는 남아 있지 않다. 보조 section recovery와 후속 event/challenge/profile query migration은 이 task의 완료 기준 밖이며 residual risk로만 기록한다.
- 검증: TDD red/green 증거를 남겼고, focused Vitest, web lint, production build verify가 모두 통과했다. build의 500 kB 초과 chunk 경고는 기존 Vite warning으로 기록했다.
- 리뷰 routing: `frontend-reviewer`가 provider/layout 책임 분리, root `errorElement` coverage, retry command fidelity를 확인했다. `harness-reviewer`는 별도 요청하지 않았고, 명령 correction과 전체 verify pass로 closeout risk를 낮췄다.

## 리뷰 계획

- Completed optional review: `frontend-reviewer`가 provider/layout 책임 분리와 reset 동작을 확인했다.
- Deferred optional review: `harness-reviewer`는 별도 실행하지 않았다. focused command가 review follow-up에서 바로잡혔고 task의 listed verify command가 모두 통과했다.

## 핸드오프

- CC-110, CC-120은 이 recovery surface를 전제로 detail route query migration을 진행한다.

## 설계 divergence

- No known divergence remains for this task. Route/layout retry now prefers `QueryErrorResetBoundary` reset before route remount/revalidation, and the fallback still exposes full reload as an explicit last-resort action.
- Out of scope by design: auxiliary section recovery and later event/challenge/profile query migrations are not exercised by this task's focused tests.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: TDD red. Focused route recovery test를 먼저 추가한 뒤 `pnpm --filter @masters/web test -- --run src/router-query-recovery.test.tsx`를 실행했고, `RouteQueryRecoveryBoundary` export가 없어 실패하는 것을 확인했다.
- 2026-05-07: `RouteQueryRecoveryBoundary`와 root `RootRouteErrorElement`가 `QueryErrorResetBoundary` reset을 retry 흐름 앞단에서 호출하도록 구현하고, `ErrorBoundary`가 retry 시 `onReset`을 받을 수 있게 했다.
- 2026-05-07: Review follow-up. Focused verify command를 `pnpm --filter @masters/web exec vitest run src/router-query-recovery.test.tsx`로 바꿨다. `@masters/web`의 `test` script가 이미 `vitest run`이어서 `test -- --run ...` 형태는 focused 실행 의도를 흐린다.
- 2026-05-07: Review follow-up. Non-development web build는 `docs/runbooks/environment-and-settings.md` 기준 `VITE_API_URL`이 필요하므로 local build verification 명령을 repo-documented placeholder인 `VITE_API_URL=http://localhost:4000` 주입 형태로 바꿨다.
- 2026-05-07: Verification. `pnpm --filter @masters/web exec vitest run src/router-query-recovery.test.tsx` -> 1 file / 2 tests passed.
- 2026-05-07: Verification. `pnpm --filter @masters/web lint` -> passed.
- 2026-05-07: Verification. `VITE_API_URL=http://localhost:4000 pnpm --filter @masters/web build` -> passed with existing Vite chunk-size warnings for chunks over 500 kB.
- 2026-05-07: Review. First `frontend-reviewer` pass requested direct root `errorElement` coverage and clearer focused test command evidence; follow-up addressed both.
- 2026-05-07: Re-review. `frontend-reviewer` approved with no findings. Residual risk: coverage intentionally does not exercise auxiliary section recovery or later event/challenge/profile migrations, consistent with this task's scope.
- 2026-05-07: Coordination note. Manager attempted a full-history GPT-5.5 child fork with model override; the environment rejected that fork mode, then accepted child agent model parameters without full-history override impact on task artifacts.

## 리뷰 노트

- Specialist review:
  - reviewer: `frontend-reviewer`
  - artifact: parent-manager handoff and re-review notes for I-0022-010
  - decision: approved after follow-up
  - findings: first pass requested direct root `errorElement` coverage and a corrected focused verification command; both were addressed before approval.
  - residual risks: coverage intentionally does not exercise auxiliary section recovery or later event/challenge/profile migrations, consistent with task scope.
- Deferred review:
  - reviewer: `harness-reviewer`
  - reason: the only verification-routing issue found in review was corrected in the task file, and focused test/lint/build all passed.

## Verification Evidence

- `pnpm --filter @masters/web exec vitest run src/router-query-recovery.test.tsx` -> 1 file / 2 tests passed, duration about 1.43s.
- `pnpm --filter @masters/web lint` -> passed.
- `VITE_API_URL=http://localhost:4000 pnpm --filter @masters/web build` -> passed; Vite emitted existing chunk-size warnings for chunks over 500 kB.

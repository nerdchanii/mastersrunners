---
id: I-0022-030
title: Router loader와 Query cache contract를 구축한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/archive/I-0022-020-web-query-cache-mutation-conventions.md
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
verify:
  - pnpm --filter @masters/web exec vitest run src/router-loader-query-contract.test.tsx
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - design/initiatives/I-0022-cool-code/details/R9-router-loader-query-contract.md
  - apps/web/src/router.tsx
  - apps/web/src/router-loaders.ts
  - apps/web/src/router-loader-query-contract.test.tsx
  - apps/web/src/main.tsx
  - apps/web/src/hooks
---

## Archive Summary

- Added `eventQueries.detail()` as the shared event-detail query option factory.
- Added a router loader factory that prefetches route-critical event detail data with `queryClient.ensureQueryData(eventQueries.detail(id))`.
- Updated app router creation so the router loader and `QueryClientProvider` share the same `QueryClient`.
- Updated the event detail hook to read the same query option instead of creating a separate data path.
- Added a source contract test that prevents direct router-loader `api.fetch` usage and verifies the loader/query option contract.

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

- 범위와 의도: event detail route를 narrow pilot으로 삼아 router-loader/query-cache contract만 다뤘다. challenge/profile/detail route 전체 migration은 건드리지 않았다.
- source of truth: I-0022 R3/R8/R9를 기준으로 loader는 `ensureQueryData(eventQueries.detail(id))`만 수행하게 했다.
- 설계 divergence: loader contract 자체의 unresolved divergence는 없다. 결과 탭, 내 결과, mutation state의 direct API 호출은 loader로 올리지 않고 기존 page hook/component 책임으로 남겼다. `docs/initiatives/`는 현재 untracked parent-owned 변경으로 표시되어 parent 지시에 따라 task path 동기화를 위해 수정하지 않았다.
- 검증: focused router loader contract test는 red/green으로 확인했다. scoped ESLint와 earlier noncanonical local build도 통과했고, parent closeout verification에서 focused test, full `pnpm --filter @masters/web lint`, canonical `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`가 모두 통과했다. full lint는 처음에는 concurrent I-0022-210 crew-board import-sort issue로 막혔지만 parent rerun에서 통과해 현재 blocker는 없다.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 loader, layout, domain hook 책임이 섞이지 않았는지 확인한다.
- Optional review: `harness-reviewer`가 direct loader fetch 방지 검증이 충분한지 확인한다.

## 핸드오프

- Detail migration task는 loader를 도입할 때 이 contract를 재사용하고, loader result를 별도 cache로 취급하지 않는다.

## 설계 divergence

- 기존 router loader가 direct fetch를 사용하면 승인된 contract로 migration하거나 남은 부분을 follow-up으로 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: child worker implementation pass를 시작하며 task를 `tasks/active/`로 이동했다. CC-020 dependency는 archive path로 갱신했고, 현재 HEAD `f80ab91 refactor(web): establish query cache conventions` 위에서 작업한다.
- 2026-05-07: parent 요청 모델은 GPT-5.5 xhigh였으나, 현재 runtime에서는 실제 model/reasoning enforcement 적용 여부를 증명하는 API/metadata를 노출하지 않아 이 제한을 기록한다.
- 2026-05-07: TDD red: `pnpm --filter @masters/web exec vitest run src/router-loader-query-contract.test.tsx` fails because `src/router-loader-query-contract.test.tsx` cannot resolve `./router-loaders`, proving the loader factory/query contract is not implemented yet.
- 2026-05-07: 기존 verify 명령 `pnpm --filter @masters/web test -- --run src/router-loader-query-contract.test.tsx`는 Vitest file filter로 동작하지 않고 broader suite를 실행해 unrelated `src/components/crew/__tests__/crew-board-list-decomposition.test.tsx` failure까지 포함했다. Focused verify command를 `pnpm --filter @masters/web exec vitest run src/router-loader-query-contract.test.tsx`로 바로잡았다.
- 2026-05-07: 구현: `eventQueries.detail()` query option factory를 추가하고 `useEvent()`가 같은 option을 읽도록 변경했다. `eventDetailLoader(queryClient)`는 `queryClient.ensureQueryData(eventQueries.detail(params.id!))`만 호출하며 `/events/:id` route에 연결했다. `main.tsx`는 provider와 router loader가 같은 `QueryClient`를 공유하도록 `createAppRouter(queryClient)`를 사용한다.
- 2026-05-07: 구현: event detail page hook은 route-critical event detail fetch를 `useEvent(eventId)`로 읽고, auxiliary result/myResult fetch와 mutation action state는 loader 밖에 유지했다. Mutation 후에는 CC-020 invalidation target으로 event detail/myResult/results keys를 invalidation한다.
- 2026-05-07: TDD green: `pnpm --filter @masters/web exec vitest run src/router-loader-query-contract.test.tsx` passed, 1 file / 2 tests.
- 2026-05-07: Verification: `pnpm --filter @masters/web exec eslint src/router-loader-query-contract.test.tsx src/router.tsx src/router-loaders.ts src/hooks/useEvents.ts 'src/pages/events/[id]/useEventDetailPage.ts' src/main.tsx` passed.
- 2026-05-07: Initial full-lint verification: `pnpm --filter @masters/web lint` failed only on unrelated `src/components/crew/__tests__/crew-board-list-decomposition.test.tsx` import sorting from concurrent I-0022-210 work.
- 2026-05-07: Earlier worker verification: `VITE_API_URL=http://localhost:4000 pnpm --filter @masters/web build` passed, but this was the noncanonical local API root and was superseded by the final `/api/v1` build verification.
- 2026-05-07: Parent closeout verification: `pnpm --filter @masters/web exec vitest run src/router-loader-query-contract.test.tsx` passed, 1 file / 2 tests.
- 2026-05-07: Parent closeout verification: `pnpm --filter @masters/web lint` passed.
- 2026-05-07: Parent closeout verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` passed with the existing Vite chunk-size warning. The task verify command records this canonical local build env requirement because Vite intentionally rejects production builds without `VITE_API_URL`.

## 리뷰 노트

- Optional review:
  - reviewer: frontend/contract review
  - artifact: read-only reviewer feedback supplied during closeout
  - decision: no implementation code changes requested; stale task verification metadata was corrected during closeout
  - findings: no code contract defects found
  - residual risks: source-string guard prevents direct router loader `api.fetch` usage for this pilot but is less robust than an AST or dedicated lint rule
- Optional review:
  - reviewer: harness verification review
  - artifact: read-only reviewer feedback supplied during closeout
  - decision: no implementation code changes requested; stale task verification metadata was corrected during closeout
  - findings: parent closeout verification passed focused test, full web lint, and canonical web build
  - residual risks: event detail is a narrow pilot for the loader/query contract, not a broad migration of all route loaders

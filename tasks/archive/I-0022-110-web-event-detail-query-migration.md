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
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/pages/events/__tests__/event-detail-query-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - design/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - design/initiatives/I-0022-cool-code/details/R4-detail-page-query-migration-contract.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/pages/events/[id]/useEventDetailPage.ts
  - apps/web/src/hooks
---

## 목표

`useEventDetailPage`의 직접 fetch, local server state, manual refetch mutation flow를 event domain query/mutation hooks로 옮긴다.

## 실제 개선 요약

Event detail route가 route-local fetch/server state 대신 event domain query/mutation hooks를 사용한다. Mutation success는 detail/myResult/results를 exact invalidation으로 갱신하고 list/delete 계열만 broad invalidation으로 유지하며, delete는 route navigation 이후 broad invalidation을 실행하도록 회귀 테스트로 고정했다.

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

- 범위와 의도: event detail query/mutation migration과 focused regression coverage만 다뤘고, challenge detail migration과 unrelated route/funnel work는 제외했다.
- source of truth: `R1-query-error-recovery.md`, `R3-query-key-cache-invalidation-matrix.md`, `R4-detail-page-query-migration-contract.md`, `R8-regression-metrics-and-verification.md`.
- 설계 divergence: 없음. Approved event detail migration contract를 낮추지 않았고, challenge detail migration은 별도 CC-120 범위로 남겨 두었다.
- 검증:
  - TDD red first: path-isolated focused spec initially had 8 expected failures before implementation.
  - `pnpm --filter @masters/web exec vitest run src/pages/events/__tests__/event-detail-query-migration.test.tsx` passed after implementation/fixes with 11 tests.
  - `pnpm --filter @masters/web test -- --run src/pages/events/__tests__/event-detail-query-migration.test.tsx` passed, collecting 15 files / 67 tests due script argument behavior.
  - `pnpm --filter @masters/web exec eslint src/hooks/useEvents.ts 'src/pages/events/[id]/useEventDetailPage.ts' 'src/pages/events/[id]/index.tsx' src/pages/events/__tests__/event-detail-query-migration.test.tsx` passed.
  - `pnpm --filter @masters/web lint` passed.
  - Bare `pnpm --filter @masters/web build` failed with `VITE_API_URL must be set for non-development web builds`; this is an environment precondition, not an event detail migration regression.
  - `VITE_API_URL=http://localhost:4000 pnpm --filter @masters/web build` passed.
  - `bash scripts/check-active-task-closeout.sh` passed before archive while another unrelated active task existed.
- 리뷰 findings/fixes/residual risks: initial review findings were closed by moving delete invalidation after route navigation, making detail/myResult/results invalidations exact, and strengthening DELETE ordering coverage to assert `DELETE -> navigate -> invalidate`. No known residual implementation risk remains in this task; CC-300 still owns final bundled route recovery and mutation invalidation regression.

## 리뷰 계획

- Optional review completed: `frontend-reviewer`가 route hook, domain hook, invalidation ordering, and exact detail-scoped invalidation을 확인했다.

## 핸드오프

- CC-300에서 event route recovery와 mutation invalidation regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- 없음. Event detail route migration contract와 다르게 남은 local server state는 확인되지 않았다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: TDD 시작. event detail query migration contract를 고정하는 focused test를 먼저 추가하고 production code는 아직 변경하지 않는다.
- 2026-05-07: Runtime model enforcement note: parent tool requested GPT-5.5 xhigh, but the worker cannot independently verify runtime model enforcement from inside this session.
- 2026-05-07: Added `apps/web/src/pages/events/__tests__/event-detail-query-migration.test.tsx`. The requested verify command fails as expected before production migration; a path-only Vitest run isolates 8 expected failures in the new spec.
- 2026-05-07: Implementation child runtime note: requested GPT-5.5 xhigh remains not independently visible from inside this worker session.
- 2026-05-07: Implemented event detail query migration in the event domain hooks and route hook. Path-isolated verification `pnpm --filter @masters/web exec vitest run src/pages/events/__tests__/event-detail-query-migration.test.tsx` passes with 11 tests after implementation/fixes.
- 2026-05-07: Tried task command `pnpm --filter @masters/web test -- --run src/pages/events/__tests__/event-detail-query-migration.test.tsx`; Vitest still collected unrelated suites and failed on the concurrent `src/components/profile/ProfileTabs.tsx` parse error from I-0022-220, while the event migration spec itself passed.
- 2026-05-07: Targeted local lint `pnpm --filter @masters/web exec eslint src/hooks/useEvents.ts 'src/pages/events/[id]/useEventDetailPage.ts' 'src/pages/events/[id]/index.tsx'` passes.
- 2026-05-07: Boundary correction: `useDeleteEvent` initially still owned DELETE plus event query invalidation; route navigation success remained in `useEventDetailPage` after `deleteMutation.mutateAsync(eventId)` resolved.
- 2026-05-07: Review fix: reviewer found delete invalidation still belonged to the mutation hook, which caused invalidation before route-owned navigation. Moved deleted-event invalidation behind `onDeleteSuccess()` in `useEventDetailPage`, with `useDeleteEvent()` scoped to the DELETE request.
- 2026-05-07: Review fix: reviewer found detail/myResult/results invalidations were prefix matches. Added event-domain invalidation ownership in `useEvents.ts` so detail-scoped keys invalidate with `exact: true`, while list family, infinite-list family, and delete `eventKeys.all` remain broad.
- 2026-05-07: Strengthened focused regression coverage for exact detail-scoped invalidation, broad family/all invalidation, `useDeleteEvent()` request-only ownership, and delete navigation-before-invalidation ordering. Targeted Vitest and ESLint commands pass.
- 2026-05-07: Post-fix review found a medium test-coverage gap: the delete ordering test proved `navigate -> invalidate` but did not record the DELETE request. Addressed by recording the DELETE request in the focused test and asserting `DELETE -> navigate -> invalidate`.
- 2026-05-07: Final task-command rerun `pnpm --filter @masters/web test -- --run src/pages/events/__tests__/event-detail-query-migration.test.tsx` passed, collecting 15 files / 67 tests because of script argument behavior.
- 2026-05-07: Workspace web lint `pnpm --filter @masters/web lint` passed.
- 2026-05-07: Bare web build `pnpm --filter @masters/web build` hit the expected non-development build precondition, `VITE_API_URL must be set for non-development web builds`; `VITE_API_URL=http://localhost:4000 pnpm --filter @masters/web build` passed.
- 2026-05-07: `bash scripts/check-active-task-closeout.sh` passed before archive while another unrelated active task existed.

## 리뷰 노트

- Optional review:
  - reviewer: frontend-reviewer
  - artifact: prompt review findings for I-0022-110 review-fix worker
  - decision: changes requested; addressed in this review-fix pass
  - model note: parent requested GPT-5.5 high; reviewer could not independently verify runtime model enforcement from inside the review session.
  - findings:
    - Delete invalidation ran from the domain mutation hook before route-owned navigation; R1/R3 require navigation first, then broad event invalidation.
    - Detail, my result, and results invalidations used TanStack Query prefix matching; these keys require exact invalidation so descendants are not unintentionally matched.
    - Post-fix medium test-coverage finding: delete ordering coverage needed to include the DELETE request itself before navigation and invalidation; addressed in `event-detail-query-migration.test.tsx`.
  - residual risks: None known after final focused test, lint, and env-backed build verification; CC-300 still owns final bundled route recovery and mutation invalidation regression.

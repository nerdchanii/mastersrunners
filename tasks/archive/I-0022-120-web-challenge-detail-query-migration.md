---
id: I-0022-120
title: Challenge detail route를 domain query hooks로 migration한다
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
  - pnpm --filter @masters/web test -- --run src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R4-detail-page-query-migration-contract.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/pages/challenges/[id]/useChallengeDetailPage.ts
  - apps/web/src/hooks
---

## 목표

`useChallengeDetailPage`의 직접 fetch, local server state, manual mutation refresh를 challenge domain query/mutation hooks로 옮긴다.

## 실제 개선 요약

Challenge detail route가 route-local fetch/server state 대신 challenge domain query/mutation hooks를 사용한다. Detail과 leaderboard query는 challenge query options/key factory로 소유권을 모았고, join/leave/progress/delete success는 challenge domain invalidation으로 갱신하며, detail failure page-level retry와 leaderboard inline retry를 focused regression test로 고정했다.

## 완료 기준

- challenge detail route hook은 `api-client`를 직접 import하지 않는다.
- detail과 leaderboard 보조 query가 challenge query options/key factory를 사용한다.
- join/leave/progress/delete mutation success가 exact invalidation 또는 cache update를 사용한다.
- detail failure는 route/page recovery와 연결되고 leaderboard failure는 inline retry/empty state로 표현된다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R4-detail-page-query-migration-contract.md`.
- TDD: challenge detail failure, leaderboard inline failure, mutation invalidation을 focused test로 먼저 고정한다.
- Event detail migration은 CC-110에서 별도로 진행한다.

## 셀프 리뷰

- 범위와 의도: challenge detail query/mutation migration과 focused regression coverage만 다뤘고, event detail migration과 unrelated route/funnel work는 제외했다.
- source of truth: `R1-query-error-recovery.md`, `R3-query-key-cache-invalidation-matrix.md`, `R4-detail-page-query-migration-contract.md`, `R8-regression-metrics-and-verification.md`.
- 설계 divergence: 없음. Approved challenge detail migration contract를 낮추지 않았고, detail failure는 page-level retry로, leaderboard auxiliary failure는 inline retryable state로 연결했다.
- 검증:
  - TDD red first: focused spec initially failed with 9 expected failures before production migration.
  - `pnpm --filter @masters/web exec vitest run src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx` passed with 9 tests.
  - After the detail retry review fix, the focused spec covers 10 tests.
  - `pnpm --filter @masters/web test -- --run src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx` passed, collecting 16 files / 77 tests due script argument behavior.
  - `pnpm --filter @masters/web exec eslint src/hooks/useChallenges.ts 'src/pages/challenges/[id]/useChallengeDetailPage.ts' 'src/pages/challenges/[id]/index.tsx' src/components/challenge/LeaderboardTable.tsx src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx` passed.
  - `pnpm --filter @masters/web lint` passed.
  - Bare `pnpm --filter @masters/web build` failed with `VITE_API_URL must be set for non-development web builds` after `tsc -b`; this is an environment precondition, not a challenge detail migration regression.
  - `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` passed with the existing chunk-size warning.
  - `bash scripts/check-active-task-closeout.sh` was run while active; it failed only because archive-ready active tasks must be moved to `tasks/archive` in the same changeset. After archive move, the same check reported no active task files.
- 리뷰 findings/fixes/residual risks: `frontend-reviewer` found detail query failure lacked a route/page retry callback. The fix exposes detail query retry from `useChallengeDetailPage`, wires page-level `다시 시도` recovery, and adds focused coverage. No known residual implementation risk remains in this task; CC-300 still owns final bundled route recovery and leaderboard regression.

## 리뷰 계획

- Optional review completed: `frontend-reviewer`가 challenge route hook과 domain hook 경계, inline failure UX, and detail retry recovery를 확인했다.

## 핸드오프

- CC-300에서 challenge route recovery와 leaderboard regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- 없음. Challenge detail route migration contract와 다르게 남은 route-local server state 또는 silent failure는 확인되지 않았다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: TDD 시작. challenge detail query migration contract를 고정하는 focused test를 먼저 추가하고 production code는 아직 변경하지 않는다.
- 2026-05-07: Added `apps/web/src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx`. Red run `pnpm --filter @masters/web exec vitest run src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx` failed as expected with 9 failing tests before production migration.
- 2026-05-07: Implemented challenge detail query migration in domain hooks and route hook. Focused verification `pnpm --filter @masters/web exec vitest run src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx` passed with 9 tests.
- 2026-05-07: Targeted lint `pnpm --filter @masters/web exec eslint src/hooks/useChallenges.ts 'src/pages/challenges/[id]/useChallengeDetailPage.ts' 'src/pages/challenges/[id]/index.tsx' src/components/challenge/LeaderboardTable.tsx src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx` passed.
- 2026-05-07: Addressed frontend-reviewer finding by exposing detail query retry from `useChallengeDetailPage`, adding page-level `다시 시도` recovery, and covering failed detail query recovery in the focused hook test.
- 2026-05-07: After the detail retry fix, focused coverage now includes 10 challenge detail query migration tests.
- 2026-05-07: Manager verification `pnpm --filter @masters/web test -- --run src/pages/challenges/__tests__/challenge-detail-query-migration.test.tsx` passed, collecting 16 files / 77 tests because of script argument behavior.
- 2026-05-07: Manager verification `pnpm --filter @masters/web lint` passed.
- 2026-05-07: Manager verification bare `pnpm --filter @masters/web build` failed only on the expected non-development build precondition, `VITE_API_URL must be set for non-development web builds`, after `tsc -b`; `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` passed with the existing chunk-size warning.
- 2026-05-07: `bash scripts/check-active-task-closeout.sh` while active failed only with the expected archive move requirement for `execution_status: ready_for_archive`; after moving this task to `tasks/archive`, rerun reported no active task files.

## 리뷰 노트

- Optional review:
  - reviewer: frontend-reviewer
  - artifact: review finding on CC-120 detail query recovery
  - decision: addressed; manager closeout gates recorded
  - findings: detail query failure was previously fatal because the page received only a string error and no refetch callback.
  - fix: exposed detail query retry from `useChallengeDetailPage`, wired page-level `다시 시도` recovery, and added focused regression coverage.
  - residual risks: none known after focused test, lint, and env-backed build verification; CC-300 still owns final bundled route recovery and leaderboard regression.

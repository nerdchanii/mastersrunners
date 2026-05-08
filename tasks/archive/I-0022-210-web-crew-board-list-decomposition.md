---
id: I-0022-210
title: CrewBoardList를 feature composite 단위로 분해한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/crew/__tests__/crew-board-list-decomposition.test.tsx
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R2-slap-layering-and-route-composition.md
  - design/initiatives/I-0022-cool-code/details/R6-crew-board-and-crew-detail-composition.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/components/crew
---

## 완료 요약

`CrewBoardList`를 feature composite root와 navigation hook 중심으로 분해했다. `CrewBoardRoot`, feed/posts/detail/composer entry 컴포넌트와 `useCrewBoardNavigation`이 selected board/post, routed defaults, composer nonce handling을 나눠 맡도록 정리했고, `CrewBoardList` default export와 `BoardPostComposer` named export는 유지했다.

query/cache/API/router contract는 변경하지 않았다. focused decomposition spec으로 routed post detail, auth-gated routed access, selected board preservation, composer nonce single-consumption, inactive close, post detail nonce skip behavior를 고정했다.

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

- 범위와 의도: `CrewBoardList` UI/composition decomposition만 다뤘고 endpoint, query key, invalidation, router/hook query contract는 변경하지 않았다.
- source of truth: I-0022 R2/R6/R8과 `design/frontend/conventions.md`를 기준으로 navigation hook, feature composite root, presentational/composer entry로 분리했다.
- 설계 divergence: 이 task 범위의 신규 divergence는 없음. crew detail route root context hardening은 기존 후속 범위로 남긴다.
- 검증: focused decomposition spec, task literal test command, web lint, web build를 통과했다. original `pnpm --filter @masters/web build` command는 non-development build에서 Vite config가 `VITE_API_URL`을 요구하므로 `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`로 보정했다.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 component boundary와 query policy 불변을 확인한다.
- Optional review: `ui-ux-reviewer`가 board navigation, composer, auth dialog interaction이 유지되는지 확인한다.

## 핸드오프

- 후속 crew detail hardening task가 필요하면 이 task의 설계 divergence에 연결한다.

## 설계 divergence

- crew detail route root의 business state/context shaping 문제가 남으면 후속 task로 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: Implementation worker가 task를 `tasks/active/`로 이동했다. Model enforcement was requested as GPT-5.5 xhigh; this worker cannot observe or enforce the actual model/runtime tier, so the limitation is recorded here.
- 2026-05-07: Implementation workers were requested as GPT-5.5 xhigh and review workers as GPT-5.5 high. Runtime/model tier visibility remains limited to request metadata available to the worker.
- 2026-05-07: TDD로 `crew-board-list-decomposition.test.tsx`를 먼저 추가해 routed post open, auth-gated routed access, selected board preservation, composer nonce opens-once 동작을 고정했다. 초기 실행에서 same nonce + callback identity change 시 `onComposerHandled`가 중복 호출되는 실패를 확인했다.
- 2026-05-07: `useCrewBoardNavigation`, `CrewBoardRoot`, `CrewBoardFeed`, `CrewBoardPosts`, `CrewBoardPostDetail`, `CrewBoardComposerEntry`로 분해했다. `CrewBoardList` default export와 `BoardPostComposer` named export는 보존했다.
- 2026-05-07: `apps/web/src/hooks/useCrewBoards.ts`는 수정하지 않았다. 기존 hook 호출과 query/cache policy를 그대로 사용했다.
- 2026-05-07: Verification ran:
  - `pnpm --filter @masters/web exec vitest run src/components/crew/__tests__/crew-board-list-decomposition.test.tsx` (pass: 1 file, 4 tests)
  - `pnpm --filter @masters/web test -- --run src/components/crew/__tests__/crew-board-list-decomposition.test.tsx` (pass: 12 files, 38 tests; this command pattern runs the broader Vitest set in the current repo)
  - `pnpm --filter @masters/web lint` (pass)
  - `pnpm --filter @masters/web exec tsc -b --pretty false` (pass)
- 2026-05-07: Reviewer finding fixed: `composerNonce` handling still lived in per-mounted feed/posts composer hooks, so `defaultSelectedBoardId + composerNonce` could consume the same nonce once in `CrewBoardFeed` and again after `CrewBoardPosts` mounted. Moved composer nonce consumption and open/close state into `useCrewBoardNavigation`, passed a shared composer controller into feed/posts, and added focused regressions for default-board nonce single handling plus feed/board inactive close. Verification: `pnpm --filter @masters/web exec vitest run src/components/crew/__tests__/crew-board-list-decomposition.test.tsx` (pass: 1 file, 7 tests).
- 2026-05-07: Follow-up edge fix: centralized composer nonce handling now treats routed and selected post detail views as composer-ineligible, closes any open composer state, and leaves the nonce unconsumed until feed/board panels are active. Added regressions for routed post detail and local selected post detail with `composerNonce`. Verification: `pnpm --filter @masters/web exec vitest run src/components/crew/__tests__/crew-board-list-decomposition.test.tsx` (pass: 1 file, 9 tests).
- 2026-05-07: Final verification ran:
  - `pnpm --filter @masters/web test -- --run src/components/crew/__tests__/crew-board-list-decomposition.test.tsx` (pass: 12 files, 43 tests)
  - `pnpm --filter @masters/web lint` (pass)
  - `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` (pass with existing Vite chunk-size warning)
- 2026-05-07: Build command correction recorded: original `pnpm --filter @masters/web build` needed the `VITE_API_URL` environment variable because the Vite config requires it for non-development builds.

## 리뷰 노트

- Optional review: component/query-boundary
  - reviewer: frontend-reviewer
  - model request: GPT-5.5 high
  - artifact: CC-210 component/query-boundary review
  - decision: fixed without router/query/cache contract changes
  - findings: Medium `composerNonce` double-consumption risk across feed and board composer mounts
  - result: fixed by moving nonce consumption/open state into `useCrewBoardNavigation` and adding regression tests
  - residual risks: covered by focused decomposition spec and final web gates
- Optional review: UI/UX behavior
  - reviewer: ui-ux-reviewer
  - model request: GPT-5.5 high
  - artifact: CC-210 UI/UX behavior review
  - decision: no blocking issues
  - findings: no blocking UI/UX behavior issues; residual behavior gaps were addressed partly by inactive close and detail nonce regression tests
  - residual risks: broader manual browser QA remains outside this task closeout

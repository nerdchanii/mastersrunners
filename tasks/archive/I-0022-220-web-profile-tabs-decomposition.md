---
id: I-0022-220
title: ProfileTabs interaction과 pane rendering을 분해한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/profile/__tests__/profile-tabs-decomposition.test.tsx
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R2-slap-layering-and-route-composition.md
  - docs/initiatives/I-0022-cool-code/details/R7-profile-tabs-composition-and-profile-query.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/components/profile/ProfileTabs.tsx
  - apps/web/src/components/profile
---

## Archive Summary

I-0022-220 split `ProfileTabs` interaction and pane rendering without changing the profile route fetch/query behavior reserved for CC-140. `useProfileTabsInteraction` now owns active tab safety, sticky tab visibility, and mobile swipe handling, while `ProfileTabBar`, `ProfilePostsPane`, `ProfileWorkoutsPane`, and `ProfileCrewsPane` own the deterministic tab and pane rendering surfaces. Focused TDD coverage now locks sticky hide/show, mobile swipe threshold, hidden-workouts tab safety, posts/workouts/crews pane contracts, and the R7 decomposition boundaries. Verified in the shared worktree with the focused component spec and web lint; shared-worktree build was blocked by unrelated dirty CC-110 event test code, so the same CC-220 file set was copied into a clean temporary worktree and passed focused Vitest, web lint, and `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` with the existing chunk-size warnings.

## 목표

`ProfileTabs`의 sticky, swipe, tab safety, pane rendering 책임을 분해하고 profile route query migration과 UI interaction regression을 분리한다.

## 완료 기준

- `useProfileTabsInteraction` 또는 동등한 hook이 active tab safety, sticky visibility, swipe gesture를 소유한다.
- tab bar와 posts/workouts/crews pane rendering이 작은 단위로 분리된다.
- profile route fetch/query migration을 이 task에 섞지 않는다.
- sticky tab scroll, mobile swipe threshold, tab switch rendering behavior가 유지된다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R7-profile-tabs-composition-and-profile-query.md`.
- TDD: sticky visibility, swipe threshold, posts/workouts/crews tab rendering을 focused component tests로 먼저 고정한다.
- CC-140은 이 decomposition 이후에 진행한다.

## 셀프 리뷰

- 범위와 의도: ProfileTabs UI decomposition만 다룬다.
- source of truth: I-0022 R2/R7/R8.
- 설계 divergence: profile route direct fetch/local state divergence는 CC-140 범위로 남겼고, 이 task는 query/cache/API behavior를 변경하지 않았다.
- 검증: focused component spec, web lint, and clean-worktree web build passed. The task's original build command without `VITE_API_URL` fails by repository config in non-development builds, so the verify command now records the canonical env-qualified build used by prior web tasks.
- 리뷰 routing: frontend and UI/UX read-only reviews found no blocking findings. UI/UX residual risk is limited to jsdom coverage gaps for reverse/end-of-list swipe, hidden-workouts active-pane transform, and actual sticky offset positioning.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 component split과 data contract 불변을 확인한다.
- Optional review: `ui-ux-reviewer`가 sticky/swipe/tab interaction이 기존 사용자 경험을 보존하는지 확인한다.

## 핸드오프

- CC-140은 이 task에서 정리된 pane/rendering boundary 위에서 profile route query migration을 진행한다.

## 설계 divergence

- profile route의 direct fetch/local state divergence는 이 task에서 고치지 않고 CC-140으로 넘긴다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: Parent manager requested GPT-5.5 xhigh for child workers. The environment accepted generic worker delegation, but child runtime does not expose independently verifiable model/effort proof in task artifacts.
- 2026-05-07: Worker A moved this task to active and added focused TDD coverage. Red step confirmed with `pnpm --filter @masters/web exec vitest run src/components/profile/__tests__/profile-tabs-decomposition.test.tsx`: 4 passed, 1 failed on missing R7 decomposition exports.
- 2026-05-07: Worker A가 focused decomposition spec을 추가했고, Worker B가 `ProfileTabs` interaction hook과 tab/pane render boundaries를 분리했다.
- 2026-05-07: `pnpm --filter @masters/web exec vitest run src/components/profile/__tests__/profile-tabs-decomposition.test.tsx` 통과.
- 2026-05-07: `pnpm --filter @masters/web exec eslint src/components/profile/ProfileTabs.tsx` 통과.
- 2026-05-07: Parent verification: `pnpm --filter @masters/web test -- --run src/components/profile/__tests__/profile-tabs-decomposition.test.tsx` passed, but the repo script shape ran wider than the target file: 15 files / 65 tests.
- 2026-05-07: Parent verification: `pnpm --filter @masters/web exec vitest run src/components/profile/__tests__/profile-tabs-decomposition.test.tsx` passed, 1 file / 5 tests.
- 2026-05-07: Parent verification: `pnpm --filter @masters/web exec eslint src/components/profile/ProfileTabs.tsx src/components/profile/__tests__/profile-tabs-decomposition.test.tsx` passed.
- 2026-05-07: Parent verification: `pnpm --filter @masters/web lint` passed in the shared worktree after unrelated event lint state changed.
- 2026-05-07: Shared-worktree `pnpm --filter @masters/web build` and `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` failed on unrelated dirty `apps/web/src/pages/events/__tests__/event-detail-query-migration.test.tsx` type error: `filters` is possibly undefined.
- 2026-05-07: Clean CC-220 verification worktree `/private/tmp/mastersrunners-i0022-220-verify` was created from HEAD, dependencies installed, and only `ProfileTabs.tsx` plus the new focused spec copied in. There, focused Vitest passed, `pnpm --filter @masters/web lint` passed, and `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` passed with existing chunk-size warnings.
- 2026-05-07: Exact clean-worktree `pnpm --filter @masters/web build` without `VITE_API_URL` failed by expected Vite config guard: `VITE_API_URL must be set for non-development web builds`. The verify command was corrected to the env-qualified build used by current web task closeouts.

## 리뷰 노트

- Optional review:
  - reviewer: frontend-reviewer equivalent, generic GPT-5.5 high read-only agent
  - artifact: bounded diff review of `ProfileTabs.tsx`, focused spec, and task file
  - decision: approved, no blocking findings
  - findings: component split and hook boundary are scoped correctly; route caller props and normalization contracts remain stable; no query/cache/API behavior was added
  - residual risks: export-boundary assertion is lower signal than behavior coverage, but acceptable because R7 explicitly asks for exposed boundaries
- Optional review:
  - reviewer: ui-ux-reviewer equivalent, generic GPT-5.5 high read-only agent
  - artifact: bounded diff review of tab interaction and pane behavior
  - decision: approved, no blocking findings
  - findings: sticky visibility, swipe threshold, transform math, hidden-workouts trigger/pane removal, and active-tab resolver preserve user-facing behavior
  - residual risks: tests do not directly cover reverse swipe, end-of-list resistance, hidden-workouts active-pane transform, desktop/mobile offset choice, or browser-level sticky positioning

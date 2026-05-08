---
id: I-0022-020
title: Query key와 mutation cache conventions를 고정한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/hooks/query-conventions.test.ts
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R1-query-error-recovery.md
  - design/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/hooks
  - apps/web/src/lib
---

## Archive Summary

I-0022-020 fixed the web query and mutation cache convention foundation. Domain-owned key factories now expose reusable family keys for event, challenge, comment, social, workout, and profile cache scopes, and mutation invalidation ownership moved into domain hooks/helpers instead of caller-supplied concrete key arrays. Comment create/delete invalidation now targets the entity comment list family, so params-specific comment lists are covered. Social like mutations now own detail/feed optimistic cache patches with snapshot rollback for post and workout feed families. Verified commands: `pnpm --filter @masters/web exec vitest run src/hooks/query-conventions.test.ts`, `pnpm --filter @masters/web test -- --run src/hooks/query-conventions.test.ts`, `pnpm --filter @masters/web lint`, and `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`; the build passed with the existing chunk-size warning.

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
- 설계 divergence: detail route hook, `CommentList`, `LikeButton`, `ShareToggle`의 직접 fetch/local refetch migration은 CC-110/CC-120/CC-130/CC-150 범위로 남겼다. event/challenge new/edit route의 broad `*.all` invalidation도 route migration 범위로 남겼다.
- frontend-reviewer finding 반영: mutation hook API와 invalidation helper에서 caller-supplied concrete key 배열을 제거하고 domain-owned list/feed/tab family invalidation으로 바꿨다.
- frontend-reviewer finding 반영: comment create/delete invalidation은 hook 생성 시점 params-specific key가 아니라 entity comment list family를 대상으로 한다.
- frontend-reviewer finding 반영: social like optimistic update는 detail cache와 post/workout feed family cache를 함께 patch/snapshot/rollback한다.
- harness-reviewer finding 반영: verify build command는 canonical `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`로 고정했다.
- 검증: focused convention test, exact task test command, web lint, corrected web build command가 모두 통과했다. corrected build command는 기존 chunk-size warning만 출력했다.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 hook boundary, query key exactness, optimistic rollback ownership을 확인한다.
- Optional review: `harness-reviewer`가 regression task(CC-300)로 넘길 검증 항목이 충분한지 확인한다.

## 핸드오프

- CC-030, CC-110, CC-120, CC-130, CC-140, CC-150은 이 task의 key/query/mutation convention을 사용한다.

## 설계 divergence

- 기존 implementation이 local refetch나 broad invalidation에 의존하면 승인된 convention을 낮추지 말고 migration 대상 note로 남긴다.
- Current Divergence: `apps/web/src/pages/events/[id]/useEventDetailPage.ts`, `apps/web/src/pages/challenges/[id]/useChallengeDetailPage.ts`, `apps/web/src/components/social/CommentList.tsx`, `apps/web/src/components/social/LikeButton.tsx`, `apps/web/src/components/workout/ShareToggle.tsx`는 아직 직접 fetch/local state를 사용한다. 후속 CC-110/CC-120/CC-130/CC-150에서 이번 key/invalidation convention으로 이동한다.
- Current Divergence: event/challenge create/edit route는 아직 route-local mutation 후 broad domain invalidation을 사용한다. 이 task에서는 route/component migration을 의도적으로 제외했다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: child worker가 작업을 시작했다. parent가 `gpt-5.5 xhigh`를 요청했으나, child worker 런타임에서는 실제 모델/추론 레벨 적용 여부가 보이지 않아 별도 검증은 불가하다.
- 2026-05-07: TDD red 확인. `pnpm --filter @masters/web test -- --run src/hooks/query-conventions.test.ts`가 `query-conventions.test.ts`의 `./useComments` import 미해결로 실패했다. 같은 실행에서 병렬 CC-010 영역의 `router-query-recovery.test.tsx` 실패도 함께 보였으나 이 task에서는 router/ErrorBoundary를 수정하지 않았다.
- 2026-05-07: `apps/web/src/hooks/query-conventions.test.ts`를 추가해 event, challenge, comment, social, workout, profile key shape, fetch-changing params, cursor-independent infinite base params, representative mutation invalidation targets를 고정했다.
- 2026-05-07: event/challenge/workout/profile hook module에 key factory와 exact invalidation target helper를 확장하고, comment/social convention hook module과 shared query-key utility를 추가했다. post feed key도 social like invalidation target으로 재사용되도록 params-aware shape를 추가했다.
- 2026-05-07: mutation hook ownership 정리. existing event/challenge/workout/profile mutation hooks는 reusable target helper를 사용한다. new comment/social hooks는 endpoint, exact invalidation, social optimistic rollback ownership을 갖는다. 기존 route/component direct fetch migration은 후속 task에 남겼다.
- 2026-05-07: `createAppQueryClient` global `defaultOptions` ownership 정적 확인. app runtime source에는 `apps/web/src/app/query-client.ts`만 global defaults를 갖고, 추가된 code에는 `defaultOptions`가 없다. test-only `new QueryClient({ defaultOptions })` fixture는 기존 `useChatWindow.test.tsx`에만 있다.
- 2026-05-07: Verification. `pnpm --filter @masters/web exec vitest run src/hooks/query-conventions.test.ts` -> 1 file / 8 tests passed. `pnpm --filter @masters/web test -- --run src/hooks/query-conventions.test.ts` -> 10 files / 31 tests passed. `pnpm --filter @masters/web lint` -> passed. `pnpm --filter @masters/web build` -> failed at Vite config because `VITE_API_URL` is unset. `VITE_API_URL=http://localhost:4000 pnpm --filter @masters/web build` -> passed with existing chunk-size warning.
- 2026-05-07: frontend-reviewer finding fixes. Removed `relevantListKeys`, `relevantTabKeys`, and `relevantFeedKeys` from CC-020 mutation hook APIs and target helpers. Event/challenge/workout/profile targets now use domain-owned list/feed/tab family keys instead of caller-supplied concrete keys. Delete mutations remain broad where already justified.
- 2026-05-07: frontend-reviewer finding fixes. Comment create/delete invalidates `commentKeys.listFamily(entityType, entityId)`, so every params-specific entity comment list is covered.
- 2026-05-07: frontend-reviewer finding fixes. `useToggleSocialLike` now cancels, snapshots, optimistically patches, and rolls back both the detail key and matching post/workout feed family caches; settled invalidation uses the same domain-owned feed family.
- 2026-05-07: harness-reviewer finding fix. Updated verify build command to `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`.
- 2026-05-07: Verification after review fixes. `pnpm --filter @masters/web exec vitest run src/hooks/query-conventions.test.ts` -> 1 file / 8 tests passed. `pnpm --filter @masters/web test -- --run src/hooks/query-conventions.test.ts` -> 10 files / 32 tests passed. `pnpm --filter @masters/web lint` -> passed. `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` -> passed with existing chunk-size warning.

## 리뷰 노트

- Optional review:
  - reviewer: frontend-reviewer
  - artifact: read-only review findings supplied in task handoff
  - decision: changes requested, addressed in this child worker pass
  - findings: remove caller-supplied concrete invalidation keys, cover comment entity list family, and make social like optimistic rollback own detail plus feed cache families
  - residual risks: hook integration coverage is still deferred; focused key/target tests and build verify the convention surface
- Optional review:
  - reviewer: harness-reviewer
  - artifact: read-only review findings supplied in task handoff
  - decision: changes requested, addressed in this child worker pass
  - findings: build verify command must include canonical `/api/v1` suffix in `VITE_API_URL`
  - residual risks: none known after corrected build command passed

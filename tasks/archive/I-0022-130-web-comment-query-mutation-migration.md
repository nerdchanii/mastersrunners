---
id: I-0022-130
title: Comment query와 mutation을 domain hooks로 migration한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/archive/I-0022-020-web-query-cache-mutation-conventions.md
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/social/__tests__/comment-query-mutation-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - design/initiatives/I-0022-cool-code/details/R5-social-interaction-hooks.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/components/social/CommentList.tsx
  - apps/web/src/hooks
---

I-0022-130 migrated `CommentList` comment loading, creation, and deletion to the comments domain hook boundary. `CommentList` no longer imports `api-client` or constructs comment endpoints; scoped `useCreateComment` and `useDeleteComment` own entity identity and exact current-list invalidation, while the component keeps only input, reply target, auth gate, and delete dialog UI state. The migration added inline load retry, visible create/delete failure messages, create failure input preservation, exact invalidation contract coverage, and delete refresh regression coverage. Verified with `pnpm --filter @masters/web test -- --run src/components/social/__tests__/comment-query-mutation-migration.test.tsx`, `pnpm --filter @masters/web lint`, `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, and `pnpm --filter @masters/web test --run src/components/social/__tests__/comment-query-mutation-migration.test.tsx src/hooks/query-conventions.test.ts`.

## 목표

`CommentList` 안에 섞인 endpoint 구성, comment fetch, create/delete mutation, rendering 책임을 comments domain hooks와 presentational thread로 분리한다.

## 완료 기준

- `useComments`, `useCreateComment`, `useDeleteComment` 또는 동등한 domain hooks가 endpoint와 key/invalidation을 소유한다.
- `CommentList`는 input/reply/delete dialog 같은 feature UI state와 callback wiring만 담당한다.
- comment load failure는 inline error와 retry를 제공한다.
- create failure는 입력 상태를 보존하고 delete success는 exact list cache update 또는 invalidation을 수행한다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R5-social-interaction-hooks.md`.
- TDD: load failure, create failure input preservation, delete success cache refresh를 focused component/hook tests로 먼저 고정한다.
- 댓글 UX redesign은 범위가 아니다.

## 셀프 리뷰

- 범위와 의도: comment query/mutation migration만 다룬다.
- source of truth: I-0022 R3/R5/R8.
- 설계 divergence: 없음. 댓글 endpoint construction과 mutation invalidation ownership은 comments domain hook으로 이동했다.
- 검증: task verify 3개와 exact invalidation regression spec을 통과했다. Build는 repo Vite 설정상 `VITE_API_URL=http://localhost:4000/api/v1`을 명시해 실행했다.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 domain hook 책임, inline retry, mutation failure handling을 확인한다.

## 핸드오프

- CC-150 social/workout hooks와 cache convention을 공유하되 implementation은 섞지 않는다.

## 설계 divergence

- 남은 endpoint construction inside component 없음.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: TDD red phase로 direct `api-client` ownership, missing retry, create failure silence를 고정했다.
- 2026-05-07: `CommentList`를 `useComments`, scoped `useCreateComment`, scoped `useDeleteComment`로 이관하고 create/delete failure UI를 추가했다.
- 2026-05-07: frontend-reviewer findings에 따라 mutation scope를 hook construction으로 이동하고 exact current-list invalidation 및 regression test를 추가했다.
- 2026-05-07: verify 통과 후 archive로 이동했다.

## 리뷰 노트

- Optional review:
  - reviewer: frontend-reviewer
  - artifact: read-only review on `useComments`, `CommentList`, `query-conventions.test.ts`, and `comment-query-mutation-migration.test.tsx`
  - decision: approved
  - findings: initial review requested scoped mutation hooks and exact list invalidation; follow-up review requested public invalidation target/test alignment. Final review found no issues.
  - residual risks: future comment surfaces using non-default params must pass matching scoped params into create/delete hooks so exact invalidation refreshes their list.

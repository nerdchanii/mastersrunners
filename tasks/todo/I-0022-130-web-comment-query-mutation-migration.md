---
id: I-0022-130
title: Comment query와 mutation을 domain hooks로 migration한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0022-020-web-query-cache-mutation-conventions.md
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/social/__tests__/comment-query-mutation-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - docs/initiatives/I-0022-cool-code/details/R5-social-interaction-hooks.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - apps/web/src/components/social/CommentList.tsx
  - apps/web/src/hooks
---

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
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 domain hook 책임, inline retry, mutation failure handling을 확인한다.

## 핸드오프

- CC-150 social/workout hooks와 cache convention을 공유하되 implementation은 섞지 않는다.

## 설계 divergence

- 남은 endpoint construction inside component가 있으면 divergence 또는 follow-up으로 기록한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

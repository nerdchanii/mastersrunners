---
id: I-0018-030
title: workout detail read를 blob 정본으로 전환한다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0018-020-api-workout-detail-blob-foundation.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/feed/repositories/feed.repository.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/posts/repositories/post.repository.spec.ts
artifacts:
  - apps/api/src/workouts/workouts.service.ts
  - apps/api/src/workouts/workouts.service.spec.ts
  - apps/api/src/feed/repositories/feed.repository.ts
  - apps/api/src/feed/repositories/feed.repository.spec.ts
  - apps/api/src/posts/repositories/post.repository.ts
  - apps/api/src/posts/repositories/post.repository.spec.ts
  - apps/api/src/posts/post-read.mapper.ts
  - apps/api/src/posts/post-read.mapper.spec.ts
  - design/frontend/workout-experience.md
---

## 목표

detail read path를 private detail blob 기준으로 전환하고, preview query는 `Workout` summary만으로 응답하게 만든다.

## 완료 기준

- `/workouts/:id`는 DB `WorkoutRoute` / `WorkoutLap` 없이도 기존 wire shape를 계속 반환한다.
- feed/post/list preview는 `Workout` summary와 `Workout.encodedPolyline`만으로 동작한다.
- 앱 코드의 read path에서 `WorkoutRoute` / `WorkoutLap` 정본 의존이 제거된다.

## 노트

- web UI 변경은 금지한다. 필요한 수정은 fixture/type/e2e 정합성 수준으로 제한한다.
- detail wire shape는 유지하되 source of truth만 바꾼다.

## 셀프 리뷰

- 범위와 의도: `GET /workouts/:id`를 blob-first read로 전환하고, feed/post preview query에서 summary polyline 정본을 `Workout.encodedPolyline`로 고정했다. web payload shape는 유지했다.
- source of truth: detail route/lap payload는 `Workout.detailPath` blob을 우선 읽고, blob이 없을 때만 legacy `WorkoutRoute`/`WorkoutLap`로 fallback한다. post/feed preview polyline은 relation 대신 `Workout` row scalar를 읽는다.
- 설계 divergence: 없음. legacy fallback은 task acceptance에 맞는 호환성 경계로 유지한다.
- 검증: task verify 3개를 모두 통과했고, post preview route shape 보존을 위해 `src/posts/post-read.mapper.spec.ts`를 추가로 통과시켰다. backend review에서 지적된 auth ordering/fail-closed 경계를 반영한 뒤 `src/workouts/workouts.service.spec.ts`, `src/workouts/workouts.controller.spec.ts`, `pnpm --filter @masters/api build`도 다시 통과시켰다.
- 리뷰 라우팅: `backend-reviewer`가 blob hydration/fallback과 preview query cutover를 확인하고, 이후 `po-reviewer`가 UI contract 유지 여부를 확인한다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: blob hydration과 preview query 정리가 regression 없이 이뤄졌는지 본다.
- PO reviewer가 확인할 내용: 현재 workout detail/report 경험이 유지되는지 본다.

## 핸드오프

- 다음 task는 legacy/source data를 실제 private storage 정본으로 backfill하고 external state를 정리한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-22: task 생성.
- 2026-04-22: `WorkoutsService.findOne`이 `detailPath` blob을 읽어 `workoutRoutes[0].routeData`/`workoutLaps`를 합성하고, blob 부재 시 legacy relation fallback을 유지하도록 구현했다.
- 2026-04-22: feed/post preview query를 `Workout.encodedPolyline` 정본으로 전환하고, post read mapper에서 기존 `route.encodedPolyline` wire shape를 유지했다.
- 2026-04-22: `pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts`, `src/feed/repositories/feed.repository.spec.ts`, `src/posts/repositories/post.repository.spec.ts`, `src/posts/post-read.mapper.spec.ts`를 통과했다.
- 2026-04-22: backend review findings를 반영해 workout detail read authorization을 service boundary로 내리고, private blob read 전에 follower/private 접근 검사를 수행하도록 수정했다.
- 2026-04-22: backend review findings를 반영해 auth boundary가 owner/visibility 정보 누락 시 fail-open하지 않도록 막고, `src/workouts/workouts.service.spec.ts`, `src/workouts/workouts.controller.spec.ts`, `pnpm --filter @masters/api build`를 재통과했다.

## 리뷰 노트

- Specialist review:
  - reviewer: backend-reviewer
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - artifact: tasks/reviews/I-0018-030/backend-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: coverage는 unit-level 위주이고, blob download/parse 실패 시 legacy route/lap fallback에 계속 의존한다. integration-level proof와 legacy cleanup은 후속 task가 닫아야 한다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - artifact: tasks/reviews/I-0018-030/po-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: 마지막 수정은 auth boundary에 한정돼 UI contract drift는 없다. 다만 end-to-end HTTP 수준으로 detail/feed/post를 한 흐름에서 검증한 증거는 아직 없다.

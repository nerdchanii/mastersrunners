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
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/feed/repositories/feed.repository.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/posts/repositories/post.repository.spec.ts
artifacts:
  - apps/api/src/workouts/workouts.service.ts
  - apps/api/src/workouts/repositories/workout.repository.ts
  - apps/api/src/feed/repositories/feed.repository.ts
  - apps/api/src/posts/repositories/post.repository.ts
  - apps/web/e2e/workout-detail.spec.ts
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

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

## 리뷰 초점

- Specialist reviewer가 확인할 내용: blob hydration과 preview query 정리가 regression 없이 이뤄졌는지 본다.
- PO reviewer가 확인할 내용: 현재 workout detail/report 경험이 유지되는지 본다.

## 핸드오프

- 다음 task는 legacy/source data를 실제 private storage 정본으로 backfill하고 external state를 정리한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-22: task 생성.

## 리뷰 노트

- Specialist review:
  - reviewer:
  - reviewer protocol:
  - artifact:
  - decision:
  - findings:
  - residual risks:
- PO review:
  - reviewer:
  - reviewer protocol:
  - artifact:
  - decision:
  - findings:
  - residual risks:

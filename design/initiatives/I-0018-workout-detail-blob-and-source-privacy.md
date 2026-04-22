# I-0018: Workout Detail Blob And Source Privacy

## 요약

워크아웃 summary/preview 정본을 `Workout`으로 모으고, 무거운 detail 데이터는 private blob으로 옮긴다. 동시에 원본 FIT/GPX를 private storage로 고정해 공개 URL과 일반 응답에서 분리한다.

## 문제

- 현재 workout detail은 `WorkoutRoute.routeData`, `WorkoutLap`, `WorkoutFile.fileUrl`에 흩어져 있고, detail 화면이 DB의 다운샘플된 JSON을 직접 정본처럼 소비한다.
- 공개 업로드 경계가 workout 원본과 이미지 자산을 함께 다뤄 privacy boundary가 약하다.
- 미래의 고해상도 self-analysis / comparison은 현재 DB payload만으로는 확장성이 낮다.

## 목표

- `Workout`이 list/feed/post preview와 access control용 summary의 단일 정본이 되게 한다.
- detail 전용 track/lap/sensor 데이터를 private blob으로 옮기고 `Workout.detailPath`로 참조한다.
- raw FIT/GPX는 private source path만 저장하고, 공개 URL이나 presigned URL을 DB/일반 응답에 남기지 않는다.
- 현재 `/workouts/:id` web UX와 wire shape는 유지하면서 내부 정본만 바꾼다.

## 비목표

- 사용자 가시 UI 개편
- raw FIT/GPX 다운로드 기능 추가
- GPX parser 교체
- summary scalar column의 대규모 감축

## 범위

- `apps/api/src/uploads/`
- `apps/api/src/workouts/`
- `apps/api/src/feed/`
- `apps/api/src/posts/`
- `packages/database/prisma/`
- `design/backend/`
- `docs/domain/`
- `docs/runbooks/`
- Cloudflare R2 bucket/runtime boundary

## 설계 참고 문서

- `design/backend/upload-ingestion.md`
- `design/frontend/workout-experience.md`
- `docs/domain/workout.md`
- `docs/guides/parallel-worktree-workflow.md`
- `design/operating-rules/parallel-worktree-lifecycle.md`

## 리뷰 계획

- API / DB / storage boundary: `backend-reviewer`
- Cloudflare / repo / workflow / docs cutover: `harness-reviewer`, `docs-reviewer`
- 모든 task는 `po-reviewer`가 product contract와 regression risk를 확인한다.

## 태스크 분해

- `tasks/archive/I-0018-010-api-workout-source-privacy-boundary.md`
- `tasks/todo/I-0018-015-web-workout-source-presign-cutover.md`
- `tasks/todo/I-0018-020-api-workout-detail-blob-foundation.md`
- `tasks/todo/I-0018-030-api-workout-detail-read-cutover.md`
- `tasks/todo/I-0018-040-repo-cloudflare-workout-private-storage-backfill.md`
- `tasks/todo/I-0018-050-db-workout-legacy-detail-cleanup.md`

## 성공 기준

- `Workout`이 preview query에 필요한 summary를 직접 제공한다.
- `/workouts/:id`는 raw source URL 없이 기존 detail wire shape를 계속 반환한다.
- workout source upload는 private 전용 경계로 분리되고 image/public asset upload와 구분된다.
- detail blob cutover 후에도 workout detail, workout list, feed, post preview가 모두 유지된다.
- legacy `WorkoutRoute`, `WorkoutLap`, `WorkoutFile.fileUrl`은 정본 역할에서 제거된다.

## 진행 메모

- 2026-04-22: initiative를 생성하고 task별 worktree/TDD/reviewer flow를 기준으로 execution을 시작한다.

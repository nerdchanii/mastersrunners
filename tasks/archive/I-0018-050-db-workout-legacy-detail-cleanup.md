---
id: I-0018-050
title: workout legacy detail schema와 dual-write를 걷어낸다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: db
owner: unassigned
reviewers:
  - backend-reviewer
  - frontend-reviewer
  - po-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0019-010-ci-secret-manager-runtime-inventory.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test
  - pnpm --filter @masters/database build
  - pnpm --filter @masters/web test -- src/pages/workouts/detail/index.test.tsx
  - TEST_DATABASE_URL=postgresql://test:test@localhost:5433/masters_runners_test DATABASE_URL=postgresql://test:test@localhost:5433/masters_runners_test DIRECT_URL=postgresql://test:test@localhost:5433/masters_runners_test pnpm --filter @masters/api test:e2e -- --runTestsByPath test/workouts.e2e-spec.ts test/feed.e2e-spec.ts
artifacts:
  - packages/database/prisma/schema.prisma
  - packages/database/prisma/migrations/
  - apps/api/src/workouts/
  - apps/api/src/uploads/
  - docs/domain/workout.md
---

## 목표

blob/source path cutover가 끝난 뒤 legacy detail schema와 dual-write를 제거한다.

## 완료 기준

- `WorkoutRoute` / `WorkoutLap` 정본 역할이 runtime schema와 application contract에서 제거된다.
- legacy `WorkoutFile.fileUrl` 의존성이 runtime schema와 application contract에서 제거된다.
- 관련 코드, migration, 문서가 최종 canonical model에 맞게 정리된다.

## 노트

- 이 task는 반드시 cutover/backfill verify 이후에만 닫는다.
- cleanup이기 때문에 regression 검증 범위를 넓게 잡는다.
- repo truth 기준으로 Cloudflare asset/public host cutover와 runtime inventory 정리는 `I-0019-010`에 흡수됐다.

## 셀프 리뷰

- 범위와 의도:
  - `WorkoutRoute`, `WorkoutLap`, `WorkoutFile.fileUrl`을 runtime schema와 코드 경로에서 제거하고, canonical model을 `Workout.detailPath` + `WorkoutFile.sourcePath`로 고정했다.
- source of truth:
  - `packages/database/prisma/schema.prisma`
  - `apps/api/src/uploads/uploads.service.ts`
  - `apps/api/src/workouts/workouts.service.ts`
  - `design/backend/upload-ingestion.md`
  - `design/frontend/workout-experience.md`
  - `docs/domain/workout.md`
- 설계 divergence:
  - 2026-05-05 `I-0018-060`에서 physical legacy table/column drop을 defer했다. 이 task의 완료 범위는 runtime schema와 application dependency cleanup으로 supersede된다.
- 검증:
  - `pnpm --filter @masters/api test`
  - `pnpm --filter @masters/database build`
  - `pnpm --filter @masters/api build`
  - `TEST_DATABASE_URL=postgresql://test:test@localhost:5433/masters_runners_test DATABASE_URL=postgresql://test:test@localhost:5433/masters_runners_test DIRECT_URL=postgresql://test:test@localhost:5433/masters_runners_test pnpm --filter @masters/api test:e2e -- --runTestsByPath test/workouts.e2e-spec.ts test/feed.e2e-spec.ts`
  - `pnpm format:check`
- 리뷰 라우팅:
  - `backend-reviewer`
  - `frontend-reviewer`
  - `po-reviewer`

## 리뷰 초점

- Specialist reviewer가 확인할 내용: legacy 제거가 안전하고 migration order가 일관적인지 본다.
- Specialist reviewer가 확인할 내용: detail blob degraded path가 기존 detail UI empty-state 계약과 충돌하지 않는지도 본다.
- PO reviewer가 확인할 내용: 사용자 계약을 깨지 않고 cleanup이 완료됐는지 본다.

## 핸드오프

- 2026-05-05 `I-0018-060`에서 dev deploy migration failure를 수습하며 physical legacy table/column drop은 final private-storage backfill 이후 별도 cleanup task로 supersede됐다.

## 설계 divergence

- 이 archived task의 원래 migration cleanup 의도 중 physical `WorkoutRoute`, `WorkoutLap`, `WorkoutFile.fileUrl` drop은 `I-0018-060`에 의해 defer됐다. runtime schema와 application dependency cleanup은 유지된다.

## 시도 로그

- 2026-04-22: task 생성.
- 2026-04-23: legacy detail tables와 `WorkoutFile.fileUrl`의 runtime schema/application 의존성을 제거하고, detail read/write path를 blob/source path 정본으로 정리했다.
- 2026-04-23: cleanup migration에 `detailPath`/`sourcePath` backfill precondition guard를 추가하고, imported workout의 missing blob 경고 및 blob-backed detail/feed acceptance e2e를 보강했다.
- 2026-04-23: `WorkoutFile.sourcePath`를 required canonical field로 격상하고, missing blob degraded path를 API e2e + web detail page test로 고정했다.
- 2026-05-05: `I-0018-060`에서 dev deploy target에 legacy backfill 미완료 row가 있음을 확인하고, physical legacy cleanup은 `I-0018-070`으로 분리했다.

## 리뷰 노트

- Specialist review:
  - reviewer: backend-reviewer
  - reviewer protocol: repo-reviewer-artifact-v1
  - artifact: tasks/reviews/I-0018-050/backend-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks:
    - migration guard는 `sourcePath`/`detailPath` backfill 완료를 강제하지만 object store blob readability 자체를 증명하진 못한다. 이 남은 리스크는 read-path warning과 degraded response로 운영 처리한다.
- Specialist review:
  - reviewer: frontend-reviewer
  - reviewer protocol: repo-reviewer-artifact-v1
  - artifact: tasks/reviews/I-0018-050/frontend-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks:
    - frontend review는 새 degraded-state test와 detail page branch 매칭을 확인했다. reported green verify를 전제로 승인했다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: repo-reviewer-artifact-v1
  - artifact: tasks/reviews/I-0018-050/po-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks:
    - detail blob missing/unreadable 시 route/lap detail이 비는 degraded behavior는 intentional runtime risk이며, recovery는 warning path와 required `sourcePath` 정합성에 의존한다.

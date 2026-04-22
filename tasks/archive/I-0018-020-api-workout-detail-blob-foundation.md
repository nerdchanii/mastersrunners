---
id: I-0018-020
title: workout detail blob 정본과 summary write를 도입한다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0018-010-api-workout-source-privacy-boundary.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/database db:generate
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.service.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/feed/feed.service.spec.ts
  - pnpm --filter @masters/api build
  - pnpm --filter @masters/api lint
artifacts:
  - packages/database/prisma/schema.prisma
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/uploads/uploads.service.spec.ts
  - apps/api/src/uploads/storage/storage-adapter.interface.ts
  - apps/api/src/uploads/storage/disk-storage.adapter.ts
  - apps/api/src/uploads/storage/r2-storage.adapter.ts
  - apps/api/src/uploads/parsers/fit-parser.service.ts
  - apps/api/src/uploads/parsers/gpx-parser.service.ts
  - apps/api/src/workouts/workouts.service.ts
  - apps/api/src/workouts/workouts.service.spec.ts
  - apps/api/src/feed/feed.service.ts
  - apps/api/src/feed/feed.service.spec.ts
  - design/backend/upload-ingestion.md
  - docs/domain/workout.md
  - design/initiatives/I-0018-workout-detail-blob-and-source-privacy.md
---

## 목표

`Workout.detailPath`와 `WorkoutFile.sourcePath`를 canonical truth로 도입하고, ingest 시 summary + private detail blob을 함께 쓴다.

## 완료 기준

- `Workout`이 preview에 필요한 summary와 `detailPath`, `detailFormatVersion`, `encodedPolyline`를 가진다.
- `WorkoutFile`이 public `fileUrl` 대신 `sourcePath`를 정본으로 쓴다.
- ingest가 full-resolution normalized track/laps/detail metrics를 private detail blob에 저장한다.
- legacy `WorkoutRoute` / `WorkoutLap` dual-write는 유지하되, 새 정본은 blob이 된다.

## 노트

- migration과 DB schema 변화가 포함된다.
- 이 task는 read-path cutover 전 단계이므로 web contract를 아직 blob 기준으로 읽지 않는다.

## 셀프 리뷰

- 범위와 의도: ingest 정본을 `Workout.detailPath`와 `WorkoutFile.sourcePath`로 옮기되, 기존 detail read contract를 깨지 않도록 `WorkoutRoute` / `WorkoutLap` dual-write와 read-side leak sanitization만 최소로 추가했다.
- source of truth: `design/initiatives/I-0018-workout-detail-blob-and-source-privacy.md`, `packages/database/prisma/schema.prisma`, `apps/api/src/uploads/uploads.service.ts`, `apps/api/src/workouts/workouts.service.ts`, `apps/api/src/feed/feed.service.ts`, `design/backend/upload-ingestion.md`, `docs/domain/workout.md`
- 설계 divergence: 없음. detail blob을 먼저 쓰고 read cutover는 후속 task로 남기는 단계적 전환을 계획대로 유지했다.
- 검증: `pnpm --filter @masters/database db:generate`, `pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.service.spec.ts`, `pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts`, `pnpm --filter @masters/api test -- --runTestsByPath src/feed/feed.service.spec.ts`, `pnpm --filter @masters/api build`, `pnpm --filter @masters/api lint`를 모두 통과했다.
- 리뷰 라우팅: `backend-reviewer`가 schema/storage/ingest canonical model과 leak guard를 확인하고, `po-reviewer`가 future high-fidelity analysis에 필요한 detail fidelity가 충분히 보존됐는지 확인해야 한다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: schema 변화와 ingest write path가 detail blob canonical model에 맞는지 확인한다.
- PO reviewer가 확인할 내용: detail fidelity를 future analysis/comparison 관점에서 충분히 보존하는지 확인한다.

## 핸드오프

- 다음 task는 이 task가 쓴 detail blob을 읽어 현재 detail wire shape를 합성한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-22: task 생성.
- 2026-04-22: `uploads.service.spec.ts` red-green으로 successful parse path가 `Workout.detailPath`, `detailFormatVersion`, `encodedPolyline`, `WorkoutFile.sourcePath`, private detail blob write를 남기고 raw source를 retention하도록 전환했다.
- 2026-04-22: `workouts.service.spec.ts`와 `feed.service.spec.ts` red-green으로 `detailPath` / `detailFormatVersion`가 기존 detail/list/feed read contract로 새어 나가지 않도록 최소 sanitization을 추가했다.
- 2026-04-22: backend review에서 지적된 blocker를 반영해 Prisma migration `20260422171000_add_workout_detail_blob_foundation`를 추가하고, DB transaction failure 시 generated detail blob를 보상 삭제하도록 `uploads.service.ts`와 spec을 보강했다.
- 2026-04-22: `pnpm --filter @masters/database db:generate`, `pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.service.spec.ts`, `pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts`, `pnpm --filter @masters/api test -- --runTestsByPath src/feed/feed.service.spec.ts`, `pnpm --filter @masters/api build`, `pnpm --filter @masters/api lint`를 통과했다.

## 리뷰 노트

- Specialist review:
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - reviewer: backend-reviewer
  - artifact: tasks/reviews/I-0018-020/backend-reviewer.json
  - decision: approved
  - findings: schema 변화에 대응하는 Prisma migration을 추가했고, detail blob 선저장 후 transaction 실패 시 orphan blob가 남지 않도록 compensating cleanup까지 넣어 foundation blocker를 닫았다.
  - residual risks: detail blob 저장 자체가 transaction 전에 수행되므로 저장 실패 시 raw source retention의 운영 cleanup은 여전히 non-transactional이다. read cutover/backfill은 `I-0018-030` 이후 과제로 남아 있다.
- PO review:
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - reviewer: po-reviewer
  - artifact: tasks/reviews/I-0018-020/po-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: 이번 task는 backend foundation이라 새 canonical fidelity 혜택이 신규 ingest에만 적용되고, 기존 workout read/backfill은 후속 task가 필요하다.

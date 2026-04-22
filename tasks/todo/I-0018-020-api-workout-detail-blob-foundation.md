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
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.service.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts
artifacts:
  - packages/database/prisma/schema.prisma
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/uploads/storage/storage-adapter.interface.ts
  - apps/api/src/uploads/parsers/fit-parser.service.ts
  - apps/api/src/uploads/parsers/gpx-parser.service.ts
  - design/backend/upload-ingestion.md
  - docs/domain/workout.md
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

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

## 리뷰 초점

- Specialist reviewer가 확인할 내용: schema 변화와 ingest write path가 detail blob canonical model에 맞는지 확인한다.
- PO reviewer가 확인할 내용: detail fidelity를 future analysis/comparison 관점에서 충분히 보존하는지 확인한다.

## 핸드오프

- 다음 task는 이 task가 쓴 detail blob을 읽어 현재 detail wire shape를 합성한다.

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

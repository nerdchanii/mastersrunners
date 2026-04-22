---
id: I-0018-050
title: workout legacy detail schema와 dual-write를 걷어낸다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: db
owner: unassigned
reviewers:
  - backend-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0018-040-repo-cloudflare-workout-private-storage-backfill.md
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/api test
  - pnpm --filter @masters/database build
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

- `WorkoutRoute` / `WorkoutLap` 정본 역할이 완전히 제거된다.
- legacy `WorkoutFile.fileUrl`이 제거된다.
- 관련 코드, migration, 문서가 최종 canonical model에 맞게 정리된다.

## 노트

- 이 task는 반드시 cutover/backfill verify 이후에만 닫는다.
- cleanup이기 때문에 regression 검증 범위를 넓게 잡는다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

## 리뷰 초점

- Specialist reviewer가 확인할 내용: legacy 제거가 안전하고 migration order가 일관적인지 본다.
- PO reviewer가 확인할 내용: 사용자 계약을 깨지 않고 cleanup이 완료됐는지 본다.

## 핸드오프

- 없음.

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

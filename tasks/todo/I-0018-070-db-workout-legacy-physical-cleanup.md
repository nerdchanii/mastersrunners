---
id: I-0018-070
title: backfill 완료 후 workout legacy physical schema를 제거한다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: db
owner: unassigned
depends_on:
  - tasks/todo/I-0018-040-repo-cloudflare-workout-private-storage-backfill.md
  - tasks/archive/I-0018-060-db-deploy-migration-backfill-compat.md
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/database db:generate
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts src/uploads/uploads.service.spec.ts
  - pnpm format:check
artifacts:
  - packages/database/prisma/migrations/
  - design/backend/upload-ingestion.md
  - docs/domain/workout.md
---

## 목표

`I-0018-040` private-storage backfill 완료 후 dev/prod DB의 legacy physical workout schema를 제거한다.

## 완료 기준

- backfill 완료 증거를 확인한 뒤 `WorkoutRoute`, `WorkoutLap`, `WorkoutFile.fileUrl` physical structures를 제거하는 새 migration이 추가된다.
- compatibility-filled `sourcePath` rows가 real private-storage identifier로 교체됐거나, 남은 예외가 운영 규칙에 기록된다.
- design/domain/runbook 문서가 final physical cleanup 완료 상태를 반영한다.

## 노트

- `I-0018-060`은 deploy unblock을 위해 physical cleanup을 defer했다.
- 이 task는 data-loss guard를 유지해야 하며, backfill proof 없이 physical drop을 수행하지 않는다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰: 필요하면 `backend-reviewer`, `harness-reviewer`, `docs-reviewer`, PO 관점으로 opt-in 한다.

## 리뷰 계획

- `backend-reviewer`, `harness-reviewer`, `docs-reviewer`: backfill proof, data-loss guard, migration order, deploy safety.
- PO 관점: legacy storage retention 종료와 운영 리스크가 납득 가능한지 본다.

## 핸드오프

- 없음.

## 설계 divergence

- `I-0018-060` 이후 physical legacy schema가 남아 있는 임시 divergence를 닫는 task다.

## 시도 로그

- 2026-05-05: `I-0018-060` deploy compatibility fix 후 후속 cleanup task로 등록.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

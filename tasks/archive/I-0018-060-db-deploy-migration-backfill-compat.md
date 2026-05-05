---
id: I-0018-060
title: dev deploy migration이 legacy workout data를 보존하며 통과하게 한다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: db
owner: codex
reviewers:
  - backend-reviewer
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0018-050-db-workout-legacy-detail-cleanup.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/database db:generate
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts src/uploads/uploads.service.spec.ts
  - pnpm format:check
artifacts:
  - packages/database/prisma/schema.prisma
  - packages/database/prisma/migrations/20260423022000_remove_workout_legacy_detail_schema/migration.sql
  - design/backend/upload-ingestion.md
  - design/initiatives/I-0018-workout-detail-blob-and-source-privacy.md
  - docs/domain/workout.md
---

## 목표

GitHub Actions dev deploy에서 `20260423022000_remove_workout_legacy_detail_schema` migration이 기존 workout 데이터를 보존하면서 통과하게 한다.

## 완료 기준

- `WorkoutFile.sourcePath` required 전환 전에 legacy `fileUrl` 값이 compatibility source identifier로 backfill된다.
- `WorkoutRoute`, `WorkoutLap`, `WorkoutFile.fileUrl`의 물리 삭제는 explicit backfill task와 후속 physical cleanup task 이후로 defer된다.
- 설계/도메인 문서가 runtime schema truth와 physical legacy cleanup defer 상태를 구분한다.
- 관련 database/API 검증과 review gate가 통과한다.

## 노트

- 실패한 deploy run: https://github.com/nerdchanii/mastersrunners/actions/runs/25367148491/job/74380834749
- failure root cause: dev DB에 `WorkoutFile.sourcePath IS NULL`인 legacy row가 있어 migration guard가 중단했다.
- physical legacy structures를 남겨도 Prisma schema/client는 더 이상 해당 컬럼/테이블을 사용하지 않는다.
- migration history safety: 직전 성공 deploy는 2026-04-21 `742cf5d`였고 해당 commit에는 `20260423022000_remove_workout_legacy_detail_schema` migration이 없다. 이 migration은 `fa69f01`에서 추가됐으며, 2026-05-05 `cd1b63b` deploy가 첫 적용 시도였고 failure before record 상태로 중단됐다.

## 셀프 리뷰

- 범위와 의도: dev deploy를 막은 Prisma migration guard를 해소하되, legacy workout detail/source data를 물리 삭제하지 않도록 migration을 deploy-safe compatibility 단계로 낮췄다.
- source of truth: runtime schema truth는 `packages/database/prisma/schema.prisma`, migration truth는 `packages/database/prisma/migrations/20260423022000_remove_workout_legacy_detail_schema/migration.sql`, 운영 backfill truth는 `I-0018-040`에 둔다.
- 설계 divergence: 앱/Prisma schema는 legacy route/lap/fileUrl을 사용하지 않지만, 기존 환경 DB에는 final backfill 전까지 legacy physical structures가 남을 수 있다. 이를 design/domain 문서에 명시했다.
- 검증: `pnpm --filter @masters/database db:generate`, `pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts src/uploads/uploads.service.spec.ts`, `pnpm format:check` 통과.
- 리뷰 라우팅: DB migration과 deploy workflow 및 문서 변경이므로 backend-reviewer, harness-reviewer, docs-reviewer, po-reviewer를 요구한다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: migration safety, deploy unblock, schema/documentation consistency.
- PO reviewer가 확인할 내용: deploy 복구와 privacy/backfill 지연 tradeoff가 납득 가능한지 본다.

## 핸드오프

- `I-0018-040`은 여전히 실제 private storage backfill 책임을 가진다. final physical cleanup은 후속 `I-0018-070`에서 수행한다.

## 설계 divergence

- 앱/Prisma schema는 legacy route/lap/fileUrl을 제거한 상태지만, physical DB cleanup은 `I-0018-040`의 private storage backfill과 `I-0018-070` cleanup 완료 이후로 defer된다.

## 시도 로그

- 2026-05-05: GitHub Actions deploy-api가 `Cannot drop WorkoutFile.fileUrl before sourcePath backfill is complete`로 실패한 것을 확인했다.
- 2026-05-05: `gh run list`와 `git ls-tree 742cf5d...`로 직전 성공 deploy commit에는 실패 migration이 없음을 확인했다.
- 2026-05-05: migration이 missing `sourcePath`를 legacy `fileUrl`로 compatibility-fill하고, `WorkoutRoute`, `WorkoutLap`, `WorkoutFile.fileUrl` physical drop을 defer하도록 수정했다.
- 2026-05-05: `pnpm --filter @masters/database db:generate`, `pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts src/uploads/uploads.service.spec.ts`, `pnpm format:check` 통과.
- 2026-05-05: docs-reviewer final pass 후 `WorkoutFile.fileType` 주석도 runtime contract와 맞게 FIT/GPX로 정리했다.

## 리뷰 노트

- Specialist review:
  - reviewer: backend-reviewer
  - reviewer protocol: repo-reviewer-artifact-v1
  - artifact: tasks/reviews/I-0018-060/backend-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: compatibility fill은 legacy physical structures를 남기므로 `I-0018-040`과 `I-0018-070` 완료가 필요하다.
- Specialist review:
  - reviewer: harness-reviewer
  - reviewer protocol: repo-reviewer-artifact-v1
  - artifact: tasks/reviews/I-0018-060/harness-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: final deploy proof는 push 후 GitHub Actions Deploy rerun에 의존한다.
- Specialist review:
  - reviewer: docs-reviewer
  - reviewer protocol: repo-reviewer-artifact-v1
  - artifact: tasks/reviews/I-0018-060/docs-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: 없음
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: repo-reviewer-artifact-v1
  - artifact: tasks/reviews/I-0018-060/po-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: deploy proof는 push 후 외부 workflow rerun으로 확인해야 한다.

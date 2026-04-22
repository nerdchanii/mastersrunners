---
id: I-0018-010
title: workout source privacy boundary를 API에서 분리한다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - docs-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.controller.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.controller.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.service.spec.ts
  - pnpm --filter @masters/api test:e2e -- --runTestsByPath test/workouts.e2e-spec.ts
  - pnpm --filter @masters/api build
  - pnpm --filter @masters/api lint
artifacts:
  - apps/api/src/workouts/workouts.controller.ts
  - apps/api/src/workouts/workouts.service.ts
  - apps/api/src/workouts/workouts.controller.spec.ts
  - apps/api/src/workouts/workouts.service.spec.ts
  - apps/api/src/uploads/uploads.controller.ts
  - apps/api/src/uploads/dto/presign-upload.dto.ts
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/uploads/uploads.controller.spec.ts
  - apps/api/src/uploads/uploads.service.spec.ts
  - apps/api/src/uploads/workout-source-upload.ts
  - apps/api/test/setup.ts
  - apps/api/test/workouts.e2e-spec.ts
  - design/backend/upload-ingestion.md
  - docs/domain/external-integration.md
  - design/initiatives/I-0018-workout-detail-blob-and-source-privacy.md
---

## 목표

workout raw source와 public asset upload 경계를 분리하고, workout detail 응답에서 raw source URL을 끊는다.

## 완료 기준

- 비로그인 사용자는 `GET /workouts/:id`에 접근할 수 없다.
- `POST /workouts/source/presign`이 FIT/GPX 전용으로 추가된다.
- `POST /uploads/presign`은 public asset 용도를 기본으로 하고, 현행 web workout 업로드(`folder: "workouts"`)는 임시 compatibility를 유지한다.
- workout detail 응답에서 `fileUrl`과 기타 storage path/url이 노출되지 않는다.

## 노트

- UI 변경은 금지한다.
- 이 task는 storage schema 정본 변경까지 포함하지 않는다. privacy boundary와 response sanitization이 우선이다.
- canonical workout raw source presign은 `POST /workouts/source/presign`이다.
- `/uploads/presign`의 workout source 허용은 web cutover 전까지의 임시 호환 경로다.
- private source bucket/sourcePath가 아직 없으므로, 현재 단계에서는 raw workout source를 parse 직후 폐기해 공개 object retention을 막는다.

## 셀프 리뷰

- 범위와 의도: workout detail auth boundary와 raw source presign contract를 분리하되 기존 web workout upload UX는 유지했다. private source path 전환 전까지는 raw source를 transient ingest input으로 취급한다.
- source of truth: `design/initiatives/I-0018-workout-detail-blob-and-source-privacy.md`, `apps/api/src/workouts/workouts.controller.ts`, `apps/api/src/workouts/workouts.service.ts`, `apps/api/src/uploads/uploads.controller.ts`, `apps/api/src/uploads/uploads.service.ts`
- 설계 divergence: canonical route는 추가했지만 web cutover 전까지 `/uploads/presign`의 `folder: "workouts"` compatibility를 남겼다. 또한 long-lived private source retention은 아직 없어서 raw source를 parse 직후 폐기하는 interim hardening을 택했다.
- 검증: controller/service spec, workout e2e spec, API build, API lint를 통과했다. e2e는 repo의 `docker-compose.test.yml` test DB를 기동하고 메인 workspace에서 `pnpm db:push`로 스키마를 맞춘 뒤 수행했다.
- 리뷰 라우팅: `backend-reviewer`가 auth/privacy boundary를, `docs-reviewer`가 design/domain truth 반영을, `po-reviewer`가 무변경 web UX를 확인해야 한다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: authz/privacy boundary와 presign contract가 분리됐는지, 그리고 raw source가 공개 경로에 장기 보존되지 않는지 확인한다.
- PO reviewer가 확인할 내용: 기존 workout 상세 접근 규칙과 upload UX를 깨지 않는지 확인한다.

## 핸드오프

- 다음 task는 web workout 업로드를 `/workouts/source/presign`으로 옮기고, 그 다음 `/uploads/presign`의 `folder: "workouts"` compatibility를 제거해야 한다.
- detail/blob cutover task는 `WorkoutFile.fileUrl` 정본 제거와 `sourcePath/detailPath` write로 이 task의 임시 compatibility를 닫아야 한다.

## 설계 divergence

- 2026-04-22: user 지시에 따라 canonical raw source boundary는 `POST /workouts/source/presign`으로 추가했지만, 현재 web UI 무변경 요구를 위해 `/uploads/presign`의 workout 업로드 compatibility를 임시 유지했다. follow-up task에서 web caller를 옮긴 뒤 해당 compatibility를 제거해야 한다.

## 시도 로그

- 2026-04-22: task 생성.
- 2026-04-22: controller/service red-green으로 `GET /workouts/:id` auth requirement, `POST /workouts/source/presign`, `/uploads/presign` workout compatibility, workout detail file sanitization을 구현했다.
- 2026-04-22: `pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.controller.spec.ts`, `src/uploads/uploads.controller.spec.ts`, `src/workouts/workouts.service.spec.ts`, `src/uploads/uploads.service.spec.ts`를 통과했다.
- 2026-04-22: repo test DB cleanup가 sandbox/Prisma 환경에서 깨져 workout e2e가 막혔고, `docker-compose.test.yml`로 test DB를 기동한 뒤 메인 workspace에서 `pnpm db:push`로 스키마를 동기화해 `pnpm --filter @masters/api test:e2e -- --runTestsByPath test/workouts.e2e-spec.ts`를 통과시켰다.
- 2026-04-22: `pnpm --filter @masters/api build`, `pnpm --filter @masters/api lint`를 통과했다.
- 2026-04-22: backend review finding을 반영해 raw workout source를 parse 성공/실패 직후 삭제하고, public asset/workout source boundary를 design/domain docs에 반영했다.

## 리뷰 노트

- Specialist review:
  - reviewer: `backend-reviewer`, `docs-reviewer`
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - artifact: current thread subagent review messages
  - decision: approved
  - findings: raw workout source public retention, delete-failure observability, design/domain drift, initiative/task drift를 수정했다.
  - residual risks: private source bucket/sourcePath가 아직 없어서 cleanup은 best-effort이며, `/uploads/presign`의 workout compatibility path는 `I-0018-015`에서 제거해야 한다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - artifact: current thread subagent review messages
  - decision: approved
  - findings: 없음
  - residual risks: raw source를 현재는 parse 직후 폐기하므로, 이후 private retention이 도입되기 전까지 서버측 재처리는 지원하지 않는다.

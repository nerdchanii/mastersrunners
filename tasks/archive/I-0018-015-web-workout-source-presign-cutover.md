---
id: I-0018-015
title: web workout 업로드를 전용 source presign으로 옮기고 compatibility를 제거한다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - backend-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0018-010-api-workout-source-privacy-boundary.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.controller.spec.ts
  - pnpm --filter @masters/web exec vitest run src/pages/workouts/new/use-workout-entry.test.tsx
  - pnpm --filter @masters/api build
  - pnpm --filter @masters/api lint
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - apps/web/src/pages/workouts/new/use-workout-entry.ts
  - apps/web/src/pages/workouts/new/use-workout-entry.test.tsx
  - apps/api/src/uploads/uploads.controller.ts
  - apps/api/src/uploads/uploads.controller.spec.ts
  - apps/api/src/workouts/workouts.controller.ts
  - design/backend/upload-ingestion.md
  - docs/domain/external-integration.md
  - design/initiatives/I-0018-workout-detail-blob-and-source-privacy.md
---

## 목표

현재 SPA workout 업로드 caller를 `POST /workouts/source/presign`으로 옮기고, `/uploads/presign`의 `folder: "workouts"` compatibility branch를 제거한다.

## 완료 기준

- workout 업로드 UI가 `POST /workouts/source/presign`만 사용한다.
- `/uploads/presign`은 public asset 경계만 남기고 `folder: "workouts"` compatibility를 제거한다.
- 현재 web workout 업로드 UX는 유지된다.

## 노트

- 사용자 가시 UI 변경은 금지한다.
- 이 task는 private source retention이나 detail blob 도입을 포함하지 않는다.

## 셀프 리뷰

- 범위와 의도: 기존 workout 업로드 UX는 유지한 채 SPA caller만 `POST /workouts/source/presign`으로 옮기고, API의 임시 `/uploads/presign` compatibility branch를 제거했다.
- source of truth: `design/initiatives/I-0018-workout-detail-blob-and-source-privacy.md`, `design/backend/upload-ingestion.md`, `docs/domain/external-integration.md`, `apps/web/src/pages/workouts/new/use-workout-entry.ts`, `apps/api/src/uploads/uploads.controller.ts`, `apps/api/src/workouts/workouts.controller.ts`
- 설계 divergence: 없음. 010에서 남겨 둔 transitional compatibility를 이번 task에서 계획대로 제거했다.
- 검증: API controller spec, isolated web hook test, API build/lint, web lint/build를 새 contract 기준으로 모두 통과했다. web build는 repo contract에 맞춰 `VITE_API_URL=http://localhost:4000/api/v1`를 주입해 수행했다.
- 리뷰 라우팅: `frontend-reviewer`가 caller/UX 유지 여부를, `backend-reviewer`가 public-asset boundary 축소를, `docs-reviewer`가 design/domain truth 동기화를, `po-reviewer`가 사용자 흐름 회귀 여부를 확인해야 한다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: web caller와 API compatibility 제거가 함께 닫혔는지, 그리고 design/domain docs가 최신 contract를 반영하는지 확인한다.
- PO reviewer가 확인할 내용: 현재 workout 업로드 UX가 그대로 유지되는지 확인한다.

## 핸드오프

- 이후 task는 private source/sourcePath와 detailPath 도입으로 canonical storage model을 옮긴다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-22: task 생성.
- 2026-04-22: `use-workout-entry`의 presign caller를 `/workouts/source/presign`으로 옮기는 failing test를 추가하고, `/uploads/presign`의 `folder: "workouts"` 거부 spec을 red-green으로 구현했다.
- 2026-04-22: `pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.controller.spec.ts`, `pnpm --filter @masters/web exec vitest run src/pages/workouts/new/use-workout-entry.test.tsx`, `pnpm --filter @masters/api build`, `pnpm --filter @masters/api lint`, `pnpm --filter @masters/web lint`, `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`를 통과했다.

## 리뷰 노트

- Specialist review:
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - reviewer: frontend-reviewer
  - artifact: tasks/reviews/I-0018-015/frontend-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: browser + storage adapter + CORS를 함께 검증하는 수동 browser e2e는 아직 없고, 현재 web caller는 API contract에 맞춰 `application/octet-stream`을 계속 사용한다.
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - reviewer: backend-reviewer
  - artifact: tasks/reviews/I-0018-015/backend-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: stale non-web caller가 여전히 `/uploads/presign` + `folder: "workouts"`를 쓰고 있다면 즉시 실패한다. 또한 contract coverage는 현재 controller/unit 수준이며 browser-to-storage e2e는 별도다.
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - reviewer: docs-reviewer
  - artifact: tasks/reviews/I-0018-015/docs-reviewer.json
  - decision: approved
  - findings: docs traceability와 `last_verified` metadata를 보강해 `POST /workouts/source/presign`의 route owner를 `apps/api/src/workouts/workouts.controller.ts`까지 source-of-truth에 반영했다.
  - residual risks: 이번 승인 범위는 문서/태스크 동기화에 한정되며, 다음 cutover task에서 private source retention과 detail blob 문서를 계속 맞춰야 한다.
- PO review:
  - reviewer protocol: `reviewers/protocols.json` overlay via subagent review
  - reviewer: po-reviewer
  - artifact: tasks/reviews/I-0018-015/po-reviewer.json
  - decision: approved
  - findings: 없음
  - residual risks: 제품 관점의 남은 리스크는 수동 브라우저 e2e 미실행뿐이며, 현재 코드와 테스트 기준으로는 workout upload UX 회귀는 보이지 않는다.

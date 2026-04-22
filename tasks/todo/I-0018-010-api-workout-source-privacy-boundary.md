---
id: I-0018-010
title: workout source privacy boundary를 API에서 분리한다
parent: I-0018-workout-detail-blob-and-source-privacy
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.controller.spec.ts
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.controller.spec.ts
artifacts:
  - apps/api/src/workouts/workouts.controller.ts
  - apps/api/src/uploads/uploads.controller.ts
  - apps/api/src/uploads/dto/presign-upload.dto.ts
  - apps/api/src/uploads/uploads.service.ts
  - design/backend/upload-ingestion.md
---

## 목표

workout raw source와 public asset upload 경계를 분리하고, workout detail 응답에서 raw source URL을 끊는다.

## 완료 기준

- 비로그인 사용자는 `GET /workouts/:id`에 접근할 수 없다.
- `POST /workouts/source/presign`이 FIT/GPX 전용으로 추가된다.
- `POST /uploads/presign`은 public asset 용도만 허용한다.
- workout detail 응답에서 `fileUrl`과 기타 storage path/url이 노출되지 않는다.

## 노트

- UI 변경은 금지한다.
- 이 task는 storage schema 정본 변경까지 포함하지 않는다. privacy boundary와 response sanitization이 우선이다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

## 리뷰 초점

- Specialist reviewer가 확인할 내용: authz/privacy boundary와 presign contract가 분리됐는지 확인한다.
- PO reviewer가 확인할 내용: 기존 workout 상세 접근 규칙과 upload UX를 깨지 않는지 확인한다.

## 핸드오프

- 다음 task는 이 task의 presign 분리를 바탕으로 sourcePath/detailPath write를 추가한다.

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

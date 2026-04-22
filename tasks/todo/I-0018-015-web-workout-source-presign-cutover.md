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
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/uploads.controller.spec.ts
artifacts:
  - apps/web/src/pages/workouts/new/use-workout-entry.ts
  - apps/api/src/uploads/uploads.controller.ts
  - design/backend/upload-ingestion.md
  - docs/domain/external-integration.md
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

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

## 리뷰 초점

- Specialist reviewer가 확인할 내용: web caller와 API compatibility 제거가 함께 닫혔는지, 그리고 design/domain docs가 최신 contract를 반영하는지 확인한다.
- PO reviewer가 확인할 내용: 현재 workout 업로드 UX가 그대로 유지되는지 확인한다.

## 핸드오프

- 이후 task는 private source/sourcePath와 detailPath 도입으로 canonical storage model을 옮긴다.

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

---
id: I-XXXX-010
title: 짧은 작업 제목
parent: I-XXXX-short-name
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
  - pnpm --filter @masters/api test -- --runTestsByPath src/example.spec.ts
artifacts:
  - apps/api/src/example.ts
---

## 목표

하나의 실행 가능한 작업 단위를 설명한다.

## 완료 기준

- 관찰 가능한 결과
- 관찰 가능한 결과

## 노트

- 제약 사항
- 관련 링크
- 사용자에게 보이는 소비자용 웹 작업이라면, 관련 UX 문서를 `artifacts` 또는 여기 `Notes`에서 참조한다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용:
- PO reviewer가 확인할 내용:

## 핸드오프

- 다음 태스크가 알아야 할 점

## 설계 divergence

- 승인된 설계와 현재 구현 사이의 차이를 기록한다.
- 이 태스크 이후에도 차이가 남는다면, 여기서 후속 태스크를 연결한다.
- 미완성 코드를 맞추기 위해 승인된 설계 문서를 낮춰 다시 쓰지 않는다.

## 시도 로그

- YYYY-MM-DD: 시도, 실패, 또는 중요한 선택을 남긴다

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

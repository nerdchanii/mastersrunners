---
id: I-0016-030
title: 소비자용 웹 카피와 인증 유도를 새 UX 규칙에 맞게 정렬
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-010-meta-web-ux-guardrail-foundation.md
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/frontend/writing-and-copy.md
  - design/frontend/ux-principles.md
---

## 목표

소비자용 웹 화면에 남아 있는 설명 과다, 데모형, 과잉 안내형 카피를 제거하고, 인증 유도 문구를 행동 경계 중심 UX에 맞게 정렬한다.

## 완료 기준

- 대상 라우트의 남은 카피가 문구 규칙을 따른다.
- 인증 유도 문구가 일반적인 서비스 설득이 아니라 행동 맥락 중심의 유틸리티 문구로 읽힌다.

## 메모

- 예상 범위에는 empty state, 인증 모달, 공개/소셜 라우트의 표면적 helper copy가 포함된다.

## 셀프 리뷰

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## 리뷰 포인트

- Specialist reviewer should check:
- PO reviewer should check:

## 핸드오프

- 어떤 라우트가 여전히 설명 문구 없이는 이해되기 어렵다면, 레이아웃만으로 충분하지 않은 이유를 기록한다.

## 설계 divergence

- 남아 있는 카피 예외를 여기에 기록한다.

## 시도 로그

- 2026-04-03: `I-0016-010`에서 후속 태스크로 시드했다.

## 리뷰 메모

- Specialist review:
- PO review:

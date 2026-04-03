---
id: I-0016-020
title: 남은 공개 소셜 화면을 UX 가드레일 계약에 맞게 정렬
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
  - design/frontend/social-surface-patterns.md
  - design/frontend/ux-principles.md
---

## 목표

문서화된 읽기/참여 패턴에서 아직 벗어나 있는 사용자용 라우트에 새 공개 소셜 UX 계약을 적용한다.

## 완료 기준

- 남은 공개 소셜 라우트가 문서화된 게이팅 및 뒤로가기 규칙을 따른다.
- 여전히 보호된 읽기 경험이 있다면 임시 divergence로 명시한다.

## 메모

- 예상 범위에는 공개 프로필 읽기와 공개 트리 안에 남아 있는 라우트 로컬 인증 리다이렉트가 포함된다.

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

- 해결되지 않은 라우트 예외는 암묵적 기본값처럼 두지 말고 명시적으로 기록한다.

## 설계 divergence

- 남아 있는 공개 라우트 불일치를 여기에 기록한다.

## 시도 로그

- 2026-04-03: `I-0016-010`에서 후속 태스크로 시드했다.

## 리뷰 메모

- Specialist review:
- PO review:

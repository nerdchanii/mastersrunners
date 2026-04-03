---
id: I-0016-040
title: UX 가드레일 검사를 1차 기반 이후로 확장
parent: I-0016-design-system-and-ux-guardrails
scope: meta
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - harness-reviewer
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
  - apps/web/e2e/ux-contract.spec.ts
  - scripts/check-ux-copy-patterns.mjs
  - docs/runbooks/ui-ux-guardrail-review.md
---

## 목표

1차 규칙 세트가 안정적이고 노이즈가 적다는 것이 확인된 뒤, UX 자동화 기반을 확장한다.

## 완료 기준

- Playwright UX 계약이 더 많은 공개 라우트와 모달/뒤로가기 케이스를 덮는다.
- 정적 카피 검사가 더 많은 금지 표현을 다루되, false positive 노이즈는 높지 않다.

## 메모

- 팀이 일반적인 제품 작업을 할 때 자동화와 싸우지 않도록, 검사기는 충분히 좁고 명확하게 유지한다.

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

- 취향 중심의 스타일 금지를 많이 추가하기보다, 신호가 강한 규칙부터 확장한다.

## 설계 divergence

- 알려진 false positive나 의도적으로 아직 막지 않은 빈틈을 여기에 기록한다.

## 시도 로그

- 2026-04-03: `I-0016-010`에서 후속 태스크로 시드했다.

## 리뷰 메모

- Specialist review:
- PO review:

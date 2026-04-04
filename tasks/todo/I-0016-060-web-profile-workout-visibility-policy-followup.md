---
id: I-0016-060
title: 공개 프로필의 workout 노출 정책과 surface 계약을 후속 정렬
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-050-web-public-profile-and-crew-route-alignment.md
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/profile/profile.service.spec.ts
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/frontend/social-profile.md
  - design/frontend/social-surface-patterns.md
  - apps/api/src/profile/profile.service.ts
  - apps/web/src/pages/profile/[id]/index.tsx
  - apps/web/src/components/profile/ProfileTabs.tsx
---

## 목표

공개 프로필에서 workout을 계속 숨길지, 제한적으로 다시 노출할지 제품 정책과 API/web surface 계약을 명시적으로 닫는다.

## 완료 기준

- 공개 프로필의 workout 노출 정책이 문서와 구현에서 하나의 truth로 정리된다.
- workout을 다시 노출한다면 privacy-safe한 데이터 범위와 CTA 경계가 함께 정의된다.

## 메모

- `I-0016-050`은 위치 민감도를 이유로 타인 공개 프로필의 workout 탭을 숨겼다.
- 이 후속 작업은 임시 보수 정책을 영구 정책으로 확정하거나, 제한적 재노출 규칙으로 대체하는 데 사용한다.

## 셀프 리뷰

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## 리뷰 포인트

- Specialist reviewer should check: 공개 프로필에서 workout surface를 다루는 방식이 privacy 경계와 UI affordance를 함께 만족하는지 확인한다.
- PO reviewer should check: 공개 프로필의 social value와 location/privacy 리스크 사이의 제품 균형이 적절한지 확인한다.

## 핸드오프

- 공개 프로필에서 workout을 다시 노출한다면, 어떤 단위가 읽기 가능하고 어떤 단위가 auth gate 또는 privacy shell 뒤에 남는지 명확히 남긴다.

## 설계 divergence

- 현재는 공개 프로필에서 workout을 숨기는 보수 정책을 적용 중이다.

## 시도 로그

- 2026-04-04: `I-0016-050` closeout residual risk에서 후속 태스크로 시드했다.

## 리뷰 메모

- Specialist review:
- PO review:

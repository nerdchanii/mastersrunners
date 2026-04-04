---
id: I-0016-070
title: 공개 프로필의 followers/following 라우트 보호 경계를 정렬
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
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
  - pnpm --filter @masters/api test -- --runTestsByPath src/follow/follow.controller.spec.ts
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/frontend/social-profile.md
  - design/frontend/app-shell-routing.md
  - apps/api/src/follow/follow.controller.ts
  - apps/web/src/router.tsx
  - apps/web/src/pages/profile/[id]/followers/index.tsx
  - apps/web/src/pages/profile/[id]/following/index.tsx
---

## 목표

`/profile/:id/followers`, `/profile/:id/following`이 공개 트리에 남아 있는 현재 상태를 제품 정책에 맞게 정렬한다.

## 완료 기준

- 팔로우 그래프 목록 라우트의 공개/보호 정책이 라우터, API, 문서에서 일관되게 맞춰진다.
- 사용자가 route-level surprise 없이 현재 정책을 이해할 수 있는 진입 흐름을 갖는다.

## 메모

- `I-0016-050`에서 현재 API는 본인만 목록을 읽게 막았지만, 라우터는 여전히 공개 트리에 남아 있다.
- 이 태스크는 라우터 보호, auth gate, 혹은 목록 공개 정책 변경 중 하나를 명시적으로 선택해 닫는다.

## 셀프 리뷰

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## 리뷰 포인트

- Specialist reviewer should check: 라우터와 API 보호 경계가 같은 정책을 말하는지 확인한다.
- PO reviewer should check: follow graph 목록을 감추거나 여는 선택이 공개 프로필 경험과 제품 가치에 맞는지 확인한다.

## 핸드오프

- 정책이 본인 전용으로 유지되면, 공개 트리 유지 이유와 redirect/modal 처리 원칙을 함께 남긴다.

## 설계 divergence

- 현재 라우터와 API가 다른 보호 경계 레벨을 사용한다.

## 시도 로그

- 2026-04-04: `I-0016-050` closeout residual risk에서 후속 태스크로 시드했다.

## 리뷰 메모

- Specialist review:
- PO review:

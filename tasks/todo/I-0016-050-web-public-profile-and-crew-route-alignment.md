---
id: I-0016-050
title: 공개 프로필과 크루 라우트를 공개 소셜 계약에 맞게 정렬
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-020-web-public-social-surface-alignment.md
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts --project=chromium
artifacts:
  - design/frontend/social-surface-patterns.md
  - design/frontend/app-shell-routing.md
  - design/frontend/social-profile.md
  - design/frontend/crew-experience.md
  - apps/web/src/router.tsx
---

## 목표

`/profile/:id`, `/crews`, `/crews/:id` 같은 남은 공개 소셜 라우트를 현재 공개 탐색/참여 게이트 계약에 맞게 정렬한다.

## 완료 기준

- 공개 읽기가 허용된 라우트는 surprise redirect 없이 제자리 흐름을 유지한다.
- 아직 보호를 유지하는 라우트는 임시 divergence가 아니라 명시적 제품 정책으로 문서화된다.

## 메모

- `I-0016-020`에서 guest `/feed` 프리뷰와 공개 게시글 auth gate를 먼저 정리했고, 이 태스크는 남은 공개 프로필/크루 표면 정렬만 다룬다.
- 공개 범위를 넓히는 작업이어도 privacy 경계를 약화해서는 안 된다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 남은 공개 소셜 라우트가 로그인 리다이렉트보다 제자리 탐색을 우선하면서도 보호 경계를 명확히 유지하는지 확인한다.
- PO reviewer가 확인할 내용: 공개 크루/프로필 탐색 폭이 제품 가치에 맞는지, 그리고 공개 범위가 너무 공격적으로 넓어지지 않는지 확인한다.

## 핸드오프

- 공개 읽기 정책이 바뀌면 라우터 구현보다 문서를 먼저 내리는 대신, 새 정책과 divergence를 함께 남긴다.

## 설계 divergence

- 남아 있는 공개 라우트 예외를 여기에 기록한다.

## 시도 로그

- 2026-04-04: `I-0016-020`의 guest `/feed` 및 공개 게시글 정렬 이후, 남은 공개 프로필/크루 정렬 범위를 별도 후속 태스크로 분리했다.

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

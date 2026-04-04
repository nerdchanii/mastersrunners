---
id: I-0016-050
title: 공개 프로필과 크루 라우트를 공개 소셜 계약에 맞게 정렬
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-020-web-public-social-surface-alignment.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/profile/profile.service.spec.ts src/crews/crews.controller.spec.ts src/crew-boards/crew-boards.controller.spec.ts
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts --project=chromium
artifacts:
  - design/frontend/social-surface-patterns.md
  - design/frontend/app-shell-routing.md
  - design/frontend/social-profile.md
  - design/frontend/crew-experience.md
  - design/frontend/writing-and-copy.md
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
  - apps/api/src/profile/profile.service.ts
  - apps/api/src/posts/posts.controller.ts
  - apps/api/src/follow/follow.controller.ts
  - apps/api/src/crews/crews.controller.ts
  - apps/api/src/crews/internal/crew-read.service.ts
  - apps/api/src/crew-boards/crew-boards.controller.ts
  - apps/web/src/router.tsx
  - apps/web/src/pages/profile/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/e2e/public-entry-auth.spec.ts
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

- 범위와 의도: 공개 프로필 `/profile/:id`를 헤더 + 게시글 + 크루 읽기 표면으로 열고, 공개 크루 `/crews/:id`는 summary + activity list + board list까지만 읽게 정렬했다. 동시에 auth gate 카피를 행동 중심으로 줄여 `I-0016-030`의 핵심 톤 규칙 일부를 이번 범위 안에서 적용했다.
- source of truth: `design/frontend/social-surface-patterns.md`, `design/frontend/social-profile.md`, `design/frontend/crew-experience.md`, `design/frontend/app-shell-routing.md`, `design/frontend/writing-and-copy.md`를 이번 구현과 함께 갱신했다.
- 설계 divergence: 팔로워/팔로잉 목록 라우트는 공개 트리에 그대로 남아 있지만 API에서 본인만 읽을 수 있게 막아 두었다. 더 세밀한 공개 범위 설정과 공개 프로필의 workout 재노출 정책은 이번 태스크 범위 밖이다.
- 검증: `pnpm --filter @masters/api test -- --runTestsByPath src/profile/profile.service.spec.ts src/crews/crews.controller.spec.ts src/crew-boards/crew-boards.controller.spec.ts`, `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts --project=chromium`를 모두 통과했다.
- 리뷰 라우팅: 공개 프로필/크루 UX와 auth gate 카피가 포함된 사용자-facing web 작업이면서, profile/follow/crew API 계약도 바뀌었으므로 `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, `po-reviewer`를 모두 요구한다.

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 남은 공개 소셜 라우트가 로그인 리다이렉트보다 제자리 탐색을 우선하면서도 보호 경계를 명확히 유지하는지 확인한다.
- PO reviewer가 확인할 내용: 공개 크루/프로필 탐색 폭이 제품 가치에 맞는지, 그리고 공개 범위가 너무 공격적으로 넓어지지 않는지 확인한다.

## 핸드오프

- 공개 읽기 정책이 바뀌면 라우터 구현보다 문서를 먼저 내리는 대신, 새 정책과 divergence를 함께 남긴다.
- 공개 프로필 workout 재노출 정책은 `tasks/todo/I-0016-060-web-profile-workout-visibility-policy-followup.md`에서 이어간다.
- `/profile/:id/followers`, `/profile/:id/following`의 route-level 보호 정렬은 `tasks/todo/I-0016-070-web-follow-graph-route-protection-alignment.md`에서 이어간다.

## 설계 divergence

- `/profile/:id/followers`, `/profile/:id/following`은 라우터상 공개 트리에 있지만 현재 제품 정책에서는 본인만 읽을 수 있다.
- 공개 프로필의 workout 탭은 위치 민감도를 이유로 숨겼다. workout 자체 공개 설정을 프로필 surface에 다시 반영하는 작업은 별도 후속 태스크가 필요하다.
- 공개 크루의 게시판/활동은 목록까지만 열고, 상세 읽기와 크루 게시글은 멤버십 경계 뒤에 남겼다.
- follow-up tasks: `I-0016-060`, `I-0016-070`

## 시도 로그

- 2026-04-04: `I-0016-020`의 guest `/feed` 및 공개 게시글 정렬 이후, 남은 공개 프로필/크루 정렬 범위를 별도 후속 태스크로 분리했다.
- 2026-04-04: 공개 프로필을 anonymous readable로 열고, 타인 프로필에서는 workout 탭 대신 crew count를 보여주는 계약으로 profile API와 web surface를 정렬했다.
- 2026-04-04: 공개 크루 상세를 summary + activity list + board list까지만 열고, deeper read는 auth gate 또는 멤버십 경계 뒤에 두도록 크루/게시판 컨트롤러, 읽기 서비스, UI를 조정했다.
- 2026-04-04: auth gate 제목을 `좋아요 남기기`, `메시지 보내기`, `게시판 열기`, `내 크루 보기`처럼 행동 중심 문구로 바꾸고 공개 진입 Playwright 회귀 테스트를 확장했다.

## 리뷰 노트

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-050/frontend-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 팔로워/팔로잉 목록 라우트는 공개 트리에 남아 있지만 API에서 본인 전용으로 막혀 있어, 향후 라우터 수준 보호 여부를 별도 정책으로 정리할 필요가 있다.
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-050/ui-ux-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 비공개 프로필 잠금 셸과 공개 크루 목록 전용 읽기 계약은 일관되지만, 향후 공개 workout 재노출 여부를 정할 때 현재의 간결한 auth gate 톤을 유지해야 한다.
  - reviewer: `backend-reviewer`
  - reviewer protocol: `.codex/agents/backend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/backend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-050/backend-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 공개 프로필의 workout 비노출은 web surface 계약으로 처리되므로, 향후 profile API를 재사용하는 다른 클라이언트가 생기면 같은 privacy 정책을 다시 명시해야 한다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-050/po-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 더 세밀한 공개 범위 설정과 workout 재노출 여부는 별도 후속 태스크가 필요하다.

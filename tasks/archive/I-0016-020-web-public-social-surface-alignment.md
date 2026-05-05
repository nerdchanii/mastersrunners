---
id: I-0016-020
title: 게스트 피드 프리뷰와 공개 게시글 인증 게이트를 UX 계약에 맞게 정렬
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-010-meta-web-ux-guardrail-foundation.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium
  - pnpm check:ux-copy
  - bash scripts/check-reviewer-protocols.sh
  - bash scripts/check-reviewer-protocol-wiring.sh
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-active-task-closeout.sh
artifacts:
  - design/frontend/social-surface-patterns.md
  - design/frontend/ux-principles.md
  - design/frontend/app-shell-routing.md
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/components/common/AuthGateDialog.tsx
  - apps/web/src/components/social/LikeButton.tsx
  - apps/web/e2e/ux-contract.spec.ts
---

## 목표

게스트 `/feed` 프리뷰와 공개 게시글의 참여 액션을 현재 UX 가드레일 계약에 맞게 정렬해, 설명형 랜딩 대신 product-like preview를 유지하면서 인증은 제자리에서 게이트한다.

## 완료 기준

- 게스트 `/feed` 프리뷰가 dead affordance 없이 읽기 중심 표면으로 보인다.
- 공개 게시글과 게스트 프리뷰의 참여 액션이 `/login` redirect 대신 auth dialog를 열고 route/back 맥락을 유지한다.
- 남은 공개 프로필/크루 정렬 범위는 별도 후속 태스크로 분리된다.

## 메모

- 현재 제품 결정은 게스트 `/feed`를 실시간 전체 공개 피드가 아니라 privacy-safe한 큐레이션 프리뷰 또는 제한된 목 데이터 표면으로 두는 것이다.
- 이번 태스크는 `/profile/:id`, `/crews`, `/crews/:id`의 공개 정렬까지 한 번에 닫지 않고, 우선순위가 높은 guest `/feed` 및 공개 게시글 흐름만 마무리했다.
- 남은 공개 프로필/크루 정렬은 `tasks/todo/I-0016-050-web-public-profile-and-crew-route-alignment.md`로 분리했다.

## 셀프 리뷰

- 범위와 의도: 게스트 `/feed` 프리뷰와 공개 게시글의 참여 게이트를 product-like preview + in-place auth contract로 정렬하고, 남은 공개 프로필/크루 정렬은 후속 태스크로 분리했다.
- source of truth: `design/frontend/ux-principles.md`, `design/frontend/social-surface-patterns.md`, `design/frontend/app-shell-routing.md`
- 설계 divergence: 공개 프로필/크루 정렬은 이번 태스크에서 닫지 않았고 `I-0016-050`으로 분리했다. 이번 changeset 안의 guest preview 및 공개 게시글 흐름에는 숨은 divergence를 남기지 않았다.
- 검증: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium`, `pnpm check:ux-copy`, `bash scripts/check-reviewer-protocols.sh`, `bash scripts/check-reviewer-protocol-wiring.sh`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`를 통과했다.
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

## 리뷰 초점

- Specialist reviewer should check: 게스트 프리뷰가 설명형 랜딩이 아니라 제품다운 읽기 경험으로 보이면서도, dead affordance와 route-local auth regressions를 남기지 않는지 확인한다.
- PO reviewer should check: 공개 탐색을 열어두되 실제 사용자 데이터 노출 경계는 넓히지 않는 현재 제품 판단이 일관되게 반영됐는지 확인한다.

## 핸드오프

- 남은 공개 프로필/크루 정렬은 `I-0016-050`에서 이어간다.
- 공개 범위를 추가로 넓힐 때는 feed preview privacy 정책과 같이 검토한다.

## 설계 divergence

- 이번 태스크 범위 밖으로 분리한 공개 프로필/크루 정렬은 `I-0016-050`에서 다룬다.

## 시도 로그

- 2026-04-03: `I-0016-010`에서 후속 태스크로 시드했다.
- 2026-04-03: 게스트 `/feed`를 큐레이션 프리뷰 또는 제한된 목 데이터 표면으로 두는 공개 정책을 문서에 반영했다.
- 2026-04-03: 게스트 프리뷰에서 프로필 링크와 태그 dead affordance를 제거하고, 태그 탐색은 제자리 인증 게이트로 정리했다.
- 2026-04-04: 게스트 프리뷰 좋아요/댓글 액션도 제자리 auth gate와 Back 계약으로 검증되도록 접근성 라벨과 Playwright UX contract를 보강했다.
- 2026-04-04: 남은 공개 프로필/크루 정렬 범위를 `I-0016-050`으로 분리하고, 이번 태스크는 guest preview 및 공개 게시글 auth gate 정렬까지로 닫는다.

## 리뷰 노트

- Self review: 2026-04-04 checklist 기준으로 scope, source-of-truth, split follow-up, verification, reviewer routing을 다시 점검했다.
- Specialist review:
  - reviewer: frontend-reviewer
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-020/frontend-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 공개 프로필과 크루 라우트는 여전히 후속 정렬이 필요하므로, 공개 소셜 read path를 더 넓히는 작업은 `I-0016-050`에서 이어져야 한다.
  - reviewer: ui-ux-reviewer
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-020/ui-ux-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 현재 preview는 privacy-safe한 1차 표면으로 적절하지만, 공개 탐색 폭 자체는 여전히 좁게 느껴질 수 있어 다음 공개 라우트 정렬과 함께 균형을 잡아야 한다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-020/po-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 공개 크루/프로필 정렬과 이후 추천/인기 공개 피드 정책은 별도 후속으로 연결돼야 한다.

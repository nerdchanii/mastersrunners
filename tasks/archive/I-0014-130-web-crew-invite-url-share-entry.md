---
id: I-0014-130
title: Add shareable crew invite URL entry points
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/lib/api-client.ts
  - apps/web/src/pages/crews/[id]/crew-detail-api.ts
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/settings/index.tsx
  - apps/web/src/pages/crews/[id]/crew-invite-api.ts
  - apps/web/src/pages/login/index.tsx
  - apps/web/src/pages/auth/callback/index.tsx
  - apps/web/src/lib/auth-return-path.ts
  - apps/api/src/crews/
  - design/frontend/crew-experience.md
  - docs/domain/crew.md
---

## Goal

Let crew operators invite members through a shareable crew URL instead of relying on hidden or manual invite flows.

## Done Criteria

- crews expose a discoverable invite/share action
- the invite flow can be expressed as a stable URL
- the first version handles the permission and destination rules cleanly

## Notes

- Execution mode: autonomous unless the final invite-auth rules require a narrower product checkpoint.
- Keep this task on invite URL entry and shareability, not on broader crew settings cleanup.

## Self Review

- Scope and intent: 크루 운영진이 detail/settings 어디에서든 안정적인 invite URL을 공유하고, 링크로 들어온 사용자가 로그인 뒤에도 같은 초대 진입점으로 복귀하도록 묶었다.
- Source of truth: `design/frontend/crew-experience.md`, `docs/domain/crew.md`, 그리고 현재 `crews.service`, `login`, `auth/callback` 흐름을 함께 맞췄다.
- Design divergence: 없음. 운영진 전용 share entry와 `/crews/:id?invite=1` 계약을 문서와 구현에 같이 반영했다.
- Verification: `pnpm --filter @masters/web build`, `pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts`, `bash scripts/check-task-review-metadata.sh`
- Review routing: user-facing UI + backend 권한 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: invite URLs are safe, understandable, and fit the current crew permission model.
- PO reviewer should check: the invite flow is easier than the current state and matches crew-growth expectations.

## Handoff

- If crew join policy later expands, reuse the invite URL structure instead of inventing a second invite surface.

## Design Divergence

- Current crew surfaces do not provide an obvious invite-by-URL flow.

## Attempt Log

- 2026-04-01: created after product requested a crew URL share/invite workflow.
- 2026-04-01: implemented operator-only invite-link retrieval plus login return-to preservation so shared invite links survive authentication.

## Review Notes

- Specialist review: 운영진만 invite path를 조회할 수 있게 API에서 막고, 웹에서는 detail/settings 양쪽에 같은 공유 액션과 invite-entry 안내를 붙여 진입 규칙을 일관되게 맞췄다.
- PO review: 공유 링크를 눌렀을 때 바로 “초대 링크”라는 맥락과 가입 CTA가 보이고, 로그인으로 튕겨도 다시 같은 크루 invite 화면으로 복귀해 초대 경험이 덜 끊긴다.

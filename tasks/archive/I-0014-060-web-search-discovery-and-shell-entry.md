---
id: I-0014-060
title: Expose runner search as a first-class shell action
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/crew-explore.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/router.tsx
  - apps/web/src/components/common/BottomNav.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/pages/search/index.tsx
  - design/frontend/app-shell-routing.md
---

## Goal

Make runner search feel present in the main app shell instead of hidden behind route knowledge.

## Done Criteria

- mobile and desktop shells expose a clear entry to runner search
- the chosen entry does not compete awkwardly with messaging, notifications, or create actions
- search remains easy to re-enter after a user leaves the dedicated search route

## Notes

- Execution mode: autonomous.
- Keep this task focused on discoverability and shell entry, not on redesigning search results.

## Self Review

- Scope and intent: mobile/desktop shell에서 `/search` 진입을 드러내고, 검색어를 URL에 반영해 재진입성을 보강하는 범위로 제한했다.
- Source of truth: `design/frontend/app-shell-routing.md`, 현재 shell component 구현, `/search` route behavior를 함께 맞췄다.
- Design divergence: 없음. 기존 “존재하지만 숨어 있음” 상태를 shell-level entry로 해소했다.
- Verification: `pnpm --filter @masters/web build`, `VITE_PORT=3000 VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web exec playwright test e2e/crew-explore.spec.ts --project=chromium`, `bash scripts/check-task-review-metadata.sh`
- Review routing: user-facing UI 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: search is easier to discover from both mobile and desktop shell layouts.
- PO reviewer should check: search now feels like a core social action, not a hidden route.

## Handoff

- If search results later need richer ranking or tabs, handle that in a separate task after the shell entry ships.

## Design Divergence

- Search exists today but is not treated like a first-class shell action.

## Attempt Log

- 2026-04-01: created from the UI bug board because product review reported search as effectively missing.
- 2026-04-01: added shell-level search entry on desktop and mobile, then mirrored user search queries into the URL so returning to search preserves context.

## Review Notes

- Specialist review: search now has explicit shell entry on both desktop and mobile, and the search page preserves query context without expanding scope into result redesign.
- PO review: runner search now reads like a core action instead of a hidden route or easter egg.

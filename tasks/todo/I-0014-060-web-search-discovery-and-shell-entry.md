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

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: search is easier to discover from both mobile and desktop shell layouts.
- PO reviewer should check: search now feels like a core social action, not a hidden route.

## Handoff

- If search results later need richer ranking or tabs, handle that in a separate task after the shell entry ships.

## Design Divergence

- Search exists today but is not treated like a first-class shell action.

## Attempt Log

- 2026-04-01: created from the UI bug board because product review reported search as effectively missing.

## Review Notes

- Specialist review:
- PO review:

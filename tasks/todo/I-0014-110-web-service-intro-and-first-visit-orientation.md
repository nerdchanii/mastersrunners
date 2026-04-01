---
id: I-0014-110
title: Add a service introduction and first-visit orientation surface
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
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/router.tsx
  - apps/web/src/pages/login/index.tsx
  - design/frontend/app-shell-routing.md
---

## Goal

Give first-time visitors a clear introduction to the service before onboarding tours or advanced guidance layers are considered.

## Done Criteria

- a new visitor can understand what the product is and why to join before seeing a utilitarian auth wall
- the entry surface has a clear handoff into signup or login
- onboarding-tour ideas such as Driver.js stay out of scope until the introduction is good enough on its own

## Notes

- Execution mode: requires product checkpoint before implementation.
- Product checkpoint topics: product promise, tone, and the minimum content blocks needed on the intro surface.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the first-visit route is clear, restrained, and mobile-safe.
- PO reviewer should check: the intro tells the right product story before signup.

## Handoff

- If later work adds guided tours, they should layer on top of this surface instead of substituting for it.

## Design Divergence

- The current logged-out experience is mostly an auth screen, not a product introduction.

## Attempt Log

- 2026-04-01: created after product flagged the lack of any real service-intro surface.

## Review Notes

- Specialist review:
- PO review:

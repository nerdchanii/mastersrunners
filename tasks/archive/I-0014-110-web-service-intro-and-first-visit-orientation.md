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
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
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

- Product checkpoint resolved in this batch: `/` becomes the logged-out service intro, `/login` remains the auth shell, and logged-in `/` requests redirect to `/feed`.
- The intro story is anchored on the service as a running community, not a generic auth gateway.

## Self Review

- Scope and intent: give first-time visitors a product story before auth and keep the login route focused on sign-in instead of carrying all orientation copy.
- Source of truth: `design/frontend/app-shell-routing.md`, `apps/web/src/router.tsx`, `apps/web/src/pages/intro/index.tsx`, and `apps/web/src/pages/login/index.tsx`.
- Design divergence: resolved in this task by moving first-visit orientation onto `/` and keeping auth-specific UI on `/login`.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`; `pnpm ci:local`; `bash scripts/check-task-review-metadata.sh`.
- Review routing: frontend, UI/UX, and PO reviews all completed with no findings.

## Review Focus

- Specialist reviewer should check: the first-visit route is clear, restrained, and mobile-safe.
- PO reviewer should check: the intro tells the right product story before signup.

## Handoff

- If later work adds guided tours, they should layer on top of this surface instead of substituting for it.

## Design Divergence

- Resolved in this task: the logged-out landing experience is now a service introduction rather than an auth-first wall.

## Attempt Log

- 2026-04-01: created after product flagged the lack of any real service-intro surface.

## Review Notes

- Specialist review: Pascal (`frontend-reviewer`) and Russell (`ui-ux-reviewer`) reported no findings after checking the route split, mobile-safe layout, and intro CTA handoff.
- PO review: Arendt (`po-reviewer`) reported no findings and confirmed the intro tells the intended community-first product story.

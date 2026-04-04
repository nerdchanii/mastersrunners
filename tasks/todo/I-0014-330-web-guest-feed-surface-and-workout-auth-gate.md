---
id: I-0014-330
title: Simplify guest feed surface and gate workout preview in place
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0014-310-web-public-feed-entry-and-auth-prompts.md
  - tasks/archive/I-0014-320-web-public-route-auth-regression-repair.md
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/post-detail.spec.ts --project=chromium
artifacts:
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/components/workout/WorkoutAttachmentPreview.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/e2e/public-entry-auth.spec.ts
  - apps/web/e2e/post-detail.spec.ts
  - apps/web/e2e/helpers/mock-auth.ts
  - design/frontend/app-shell-routing.md
  - design/frontend/workout-experience.md
---

## Goal

Remove explanatory guest-side discovery chrome from `/feed` and keep public post workout previews in-place for anonymous visitors by opening an auth modal instead of redirecting to `/login`.

## Done Criteria

- `/feed` no longer renders the old desktop explainer/sidebar rail or discovery copy blocks
- anonymous users can click an attached workout preview on a public post and stay on the post route while seeing an auth modal
- Playwright covers both the public modal flow and the authenticated `/posts/:id -> /workouts/:id` transition

## Notes

- `/workouts/:id` remains a protected route in this task
- this task narrows guest UX to content-first behavior instead of adding more promotional copy

## Self Review

- Scope and intent: tightened the public feed surface and repaired the remaining guest workout redirect mismatch without reopening workout-detail visibility
- Source of truth: updated `design/frontend/app-shell-routing.md` and `design/frontend/workout-experience.md` with the guest feed and public post workout gating contract
- Design divergence: none intended; this removes explanatory UI that product explicitly rejected
- Verification: web build plus focused Playwright coverage both pass
- Review routing: `frontend-reviewer`, `ui-ux-reviewer`, and `po-reviewer`

## Review Focus

- Specialist reviewer should check that `/feed` now reads as content-first instead of copy-first and that the workout preview keeps guest context intact
- PO reviewer should check that the guest/public experience no longer over-explains itself and that the modal gate appears only at the participation boundary

## Handoff

- After review, archive this task in the same changeset as the commit
- If product later wants public workout detail, open a separate task rather than weakening the current protected-route contract here

## Design Divergence

- No known divergence at handoff

## Attempt Log

- 2026-04-03: removed the feed sidebar rail, simplified the empty feed surface, changed public post workout previews to guest modal gating, and updated Playwright coverage plus authenticated test helpers

## Review Notes

- Specialist review:
- PO review:

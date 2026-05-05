---
id: I-0014-120
title: Rebuild the empty feed with explore modules and recommendation slots
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
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/components/feed/FeedSidebar.tsx
  - design/frontend/app-shell-routing.md
---

## Goal

Turn the empty feed into an exploration surface that can later host recommendation logic without leaving new users at a dead end.

## Done Criteria

- cold-start users see follow suggestions or exploration modules instead of a dead-end empty state
- the empty-feed layout reserves clear recommendation-ready slots without pretending the algorithm already exists
- mobile home remains useful even with no followed content

## Notes

- Product checkpoint resolved in this batch: the cold-start order is recommended runners, recommended crews, upcoming events, then joinable challenges.
- Guests do not probe protected event or challenge APIs; secondary sections show an explicit login CTA instead.

## Self Review

- Scope and intent: replace the dead-end empty feed with a recommendation-ready discovery layout while keeping the existing feed contract intact for followed content.
- Source of truth: `design/frontend/app-shell-routing.md`, `apps/web/src/pages/feed/index.tsx`, `apps/web/src/components/feed/FeedSidebar.tsx`, `apps/web/src/hooks/usePosts.ts`, and `apps/web/src/hooks/useWorkouts.ts`.
- Design divergence: resolved in this task by turning the empty feed into a structured exploration surface instead of a dead-end state.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`; `pnpm ci:local`; `bash scripts/check-task-review-metadata.sh`.
- Review routing: frontend, UI/UX, and PO reviews all completed with no findings.

## Review Focus

- Specialist reviewer should check: the empty feed becomes actionable without bloating the home surface.
- PO reviewer should check: the exploration modules match the intended recommendation-readiness direction.

## Handoff

- Keep future recommendation work additive by reusing the reserved module boundaries from this task.

## Design Divergence

- Resolved in this task: the feed empty state now reserves recommendation-ready slots for runners, crews, events, and challenges instead of stopping at a blank-state message.

## Attempt Log

- 2026-04-01: created after product asked for a recommendation-ready empty home and follow exploration.

## Review Notes

- Specialist review: Pascal (`frontend-reviewer`) and Russell (`ui-ux-reviewer`) reported no findings after checking the cold-start module order, mobile behavior, and guest-safe fallbacks.
- PO review: Arendt (`po-reviewer`) reported no findings and confirmed the empty-feed modules match the intended recommendation-readiness direction.

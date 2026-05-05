---
id: I-0014-200
title: Deep-link attached workouts and ship safe summary detail
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
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/src/pages/workouts/detail/index.tsx
  - apps/web/src/pages/workouts/new/index.tsx
  - design/frontend/workout-experience.md
  - design/backend/upload-ingestion.md
---

## Goal

Make attached workouts navigable from posts and keep the linked workout detail inside the current safe-summary contract.

## Done Criteria

- attached workouts on posts deep-link into the underlying workout detail route
- the linked workout detail stops at safe summary metrics for this batch
- GPX and FIT differences are documented and respected as a reason to defer richer visuals

## Notes

- Product checkpoint resolved: this batch stops at deep-link + safe summary only.
- Route maps, lap tables, elevation, heart-rate visuals, and other file-derived panels are intentionally deferred to a later task.

## Self Review

- Scope and intent: make attached workouts deep-link into the canonical workout detail route while constraining the detail surface to safe summary data that both GPX and FIT uploads can support.
- Source of truth: `design/frontend/workout-experience.md`, `design/backend/upload-ingestion.md`, `apps/web/src/pages/posts/[id]/index.tsx`, `apps/web/src/pages/workouts/detail/index.tsx`, and `apps/web/src/components/workout/ShareCardGenerator.tsx`.
- Design divergence: resolved in this task by removing deferred file-derived visuals from workout detail and keeping the attached-workout journey centered on safe summary metrics.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`; `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium`; `pnpm ci:local`; `apps/web/e2e/file-upload.spec.ts` was updated to the new `/workouts/:id` route but could not be executed locally because no API server was listening on `localhost:4000`.
- Review routing: frontend, UI/UX, backend, and PO reviews all completed with no findings.

## Review Focus

- Specialist reviewer should check: attached workouts navigate correctly and the detail screen does not overpromise unsupported file-derived visuals.
- PO reviewer should check: the shipped metric set stays inside the agreed safe-summary scope.

## Handoff

- Keep file-format capability notes current so later workout-visual tasks do not assume FIT and GPX behave the same.

## Design Divergence

- The previous implementation kept attached workouts shallow and left workout detail overexposed to file-derived panels that this batch now intentionally defers.

## Attempt Log

- 2026-04-01: created after product requested deeper attached-workout visuals and explicit GPX/FIT sample validation.

## Review Notes

- Specialist review: Pascal (`frontend-reviewer`), Russell (`ui-ux-reviewer`), and Faraday (`backend-reviewer`) reported no findings after checking deep-link behavior, summary-only rendering, and the deferred file-derived panels.
- PO review: Arendt (`po-reviewer`) reported no findings and confirmed the shipped workout detail stays inside the agreed safe-summary scope.

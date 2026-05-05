---
id: I-0014-300
title: Rebuild workout detail as an analysis report and strengthen post previews
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
  - pnpm --filter @masters/api test -- --runTestsByPath src/posts/repositories/post.repository.spec.ts src/feed/repositories/feed.repository.spec.ts
  - pnpm --filter @masters/api build
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts e2e/post-detail.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-active-task-closeout.sh
  - pnpm ci:local
artifacts:
  - apps/web/src/pages/workouts/detail/index.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/api/src/posts/repositories/post.repository.ts
  - design/frontend/workout-experience.md
  - design/backend/upload-ingestion.md
---

## Goal

Turn workout detail back into an analysis-first report with a large route map, linked charts, and laps, while making post detail show a richer workout preview before entering the full report.

## Done Criteria

- `/workouts/:id` reads like an analysis report rather than a summary card
- route map, elevation/heart-rate/cadence charts, and lap data all appear when the data exists
- chart scrubbing updates the corresponding location on the route map
- post detail shows a richer workout preview instead of a thin three-stat handoff
- file metadata is no longer treated as a primary workout-detail surface

## Notes

- Product checkpoint resolved in this batch: workout detail should evolve toward an analysis destination similar in spirit to Garmin or Coros, with a top map and deeper metrics below.
- Missing GPS or sensor data should degrade by partial rendering rather than by falling back to a separate summary-only layout.
- Feed cards stay relatively light; the richer preview belongs on post detail and the full analysis belongs on workout detail.

## Self Review

- Scope and intent: restored workout detail as an analysis-first report without reopening upload ingestion or inventing a separate analytics API, and kept the post-side change focused on a richer preview plus a stronger handoff into the report.
- Source of truth: aligned the UI with `design/frontend/workout-experience.md` and kept `design/backend/upload-ingestion.md` truthful that route, lap, elevation, heart-rate, and cadence data already exist in persisted workout detail payloads.
- Design divergence: replaced the temporary safe-summary workout detail that hid stored route/lap/sensor data; the remaining deliberate limit is that long-horizon analytics, zones, and file-info-centric tooling still stay out of scope.
- Verification: `pnpm --filter @masters/api test -- --runTestsByPath src/posts/repositories/post.repository.spec.ts src/feed/repositories/feed.repository.spec.ts`, `pnpm --filter @masters/api build`, `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts e2e/post-detail.spec.ts --project=chromium`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`, `pnpm ci:local`
- Review routing: `frontend-reviewer` for detail-page correctness and the post-to-report handoff, `ui-ux-reviewer` for report hierarchy and card restraint, `backend-reviewer` for attached-workout contract consistency, and `po-reviewer` for the intended map-first analytics story.

## Review Focus

- Specialist reviewer should check: the detail page now behaves like a coherent analysis report, and the shared data contract between posts and workouts stays sound.
- PO reviewer should check: the restored detail experience matches the intended “map first, analytics below” workout story.

## Handoff

- If later analytics work adds zones, splits comparison, or trend overlays, keep the current route-selection state reusable instead of rebuilding the interaction model.

## Design Divergence

- Current workout detail is intentionally summary-first and hides route, charts, and laps even though the ingest pipeline still stores them.

## Attempt Log

- 2026-04-03: created after product confirmed workout detail should grow into a richer analysis report instead of staying on the temporary safe-summary layout.
- 2026-04-03: rebuilt `/workouts/:id` around a large route map, synchronized charts, and lap analysis, and strengthened post detail so attached workouts now hand off into the report through a richer preview instead of a thin three-stat strip.
- 2026-04-03: addressed review follow-ups by preserving lap analysis for no-GPS workouts, flattening the repeated card chrome into report-style sections, adding tap selection alongside hover for chart-to-map sync, and aligning the hashtag/feed workout-preview contract plus tests with the richer post payload.

## Review Notes

- Specialist review: `frontend-reviewer`, `ui-ux-reviewer`, and `backend-reviewer` all approved after confirming the no-GPS lap fallback stays visible, the detail page reads like a map-first analysis report instead of a repeated card stack, chart selection works for tap/click as well as hover, and every post read path now shares the richer workout preview contract. Residual risks: Recharts touch behavior should still be sanity-checked on real mobile devices, and unusual lap ordering or distance mismatches in live data may still affect the polish of lap highlighting.
- PO review: approved after the no-GPS fallback was corrected so lap-only workouts still honor the partial-render promise, while post detail now frames attached workouts as previews that can open a full analysis report when route or sensor data exists.

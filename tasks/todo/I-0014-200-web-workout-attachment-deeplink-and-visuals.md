---
id: I-0014-200
title: Deep-link attached workouts and raise visual parity with workout detail
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

Make attached workouts navigable from posts and move their presentation closer to the richness already available on the workout detail route.

## Done Criteria

- attached workouts on posts deep-link into the underlying workout detail route
- richer workout visuals are only implemented after a confirmed data-availability checkpoint
- GPX and FIT differences are documented and respected in the shipped UI

## Notes

- Execution mode: requires product checkpoint before implementation.
- Mandatory checkpoint: review representative GPX and FIT samples with the product owner before deciding which metrics and map visuals are guaranteed enough to ship.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: attached workouts navigate correctly and richer visuals do not overpromise unsupported data.
- PO reviewer should check: the chosen metric set matches product expectations after sample review.

## Handoff

- Keep file-format capability notes current so later workout-visual tasks do not assume FIT and GPX behave the same.

## Design Divergence

- Current post-attached workouts are shallow compared with the dedicated workout detail surface and do not deep-link cleanly.

## Attempt Log

- 2026-04-01: created after product requested deeper attached-workout visuals and explicit GPX/FIT sample validation.

## Review Notes

- Specialist review:
- PO review:

---
id: I-0014-080
title: Remove fake profile covers and flatten the profile header
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
  - pnpm --filter @masters/web exec playwright test e2e/profile.spec.ts e2e/profile-edit.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/components/profile/ProfileHeader.tsx
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/profile/[id]/index.tsx
  - design/frontend/social-profile.md
---

## Goal

Remove the fallback cover-image look and make the profile header read as a clean information surface.

## Done Criteria

- profiles without background media no longer show an unnecessary fake cover treatment
- header hierarchy favors identity, stats, and actions over decorative chrome
- mobile profile scanning improves without requiring a major profile rewrite

## Notes

- Execution mode: autonomous.
- Keep this task on header cleanup only; broader profile field/model changes belong to separate tasks.

## Self Review

- Scope and intent: kept the task on the profile header only by removing the fake cover treatment, flattening the identity block, and leaving the dedicated edit form model untouched.
- Source of truth: used the current self/public profile routes, `ProfileHeader`, and the no-cover direction from the I-0014 bug board as the contract.
- Design divergence: removed the decorative cover fallback from the shipped profile surface instead of pretending the product still needs a hero image to look complete.
- Verification: ran `pnpm --filter @masters/web build`, `VITE_PORT=3000 VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web exec playwright test e2e/profile.spec.ts e2e/profile-edit.spec.ts --project=chromium`, and `bash scripts/check-task-review-metadata.sh`.
- Review routing: kept `frontend-reviewer` and `ui-ux-reviewer` because the change is entirely user-facing and modifies mobile information hierarchy.

## Review Focus

- Specialist reviewer should check: the profile header feels cleaner and remains readable on mobile.
- PO reviewer should check: the surface matches the “no cover image needed” direction.

## Handoff

- Follow-up profile tasks should build on this flatter header instead of reintroducing decorative cover blocks.

## Design Divergence

- The current profile header still implies a cover-image model even when no useful cover media exists.

## Attempt Log

- 2026-04-01: created after product requested cover removal and a cleaner profile surface.
- 2026-04-01: replaced the overlapping cover-avatar treatment with a flat header that centers avatar, identity, actions, and counts without decorative cover fallback.

## Review Notes

- Specialist review: reviewed the flatter header against mobile scanning and action hierarchy. The surface now reads as profile information first rather than a fake hero image shell.
- PO review: accepted because profiles no longer show an invented background-cover treatment and the header now matches the cleaner social-profile direction.

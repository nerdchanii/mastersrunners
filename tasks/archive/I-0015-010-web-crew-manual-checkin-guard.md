---
id: I-0015-010
title: Block non-operator manual check-in on crew activities
parent: I-0015-crew-attendance-permission-hardening
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
  - pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts
  - pnpm --filter @masters/web exec playwright test e2e/crew-activity-detail.spec.ts e2e/qr-check-in.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/api/src/crews/internal/crew-activities.service.ts
  - apps/api/src/crews/crews.service.spec.ts
  - apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx
  - apps/web/src/pages/crews/[id]/activities/[activityId]/use-crew-activity-detail-view-model.ts
  - apps/web/src/pages/crews/[id]/activities/[activityId]/qr-check-in.tsx
  - apps/web/e2e/crew-activity-detail.spec.ts
  - apps/web/e2e/qr-check-in.spec.ts
  - design/frontend/crew-experience.md
  - design/backend/crew-platform.md
  - docs/domain/crew.md
---

## Goal

Close the policy gap that currently allows ordinary crew members to self-trigger manual check-in from an activity detail page, and route member check-in through the QR flow instead.

## Done Criteria

- non-operator members no longer see a manual check-in action on the activity detail page
- the manual `/check-in` backend path rejects non-operator use
- RSVP members still have a visible QR-based check-in path from the activity detail surface
- design and domain docs reflect that non-operator members use QR check-in while operators can still perform manual/admin check-in

## Notes

- “Operator” here means crew `OWNER` or `ADMIN`, plus popup hosts where the current activity-management policy already grants operator-like rights.
- This task should not redesign the whole attendance UX or change RSVP semantics.
- Keep the fix narrow: policy guard, entry-point swap, and regression coverage only.

## Self Review

- Scope and intent: limited the change to the crew activity attendance permission rule, the matching member/operator entry points, and focused regression coverage.
- Source of truth: updated the live crew frontend/backend/domain docs together with the API guard and activity-detail UI so the new policy is recorded in-repo.
- Design divergence: historical notes still mention broader manual flows, but current live docs now reflect the intended operator-only manual policy for non-archived behavior.
- Verification: `pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts`, `pnpm --filter @masters/web exec playwright test e2e/crew-activity-detail.spec.ts e2e/qr-check-in.spec.ts --project=chromium`, and `bash scripts/check-task-review-metadata.sh` all passed.
- Review routing: kept the union of `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, and `po-reviewer` because the fix changes both API authorization and a user-facing attendance flow.

## Review Focus

- Specialist reviewer should check: the manual check-in path is blocked for members in both UI and API, and the QR path remains reachable for RSVP members.
- PO reviewer should check: the resulting attendance flow matches the intended crew-operations policy and no longer lets members self-check in manually.

## Handoff

- If later work changes attendance policy again, update both the backend service guard and the activity-detail/QR entry surfaces together.
- If product later wants a member-visible QR CTA redesign, that should be a separate UX task rather than widening this permission fix.

## Design Divergence

- Historical notes under `docs/reports/history/` mention broader manual-check-in options, but the current design and domain docs for live behavior should now treat non-operator self manual check-in as disallowed.

## Attempt Log

- 2026-04-01: created after product review flagged that ordinary members can still self-trigger manual check-in from crew activity detail.
- 2026-04-01: blocked non-operator use of the manual `/check-in` path, swapped RSVP-member activity-detail CTA to the QR route, updated crew policy docs, and locked the change with API plus Playwright regression coverage.

## Review Notes

- Specialist review: `frontend-reviewer`, `ui-ux-reviewer`, and `backend-reviewer` internal pass on 2026-04-01. Confirmed operators retain manual/admin flows, RSVP members now route through QR, and focused browser/API coverage protects the permission boundary.
- PO review: product owner requested immediate shipment of the narrow permission fix on 2026-04-01 before broader attendance UX follow-up.

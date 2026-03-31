---
id: I-BUGS-010
title: Fix manual workout pace calculation bug
parent: I-BUGS
scope: web
owner: frontend-ui-ux-engineer
reviewers:
  - frontend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web exec tsc -b
artifacts:
  - apps/web/src/pages/workouts/new/use-workout-entry.ts
  - apps/web/src/lib/format.ts
  - apps/web/src/components/workout/LapsTable.tsx
  - apps/web/e2e/helpers/mock-auth.ts
---

## Goal

Fix the pace calculation problem caused by distance unit discrepancy in manual workout entry (sending km instead of meters) and apply fallback handling for `formatPace` to prevent UI rendering errors (for example `NaN'NaN"`).

## Done Criteria

- `use-workout-entry.ts` converts user input km to meters before submitting the API request.
- `formatPace` returns a fallback string (for example `-'--"`) when input is `NaN`, `Infinity`, or `0`.
- Workout lap display and related mock data stay aligned on the canonical `pace` field instead of the stale `avgPace` shape.

## Notes

- Backend expects `distance` to be in meters.
- The UI handles the inputs in `km`.
- Workout detail UI already consumes lap `pace`; the local lap table types and mock data need to match that shape.

## Self Review

- Scope and intent: keep this task on workout-entry unit normalization and pace rendering only.
- Source of truth: `design/frontend/workout-experience.md`, `design/adr/ADR-0003-canonical-workout-units.md`, and `docs/domain/workout.md`.
- Design divergence: none. This restores the approved canonical unit flow instead of changing it.
- Verification: `pnpm --filter @masters/web lint` and `pnpm --filter @masters/web exec tsc -b` both pass.
- Review routing: `frontend-reviewer` plus PO review is sufficient because this is a bounded web bugfix without backend contract changes.

## Review Focus

- Specialist reviewer should check: manual entry still displays km in the UI while submitting meters, and invalid pace values no longer render broken strings.
- PO reviewer should check: the fix restores correct workout entry behavior without changing the visible creation flow.

## Handoff

- If future cleanup touches workout detail mocks or lap rendering, keep them aligned to the canonical `pace` field name already used by API-facing web views.

## Design Divergence

- None.

## Attempt Log

- 2026-03-30: identified the cause for outrageous pace rendering. Distance was passed directly without being multiplied by `1000`.
- 2026-03-31: aligned local lap display and mock data to the canonical `pace` field while preserving the UI-level kilometer input flow.
- 2026-03-31: verification passed with `pnpm --filter @masters/web lint` and `pnpm --filter @masters/web exec tsc -b`.

## Review Notes

- Specialist review:
  - `frontend-reviewer` pass on 2026-03-31: confirmed the manual entry flow now preserves km-only UI input while submitting canonical meters, invalid pace rendering no longer leaks `NaN`, and lap table/mock data are aligned to the canonical `pace` field.
- PO review:
  - 2026-03-31: user-approved closeout. The fix stays inside workout correctness without changing the intended entry UX.

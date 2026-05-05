# I-0015: Crew Attendance Permission Hardening

## Summary

Harden the crew activity attendance flow so ordinary members cannot self-trigger manual check-in from the activity detail surface, while operator-managed check-in and QR-based member check-in remain intact.

## Problem

The current crew activity flow lets RSVP members trigger the manual `/check-in` path for themselves from the activity detail page. That blurs the difference between member self-service attendance and operator-run attendance management.

## Goals

- block member self manual check-in in both UI and API
- preserve QR-based check-in for RSVP members
- preserve operator-only manual/admin attendance actions
- lock the rule with focused service and browser regression coverage

## Non-Goals

- redesigning the full crew attendance UX
- changing RSVP semantics
- changing QR code generation or scanner behavior beyond the return/entry copy needed for this rule

## Scope

- `apps/api/src/crews/internal/crew-activities.service.ts`
- `apps/api/src/crews/crews.service.spec.ts`
- `apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx`
- `apps/web/src/pages/crews/[id]/activities/[activityId]/use-crew-activity-detail-view-model.ts`
- `apps/web/src/pages/crews/[id]/activities/[activityId]/qr-check-in.tsx`
- `apps/web/e2e/crew-activity-detail.spec.ts`
- `apps/web/e2e/qr-check-in.spec.ts`
- `design/frontend/crew-experience.md`
- `design/backend/crew-platform.md`
- `docs/domain/crew.md`

## Design References

- `design/frontend/crew-experience.md`
- `design/backend/crew-platform.md`
- `docs/domain/crew.md`

## Review Plan

- `frontend-reviewer` checks member/operator entry-point separation on the activity detail route
- `ui-ux-reviewer` checks the RSVP-member check-in CTA is still understandable after the manual action is removed
- `backend-reviewer` checks the API permission guard matches the frontend behavior
- `po-reviewer` checks the shipped rule matches the intended crew-operations policy

## Task Breakdown

- `tasks/archive/I-0015-010-web-crew-manual-checkin-guard.md`

## Success Criteria

- ordinary members no longer see a self manual check-in action on the activity detail page
- the manual `/check-in` path rejects non-operator use
- RSVP members still have a clear QR-based attendance path
- the current design/domain docs describe operator-only manual check-in accurately

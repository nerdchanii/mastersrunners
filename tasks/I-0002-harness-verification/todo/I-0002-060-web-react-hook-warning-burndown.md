---
id: I-0002-060
title: Burn down remaining web react-hooks warnings
parent: I-0002-harness-verification
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - I-0002-010
blocked_by: []
verify:
  - pnpm --filter @masters/web lint -- --max-warnings=0
artifacts:
  - apps/web/src/components/challenge/ChallengeTeams.tsx
  - apps/web/src/components/challenge/TeamLeaderboard.tsx
  - apps/web/src/components/crew/CrewAttendance.tsx
  - apps/web/src/components/crew/CrewTagManager.tsx
  - apps/web/src/components/crew/PendingMemberList.tsx
  - apps/web/src/pages/challenges/[id]/index.tsx
  - apps/web/src/pages/events/[id]/index.tsx
  - apps/web/src/pages/messages/[id]/index.tsx
---

## Goal

Resolve the remaining `react-hooks/exhaustive-deps` warnings so web lint can become fully warning-free.

## Done Criteria

- `pnpm --filter @masters/web lint -- --max-warnings=0` passes
- warning fixes do not change user-visible behavior unexpectedly
- any intentional dependency omissions are documented inline

## Notes

- After ESLint repair on 2026-03-11, web lint still reported 11 `react-hooks/exhaustive-deps` warnings.
- This is follow-up cleanup, not a blocker for the lint harness foundation itself.

## Review Focus

- Specialist reviewer should check: warning cleanup does not change data-fetch or interaction timing unexpectedly.
- PO reviewer should check: cleanup work is worth the scope relative to product-facing tasks.

## Handoff

- Use `pnpm --filter @masters/web lint -- --max-warnings=0` as the closure signal for this warning burn-down task.

## Attempt Log

- 2026-03-11: task created after lint repair left 11 non-blocking `react-hooks/exhaustive-deps` warnings in web code

## Review Notes

- Specialist review:
- PO review:

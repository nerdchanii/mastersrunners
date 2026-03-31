---
id: I-0012-080
title: Stabilize challenge coverage tests against calendar drift
parent: I-0012-supabase-postgres-rollout
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0012-070
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/challenges/challenges.service.spec.ts
  - pnpm --filter @masters/api test:cov
  - pnpm exec prettier --check apps/api/src/challenges/challenges.service.spec.ts design/initiatives/I-0012-supabase-postgres-rollout.md tasks/active/I-0012-080-api-stabilize-challenge-coverage-dates.md
artifacts:
  - apps/api/src/challenges/challenges.service.spec.ts
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Remove calendar-sensitive challenge coverage failures so the `dev` branch CI can stay green after the pipeline regressions are fixed.

## Done Criteria

- challenge join coverage tests use dates relative to execution time instead of expiring calendar literals
- the targeted challenge spec and API coverage command pass locally again
- the initiative tracks this follow-up as the last blocker discovered during `dev` bring-up

## Notes

- The service behavior is correct; the failing test hard-coded a March 2026 challenge window that has now expired.
- This task should not relax the “ended challenges cannot be joined” rule.

## Self Review

- Scope and intent: limited the change to the date-sensitive challenge join coverage fixtures so CI regains stability without changing challenge service behavior.
- Source of truth: updated only the challenge service spec and initiative task breakdown; the runtime rule in `ChallengesService.join` stays unchanged.
- Design divergence: none intended; the service still rejects expired challenges, and the tests now prove that rule with relative dates instead of expiring calendar literals.
- Verification: `pnpm --filter @masters/api test -- --runTestsByPath src/challenges/challenges.service.spec.ts`, `pnpm --filter @masters/api test:cov`, and targeted `prettier --check` all passed locally.
- Review routing: `backend-reviewer` checks the rule coverage, `harness-reviewer` checks the CI unblock, and PO review confirms the user-facing challenge participation behavior is unchanged.

## Review Focus

- Specialist reviewer should check:
  - the updated test still proves active vs expired challenge behavior instead of masking the date validation branch
- PO reviewer should check:
  - the CI unblock keeps the intended challenge participation rule intact

## Handoff

- After this task, re-run the `dev` pipeline and continue Cloud Run bring-up if coverage stays green.

## Design Divergence

- None intended.

## Attempt Log

- 2026-03-31: created after `dev` CI passed the earlier env/docker regressions but still failed in `Run API coverage` because `ChallengesService` tests used a hard-coded March 2026 challenge window.

## Review Notes

- Specialist review:
  - 2026-03-31 `backend-reviewer`: approved after the active challenge fixtures switched to relative future dates while the expired challenge case stayed explicit, so the join rule is still covered instead of being bypassed.
  - 2026-03-31 `harness-reviewer`: approved after the CI blocker was narrowed to a deterministic spec change and the full API coverage command passed again locally.
- PO review:
  - 2026-03-31: approved by the user direction to keep execution moving and unblock the `dev` pipeline without changing the actual challenge participation rule.

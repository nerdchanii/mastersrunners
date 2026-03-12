---
id: I-0007-010
title: Refactor web route batch A
parent: I-0007-readability-hardening
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - I-0005-020
  - I-0006-020
blocked_by: []
verify:
  - bash scripts/check-size-budgets.sh
artifacts:
  - apps/web/src/pages/events/[id]/index.tsx
  - apps/web/src/pages/challenges/[id]/index.tsx
  - apps/web/src/pages/messages/[id]/index.tsx
---

## Goal

Make the first three route hotspots smaller and remove direct page-side `api.fetch` from them.

## Done Criteria

- each target route is under the size budget or has a scorecard exception
- direct page-side `api.fetch` is zero in these route files
- smoke checks for events/challenges/messages pass

## Notes

- No allowlist is permitted inside these three files.

## Review Focus

- Specialist reviewer should check:
  - route files no longer call `api.fetch` directly
  - page behavior stays stable for event/challenge/message detail flows
- PO reviewer should check:
  - readability-only scope stayed within the three targeted routes
  - no new user-facing flow was introduced during the split

## Handoff

- The smoke matrix command and pass result must be recorded in the task attempt log.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: moved to `active/` and extracted route-local page hooks:
  - `apps/web/src/pages/messages/[id]/useMessageDetailPage.ts`
  - `apps/web/src/pages/challenges/[id]/useChallengeDetailPage.ts`
  - `apps/web/src/pages/events/[id]/useEventDetailPage.ts`
- 2026-03-12: verification passed:
  - `rg -n "api\\.fetch" apps/web/src/pages/messages/[id]/index.tsx apps/web/src/pages/challenges/[id]/index.tsx apps/web/src/pages/events/[id]/index.tsx` -> no matches
  - `bash scripts/check-size-budgets.sh` -> passed
  - `pnpm --filter @masters/web exec eslint src/pages/messages/[id]/index.tsx src/pages/messages/[id]/useMessageDetailPage.ts src/pages/challenges/[id]/index.tsx src/pages/challenges/[id]/useChallengeDetailPage.ts src/pages/events/[id]/index.tsx src/pages/events/[id]/useEventDetailPage.ts` -> passed
  - `pnpm --filter @masters/web build` -> passed
  - `pnpm lint` -> blocked by unrelated API WIP in `apps/api/src/crews/*` from parallel `I-0007-030` worktree changes
- 2026-03-12: smoke matrix command used for this task:
  - `pnpm --filter @masters/web build`
  - Result: passed as structural smoke for events/challenges/messages route composition after fetch extraction.

## Review Notes

- Specialist review:
  - frontend-reviewer: approved. Route files now import dedicated page hooks, direct page-side `api.fetch` is removed, and `messages/[id]` is back under budget. Remaining event/challenge size exceptions are explicit and unchanged in behavior scope.
  - ui-ux-reviewer: approved. No layout or interaction regressions found in the static review; tab toggles, CTA placement, and message composer flow remain intact.
- PO review:
  - po-reviewer: approved. Scope stayed on readability hardening for events/challenges/messages and did not expand into product behavior redesign.

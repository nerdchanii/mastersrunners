# I-0007: Readability Hardening

## Summary

Reduce the first-wave large-file and page/controller coupling hotspots after the design corpus and guardrails are in place.

## Problem

Several high-traffic files are too large and carry too much mixed responsibility, which limits agent readability and raises regression risk.

## Goals

- split the first-wave hotspots along documented boundaries
- remove direct page-side `api.fetch` usage from the targeted route files
- add size-budget verification tied to a committed registry

## Non-Goals

- refactoring the entire web app or API in one pass
- style-only file splitting
- changing user-facing behavior outside what is needed to preserve existing flows

## Scope

- `apps/api/src/crews/crews.service.ts`
- `apps/web/src/pages/events/[id]/index.tsx`
- `apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx`
- `apps/web/src/pages/posts/new/index.tsx`
- `apps/web/src/pages/workouts/new/index.tsx`
- `apps/web/src/pages/challenges/[id]/index.tsx`
- `apps/web/src/pages/settings/profile/index.tsx`
- `apps/web/src/pages/messages/[id]/index.tsx`

## Design References

- `design/frontend/client-data-state.md`
- `design/frontend/*`
- `design/backend/*`
- `scripts/check-size-budgets.targets.json`

## Review Plan

- web route refactors: frontend review
- API service decomposition: backend review
- user-facing route changes may also need UI/UX review
- PO review checks that the scope stays constrained to readability hardening and does not sprawl into feature work

## Task Breakdown

- `tasks/archive/I-0007-010-web-route-batch-a.md`
- `tasks/archive/I-0007-020-web-route-batch-b.md`
- `tasks/archive/I-0007-030-api-crews-service-decomposition.md`
- `tasks/archive/I-0007-040-meta-size-budget-stop-rule.md`

## Success Criteria

- the eight first-wave files are below the agreed size budget or explicitly tracked as temporary exceptions in the readability registry
- the targeted web route files no longer perform direct page-side `api.fetch`
- smoke coverage exists for the affected flows

## Progress Notes

- `I-0007-040` now adds a machine-checkable first-wave size-budget stop rule and registry-backed exception list.
- `I-0007-010` removed direct page-side `api.fetch` from the event, challenge, and message detail routes. `messages/[id]` is now back under the 350-line budget, while event/challenge remain tracked exceptions.
- `I-0007-020` removed direct page-side `api.fetch` from the route files in batch B. `posts/new` and `settings/profile` are now below budget, while `workouts/new` and crew activity detail remain registry-tracked exceptions with route-local orchestration/view-model extraction in place.
- `I-0007-030` reduced `apps/api/src/crews/crews.service.ts` below the budget by turning it into a thin facade over internal membership, tags, activities, and read/chat responsibility services.

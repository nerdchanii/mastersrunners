---
doc_state: current
owner: frontend
last_verified: 2026-04-01
sources:
  - apps/web/src/components/common/FeatureRoute.tsx
  - apps/web/src/pages/events/index.tsx
  - apps/web/src/pages/events/[id]/index.tsx
  - apps/web/src/pages/events/[id]/useEventDetailPage.ts
  - apps/web/src/pages/events/new/index.tsx
  - apps/web/src/pages/challenges/index.tsx
  - apps/web/src/pages/challenges/[id]/index.tsx
  - apps/web/src/pages/challenges/[id]/useChallengeDetailPage.ts
  - apps/web/src/pages/challenges/new/index.tsx
  - apps/web/src/hooks/useEvents.ts
  - apps/web/src/hooks/useChallenges.ts
---

# Events and Challenges Experience

## Summary

Events and challenges share a similar discovery and detail pattern: public list routes, protected creation/edit routes, and detail pages that mix current-state hook/query usage with route-local orchestration. Those routes are now also gated by public runtime config, so disabled features disappear from navigation and resolve to `NotFound`.

## Route Model

### Events

- `/events`
- `/events/new`
- `/events/:id`
- `/events/:id/edit`

### Challenges

- `/challenges`
- `/challenges/new`
- `/challenges/:id`
- `/challenges/:id/edit`

List and detail routes are public. Create and edit flows are protected.

When the matching repo-tracked runtime setting is disabled:

- header and mobile navigation links are hidden
- route entries render the shared `NotFound` page instead of loading the feature surface

## List Behavior

- event lists support `upcoming`, `past`, and `my` modes
- challenge lists support general discovery and `my` participation mode
- list surfaces use React Query hook wrappers (`useInfiniteEvents`, `useInfiniteChallenges`)

## Detail Behavior

Both detail routes still rely on route-local view-model hooks that call `api.fetch()` directly.

### Event detail

- `info` and `results` tabs
- register/cancel participation
- submit or edit result metadata
- link or unlink one workout to the participant record
- delete event when the current user is the organizer

### Challenge detail

- `info`, `leaderboard`, and optional team-oriented views
- join/leave
- update progress manually
- delete challenge when the current user is the creator

## Current Constraints

- list pages use React Query, but both detail pages still keep custom local fetch state instead of reusing the hook-level detail queries
- event results and challenge leaderboard fetch on tab activation, so inactive tabs do not stay warm in cache
- challenge teams exist in the data model, but the UI emphasis is still on individual join and leaderboard flows

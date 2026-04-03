---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/profile/[id]/index.tsx
  - apps/web/src/pages/profile/[id]/followers/index.tsx
  - apps/web/src/pages/profile/[id]/following/index.tsx
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/components/profile/ProfileHeader.tsx
  - apps/web/src/components/profile/ProfileTabs.tsx
  - apps/web/src/pages/onboarding/index.tsx
  - apps/web/src/hooks/useMessages.ts
---

# Social and Profile Experience

## Summary

The profile surface is split between a protected self-profile route and a public route path for other users that still applies a page-local auth gate. It combines follow state, profile editing, direct-message entry, and tabbed content browsing.

The shipped header is now a flat identity surface rather than a cover-image hero. Profiles should prioritize avatar, name, bio, actions, and counts without inventing decorative fallback cover media.

## Route Model

- `/profile` is the authenticated current-user profile.
- `/profile/:id` lives in the public route tree, but the page currently redirects anonymous users to `/login` before loading another user's profile.
- `/profile/:id/followers` and `/profile/:id/following` expose follow lists.
- `/settings/profile` is the dedicated edit form for profile metadata.

The public-profile route redirects back to `/profile` when the requested user id matches the current session.

## Current Interaction Model

### Follow lifecycle

- public accounts can be followed immediately
- private accounts switch into a pending-follow state
- unfollow is destructive and updates follower counts optimistically in the page state

### Messaging entry

- the public profile header can open or create a direct conversation
- DM bootstrap currently happens by POSTing to `/conversations` with the target participant id

### Tab model

The other-user profile page currently owns three tab families with page-local fetching:

- `posts`
- `workouts`
- `crews`

Each tab fetches its own list when activated instead of using a shared route-level query layer.

### Onboarding inputs

The first-visit onboarding flow is intentionally lighter than the full profile editor:

- `name` is required
- `bio` is optional and maps to the one-line intro
- `region` and `subRegion` are optional
- PB fields are optional for `5K`, `10K`, `HM`, and `FM`
- `isPrivate` is chosen explicitly in the final onboarding step
- the flow can be skipped after login if the user wants to reach the feed first

The dedicated profile edit form can later revise the same region, PB, and privacy fields without sending the user back through onboarding.

## Current Data Ownership

- auth and current-user bootstrap still live in `AuthProvider`
- `/profile/:id` owns follow state, tab state, and tab fetches locally
- reusable visual structure is split into `ProfileHeader` and `ProfileTabs`
- followers/following list pages are separate routes rather than modal overlays

## Current Constraints

- the profile surface still uses page-local `api.fetch()` calls instead of a dedicated hook/query layer
- private-account visibility is enforced by API response shape, so the route needs defensive handling for partial profile data
- self-profile and other-user profile do not yet share one unified view-model
- background-image editing still exists in the dedicated settings form, but the public profile header no longer treats that field as required presentation chrome
- onboarding no longer treats running level or main distance as canonical profile fields
- `/profile/:id` still lags behind the public social route posture used by feed, posts, and crews; treat that as an explicit alignment follow-up instead of silent UX truth

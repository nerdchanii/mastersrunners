---
doc_state: current
owner: frontend
last_verified: 2026-04-01
sources:
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/profile/[id]/index.tsx
  - apps/web/src/pages/profile/[id]/followers/index.tsx
  - apps/web/src/pages/profile/[id]/following/index.tsx
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/components/profile/ProfileHeader.tsx
  - apps/web/src/components/profile/ProfileTabs.tsx
  - apps/web/src/hooks/useMessages.ts
---

# Social and Profile Experience

## Summary

The profile surface is split between a protected self-profile route and a protected public-profile route for other users. It combines follow state, profile editing, direct-message entry, and tabbed content browsing.

The shipped header is now a flat identity surface rather than a cover-image hero. Profiles should prioritize avatar, name, bio, actions, and counts without inventing decorative fallback cover media.

## Route Model

- `/profile` is the authenticated current-user profile.
- `/profile/:id` is the authenticated public profile for another user.
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

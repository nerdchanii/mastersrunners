---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - design/frontend/ux-principles.md
  - design/frontend/app-shell-routing.md
  - design/frontend/crew-experience.md
  - design/frontend/social-profile.md
  - design/frontend/workout-experience.md
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/pages/posts/[id]/index.tsx
  - apps/web/src/pages/crews/index.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
---

# Social Surface Patterns

## Summary

This document defines current UX patterns for public social routes and their auth boundaries. Use it when implementing or reviewing user-facing social surfaces.

## Pattern: Public Feed

- `/feed` is the first-touch route for both guests and signed-in users
- guest feed should remain one main reading column, not a split discovery-marketing shell
- public posts in the guest feed should read like real community activity
- guest feed should not use labels that frame the content as sample, demo, or preview-only

## Pattern: Public Post Detail

- `/posts/:id` should stay directly readable when the post itself is public
- post detail should preserve images, attached workouts, comments, and actions in one document-like reading flow
- guest users may read the page without login
- guest attempts to like, comment, or open a protected workout detail should open an in-place auth dialog and keep the current post URL

## Pattern: Public Crew Discovery

- `/crews` should default to public exploration for logged-out visitors
- guest users can scan public crews without being redirected to `/login`
- switching into clearly member-scoped areas should trigger an auth dialog rather than a surprise route change

## Pattern: Public Crew Detail

- `/crews/:id` remains readable when the crew is public
- basic crew identity, public posts, and public activity summaries should be readable before login
- join, invite-entry completion, and protected activity/chat entry should open an auth dialog in place

## Pattern: Public Profile Detail

- `/profile/:id` belongs to the public route tree
- if the profile remains auth-gated today, that should be treated as an explicit temporary constraint rather than silent default behavior
- future work should align public profile reads with the same explore-first posture used by feed, posts, and crews

## Pattern: Auth Prompts

- auth dialogs should appear at the moment of consequence
- titles should name the blocked action, not market the service
- auth prompts should preserve the current route as `next`
- closing the dialog should leave the user exactly where they were

## Pattern: Back Navigation

- if a user opened a dialog from a public route, Back should first unwind that overlay state before leaving the underlying route
- public browsing should never trap the user in `/login?next=...` unless the target route itself is protected
- when the target route is protected, `next` must preserve the intended destination exactly

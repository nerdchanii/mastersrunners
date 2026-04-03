---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - apps/web/src/pages/crews/index.tsx
  - apps/web/src/pages/crews/new/index.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/settings/index.tsx
  - apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx
  - apps/web/src/pages/crews/[id]/activities/[activityId]/chat.tsx
  - apps/web/src/pages/crews/[id]/activities/[activityId]/qr-check-in.tsx
  - apps/web/src/pages/messages/index.tsx
  - apps/web/src/components/crew/CrewActivityList.tsx
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/components/crew/CrewIdentityHero.tsx
  - apps/web/src/components/crew/CrewMemberList.tsx
  - apps/web/src/components/crew/GroupChat.tsx
  - apps/web/src/hooks/useCrewActivities.ts
  - apps/web/src/hooks/useCrews.ts
  - apps/web/src/hooks/useMessages.ts
  - apps/web/src/hooks/useGroupChat.ts
---

# Crew Experience

## Summary

Crew UX combines discovery, membership management, discussion, activity scheduling, attendance, and chat. The detail route is the operational hub, but the page now uses a clearer primary/secondary hierarchy so members can scan it without being overwhelmed by tabs.

## Route Model

- `/crews` lists crews
- `/crews/new` creates a crew
- `/crews/:id` shows the crew hub
- `/crews/:id/settings` configures the crew
- `/crews/:id/activities/:activityId` shows an activity detail page
- `/crews/:id/activities/:activityId/edit` edits an activity
- `/crews/:id/activities/:activityId/chat` opens activity chat
- `/crews/:id/activities/:activityId/qr-check-in` handles QR attendance

Anonymous entry stays public-first:

- `/crews` defaults to `크루 찾기` for logged-out visitors instead of opening `내 크루`
- choosing `내 크루` while logged out opens an auth prompt dialog instead of an immediate redirect
- `/crews/:id` remains readable without login for public discovery
- logged-out crew reads should include the public exploration payloads the page mounts by default:
  - region filters
  - explore results
  - public crew boards/posts
  - activity summaries
- join, invite-entry, and activity-entry actions now open an auth prompt dialog and preserve the current crew path as the post-login return target
- member-only chat data should not be queried until the viewer is actually an active member
- public crew surfaces should not rely on extra explainer copy to justify their visibility; the readable data and gated actions should communicate the boundary by themselves

## Crew Hub Composition

The crew detail page now assembles a layered workspace instead of a flat tab bar:

- a hero area that treats crew profile image and cover image as separate roles, without reusing one slot as the other's fallback
- three primary tabs only: 활동, 채팅, 게시판
- a secondary member panel that keeps the roster visible without competing with the primary content
- separate operator panels for attendance stats, tags, and pending members
- invite entrants who land on `/crews/:id?invite=1` still see the lightweight shared-invite explainer above the hero until they join or their request becomes pending
- unauthenticated invite entrants keep the same invite URL as the post-login return target through the auth prompt dialog

Membership state now determines the primary affordances instead of the entire page structure:

- non-members can request or join
- active members can use the chat tab
- owners/admins see invite, moderation, stats, and settings actions
- admin/operator tools are visually separated from member-facing surfaces so scanning the page does not feel like opening a control panel first

Primary tab order is fixed to support fast scanning:

1. 활동
2. 채팅
3. 게시판

### Settings Shell

- `/crews/:id/settings` now uses the same profile/cover framing as the detail hero so the crew identity feels consistent across read and edit modes.
- the routine edit form stays in the left/main column, while member management, pending approvals, and bans move into separate operational cards.
- operators can edit profile-image URL and cover-image URL directly from the same settings form, with live previews for each slot.
- simple text inputs still rely on placeholders and supporting copy where that reduces noise without hiding intent.
- destructive owner actions remain visually separated from the routine edit form.
- owner/admin surfaces expose a dedicated invite-link share action in both the crew hub and settings so operators do not have to copy crew URLs manually.
- the current invite URL contract is `/crews/:id?invite=1`; when an unauthenticated user opens it, the login flow should preserve that destination and return the user to the same invite entry after authentication.

## Activity Model in the UI

Crew activities are split from the main crew hub into route-specific detail and utility pages:

- detail page
- edit page
- QR check-in page
- activity chat page

The activity detail route was slimmed down in `I-0007`, but it still orchestrates several member and attendance behaviors around a route-local view model.

Current attendance entry points are intentionally split:

- RSVP members use the QR check-in route for their own check-in
- owners/admins, plus popup hosts with manage permission, can still perform manual/operator check-in actions
- the activity detail page should not expose self manual check-in to ordinary members

## Chat and Realtime

- direct crew chat and activity chat are built on the group-chat hooks
- direct messages use SSE, but crew and activity chat still rely on the group-chat polling model
- crew chat and activity chat now use route-owned labels and copy instead of generic room names
- the main `/messages` hub now keeps crew and activity chat rooms visible with explicit room identity:
  - crew rooms render as `크루명`
  - activity rooms render as `크루명 / 활동명`
- selecting a crew or activity room from the message hub routes the user back into the matching crew or activity chat surface instead of pretending every room is a DM thread
- raw `crewId`, `activityId`, or fallback conversation ids should not surface in crew-facing chat headers or empty states
- activity chat route access is intentionally aligned with the activity detail CTA:
  - `RSVP`
  - `CHECKED_IN`
  - crew admins/owners
  - popup hosts with manage permission
- users outside those access rules see an explanatory state and a return action instead of an editable chat composer

## Current Constraints

- `/crews/:id` still performs direct page-level fetches instead of a dedicated hook/query owner
- crew hub scope is still broad, but the page is now split into a primary three-tab surface plus secondary operational zones
- membership approval, tag management, and activity operations are implemented, but their state is not yet normalized through one shared crew query layer
- group chat still polls every 10 seconds, so scroll behavior must protect users who are reading older messages during refreshes

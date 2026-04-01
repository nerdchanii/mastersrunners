---
doc_state: current
owner: frontend
last_verified: 2026-04-01
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
  - apps/web/src/components/crew/CrewMemberList.tsx
  - apps/web/src/components/crew/GroupChat.tsx
  - apps/web/src/hooks/useCrewActivities.ts
  - apps/web/src/hooks/useCrews.ts
  - apps/web/src/hooks/useMessages.ts
  - apps/web/src/hooks/useGroupChat.ts
---

# Crew Experience

## Summary

Crew UX combines discovery, membership management, discussion, activity scheduling, attendance, and chat. The detail route is the operational hub and still owns part of its fetch/mutation orchestration locally.

## Route Model

- `/crews` lists crews
- `/crews/new` creates a crew
- `/crews/:id` shows the crew hub
- `/crews/:id/settings` configures the crew
- `/crews/:id/activities/:activityId` shows an activity detail page
- `/crews/:id/activities/:activityId/edit` edits an activity
- `/crews/:id/activities/:activityId/chat` opens activity chat
- `/crews/:id/activities/:activityId/qr-check-in` handles QR attendance

## Crew Hub Composition

The crew detail page currently assembles:

- crew header and membership actions
- member and pending-member management
- tag management
- board/posts surfaces
- attendance stats
- activity list and creation entry point
- crew chat

Membership state determines which tabs and controls are visible:

- non-members can request or join
- active members can view internal tabs
- owners/admins see moderation, settings, and attendance-management controls

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
- crew hub scope is broad and spans social, admin, and activity flows in one route tree
- membership approval, tag management, and activity operations are implemented, but their state is not yet normalized through one shared crew query layer
- group chat still polls every 10 seconds, so scroll behavior must protect users who are reading older messages during refreshes

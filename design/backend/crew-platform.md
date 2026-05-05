---
doc_state: current
owner: backend
last_verified: 2026-03-12
sources:
  - apps/api/src/crews/crews.controller.ts
  - apps/api/src/crews/crews.service.ts
  - apps/api/src/crews/internal/crew-membership.service.ts
  - apps/api/src/crews/internal/crew-activities.service.ts
  - apps/api/src/crews/internal/crew-tags.service.ts
  - apps/api/src/crews/internal/crew-read.service.ts
  - apps/api/src/crew-boards/crew-boards.service.ts
  - apps/api/src/conversations/repositories/conversations.repository.ts
---

# Crew Platform

## Summary

The crew backend is a thin orchestration facade over membership, tags, activities, and read-model services, with adjacent board and conversation setup handled through explicit collaborators.

## Public API Boundaries

- `CrewsController`
  - crew lifecycle
  - join/leave and moderation
  - tag management
  - activity CRUD, RSVP, and check-in flows
- `CrewBoardsController`
  - board and post surfaces owned by the crew-board module

## Internal Service Boundaries

- `CrewMembershipService`
  - join, approve, reject, leave, kick, and role changes
- `CrewTagsService`
  - crew tag CRUD and member-tag assignments
- `CrewActivitiesService`
  - official/pop-up activity lifecycle, RSVP, check-in, and completion status
  - enforces that ordinary members use QR/self-service attendance while operator-style manual check-in stays behind crew management permissions
- `CrewReadService`
  - crew detail reads, activity read models, and aggregated lookups
- `CrewsService`
  - public facade that wires those boundaries together and owns high-level orchestration only

## Adjacent Dependencies

- `CrewBoardsService`
  - default board bootstrap during crew creation
- `ConversationsRepository`
  - crew group conversation bootstrap and participant wiring
- repositories under `apps/api/src/crews/repositories`
  - persistence boundaries for crew, member, tag, ban, and activity records

## Current Constraints

- `CrewsService` is now a facade, but the module still exports a broad surface from one controller.
- Board, chat, and crew activity flows remain in the same API process rather than separate bounded services.

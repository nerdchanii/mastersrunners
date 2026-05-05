---
doc_state: current
owner: backend
last_verified: 2026-04-01
sources:
  - apps/api/src/events/events.controller.ts
  - apps/api/src/events/events.service.ts
  - apps/api/src/events/repositories/event.repository.ts
  - apps/api/src/events/repositories/event-registration.repository.ts
  - apps/api/src/challenges/challenges.controller.ts
  - apps/api/src/challenges/challenges.service.ts
  - apps/api/src/challenges/challenge-aggregation.service.ts
  - apps/api/src/challenges/repositories/challenge.repository.ts
  - apps/api/src/challenges/repositories/challenge-participant.repository.ts
  - apps/api/src/challenges/repositories/challenge-team.repository.ts
---

# Events and Challenges

## Summary

Events and challenges are separate feature modules with their own controllers and repositories, but both now sit behind runtime feature gates and expose user participation, ranking/progress, and workout-linked outcomes only when enabled.

## Events Boundary

- `EventsController`
  - create, list, update, and soft-delete events
  - register/cancel participation
  - submit or fetch race results
  - link and unlink workouts to event participation
- event persistence is split between:
  - `EventRepository` for event records
  - `EventRegistrationRepository` for participant/result records

## Challenges Boundary

- `ChallengesController`
  - create, list, update, and remove challenges
  - join/leave participation
  - update progress
  - view individual and team leaderboards
  - create, join, leave, and delete challenge teams
- challenge persistence is split between:
  - `ChallengeRepository`
  - `ChallengeParticipantRepository`
  - `ChallengeTeamRepository`
- `ChallengeAggregationService`
  - computes leaderboard and progress aggregation behavior

## Shared Behavioral Themes

- controllers enforce pagination and simple transport coercion
- services enforce creator/participant permissions
- repositories own the relational query shapes
- workout-linked progression is explicit rather than inferred by a background worker

## Current Constraints

- Events and challenges still live as peer feature modules rather than a shared participation platform.
- Controller access is guarded by repo-tracked runtime config, so disabled features return `404` instead of partial empty states.
- Challenge progress and event result linking are app-level service behaviors, not decoupled asynchronous workflows.

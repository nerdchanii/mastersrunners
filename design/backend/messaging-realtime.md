---
doc_state: current
owner: backend
last_verified: 2026-04-28
sources:
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/realtime/realtime.gateway.ts
  - apps/api/src/realtime/realtime-events.service.ts
  - apps/api/src/notifications/notifications.controller.ts
  - apps/api/src/common/filters/http-exception.filter.ts
  - apps/api/src/conversations/repositories/conversations.repository.ts
  - apps/api/src/crews/internal/crew-read.service.ts
  - apps/api/src/crews/internal/crew-activities.service.ts
  - apps/api/src/block/repositories/block.repository.ts
---

# Messaging and Realtime

## Summary

Messaging is implemented as an authenticated conversations module with cursor pagination, soft-delete semantics, and one `/realtime` WebSocket fan-out path for conversation messages plus unread/read updates.

## Public API Boundaries

- `POST /conversations`
  - start or find a direct conversation with another user
- `GET /conversations`
  - list the caller's DM, crew, and activity conversations with unread counts plus room-identity context
- `GET /conversations/:id`
  - fetch one conversation plus paginated messages
- `POST /conversations/:id/messages`
  - send a message as a participant
- `PATCH /conversations/:id/read`
  - advance the caller's last-read marker
- `DELETE /conversations/:id/leave`
  - mark a direct-message cut-line for the caller without removing the participant
- `DELETE /conversations/messages/:id`
  - soft-delete the caller's own message
- WebSocket namespace `/realtime`
  - cookie-authenticated realtime channel for chat, notification, and unread/read events

## Module Responsibilities

- `ConversationsController`
  - HTTP transport and pagination bounds
- `RealtimeGateway`
  - cookie-authenticated WebSocket connection, room subscription, chat send/read commands, notification read commands, and realtime fan-out
- `ConversationsService`
  - participant authorization, block checks, and write orchestration
- `ConversationsRepository`
  - durable conversation, participant, and message persistence, plus room-identity context hydration for crew/activity rooms
- `RealtimeEventsService`
  - shared process-local event emitter used by API services and the gateway

## Realtime Boundary

- Chat delivery is WebSocket-based for `DIRECT`, `CREW`, and `ACTIVITY` conversations.
- The gateway authenticates from the same cookie session used by HTTP requests.
- Each socket joins a per-user room on connect and can also join per-conversation rooms through `chat:subscribe`.
- Message creation persists first, then realtime emits `chat:message` to the conversation room plus participant user rooms.
- Chat read updates emit `chat:unread:update` to the caller's user room after `lastReadAt` advances.
- Notification creation emits `notification:new`; notification read changes emit `notification:unread:update`.

## Participant State

- `ConversationParticipant` now carries `lastReadAt`, `leftAt`, and `joinedAt`.
- `leftAt` is only meaningful for `DIRECT` conversations.
- `DELETE /conversations/:id/leave` updates the caller's `leftAt` instead of deleting the participant row.

## DM Leave Semantics

- A left DM disappears from `/conversations` until a message newer than `leftAt` exists.
- When a DM reappears, `/conversations/:id` only returns messages newer than `leftAt`.
- Unread counts for DM are computed from `max(lastReadAt, leftAt)`.
- Direct-entry to a DM with no message newer than `leftAt` is rejected so the web client can return to `/messages`.

## Current Constraints

- The main `/conversations` API now returns mixed room types, but only direct-message routes use the dedicated `/messages/:id` detail screen today.
- Presence, typing indicators, and reconnect replay are not first-class realtime features in the current implementation.
- Realtime socket delivery is process-local; multi-instance fan-out would need extra infrastructure beyond the repo.

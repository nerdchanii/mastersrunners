---
doc_state: current
owner: backend
last_verified: 2026-04-21
sources:
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/conversations/conversations.gateway.ts
  - apps/api/src/conversations/conversations-sse.service.ts
  - apps/api/src/notifications/notifications.controller.ts
  - apps/api/src/notifications/notifications-sse.service.ts
  - apps/api/src/common/filters/http-exception.filter.ts
  - apps/api/src/conversations/repositories/conversations.repository.ts
  - apps/api/src/crews/internal/crew-read.service.ts
  - apps/api/src/crews/internal/crew-activities.service.ts
  - apps/api/src/auth/guards/jwt-sse.guard.ts
  - apps/api/src/block/repositories/block.repository.ts
---

# Messaging and Realtime

## Summary

Messaging is implemented as an authenticated conversations module with cursor pagination, soft-delete semantics, and WebSocket fan-out for conversation messages, while notification delivery keeps a separate SSE channel.

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
- WebSocket namespace `/conversations`
  - cookie-authenticated chat realtime channel
- `GET /conversations/sse`
  - legacy SSE endpoint retained while notification-style SSE infrastructure remains in the repo

## Module Responsibilities

- `ConversationsController`
  - HTTP transport, pagination bounds, and legacy SSE entrypoint
- `ConversationsGateway`
  - cookie-authenticated WebSocket connection, room subscription, and message fan-out
- `ConversationsService`
  - participant authorization, block checks, and write orchestration
- `ConversationsRepository`
  - durable conversation, participant, and message persistence, plus room-identity context hydration for crew/activity rooms
- `ConversationsSseService`
  - in-process connection registry and message fan-out

## Realtime Boundary

- Chat delivery is WebSocket-based for `DIRECT`, `CREW`, and `ACTIVITY` conversations.
- The gateway authenticates from the same cookie session used by HTTP requests.
- Each socket joins a per-user room on connect and can also join per-conversation rooms through `chat:subscribe`.
- Message creation persists first, then the gateway emits `chat:message` to the conversation room plus participant user rooms.
- Notification delivery remains SSE-based and still uses the existing `JwtSseGuard` boundary.

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
- Chat WebSocket and notification SSE delivery are both process-local; multi-instance fan-out would need extra infrastructure beyond the repo.

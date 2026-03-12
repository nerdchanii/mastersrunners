---
doc_state: current
owner: backend
last_verified: 2026-03-12
sources:
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/conversations/conversations-sse.service.ts
  - apps/api/src/conversations/repositories/conversations.repository.ts
  - apps/api/src/auth/guards/jwt-sse.guard.ts
  - apps/api/src/block/repositories/block.repository.ts
---

# Messaging and Realtime

## Summary

Direct messaging is implemented as an authenticated conversations module with cursor pagination, soft-delete semantics, and SSE fan-out for new messages.

## Public API Boundaries

- `POST /conversations`
  - start or find a direct conversation with another user
- `GET /conversations`
  - list the caller's conversations with unread counts
- `GET /conversations/:id`
  - fetch one conversation plus paginated messages
- `POST /conversations/:id/messages`
  - send a message as a participant
- `PATCH /conversations/:id/read`
  - advance the caller's last-read marker
- `DELETE /conversations/messages/:id`
  - soft-delete the caller's own message
- `GET /conversations/sse`
  - realtime message stream authenticated by `JwtSseGuard`

## Module Responsibilities

- `ConversationsController`
  - transport, pagination bounds, and SSE entrypoint
- `ConversationsService`
  - participant authorization, block checks, and write orchestration
- `ConversationsRepository`
  - durable conversation, participant, and message persistence
- `ConversationsSseService`
  - in-process connection registry and message fan-out

## Realtime Boundary

- Realtime delivery is SSE, not WebSocket.
- SSE endpoints are public at the route layer but protected by query-token auth through `JwtSseGuard`.
- Message creation persists first, then fan-out happens as a non-blocking side effect.

## Current Constraints

- The current repo only models direct conversations in the user-facing API.
- Presence, typing indicators, and reconnect replay are not first-class realtime features in the current implementation.
- Realtime delivery is process-local; multi-instance fan-out would need extra infrastructure beyond the repo.

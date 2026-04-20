---
doc_state: current
owner: architecture
last_verified: 2026-04-01
sources:
  - apps/api/src/uploads/uploads.module.ts
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/uploads/storage/storage-adapter.interface.ts
  - apps/api/src/auth/guards/jwt-sse.guard.ts
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/conversations/conversations.gateway.ts
  - apps/api/src/conversations/conversations-sse.service.ts
  - apps/api/src/notifications/notifications.controller.ts
  - apps/api/src/notifications/notifications-sse.service.ts
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/lib/chat-realtime-context.tsx
  - apps/web/src/pages/messages/[id]/index.tsx
  - apps/web/src/hooks/useGroupChat.ts
---

# Storage and Realtime Data Flow

## Storage Flow

The upload boundary is inside `UploadsModule`.

- `UploadsModule` selects a `StorageAdapter` implementation at startup.
- Disk storage is the default in development or when R2 credentials are missing.
- R2 storage is used when the environment is configured for it.
- `UploadsService` owns file-key generation, signed upload/download URLs, deletion, and public URL derivation.

When a FIT or GPX file is ingested:

1. The API downloads the raw file through the selected storage adapter.
2. The parser extracts workout metrics and GPS data.
3. `UploadsService` writes `Workout`, `WorkoutFile`, route, and lap records in one Prisma transaction.
4. Large GPS tracks are downsampled before route persistence.

## Realtime Flow

Two realtime channels exist today:

- conversation updates through the WebSocket namespace `/conversations`
- notification updates through `/notifications/sse`

The chat gateway authenticates from the browser cookie session, joins one user room per socket, and lets open chat screens join conversation rooms with `chat:subscribe`.

Typed events:

- conversations: `chat:message`
- notifications: `notification`

## Client Consumption

- `ChatRealtimeProvider` opens one shared WebSocket connection for chat routes and shell-level unread/list updates.
- direct, crew, and activity chat screens subscribe their active conversation room over that shared socket.
- `Header` keeps only the notification SSE connection.

## Current Constraints

- Realtime delivery is process-local in memory. There is no shared pub/sub or Redis fan-out in the current repo implementation.
- Chat WebSocket auth and notification SSE auth both use the same access-token cookie as normal API requests.
- Shared chat ownership now sits in one app-level provider instead of being split across page and layout components.

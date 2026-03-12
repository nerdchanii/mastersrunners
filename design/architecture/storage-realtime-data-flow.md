---
doc_state: current
owner: architecture
last_verified: 2026-03-12
sources:
  - apps/api/src/uploads/uploads.module.ts
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/uploads/storage/storage-adapter.interface.ts
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/conversations/conversations-sse.service.ts
  - apps/api/src/notifications/notifications.controller.ts
  - apps/api/src/notifications/notifications-sse.service.ts
  - apps/web/src/components/layout/Header.tsx
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

- direct and group conversation updates through `/conversations/sse`
- notification updates through `/notifications/sse`

Both SSE services keep one in-memory `Subject` per user connection and emit typed events:

- conversations: `new-message`
- notifications: `notification`

At the server boundary, conversation SSE exists as one endpoint for conversation events. In the current service implementation, message fan-out is still written for "the other participant" rather than a true group-broadcast path, so it accurately fits direct-message delivery and not a full group-chat SSE model.

## Client Consumption

- `Header` opens SSE connections for unread DM and notification updates.
- the direct-message detail page opens its own conversation SSE stream.
- group chat pages do not use SSE today; they poll via React Query every 10 seconds.

## Current Constraints

- Realtime delivery is process-local in memory. There is no shared pub/sub or Redis fan-out in the current repo implementation.
- SSE auth uses `?token=` rather than the normal `Authorization` header because `EventSource` cannot set custom headers directly.
- Realtime ownership is split across page and layout components, and the desktop shell plus direct-message detail can subscribe to the same DM SSE stream at the same time.

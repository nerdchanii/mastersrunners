# ADR-0005: Use WebSocket for chat delivery and keep SSE for notifications

## Status

Superseded by ADR-0006

## Date

2026-04-21

## Context

The messaging stack now serves three chat surfaces through one conversations model:

- direct message detail
- crew chat
- activity chat

The repository also maintains shell-level unread updates and a separate in-app notification stream.

The earlier realtime ADR (`ADR-0004`) described an SSE-first chat model that matched the repository at that time. The current implementation has moved chat delivery onto a cookie-authenticated Socket.IO gateway and keeps SSE only for notifications. Without a superseding ADR, task files and design docs can disagree about which transport is the current truth.

## Decision

Use a shared WebSocket transport for chat delivery and keep SSE for notification delivery.

Current behavior:

- the API exposes the Socket.IO namespace `/conversations` on path `/api/v1/socket.io`
- the browser opens one shared chat socket in `ChatRealtimeProvider`
- direct, crew, and activity chat screens subscribe conversation rooms over that shared socket
- chat list and unread state reuse the same socket-backed event stream
- notification updates continue to use `/notifications/sse`

## Alternatives Considered

- Keep SSE as the current chat transport
  - Rejected because the implemented repository now uses `ConversationsGateway` plus `socket.io-client` for chat delivery.
- Move notifications to WebSocket in the same batch
  - Rejected because the current implementation and operational assumptions still use the existing notification SSE path.
- Poll all chat surfaces
  - Rejected because the current repo already has socket fan-out and shared unread/list updates built around push delivery.

## Consequences

- Agents should treat WebSocket as the current source-of-truth transport for `DIRECT`, `CREW`, and `ACTIVITY` chat delivery.
- Agents should treat notification SSE as a separate current transport, not as evidence that chat still uses SSE.
- `ADR-0004` remains historical context only.
- Multi-instance fan-out is still unresolved because both chat WebSocket and notification SSE stay process-local in the current repo runtime.
- Any future move to Redis-backed fan-out or notification WebSocket delivery should supersede this ADR with a new decision record.

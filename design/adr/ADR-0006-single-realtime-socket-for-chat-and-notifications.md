# ADR-0006: Use one realtime socket for chat and notifications

## Status

Accepted

## Date

2026-04-28

## Context

The repository had converged on Socket.IO for DM, crew, and activity chat delivery, but notification delivery and some unread/read state still used SSE or polling. That split kept multiple long-lived browser connections open and made unread badge ownership inconsistent across chat and notification surfaces.

## Decision

Use one cookie-authenticated Socket.IO namespace, `/realtime`, for chat, notification, and unread/read updates.

Current behavior:

- the API exposes Socket.IO namespace `/realtime` on path `/api/v1/socket.io`
- the browser opens one shared socket in `RealtimeProvider`
- direct, crew, and activity chat screens subscribe conversation rooms over that shared socket
- chat sends and read acknowledgements use `chat:*` events
- notification creation and read acknowledgements use `notification:*` events
- REST unread endpoints remain for initial snapshot and compatibility, not polling

## Alternatives Considered

- Keep `/conversations` and add notification events there
  - Rejected because the namespace name would no longer describe the shared transport.
- Add a second `/notifications` socket
  - Rejected because the goal is one browser realtime connection.
- Keep notification SSE
  - Rejected because it preserves the split transport and long-lived connection overhead.

## Consequences

- Agents should treat `/realtime` as the current source-of-truth realtime transport.
- SSE endpoints are no longer active deployment proof surfaces.
- Multi-instance fan-out is still unresolved because realtime delivery remains process-local in the current repo runtime.

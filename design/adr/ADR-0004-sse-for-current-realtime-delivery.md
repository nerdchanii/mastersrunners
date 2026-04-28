# ADR-0004: Use SSE for the current realtime delivery path

## Status

Superseded

## Date

2026-03-12

## Context

The current product has realtime needs for:

- unread direct-message updates
- notification delivery
- direct-message detail refresh

The implemented repository already uses Server-Sent Events for these paths, while some other flows still poll. The harness needs an explicit decision so agents do not assume WebSocket or Redis pub/sub are the current in-repo default.

## Decision

Use Server-Sent Events as the current realtime delivery transport for direct-message and notification updates.

Current behavior:

- layout and message-detail surfaces subscribe with `EventSource`
- the API exposes SSE endpoints and sends typed events
- group-chat style flows that are not yet on SSE may continue using polling until a later decision supersedes this one

## Alternatives Considered

- WebSocket as the default realtime transport
  - Rejected because the implemented repository does not use a WebSocket stack today.
- Polling for all realtime-like updates
  - Rejected because DM and notification flows already rely on push-style delivery.
- Redis pub/sub as the immediate baseline
  - Rejected because horizontal fan-out infrastructure is not the current in-repo runtime path.

## Consequences

- This ADR is historical only.
- Chat delivery no longer uses SSE as the current source-of-truth transport.
- Notification delivery moved from SSE to the shared `/realtime` socket in `ADR-0006`.

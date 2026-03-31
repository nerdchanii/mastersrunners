---
id: I-0009-030
title: Stabilize DM and notification SSE streams under the shared API runtime
parent: I-0009-crew-messaging-ux
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - frontend-reviewer
po_review: required
depends_on:
  - I-0009-010
  - I-0009-020
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations-sse.service.spec.ts src/notifications/notifications-sse.service.spec.ts src/notifications/notifications.service.spec.ts
  - pnpm --filter @masters/api build
  - pnpm exec prettier --check apps/api/src/conversations/conversations.controller.ts apps/api/src/conversations/conversations-sse.service.ts apps/api/src/conversations/conversations-sse.service.spec.ts apps/api/src/notifications/notifications.controller.ts apps/api/src/notifications/notifications-sse.service.ts apps/api/src/notifications/notifications-sse.service.spec.ts apps/api/src/common/filters/http-exception.filter.ts design/backend/messaging-realtime.md tasks/active/I-0009-030-api-sse-stream-stability.md
artifacts:
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations-sse.service.ts
  - apps/api/src/conversations/conversations-sse.service.spec.ts
  - apps/api/src/notifications/notifications.controller.ts
  - apps/api/src/notifications/notifications-sse.service.ts
  - apps/api/src/notifications/notifications-sse.service.spec.ts
  - apps/api/src/common/filters/http-exception.filter.ts
  - design/backend/messaging-realtime.md
---

## Goal

Stop DM and notification SSE connections from failing with `Cannot set headers after they are sent to the client` in the shared API runtime.

## Done Criteria

- opening or reconnecting DM and notification SSE streams no longer emits the observed header-sent runtime error
- shared API error handling does not attempt to write a JSON error response after an SSE stream has already started
- SSE behavior is covered by targeted regression verification so reconnects and concurrent listeners stay stable

## Notes

- The current dev host shows repeated browser console errors for both DM and notification `EventSource` listeners.
- DM detail subscribes to `/conversations/sse` and the desktop shell opens both `/conversations/sse` and `/notifications/sse`.
- The likely fault line is the shared API boundary around SSE responses, not just one feature module, because both endpoints surface the same runtime error text.

## Self Review

- Scope and intent: limited to SSE connection lifecycle and shared API error handling; no frontend route or transport redesign was mixed in.
- Source of truth: the fix lives in the API SSE services/controllers and the matching backend realtime design doc.
- Design divergence: none intended; the current SSE transport stays in place and is being stabilized rather than replaced.
- Verification: targeted SSE specs, API build, and targeted Prettier checks passed locally; deployed dev verification is still pending until the updated API is redeployed.
- Review routing: `backend-reviewer` and `frontend-reviewer` remain appropriate because the bug appears in the browser but the first fix pass is in the shared API runtime.

## Review Focus

- Specialist reviewer should check:
  - the fix preserves the current SSE transport contract while removing the stream-breaking runtime error
- PO reviewer should check:
  - messaging and notification realtime updates feel stable again instead of repeatedly erroring in the browser

## Handoff

- If the fix requires special handling for SSE in shared filters or interceptors, document that rule explicitly so later API changes do not reintroduce the same failure mode.

## Design Divergence

- Current design treats SSE as the active realtime transport, but the dev runtime is currently surfacing stream-breaking errors for both DM and notification listeners.

## Attempt Log

- 2026-04-01: created after observing repeated `Cannot set headers after they are sent to the client` errors from both DM and notification `EventSource` subscriptions on `https://dev.mastersrunners.com`.
- 2026-04-01: initial code inspection showed the shared API runtime applies one global exception filter and request interceptor to all HTTP requests, including SSE endpoints, so the failure likely crosses module boundaries rather than living in one frontend listener alone.
- 2026-04-01: moved to `tasks/active/` and narrowed the first fix pass to explicit SSE connection cleanup, heartbeat keepalive, multi-connection notification support, and headers-sent-safe exception handling.
- 2026-04-01: local verification passed with targeted conversations/notifications SSE specs, API build, and formatting checks; the remaining proof step is redeploying the API and observing the dev browser console/runtime logs.

## Review Notes

- Specialist review:
- PO review:

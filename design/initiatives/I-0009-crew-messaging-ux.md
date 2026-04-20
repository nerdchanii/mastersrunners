# I-0009: Crew Messaging UX

## Summary

Polish the awkward parts of crew chat, activity chat, direct messages, and unread badge behavior so the messaging experience feels contextual, stable, and regression-tested in the browser.

## Problem

The current messaging surfaces mostly work, but several flows still feel unnatural: crew and activity chat render generic room identity, activity chat route access can diverge from its CTA gating, group chat polling can yank scroll position, and unread badges are computed separately across desktop and mobile shells. Existing Playwright coverage mostly checks presence, not quality.

## Goals

- make crew and activity chat feel contextual instead of generic
- align activity chat route access with the activity-detail CTA rules
- prevent chat send failures and unread updates from producing confusing UX
- raise browser regression coverage from visibility checks to behavior-quality checks

## Non-Goals

- adding presence, typing, or delivery-receipt features on top of the transport change
- redesigning unrelated feed, challenge, or workout surfaces
- changing backend chat or notification contracts in this batch

## Scope

- `apps/web/src/components/crew/GroupChat.tsx`
- `apps/web/src/pages/crews/[id]/index.tsx`
- `apps/web/src/pages/crews/[id]/activities/[activityId]/chat.tsx`
- `apps/web/src/pages/messages/[id]/index.tsx`
- `apps/web/src/pages/messages/[id]/useMessageDetailPage.ts`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/common/BottomNav.tsx`
- `apps/web/src/hooks/useMessages.ts`
- `apps/web/src/hooks/useUnreadCounts.ts`
- `apps/api/src/conversations/conversations-sse.service.ts`
- `apps/web/e2e/crew-group-chat.spec.ts`
- `apps/web/e2e/messages.spec.ts`
- `design/frontend/crew-experience.md`
- `design/backend/messaging-realtime.md`

## Design References

- `design/frontend/crew-experience.md`
- `design/frontend/client-data-state.md`
- `design/frontend/conventions.md`

## Review Plan

- `frontend-reviewer` checks route composition, shared state ownership, and UI behavior
- `backend-reviewer` checks DM SSE delivery reliability stays inside the existing transport contract
- `ui-ux-reviewer` checks chat identity, copy, empty states, and interaction smoothness
- `po-reviewer` checks the resulting messaging flow feels natural for community use

## Task Breakdown

- `tasks/archive/I-0009-010-web-crew-messaging-ux-polish.md`
- `tasks/archive/I-0009-020-web-messaging-e2e-mock-fixtures.md`
- `tasks/archive/I-0009-030-api-sse-stream-stability.md`
- `tasks/todo/I-0009-040-api-web-chat-websocket-transport.md`

## Success Criteria

- crew and activity chat show human-readable room identity and helpful fallback copy
- activity chat route and entry CTA use the same access rules
- message send and unread behavior no longer create silent failures or contradictory badges
- Playwright covers contextual labels, gating, failure states, and badge synchronization

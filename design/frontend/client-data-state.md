---
doc_state: current
owner: frontend
last_verified: 2026-04-22
sources:
  - apps/web/src/lib/api-client.ts
  - apps/web/src/lib/auth-context.tsx
  - apps/web/src/lib/chat-realtime-context.tsx
  - apps/web/src/lib/theme-context.tsx
  - apps/web/src/hooks/useNotifications.ts
  - apps/web/src/hooks/useMessages.ts
  - apps/web/src/hooks/useUnreadCounts.ts
  - apps/web/src/hooks/useEvents.ts
  - apps/web/src/hooks/useChallenges.ts
  - apps/web/src/pages/events/[id]/index.tsx
  - apps/web/src/pages/challenges/[id]/index.tsx
  - apps/web/src/pages/messages/[id]/index.tsx
  - apps/web/src/pages/messages/[id]/useMessageDetailPage.ts
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/components/common/BottomNav.tsx
  - apps/web/src/components/social/CommentList.tsx
---

# Client Data and State

## Summary

The frontend is in a hybrid state: React Query is the preferred server-state layer, but auth, theme, realtime wiring, and several detail pages still use local component or context state directly.

## Current State Layers

### HTTP boundary

- `ApiClient` is the single fetch wrapper for API calls.
- It owns the API base URL, bearer token attachment, refresh-token retry, and logout redirect behavior.

### Session state

- `AuthProvider` is the current-user/session owner.
- It bootstraps with `/auth/me`.
- It is currently implemented outside React Query today.

### Theme state

- `ThemeProvider` owns `light | dark | system` state and DOM class application.
- Theme state is local UI state, not server state.

### Server state standard

The current preferred pattern is:

- key factory
- `useQuery` / `useInfiniteQuery`
- `useMutation`
- `invalidateQueries` on mutation success

Representative examples are `useNotifications`, `useMessages`, `useEvents`, `useChallenges`, `useCrews`, and `useWorkouts`.

## Current Exceptions

Notable current exceptions still bypass the hook-first pattern with direct `api.fetch()` calls in pages or components:

- `pages/events/[id]/index.tsx`
- `pages/challenges/[id]/index.tsx`
- `pages/messages/[id]/index.tsx`
- `pages/profile/index.tsx`
- `pages/settings/profile/index.tsx`
- `components/social/CommentList.tsx`

Realtime state is also distributed:

- `ChatRealtimeProvider` owns one shared chat WebSocket and patches conversation/unread React Query state from `chat:message`
- direct, crew, and activity chat screens subscribe their current room over that shared socket
- `Header` owns only the notification SSE subscription

## Current Constraints

- The repo does not yet enforce a zero direct-fetch rule in route components.
- The exception list above is illustrative, not exhaustive.
- Desktop and mobile shells now consume one shared unread-count source, but realtime ownership is still split between app-level socket context and layout-level notification SSE.
- Chat and notification delivery still use different transports and both remain process-local.

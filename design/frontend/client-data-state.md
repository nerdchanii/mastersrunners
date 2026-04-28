---
doc_state: current
owner: frontend
last_verified: 2026-04-28
sources:
  - apps/web/src/lib/api-client.ts
  - apps/web/src/lib/auth-context.tsx
  - apps/web/src/lib/realtime-context.tsx
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

Realtime state is centralized:

- `RealtimeProvider` owns one shared WebSocket and patches conversation, notification, and unread React Query state from `/realtime` events
- the same provider revalidates unread snapshots on socket reconnect so shell badges recover after temporary disconnects without reintroducing polling
- direct, crew, and activity chat screens subscribe their current room over that shared socket
- `Header` consumes shared unread state and does not open its own realtime connection

## Current Constraints

- The repo does not yet enforce a zero direct-fetch rule in route components.
- The exception list above is illustrative, not exhaustive.
- Desktop and mobile shells consume one shared unread-count source backed by the app-level realtime socket.
- Chat and notification delivery share one transport and remain process-local.

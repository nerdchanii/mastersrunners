---
doc_state: current
owner: frontend
last_verified: 2026-03-21
sources:
  - apps/web/src/lib/api-client.ts
  - apps/web/src/lib/auth-context.tsx
  - apps/web/src/lib/theme-context.tsx
  - apps/web/src/hooks/useNotifications.ts
  - apps/web/src/hooks/useMessages.ts
  - apps/web/src/hooks/useUnreadCounts.ts
  - apps/web/src/hooks/useGroupChat.ts
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

The frontend is in a hybrid state: React Query is the preferred server-state layer, but auth, theme, SSE, and several detail pages still use local component or context state directly.

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

- `Header` owns DM and notification SSE subscriptions, but unread badge rendering now reads from shared React Query-backed hooks
- direct-message detail owns its own SSE stream
- desktop shell and direct-message detail can subscribe to the same DM SSE endpoint at the same time
- group chat uses polling rather than SSE

## Current Constraints

- The repo does not yet enforce a zero direct-fetch rule in route components.
- The exception list above is illustrative, not exhaustive.
- Desktop and mobile shells now consume one shared unread-count source, but SSE ownership is still split between shell and direct-message detail.
- Group chat polling and direct-message SSE use different freshness models.

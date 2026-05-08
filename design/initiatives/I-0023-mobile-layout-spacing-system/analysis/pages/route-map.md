# Route Map

## Router Definition

- App boot mounts `RouterProvider` from `apps/web/src/main.tsx`, with the router created by `createAppRouter(queryClient)` in [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:243).
- Routes are defined in a single `createBrowserRouter([...])` tree in [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:243).

## Layout Wrappers

- `RootLayout` is the top-level route element and only renders `<Outlet />`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:128)
- `RootRouteErrorElement` is the top-level `errorElement`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:144)
- `AuthLayout` wraps `/login` only. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:233)
- `MainLayout` wraps all main public and protected app routes. It always renders `Header`, `BottomNav`, and a `main` region containing `Suspense` -> `RouteQueryRecoveryBoundary` -> `<Outlet />`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:189)
- `ProtectedRoute` is a route-level auth gate that either renders `LoadingPage`, redirects to `/login`, or passes through to `<Outlet />`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:111)
- `FeatureRoute` wraps challenge/event routes where feature flags apply. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:287)

## MainLayout Route Classes

- Chat routes: `/messages...` get `h-svh` sizing and no main padding. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:191)
- Viewport-locked route: `/crews/new` gets a full-height locked shell. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:192)
- Crew hub surface routes matching `isCrewHubSurfacePath(...)` get `px-0 py-0 pb-20 md:pb-0`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:193)
- Profile surface routes (`/profile`, `/profile/:id`) get `px-0 py-0 pb-20 md:pb-6`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:197)
- Other non-chat, non-locked main routes get `px-4 py-4 pb-20 md:py-6 md:pb-6`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:212)

## Route Tree

```text
/
`- RootLayout
   |- / -> Navigate(/feed)
   |- AuthLayout
   |  `- /login -> LoginPage
   |- /auth/callback -> AuthCallbackPage
   `- MainLayout
      |- /feed -> FeedPage
      |- /crews -> CrewsPage
      |- /crews/:id -> CrewDetailPage
      |  |- (index) -> CrewHomePanel
      |  |- activities -> CrewActivitiesPanel
      |  |- board -> CrewBoardPanel
      |  |- board/:boardId/posts/:postId -> CrewBoardPanel
      |  |- members -> CrewMembersPanel
      |  `- ProtectedRoute
      |     |- activities/new -> CrewActivityCreatePanel
      |     |- board/new -> CrewBoardCreatePanel
      |     |- manage -> CrewManagePanel
      |     `- pending -> CrewPendingMembersPanel
      |- /challenges -> FeatureRoute(ChallengesPage)
      |- /challenges/:id -> FeatureRoute(ChallengeDetailPage)
      |- /events -> FeatureRoute(EventsPage)
      |- /events/:id -> loader + FeatureRoute(EventDetailPage)
      |- /posts/:id -> PostDetailPage
      |- /profile/:id -> UserProfilePage
      |- /search -> SearchPage
      |- ProtectedRoute
      |  |- /workouts -> WorkoutsPage
      |  |- /workouts/new -> NewWorkoutPage
      |  |- /workouts/:id -> WorkoutDetailPage
      |  |- /workouts/:id/edit -> EditWorkoutPage
      |  |- /challenges/:id/edit -> FeatureRoute(EditChallengePage)
      |  |- /events/:id/edit -> FeatureRoute(EditEventPage)
      |  |- /posts/new -> PostNewPage
      |  |- /posts/:id/edit -> EditPostPage
      |  |- /profile -> ProfilePage
      |  |- /profile/:id/connections -> ProfileConnectionsPage
      |  |- /profile/:id/followers -> FollowersPage
      |  |- /profile/:id/following -> FollowingPage
      |  |- /settings/profile -> EditProfilePage
      |  |- /crews/new -> CrewNewPage
      |  |- /crews/:id/settings -> CrewSettingsPage
      |  |- /crews/:id/activities/:activityId/qr-check-in -> QrCheckInPage
      |  |- /crews/:id/activities/:activityId/edit -> CrewActivityEditPage
      |  |- /crews/:id/activities/:activityId -> CrewActivityDetailPage
      |  |- /challenges/new -> FeatureRoute(ChallengeNewPage)
      |  |- /events/new -> FeatureRoute(EventNewPage)
      |  |- /messages -> MessagesShell
      |  |  |- (index) -> MessagesPage
      |  |  |- crew/:crewId -> CrewMessagePage
      |  |  |- crew/:crewId/activity/:activityId -> ActivityMessagePage
      |  |  `- :id -> MessageDetailPage
      |  |- /notifications -> NotificationsPage
      |  |- /feedback -> FeedbackPage
      |  `- /onboarding -> OnboardingPage
      `- * -> NotFoundPage
```

## Key Pages

### `/feed`

- Wrapper stack: `RootLayout` -> `MainLayout` -> `FeedPage`.
- Route entry: [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:265)
- Entry component file: [apps/web/src/pages/feed/index.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/feed/index.tsx:1)

### `/profile`

- Wrapper stack: `RootLayout` -> `MainLayout` -> `ProtectedRoute` -> `ProfilePage`.
- `MainLayout` also treats `/profile` as a profile surface route with the profile-specific main padding class branch. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:197)
- Route entry: [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:350)
- Entry component file: [apps/web/src/pages/profile/index.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/profile/index.tsx:24)

### `/posts/:postId`

- Implemented route path is `/posts/:id`, not `/posts/:postId`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:320)
- Wrapper stack: `RootLayout` -> `MainLayout` -> `PostDetailPage`.
- Entry component file: [apps/web/src/pages/posts/[id]/index.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/posts/[id]/index.tsx:16)
- The page reads `params.id` from `useParams()`. [apps/web/src/pages/posts/[id]/index.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/posts/[id]/index.tsx:17)

### `/workouts/:workoutId`

- Implemented route path is `/workouts/:id`, not `/workouts/:workoutId`. [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:330)
- Wrapper stack: `RootLayout` -> `MainLayout` -> `ProtectedRoute` -> `WorkoutDetailPage`.
- Entry component file: [apps/web/src/pages/workouts/detail/index.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/workouts/detail/index.tsx:76)
- The page reads `id` as `workoutId` from `useParams<{ id: string }>()`. [apps/web/src/pages/workouts/detail/index.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/workouts/detail/index.tsx:77)

### `/crews`

- Wrapper stack: `RootLayout` -> `MainLayout` -> `CrewsPage`.
- Route entry: [apps/web/src/router.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/router.tsx:266)
- Entry component file: [apps/web/src/pages/crews/index.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/crews/index.tsx:21)

## Crew Detail Subtree Reference

- Parent route `/crews/:id` mounts [apps/web/src/pages/crews/[id]/index.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/crews/[id]/index.tsx:36).
- Nested hub panels are exported from [apps/web/src/pages/crews/[id]/CrewHubPanels.tsx](/Users/gim-yechan/project/mastersrunners/apps/web/src/pages/crews/[id]/CrewHubPanels.tsx:37).
- Crew hub route/tab matching logic lives in [apps/web/src/components/crew/crew-hub-routes.ts](/Users/gim-yechan/project/mastersrunners/apps/web/src/components/crew/crew-hub-routes.ts:11).

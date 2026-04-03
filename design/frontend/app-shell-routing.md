---
doc_state: current
owner: frontend
last_verified: 2026-04-03
sources:
  - apps/web/src/main.tsx
  - apps/web/src/router.tsx
  - apps/web/src/pages/intro/index.tsx
  - apps/web/src/pages/onboarding/index.tsx
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/components/common/BottomNav.tsx
  - apps/web/src/components/common/LoadingPage.tsx
  - apps/web/src/components/common/ErrorBoundary.tsx
---

# App Shell and Routing

## Summary

The web app is a Vite SPA that composes one router tree, one main shell, and a protected-route wrapper.

## Entry Composition

`apps/web/src/main.tsx` mounts:

- `QueryClientProvider`
- `RouterProvider`
- global `Toaster`

The router tree in `apps/web/src/router.tsx` defines three shell layers:

- `RootLayout`: `ThemeProvider -> AuthProvider -> Outlet`
- `AuthLayout`: login-only shell
- `MainLayout`: `Header`, centered `<main>`, `BottomNav`, `Suspense`, `ErrorBoundary`

## Route Model

Public routes include:

- `/` public intro route
- `/login` login-only shell
- `/feed`
- `/crews`, `/crews/:id`
- `/events`, `/events/:id`
- `/challenges`, `/challenges/:id`
- `/posts/:id`
- `/profile/:id`
- `/search`

Protected routes include:

- `/workouts/*`
- `/posts/new`
- `/profile`
- `/settings/profile`
- `/messages/*`
- `/notifications`
- `/feedback`
- crew activity edit/chat/check-in routes

The authenticated `/` path now redirects to `/feed`. The root intro route is intentionally shell-less so the first impression can stay focused on community messaging instead of the authenticated app chrome.

Most route modules are lazy loaded with `lazy(() => import(...))`.

## Route Guarding

- `ProtectedRoute` reads `useAuth()`
- while auth is bootstrapping, it renders `LoadingPage`
- unauthenticated access redirects to `/login`
- some protected pages still keep page-local auth/bootstrap logic on top of `ProtectedRoute`, including `/profile` and `/settings/profile`
- `/profile/:id` and its follower/following subroutes live in the public route tree but still apply a page-local auth gate that redirects anonymous users to `/login`

## Current Constraints

- Route path and file path are not always 1:1. For example, `/workouts/:id` resolves to `pages/workouts/detail/index.tsx`.
- Some large route files still mix orchestration and view logic; `I-0007` is the readability follow-up for that.
- Authenticated shell entry points now include a dedicated feedback handoff in the desktop header and mobile bottom-shell layer so users can file bugs without leaving the product.
- Search is a first-class shell entry:
  - desktop header exposes a direct `/search` link
  - mobile bottom navigation keeps `/search` visible without requiring route knowledge
  - the search page mirrors user queries into the URL so re-entry and back-navigation preserve context
- The first-visit route is community-first:
  - `/` shows a public intro page for anonymous users
  - `/login` remains the auth handoff
  - onboarding can be skipped once the user is ready to reach the feed
- Authenticated mobile navigation now owns the create entry directly:
  - the detached post-only FAB is removed
  - the center create trigger opens a bottom-sheet chooser for `/posts/new` or `/workouts/new`
  - both creation routes expose a lightweight switch so users can correct the chosen flow without backing out to the shell
- Composer routes keep their own local shell rails above mobile navigation:
  - `/posts/new` uses a top progress bar without step labels and a sticky bottom action rail
  - `/posts/new` photo selection is gallery-first within browser limits:
    - the photo step should foreground opening the device photo picker instead of a generic upload prompt
    - selected media should land in a 3-column grid and stay visible in later composer steps
  - `/posts/new` text authoring should use one primary textarea for body, hashtags, and lightweight mentions:
    - hashtags are parsed from the same text input instead of a second field
    - lightweight mentions can be previewed without autocomplete-backed tagging in the first pass
  - `/workouts/new` keeps cancel/save actions in the same bottom rail zone instead of leaving them at the end of the scroll

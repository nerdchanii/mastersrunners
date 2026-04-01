---
doc_state: current
owner: frontend
last_verified: 2026-03-12
sources:
  - apps/web/src/main.tsx
  - apps/web/src/router.tsx
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

Most route modules are lazy loaded with `lazy(() => import(...))`.

## Route Guarding

- `ProtectedRoute` reads `useAuth()`
- while auth is bootstrapping, it renders `LoadingPage`
- unauthenticated access redirects to `/login`
- some protected pages still keep page-local auth/bootstrap logic on top of `ProtectedRoute`, including `/profile` and `/settings/profile`

## Current Constraints

- Route path and file path are not always 1:1. For example, `/workouts/:id` resolves to `pages/workouts/detail/index.tsx`.
- Some large route files still mix orchestration and view logic; `I-0007` is the readability follow-up for that.
- Authenticated shell entry points now include a dedicated feedback handoff in the desktop header and mobile bottom-shell layer so users can file bugs without leaving the product.
- Search is a first-class shell entry:
  - desktop header exposes a direct `/search` link
  - mobile bottom navigation keeps `/search` visible without requiring route knowledge
  - the search page mirrors user queries into the URL so re-entry and back-navigation preserve context
- Authenticated mobile navigation now owns the create entry directly:
  - the detached post-only FAB is removed
  - the center create trigger opens a bottom-sheet chooser for `/posts/new` or `/workouts/new`
  - both creation routes expose a lightweight switch so users can correct the chosen flow without backing out to the shell

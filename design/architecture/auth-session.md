---
doc_state: current
owner: architecture
last_verified: 2026-04-01
sources:
  - apps/api/src/config/feature-flags.ts
  - apps/api/src/config/public-config.controller.ts
  - apps/api/src/auth/auth.controller.ts
  - apps/api/src/auth/auth.service.ts
  - apps/api/src/auth/auth.module.ts
  - apps/api/src/auth/strategies/jwt.strategy.ts
  - apps/api/src/auth/guards/jwt-sse.guard.ts
  - packages/database/prisma/schema.prisma
  - packages/types/src/next-auth.d.ts
  - apps/web/src/lib/api-client.ts
  - apps/web/src/lib/auth-context.tsx
  - apps/web/src/router.tsx
  - apps/web/src/pages/login/index.tsx
  - apps/web/src/pages/auth/callback/index.tsx
---

# Auth and Session Architecture

## Summary

The current auth model is OAuth login at the API boundary plus JWT token storage in the SPA.

## Login Flow

1. The web app calls `/config/public` to discover public feature flags and enabled OAuth providers.
2. Login buttons redirect the browser to `/auth/{provider}` on the API.
3. Passport strategies complete the provider flow and return an OAuth profile to `AuthService`.
4. `AuthService` upserts or links the user/account and mints an access token plus refresh token.
5. The API redirects the browser back to `/auth/callback` on the frontend with both tokens in the query string.
6. The SPA stores tokens in `localStorage` and routes the user into the app.

## Session Model

- Access and refresh tokens are JWTs signed by Nest `JwtModule`.
- The SPA stores both tokens in `localStorage` through `ApiClient`.
- `ApiClient.fetch()` attaches the access token to API requests.
- On `401`, the client tries `/auth/refresh` once before clearing tokens and redirecting to `/login`.
- `AuthProvider` treats `/auth/me` as the canonical current-user bootstrap request.
- Public route and navigation gating rely on the runtime config returned from `/config/public`, which is derived from the repo-tracked config module plus provider credential availability.

## Authorization Boundary

- `JwtAuthGuard` is applied globally through `APP_GUARD` in `AppModule`.
- Controllers or handlers opt out with `@Public()`.
- `ProtectedRoute` in the SPA is the route-level UX gate, not the source of backend authorization truth.
- SSE endpoints use `JwtSseGuard`, which reads the token from the `?token=` query parameter and attaches the same `{ userId, email }` shape used by JWT requests.

## Current Constraints

- The system does not use server-side sessions or HTTP-only auth cookies today.
- Access and refresh tokens flow through browser storage, and callback delivery currently uses query parameters.
- `dev-login` exists only for `development` and `test`.
- OAuth and public feature availability are repo-tracked in code, while actual provider availability still depends on runtime credentials and callback URLs.
- Realtime auth is parallel to request auth, not unified through a shared transport/session abstraction.
- Prisma still contains `Session` and `VerificationToken` models, and `packages/types` still contains NextAuth type residue. Those are repository leftovers, not the active runtime session path.

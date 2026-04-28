---
doc_state: current
owner: architecture
last_verified: 2026-04-28
sources:
  - apps/api/src/config/feature-flags.ts
  - apps/api/src/config/public-config.controller.ts
  - apps/api/src/auth/auth.controller.ts
  - apps/api/src/auth/auth-cookie.util.ts
  - apps/api/src/auth/auth.service.ts
  - apps/api/src/auth/auth.module.ts
  - apps/api/src/auth/strategies/jwt.strategy.ts
  - packages/database/prisma/schema.prisma
  - packages/types/src/next-auth.d.ts
  - apps/web/src/lib/api-client.ts
  - apps/web/src/lib/auth-context.tsx
  - apps/web/src/lib/realtime-context.tsx
  - apps/web/src/router.tsx
  - apps/web/src/pages/login/index.tsx
  - apps/web/src/pages/auth/callback/index.tsx
  - apps/api/src/realtime/realtime.gateway.ts
---

# Auth and Session Architecture

## Summary

The current auth model is OAuth login at the API boundary plus JWT-backed browser sessions carried in `HttpOnly` cookies.

## Login Flow

1. The web app calls `/config/public` to discover public feature flags and enabled OAuth providers.
2. Login buttons redirect the browser to `/auth/{provider}` on the API.
3. Passport strategies complete the provider flow and return an OAuth profile to `AuthService`.
4. `AuthService` upserts or links the user/account and mints an access token plus refresh token.
5. The API writes both JWTs into host-only `HttpOnly` cookies scoped to `/api/v1`.
6. The API redirects the browser back to `/auth/callback` on the frontend without exposing tokens in the URL.
7. The SPA bootstraps the session by calling `/auth/me` and routes the user into the app.

## Session Model

- Access and refresh tokens are JWTs signed by Nest `JwtModule`.
- The API stores them in `mr_access_token` and `mr_refresh_token` cookies with `HttpOnly`, `SameSite=Lax`, `Path=/api/v1`, and `Secure` derived from `FRONTEND_URL`.
- `ApiClient.fetch()` always sends browser credentials and never reads or writes auth tokens in `localStorage`.
- On `401`, the client tries `/auth/refresh` once using the refresh cookie before calling `/auth/logout`, clearing local auth state, and redirecting to `/login`.
- `AuthProvider` treats `/auth/me` as the canonical current-user bootstrap request.
- `/auth/callback` is a loading/bootstrap route, not a token-parsing route.
- Public route and navigation gating rely on the runtime config returned from `/config/public`, which is derived from the repo-tracked config module plus provider credential availability.

## Authorization Boundary

- `JwtAuthGuard` is applied globally through `APP_GUARD` in `AppModule`.
- Controllers or handlers opt out with `@Public()`.
- `ProtectedRoute` in the SPA is the route-level UX gate, not the source of backend authorization truth.
- Request auth and realtime WebSocket auth both read the access JWT from the same access-token cookie and attach the same `{ userId, email }` shape to the request.
- Browser-facing API auth no longer accepts `Authorization: Bearer` as an active session transport.

## Current Constraints

- The system remains stateless JWT auth; the cookie layer is a transport boundary, not a database-backed server session.
- Refresh is still JWT-only rotation with no persisted refresh-token store or revocation list.
- `dev-login` exists only for `development` and `test`.
- OAuth and public feature availability are repo-tracked in code, while actual provider availability still depends on runtime credentials and callback URLs.
- Realtime auth is now unified with normal request auth through the shared cookie transport, while chat and notification delivery use the same process-local WebSocket fan-out.
- Prisma still contains `Session` and `VerificationToken` models, and `packages/types` still contains NextAuth type residue. Those are repository leftovers, not the active runtime session path.

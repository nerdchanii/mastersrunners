---
doc_state: current
owner: backend
last_verified: 2026-04-01
sources:
  - apps/api/src/auth/auth.module.ts
  - apps/api/src/auth/auth.controller.ts
  - apps/api/src/auth/auth-cookie.util.ts
  - apps/api/src/auth/auth.service.ts
  - apps/api/src/config/feature-flags.ts
  - apps/api/src/config/public-config.controller.ts
  - apps/api/src/auth/strategies/jwt.strategy.ts
  - apps/api/src/auth/guards/jwt-sse.guard.ts
  - apps/api/src/common/decorators/public.decorator.ts
  - apps/api/src/notifications/notifications.controller.ts
  - apps/api/src/conversations/conversations.controller.ts
  - apps/web/src/lib/api-client.ts
  - apps/web/src/pages/auth/callback/index.tsx
---

# Backend Auth and Session

## Summary

The API owns OAuth provider handoff, user/account linking, JWT issuance, refresh, authenticated identity lookup, and public runtime feature/config disclosure.

## Provider Flow

- The API exposes `GET /config/public` for web-facing feature and auth-provider availability.
- The auth controller exposes `/auth/{provider}` and callback endpoints for Kakao and Google.
- OAuth strategies are only registered when the repo-tracked runtime config enables the provider and the required runtime credentials exist.
- `GET /auth/providers` is the auth-only projection of the same provider availability contract.
- `AuthService.upsertOAuthUser()` links by provider account first, then by email, then creates a new user/account pair.

## Token Model

- access tokens are signed with the default JWT expiry and written to `mr_access_token`
- refresh tokens are signed with `JWT_REFRESH_TTL` and written to `mr_refresh_token`
- both cookies are `HttpOnly`, `SameSite=Lax`, host-only, scoped to `/api/v1`, and `Secure` only when `FRONTEND_URL` is HTTPS
- `/auth/refresh` reads the refresh cookie, verifies the refresh JWT, and rotates both cookies without persisted refresh-token storage or revocation checks
- `POST /auth/logout` clears both auth cookies
- `/auth/me` depends on the authenticated request user injected by `JwtStrategy`
- `POST /auth/dev-login` exists as a development/test-only bypass that sets browser session cookies instead of returning token JSON

## Authorization Model

- `@Public()` marks handlers that skip the global JWT guard.
- Normal browser-facing API requests authenticate through the access-token cookie.
- SSE endpoints authenticate through `JwtSseGuard` using the same access-token cookie.
- Deleted users are rejected during cookie-token JWT validation.
- SSE auth currently verifies the token but does not re-check `deletedAt`.

## Current Constraints

- The repo still contains `Session` and `VerificationToken` models in Prisma, but the active auth path is JWT plus OAuth account linkage.
- The active browser session contract is cookie-based, but refresh remains stateless JWT rotation rather than a database-backed server session.
- Feature availability for public product surfaces is repo-tracked in code and not stored in the database.

---
id: I-0006-120
title: Remove OAuth token delivery through query strings
parent: I-0006-guardrail-hardening
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - frontend-reviewer
  - docs-reviewer
  - architecture-reviewer
po_review: required
depends_on:
  - I-0006-110
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/auth/auth.controller.spec.ts src/auth/auth.service.spec.ts src/conversations/conversations.controller.spec.ts src/notifications/notifications.controller.spec.ts
  - pnpm --filter @masters/api lint
  - pnpm --filter @masters/api build
  - pnpm --filter @masters/web exec tsc -b
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - bash scripts/check-task-review-metadata.sh
  - pnpm exec prettier --check apps/api/jest-e2e.config.ts apps/api/src/auth/auth.controller.ts apps/api/src/auth/auth-cookie.util.ts apps/api/src/auth/guards/jwt-sse.guard.ts apps/api/src/auth/jwt-ttl.ts apps/api/src/auth/strategies/jwt.strategy.ts apps/api/src/main.ts apps/api/src/auth/auth.controller.spec.ts apps/api/test/helpers/auth.helper.ts apps/api/test/auth.e2e-spec.ts apps/web/src/lib/api-client.ts apps/web/src/lib/auth-context.tsx apps/web/src/pages/auth/callback/index.tsx apps/web/src/pages/login/login-api.ts apps/web/src/components/layout/Header.tsx apps/web/src/pages/messages/[id]/useMessageDetailPage.ts apps/web/e2e/helpers/mock-auth.ts apps/web/e2e/file-upload.spec.ts design/architecture/auth-session.md design/backend/auth-session.md design/backend/messaging-realtime.md design/architecture/storage-realtime-data-flow.md docs/runbooks/deployment.md design/initiatives/I-0006-guardrail-hardening.md tasks/archive/I-0006-120-api-auth-token-transport-hardening.md
artifacts:
  - apps/api/jest-e2e.config.ts
  - apps/api/src/auth/auth.controller.ts
  - apps/api/src/auth/auth-cookie.util.ts
  - apps/api/src/auth/guards/jwt-sse.guard.ts
  - apps/api/src/auth/jwt-ttl.ts
  - apps/api/src/auth/strategies/jwt.strategy.ts
  - apps/api/src/main.ts
  - apps/api/src/auth/auth.controller.spec.ts
  - apps/api/test/helpers/auth.helper.ts
  - apps/api/test/auth.e2e-spec.ts
  - apps/web/src/pages/auth/callback/index.tsx
  - apps/web/src/lib/api-client.ts
  - apps/web/src/lib/auth-context.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/pages/messages/[id]/useMessageDetailPage.ts
  - apps/web/src/pages/login/login-api.ts
  - apps/web/e2e/helpers/mock-auth.ts
  - apps/web/e2e/file-upload.spec.ts
  - design/architecture/auth-session.md
  - design/backend/auth-session.md
  - design/backend/messaging-realtime.md
  - design/architecture/storage-realtime-data-flow.md
  - design/initiatives/I-0006-guardrail-hardening.md
  - docs/runbooks/deployment.md
---

## Goal

Eliminate OAuth token exposure through redirect query strings and browser-visible token storage by moving browser auth transport to `HttpOnly` cookies.

## Done Criteria

- OAuth success no longer redirects with access or refresh tokens in the URL
- browser access and refresh tokens are no longer stored in `localStorage`
- API request auth, refresh, logout, and SSE browser auth use the shared cookie session transport
- the replacement session transport is documented and verified end to end

## Notes

- This is a launch-blocking security follow-up discovered during `I-0006-110`.
- The selected replacement flow is stateless JWT transport in `HttpOnly` cookies rather than a one-time code exchange or database-backed server session.

## Self Review

- Scope and intent: this changes only the browser-facing auth transport and its matching tests/docs; it does not add server-side session storage or unrelated auth feature work.
- Source of truth: the active contract now lives in `apps/api/src/auth/*`, `apps/web/src/lib/api-client.ts`, and the matching architecture/backend/runbook docs updated in this task.
- Design divergence: none intended for the browser session boundary; the remaining limitation is the existing stateless refresh model without server-side revocation, which is already documented as the active design.
- Verification: targeted auth/controller regression tests, API lint/build, web typecheck/build, task metadata check, targeted Prettier, and a manual cookie-session runtime proof all passed. A focused `test:e2e` auth attempt remains blocked by a pre-existing Prisma/Jest ESM runtime issue and is recorded below instead of being hidden.
- Review routing: `backend-reviewer`, `frontend-reviewer`, `docs-reviewer`, and `architecture-reviewer` fit because the task changes the API contract, browser client behavior, SSE transport, and source-of-truth docs in one pass.

## Review Focus

- Specialist reviewer should check:
  - OAuth callback, refresh, logout, and SSE browser auth all use the same cookie transport with no query-string or `localStorage` token leakage
  - the web still bootstraps, refreshes, and redirects correctly without bearer-token fallback
- PO reviewer should check:
  - login/logout/session-expiry behavior still feels coherent to end users while removing the high-risk token exposure path

## Handoff

- Existing browser sessions should be treated as invalid after deploy because the SPA no longer reads token state from `localStorage`.

## Design Divergence

- None intended.

## Attempt Log

- 2026-03-31: follow-up created from deployment/env hardening review because current auth token transport is a separate high-risk security concern.
- 2026-04-01: switched the API auth boundary to `HttpOnly` cookies for OAuth callback, dev-login, refresh, logout, request auth, and SSE auth; removed browser `localStorage` token reads/writes and removed query-token SSE URLs.
- 2026-04-01: added targeted auth-controller coverage for callback redirect behavior and rewired auth/e2e helpers plus Playwright helpers around cookie transport.
- 2026-04-01: verification passed with `pnpm --filter @masters/api test -- --runTestsByPath src/auth/auth.controller.spec.ts src/auth/auth.service.spec.ts src/conversations/conversations.controller.spec.ts src/notifications/notifications.controller.spec.ts`, `pnpm --filter @masters/api lint`, `pnpm --filter @masters/api build`, `pnpm --filter @masters/web exec tsc -b`, `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `bash scripts/check-task-review-metadata.sh`, and the targeted Prettier check listed above.
- 2026-04-01: manual runtime proof with `NODE_ENV=test API_PORT=4100 pnpm --filter @masters/api start`, `curl -i -c /tmp/mr-auth-cookies.txt -X POST http://localhost:4100/api/v1/auth/dev-login`, and `curl -i -b /tmp/mr-auth-cookies.txt http://localhost:4100/api/v1/auth/me` confirmed `204 No Content`, both auth cookies, and a follow-up `200` session bootstrap without any token JSON response.
- 2026-04-01: `pnpm --filter @masters/api test:e2e -- --runTestsByPath test/auth.e2e-spec.ts` was attempted but remains blocked by a pre-existing Prisma/Jest ESM runtime issue around `@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs`; the browser-auth transport change itself still verified through targeted tests and manual runtime proof.

## Review Notes

- Specialist review:
  - backend/frontend/docs/architecture lens says the current repo now uses one cookie-based browser auth contract across callback, request auth, refresh, logout, and SSE, and the source-of-truth docs no longer describe the removed query-string or `localStorage` transport.
- PO review:
  - removing query-string and browser-visible token storage is worth the forced re-login because the login and session bootstrap flow remain consistent while the highest-risk leak path is removed.

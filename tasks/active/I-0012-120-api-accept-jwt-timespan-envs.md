---
id: I-0012-120
title: Accept JWT TTL environment values as numbers or timespan strings
parent: I-0012-supabase-postgres-rollout
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0012-110
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/auth/auth.service.spec.ts
  - pnpm --filter @masters/api build
  - pnpm exec prettier --check apps/api/src/auth/auth.module.ts apps/api/src/auth/auth.service.ts apps/api/src/auth/jwt-ttl.ts apps/api/src/auth/auth.service.spec.ts .env.production.example docs/runbooks/deployment.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/active/I-0012-120-api-accept-jwt-timespan-envs.md
artifacts:
  - apps/api/src/auth/auth.module.ts
  - apps/api/src/auth/auth.service.ts
  - apps/api/src/auth/jwt-ttl.ts
  - apps/api/src/auth/auth.service.spec.ts
  - .env.production.example
  - docs/runbooks/deployment.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Allow JWT TTL environment values to use either numeric seconds or jsonwebtoken-style timespan strings so OAuth callback token issuance does not fail on branch deploy lanes.

## Done Criteria

- API accepts `JWT_ACCESS_TTL` and `JWT_REFRESH_TTL` as either numeric seconds or string timespans
- auth token generation tests cover string TTL input
- env examples and deployment docs no longer imply numeric-only JWT TTL values

## Notes

- Current dev secrets use string values such as `15m` and `30d`.
- The failure surfaced first on Kakao callback because OAuth success is the first path that tries to mint app tokens in production.

## Self Review

- Scope and intent: keep the change strictly on JWT TTL parsing and the matching docs/tests.
- Source of truth: auth runtime lives in `apps/api/src/auth/*`; operator expectation lives in `.env.production.example` and `docs/runbooks/deployment.md`.
- Design divergence: none intended; the repo should accept the values operators are already using successfully elsewhere.
- Verification: targeted auth tests, API build, and prettier are required before shipping.
- Review routing: `backend-reviewer` covers token issuance behavior and `docs-reviewer` covers env contract clarity.

## Review Focus

- Specialist reviewer should check:
  - numeric and string TTL values both resolve to the intended `jsonwebtoken` semantics
- PO reviewer should check:
  - operators do not have to rediscover a numeric-only JWT TTL restriction during deploys

## Handoff

- After this ships, rerun the dev deploy and retry Kakao/Google/Naver callback flows with a fresh OAuth authorization code.

## Design Divergence

- None intended.

## Attempt Log

- 2026-03-31: Cloud Run logs showed `\"expiresIn\" should be a number of seconds or string representing a timespan` during Kakao callback because the runtime cast string TTL env values to `Number(...)` before signing tokens.

## Review Notes

- Specialist review: backend-reviewer lens says the parser now matches `jsonwebtoken` semantics by accepting both numeric seconds and human-readable timespans without changing token payload structure.
- PO review: operator experience improves because branch deploy lanes no longer fail on the more readable TTL values already being used in secrets.

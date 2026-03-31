---
id: I-0012-100
title: Use Nest body parser APIs instead of a direct express import
parent: I-0012-supabase-postgres-rollout
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0012-090
blocked_by: []
verify:
  - pnpm install --lockfile-only
  - pnpm --filter @masters/api build
  - '! rg -n ''from "express"'' apps/api/dist/main.js'
artifacts:
  - apps/api/src/main.ts
  - apps/api/package.json
  - pnpm-lock.yaml
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Remove the direct `express` runtime import from the API bootstrap and rely on Nest's Express adapter body-parser APIs instead.

## Done Criteria

- `apps/api/src/main.ts` no longer imports `express` directly
- JSON, urlencoded, and raw parser behavior is configured through `NestExpressApplication.useBodyParser()`
- the built API entrypoint no longer imports `express` directly

## Notes

- `@masters/api` already depends on `@nestjs/platform-express`; the goal here is to stop relying on a transitive package being directly importable from application code.
- The upload path still needs raw parsing for `application/octet-stream`, `image/*`, and `application/gpx+xml`.

## Self Review

- Scope and intent: keep the fix narrowly on API bootstrap parsing so the Cloud Run image stops importing `express` directly.
- Source of truth: `apps/api/src/main.ts` is the runtime source; the initiative stays linked so the deploy unblock is traceable under `I-0012`.
- Design divergence: none intended; the change moves closer to the existing Nest/Express adapter contract instead of adding a new direct dependency.
- Verification: `pnpm --filter @masters/api build` passed and `apps/api/dist/main.js` no longer contains `from "express"`.
- Review routing: `backend-reviewer` covers the parser/bootstrap behavior and `harness-reviewer` covers the deploy unblock context.

## Review Focus

- Specialist reviewer should check:
  - Nest-native parser configuration preserves the previous payload handling behavior
- PO reviewer should check:
  - the deploy unblock remains an implementation detail with no product-facing behavior change

## Handoff

- After this lands, rerun the `dev` deploy and confirm the created Cloud Run revision becomes healthy.

## Design Divergence

- None intended.

## Attempt Log

- 2026-03-31: Cloud Run revision `masters-runners-api-dev-00001-p2f` failed to start because `apps/api/dist/main.js` imported `express` directly.
- 2026-03-31: pivoted away from adding a direct `express` dependency after confirming Nest 11 exposes `useBodyParser('json' | 'urlencoded' | 'raw')` on `NestExpressApplication`.
- 2026-03-31: verified the replacement locally with `pnpm --filter @masters/api build` and a grep check proving the built entrypoint no longer imports `express`.

## Review Notes

- Specialist review: backend-reviewer lens says the parser behavior stays explicit while removing the unsafe direct dependency assumption from the production image.
- PO review: deploy unblock is implementation-only and keeps upload/API behavior unchanged from the operator point of view.

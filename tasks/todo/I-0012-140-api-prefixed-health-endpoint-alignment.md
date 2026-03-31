---
id: I-0012-140
title: Expose a prefixed API health endpoint for same-domain verification
parent: I-0012-supabase-postgres-rollout
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - docs-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0012-060
blocked_by: []
verify:
  - pnpm --filter @masters/api build
  - pnpm exec prettier --check apps/api/src/main.ts apps/api/src/health/health.controller.ts docs/runbooks/deployment.md design/architecture/deployment.md AGENTS.md scripts/verify-deployment.sh tasks/todo/I-0012-140-api-prefixed-health-endpoint-alignment.md
artifacts:
  - apps/api/src/main.ts
  - apps/api/src/health/health.controller.ts
  - docs/runbooks/deployment.md
  - design/architecture/deployment.md
  - AGENTS.md
  - scripts/verify-deployment.sh
---

## Goal

Make same-domain deploy verification hit a real API health endpoint by exposing `GET /api/v1/health` and aligning the documented contract.

## Done Criteria

- the API responds on `GET /api/v1/health`
- deploy verification and rollout docs target the prefixed health path for same-domain checks
- docs explicitly state whether legacy `GET /health` remains supported or is retired

## Notes

- `https://dev.mastersrunners.com/health` currently returns the SPA host, not the API health response.
- `https://dev.mastersrunners.com/api/v1/health` currently reaches the API lane but returns 404, while `https://dev.mastersrunners.com/api/v1/auth/providers` already proves `/api/*` routing works.
- This task intentionally changes the current repository contract, which still documents `GET /health` as the public health endpoint.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
  - the new health endpoint stays simple and does not create duplicate or conflicting health behavior
- PO reviewer should check:
  - rollout verification becomes easier without adding operator confusion about which health path is canonical

## Handoff

- If `GET /health` remains in place for backward compatibility, document the sunset or coexistence rule explicitly instead of leaving both paths implicit.

## Design Divergence

- Current deployment guidance expects `GET /health`, but the current same-domain dev host only proves API reachability consistently under `/api/*`.

## Attempt Log

- 2026-04-01: created after confirming `https://dev.mastersrunners.com/health` returns SPA HTML, `https://dev.mastersrunners.com/api/v1/health` returns API 404, and `https://dev.mastersrunners.com/api/v1/auth/providers` reaches the API successfully.

## Review Notes

- Specialist review:
- PO review:

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
  - pnpm --filter @masters/api test -- --runTestsByPath src/health/health.controller.spec.ts
  - pnpm --filter @masters/api build
  - pnpm exec prettier --check --ignore-unknown apps/api/src/health/health.controller.ts apps/api/src/health/health.controller.spec.ts apps/api/src/main.ts apps/api/src/app.module.ts apps/api/test/setup.ts docs/runbooks/deployment.md design/architecture/deployment.md AGENTS.md scripts/verify-deployment.sh tasks/archive/I-0012-140-api-prefixed-health-endpoint-alignment.md
artifacts:
  - apps/api/src/health/health.controller.ts
  - apps/api/src/health/health.controller.spec.ts
  - apps/api/src/main.ts
  - apps/api/src/app.module.ts
  - apps/api/test/setup.ts
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

- Scope and intent: keep the change on health-path exposure and deployment verification, while preserving legacy `/health` compatibility to avoid a needless hard cutover.
- Source of truth: the health controller, bootstrap prefix config, deployment verification script, and rollout docs now define the contract together.
- Design divergence: none intended; the repo is moving its canonical verification path under `/api/v1/*` while documenting the compatibility endpoint explicitly.
- Verification: targeted health controller route test, API build, and targeted Prettier checks passed locally on 2026-04-01.
- Review routing: `backend-reviewer`, `docs-reviewer`, and `harness-reviewer` all apply because the change spans API routing, deployment docs, and verification tooling.

## Review Focus

- Specialist reviewer should check:
  - the new health endpoint stays simple and does not create duplicate or conflicting health behavior
- PO reviewer should check:
  - rollout verification becomes easier without adding operator confusion about which health path is canonical

## Handoff

- Same-domain runtime checks can now use `/api/v1/health`; if `/health` is ever retired later, do that in an explicit follow-up instead of silently removing the compatibility path.

## Design Divergence

- Current deployment guidance expects `GET /health`, but the current same-domain dev host only proves API reachability consistently under `/api/*`.

## Attempt Log

- 2026-04-01: created after confirming `https://dev.mastersrunners.com/health` returns SPA HTML, `https://dev.mastersrunners.com/api/v1/health` returns API 404, and `https://dev.mastersrunners.com/api/v1/auth/providers` reaches the API successfully.
- 2026-04-01: switched the API to expose both `/health` and `/api/v1/health`, removed the duplicate app-level health controller wiring, and changed `scripts/verify-deployment.sh` to default to the prefixed path used by same-domain routing checks.

## Review Notes

- Specialist review: backend/docs/harness lenses say the health contract now has one clear controller-level source of truth, and deploy verification finally targets the same-domain API path that Cloudflare actually routes.
- PO review: operators now have one canonical health URL for rollout checks without losing older direct-origin compatibility.

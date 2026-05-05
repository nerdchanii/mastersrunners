---
id: I-0013-010
title: Add repo runtime config and prune unreleased OAuth/product surfaces
parent: I-0013-repo-runtime-config-foundation
scope: repo
owner: unassigned
reviewers:
  - backend-reviewer
  - frontend-reviewer
  - ui-ux-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0012-110
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/config/feature-flags.spec.ts src/config/runtime-env.spec.ts src/common/guards/feature-flag.guard.spec.ts src/challenges/challenges.controller.spec.ts
  - pnpm --filter @masters/api build
  - VITE_API_URL=http://localhost:4000 pnpm --filter @masters/web build
  - pnpm exec prettier --check --ignore-unknown .github/workflows/deploy.yml .env.production.example docker-compose.prod.yml scripts/bootstrap-gcp-secrets.sh apps/api/src/app.module.ts apps/api/src/auth/auth.controller.ts apps/api/src/auth/auth.module.ts apps/api/src/common/decorators/feature-gate.decorator.ts apps/api/src/config/feature-flags.ts apps/api/src/config/feature-flags.service.ts apps/api/src/config/load-env.ts apps/api/src/config/public-config.controller.ts apps/api/src/config/runtime-env.ts apps/api/src/main.ts apps/web/src/components/common/BottomNav.tsx apps/web/src/components/common/FeatureRoute.tsx apps/web/src/components/layout/Header.tsx apps/web/src/lib/public-config.ts apps/web/src/pages/login/index.tsx apps/web/src/pages/login/login-api.ts apps/web/src/router.tsx docs/runbooks/deployment.md docs/runbooks/environment-and-settings.md design/architecture/auth-session.md design/backend/auth-session.md design/backend/events-challenges.md design/frontend/events-challenges.md design/initiatives/I-0013-repo-runtime-config-foundation.md tasks/archive/I-0013-010-repo-runtime-config-and-oauth-surface-pruning.md
artifacts:
  - .github/workflows/deploy.yml
  - .env.production.example
  - docker-compose.prod.yml
  - apps/api/src/common/decorators/feature-gate.decorator.ts
  - apps/api/src/config/feature-flags.ts
  - apps/api/src/config/load-env.ts
  - apps/api/src/config/public-config.controller.ts
  - apps/web/src/lib/public-config.ts
  - apps/web/src/router.tsx
  - docs/runbooks/deployment.md
  - design/initiatives/I-0013-repo-runtime-config-foundation.md
---

## Goal

Add a repo-tracked runtime config foundation that explicitly controls OAuth provider exposure and unreleased public product surfaces, while removing Naver OAuth from the active codebase.

## Done Criteria

- API exposes a typed public runtime config for feature and auth-provider availability
- web login, navigation, and challenge/event routes all respect the same runtime feature gates
- repo-tracked runtime config becomes the source of truth for public feature defaults instead of deploy env flags
- Naver OAuth code, env contract, and dependency references are removed

## Notes

- Current launch priority is crews, social posting, and workout upload; challenges and events stay off by default in the repo-tracked runtime config.
- OAuth secrets remain env-backed, but provider exposure no longer does.
- `/auth/providers` remains as an auth-only compatibility surface, but `/config/public` becomes the web-facing source of truth.

## Self Review

- Scope and intent: keep this task on repo-tracked runtime gating, OAuth surface cleanup, and matching docs/contracts without redesigning unrelated auth/session transport.
- Source of truth: runtime contract lives in the repo-tracked API config/auth code; web route visibility must follow the same public config endpoint.
- Design divergence: none intended; the repo should move from implicit secret-driven exposure to explicit repo-owned runtime defaults.
- Verification: focused API tests, API build, web build with placeholder `VITE_API_URL`, and prettier checks are required.
- Review routing: backend, frontend/ui, and harness reviewers all have real surface area here because the change is cross-cutting.

## Review Focus

- Specialist reviewers should check:
  - disabled challenges/events resolve consistently as hidden nav plus `404` routes/API
  - auth provider availability is derived from repo-tracked defaults plus required runtime config
  - deploy lane contracts stay explicit while public feature defaults remain repo-owned
- PO reviewer should check:
  - the resulting public surface matches the intended launch order and does not accidentally expose challenges or events

## Handoff

- Opening Google later should only require changing `apps/api/src/config/feature-flags.ts` plus the matching Google callback/credentials for the target lane.
- Opening challenges or events later should only require changing the repo-tracked runtime config after product approval.

## Design Divergence

- None intended.

## Attempt Log

- 2026-04-01: added API-side public runtime config resolution, challenge/event feature gating, and OAuth provider gating so the web and API can share one explicit launch-surface contract.
- 2026-04-01: removed env-backed feature-flag assumptions and made the repo-tracked runtime config module the source of truth for public defaults.
- 2026-04-01: removed Naver OAuth from runtime code and env/deploy docs to match the current launch plan.
- 2026-04-01: addressed review findings by making feature gating a global pre-auth guard, adding `/auth/providers` compatibility fallback for web login bootstrap, and preloading repo-supported env files before import-time OAuth strategy registration.

## Review Notes

- Specialist review: backend, frontend, ui-ux, and harness review completed in-thread on 2026-04-01; initial findings around login compatibility, import-time env loading, and pre-auth feature gating were addressed before final verification.
- PO review: approved in-thread on 2026-04-01 when the requester asked to commit and push after review/verification.

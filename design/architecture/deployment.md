---
doc_state: current
owner: architecture
last_verified: 2026-04-02
sources:
  - .github/workflows/deploy.yml
  - scripts/verify-deployment.sh
  - docker-compose.prod.yml
  - package.json
  - apps/api/Dockerfile
  - apps/api/src/main.ts
  - apps/web/package.json
  - docs/runbooks/deployment.md
---

# Deployment Architecture

This document defines the intended deployment shape for the repository. Runbooks explain operations; workflows and scripts execute them.

## Production Topology

- API: NestJS container on Google Cloud Run
- Web: static Vite SPA on Cloudflare Pages
- Planned operator surface: single `ops.<lane>.mastersrunners.com` host fronted by Cloudflare Access
- Database: Supabase Postgres
- File storage: Cloudflare R2

## Execution Boundaries

- Build artifact for API: Docker image from `apps/api/Dockerfile`
- Build artifact for web: static files from `apps/web/dist`
- Web build entrypoint: root `pnpm build:web` script
- Web deploy automation: Cloudflare Pages Git integration with dashboard-managed project settings
- Deployment automation: `.github/workflows/deploy.yml`
- Local production-like runtime: `docker-compose.prod.yml`
- Post-deploy verification: `scripts/verify-deployment.sh`
- Web response-header source of truth: `apps/web/public/_headers`

## Health Contract

- Canonical deployment verification endpoint: `GET /api/v1/health`
- Legacy compatibility endpoint: `GET /health`
- Both paths are intentionally exposed so same-domain `/api/*` routing can be verified without breaking older direct-origin checks

## Response Header Contract

- Cloudflare Pages HTML and static responses use the repo-tracked `_headers` file at `apps/web/public/_headers`.
- The Pages header contract keeps Cloudflare Web Analytics on an explicit external beacon host and blocks inline HTML mutation with `Cache-Control: public, no-transform`.
- The API applies a centralized bootstrap-level response-header policy before route handling.
- API JSON surfaces use a deny-by-default CSP, while Swagger UI uses a narrower Swagger-safe CSP instead of inheriting an accidental default.
- Public app hosts should not treat Swagger as part of the same-domain contract; operator docs are intended to move behind the future ops host.
- Current HSTS posture is `max-age=31536000` only.
- `includeSubDomains` and `preload` are intentionally deferred because `mastersrunners.com` and `www.mastersrunners.com` still serve placeholder content outside the active app rollout.

## Environment Boundaries

### Production

- Runtime config is injected by the deploy workflow through env vars and secrets
- The deploy workflow selects a branch-matched GitHub environment:
  - `dev` branch -> `dev`
  - `main` branch -> `production`
- Web runtime config for Cloudflare Pages is injected through Pages environment variables such as `VITE_API_URL`
- API runtime should use the pooled Supabase `DATABASE_URL`, while Prisma CLI/operator flows should use `DIRECT_URL` when available
- Non-development web builds intentionally fail when `VITE_API_URL` is missing instead of silently falling back to localhost
- Production deploys should be immutable by commit SHA
- Redis appears in environment and compose-level deployment assumptions, but the current repo implementation does not use a shared Redis runtime for app logic or realtime fan-out
- The Pages project itself is external state, so its build command and output directory must match `docs/runbooks/deployment.md`
- Branch aliases, custom domains, and `/api/*` proxy rules for Pages are also external state and are tracked under `EX-0004`
- The future ops host, its Access policy, and any `/api-docs*` or operator-route proxy rules are external state tracked under `EX-0007`
- The deployment verify script should block automated deploys on the direct API origin only; web-host header proof remains available through the same script when operators provide `WEB_VERIFY_URL`, because the Pages host is external state tracked under `EX-0004`

### Local Production-Like

- Runtime config is read from `.env.production` via `docker compose --env-file` and `docker-compose.prod.yml`
- This path exists to validate the containerized runtime before or alongside production rollout work

### Current Rollout Phase

- The active app host is expected to be `dev.mastersrunners.com` on the `dev` branch while apex/www remain on a placeholder site.
- The public `dev.mastersrunners.com` host is expected to carry the app plus `/api/*`, but not public Swagger.
- Planned staff-only host:
  - `dev` lane -> `ops.dev.mastersrunners.com`
- 2026-04-02 external provisioning status: the dev lane now has an active `ops.dev.mastersrunners.com` custom domain, Worker routes for `/api/*` and `/api-docs*`, and a Cloudflare Access self-hosted app protecting `ops.dev.mastersrunners.com/*`.
- The API has two automated deploy lanes:
  - `dev` branch -> `masters-runners-api-dev`
  - `main` branch -> `masters-runners-api`
- The `main` branch remains the intended production branch for the eventual `mastersrunners.com` app launch.

## Rollout Model

1. Commit lands on `dev` or `main`
2. CI validates build and tests
3. Deploy workflow selects the matching GitHub environment and Cloud Run service
4. Deploy workflow validates deploy vars and additive-only migration safety
5. Deploy workflow builds and pushes the API image
6. Deploy workflow loads `DIRECT_URL` from Secret Manager
7. Deploy workflow applies additive-only automated migrations and seed data
8. Cloud Run receives the new revision
9. Verification script checks service health plus the repo-tracked header contract on the direct API surface; web-host proof remains an operator-run follow-up when the external Pages host is reachable

## Rollback Model

- Primary repository-level rollback: `git revert`
- Primary infrastructure-level rollback: switch Cloud Run traffic to the last known good revision

## Non-Goals

- This document does not replace operational runbooks
- This document does not describe developer setup or local feature development

## Related Docs

- `docs/runbooks/deployment.md`
- `docs/runbooks/rollback.md`
- `DEPLOYMENT.md`

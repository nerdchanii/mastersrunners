---
doc_state: current
owner: architecture
last_verified: 2026-03-31
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

## Health Contract

- Public health endpoint: `GET /health`
- This endpoint is intentionally excluded from the `/api/v1` global prefix
- Any deployment verification must use `/health`, not `/api/v1/health`

## Environment Boundaries

### Production

- Runtime config is injected by the deploy workflow through env vars and secrets
- Web runtime config for Cloudflare Pages is injected through Pages environment variables such as `VITE_API_URL`
- API runtime should use the pooled Supabase `DATABASE_URL`, while Prisma CLI/operator flows should use `DIRECT_URL` when available
- Non-development web builds intentionally fail when `VITE_API_URL` is missing instead of silently falling back to localhost
- Production deploys should be immutable by commit SHA
- Redis appears in environment and compose-level deployment assumptions, but the current repo implementation does not use a shared Redis runtime for app logic or realtime fan-out
- The Pages project itself is external state, so its build command and output directory must match `docs/runbooks/deployment.md`
- Branch aliases, custom domains, and `/api/*` proxy rules for Pages are also external state and are tracked under `EX-0004`

### Local Production-Like

- Runtime config is read from `.env.production` via `docker compose --env-file` and `docker-compose.prod.yml`
- This path exists to validate the containerized runtime before or alongside production rollout work

### Current Rollout Phase

- The active app host is expected to be `dev.mastersrunners.com` on the `dev` branch while apex/www remain on a placeholder site.
- The `dev` branch is the only automated API deploy branch during the current prelaunch phase.
- The `main` branch remains the intended production branch for the eventual `mastersrunners.com` app launch.

## Rollout Model

1. Commit lands on `dev`
2. CI validates build and tests
3. Deploy workflow validates deploy vars and additive-only migration safety
4. Deploy workflow builds and pushes the API image
5. Deploy workflow loads `DIRECT_URL` from Secret Manager
6. Deploy workflow applies additive-only automated migrations and seed data
7. Cloud Run receives the new revision
8. Verification script checks service health

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

# Deployment Architecture

This document defines the intended deployment shape for the repository. Runbooks explain operations; workflows and scripts execute them.

## Production Topology

- Web: static SPA deployment
- API: NestJS container on Google Cloud Run
- Database: PostgreSQL
- Cache: Redis
- File storage: Cloudflare R2

## Execution Boundaries

- Build artifact for API: Docker image from `apps/api/Dockerfile`
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
- Production deploys should be immutable by commit SHA

### Local Production-Like

- Runtime config is read from `.env.production` and `docker-compose.prod.yml`
- This path exists to validate the containerized runtime before or alongside production rollout work

## Rollout Model

1. Commit lands on `main`
2. CI validates build and tests
3. Deploy workflow builds and pushes the API image
4. Cloud Run receives the new revision
5. Verification script checks service health

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

# Deployment Runbook

This runbook explains how deployment works in this repository, what to verify before and after rollout, and which commands are the source of execution.

## Source of Execution

- CI test gate: `.github/workflows/ci.yml`
- Production deploy workflow: `.github/workflows/deploy.yml`
- Production-like local stack: `docker-compose.prod.yml`
- Post-deploy verification script: `scripts/verify-deployment.sh`
- Cloudflare Pages web build entrypoint: `package.json` -> `pnpm build:web`

## Deployment Surfaces

### Production API

- Target: Google Cloud Run
- Trigger: push to `main`
- Artifact: Docker image built from `apps/api/Dockerfile`

### Production-like Local Verification

- Target: local Docker Compose stack
- Purpose: validate runtime config, container boot, and health checks before touching production

### Web Static Hosting

- Target: Cloudflare Pages
- Trigger: Git-connected preview and production deployments
- Build artifact: `apps/web/dist`
- Build contract source of truth: this runbook plus the root `build:web` script

## Pre-Deploy Checklist

- CI is green on the commit being deployed.
- Required secrets exist for the deploy workflow.
- Database migrations required by the release are already prepared.
- Health endpoint contract is still `GET /health`.
- Runbook and workflow still describe the same deployment path.

## Environment Contract

### Cloud Run

- Deployment workflow injects:
  - `NODE_ENV=production`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_ACCESS_TTL`
  - `JWT_REFRESH_TTL`
  - R2 credentials and bucket/public URL values

### Local Docker Compose

- Copy `.env.production.example` to `.env.production`
- Populate production-like values before running the stack
- `docker-compose.prod.yml` also expects runtime values such as:
  - `FRONTEND_URL`
  - OAuth provider credentials
  - storage config

### Cloudflare Pages

- Set the Pages build command to `pnpm build:web`
- Set the Pages build output directory to `apps/web/dist`

## Local Production-Like Verification

### 1. Prepare environment

```bash
cp .env.production.example .env.production
```

### 2. Start the stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Verify API health

```bash
pnpm deploy:verify -- http://localhost:4000
```

### 4. Check logs

```bash
docker compose -f docker-compose.prod.yml logs -f api
```

### 5. Stop the stack

```bash
docker compose -f docker-compose.prod.yml down
```

## Production Deploy Flow

1. Merge or push the release commit to `main`.
2. GitHub Actions builds and pushes the API image.
3. GitHub Actions deploys that image to Cloud Run.
4. GitHub Actions runs `scripts/verify-deployment.sh` against the deployed service URL.

## Cloudflare Pages Build Contract

### Confirmed Contract

The confirmed Pages contract for this repository is:

- Build command: `pnpm build:web`
- Build output directory: `apps/web/dist`

### Failure Signature

- If Pages runs `npx next build` and fails with `Couldn't find any pages or app directory`, the project is still using a stale Next.js-era build command from an older frontend setup.
- That failure is configuration drift in the Pages dashboard, not a current repo-local Vite build failure.

### Observed Context

- Cloudflare cloned the repository successfully from the repo root.
- Cloudflare detected `pnpm@10.28.2` and `nodejs@22.16.0`.
- Cloudflare completed dependency installation before the stale user build command ran.

### Recommendations

- Keep the project configured so workspace installs continue to resolve the root `pnpm-workspace.yaml` and shared packages.
- If you change install or root-directory settings later, verify that `@masters/types` still resolves during the Pages build.
- After the build is restored, set `VITE_API_URL` for preview and production environments; the local fallback in `apps/web/src/lib/api-client.ts` is only safe for local development.

### Recovery Steps

1. Open the Cloudflare Pages project build settings.
2. Replace the stale build command with `pnpm build:web`.
3. Confirm the output directory is `apps/web/dist`.
4. Re-run the failed preview deployment or push a no-op commit after the settings change.

## Post-Deploy Checks

- Health check succeeds:

```bash
pnpm deploy:verify -- https://<service-url>
```

- Swagger UI is reachable at `/api-docs`
- Critical env-backed features boot correctly:
  - auth provider availability
  - database connectivity
  - storage adapter selection

## Migrations

Run migrations only with the intended production database URL.

```bash
export DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>
pnpm db:migrate
```

## Failure Handling

- If deployment health verification fails, stop rollout and inspect workflow logs first.
- If the new revision is unhealthy but the previous revision was healthy, follow `docs/runbooks/rollback.md`.
- If the issue is config-only, correct secrets/env vars before re-running deploy.
- If the issue is code-related, revert the change and let the deploy workflow ship the rollback commit.

## References

- `design/architecture/deployment.md`
- `docs/runbooks/rollback.md`
- `.github/workflows/deploy.yml`
- `docker-compose.prod.yml`
- `package.json`
- `apps/web/package.json`

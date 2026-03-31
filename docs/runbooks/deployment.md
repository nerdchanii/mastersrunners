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
  - `FRONTEND_URL`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_ACCESS_TTL`
  - `JWT_REFRESH_TTL`
  - R2 credentials and bucket/public URL values
- Optional runtime values:
  - `API_PUBLIC_URL`
  - `KAKAO_CALLBACK_URL`
  - `GOOGLE_CALLBACK_URL`
  - `NAVER_CALLBACK_URL`
- `FRONTEND_URL` is required for production boot because the API uses it for CORS and OAuth redirect targets.
- If a social provider is enabled with `<PROVIDER>_CLIENT_ID`, the matching `<PROVIDER>_CALLBACK_URL` must also be present.
- The deploy workflow only validates repo-managed variables. OAuth provider client IDs and secrets still live in external Cloud Run or Secret Manager state, so API boot-time validation remains the final guard against stale provider callback config.

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
- Treat Pages environment variables as public build-time config.
- Required Pages variable for every non-local deployment:
  - `VITE_API_URL`
- Never store OAuth secrets, JWT secrets, database credentials, or R2 secrets in Pages env.

### Current Host Matrix

- Current pre-launch app host:
  - `dev` branch -> `dev.mastersrunners.com`
- Deferred launch host:
  - `main` branch -> `mastersrunners.com`
- Current placeholder hosts:
  - `mastersrunners.com`
  - `www.mastersrunners.com`
- Same-domain API routing is an external Cloudflare dashboard responsibility. For the current phase, only `dev.mastersrunners.com/api/*` needs to proxy to the API origin.
- Local non-development web builds should provide `VITE_API_URL` through the shell environment or an env file resolved from `apps/web`.

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
- Set `VITE_API_URL` for every preview and production environment before triggering a Pages deployment. Non-development builds now fail fast when it is missing.
- Use environment-specific values:
  - `dev` branch / `dev.mastersrunners.com` -> `https://dev.mastersrunners.com/api/v1`
  - `main` branch / `mastersrunners.com` -> `https://mastersrunners.com/api/v1` when launch switches to the app host

### Recovery Steps

1. Open the Cloudflare Pages project build settings.
2. Replace the stale build command with `pnpm build:web`.
3. Confirm the output directory is `apps/web/dist`.
4. Add `VITE_API_URL` for the target branch environment before re-running the deployment.
5. Re-run the failed preview deployment or push a no-op commit after the settings change.

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

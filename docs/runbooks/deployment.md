# Deployment Runbook

This runbook explains how deployment works in this repository, what to verify before and after rollout, and which commands are the source of execution.

## Source of Execution

- CI test gate: `.github/workflows/ci.yml`
- Current dev deploy workflow: `.github/workflows/deploy.yml`
- Automated migration safety guard: `scripts/check-safe-production-migrations.sh`
- Production-like local stack: `docker-compose.prod.yml`
- Post-deploy verification script: `scripts/verify-deployment.sh`
- Cloudflare Pages web build entrypoint: `package.json` -> `pnpm build:web`

## Deployment Surfaces

### Current API Rollout

- Target: Google Cloud Run
- Trigger: push to `dev`
- Artifact: Docker image built from `apps/api/Dockerfile`
- Service: `masters-runners-api-dev`
- Database target: Supabase Postgres via `DATABASE_URL`

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
- `DIRECT_URL` exists in Secret Manager for the migration job.
- Database migrations required by the release are already prepared.
- Any migration SQL in the release stays inside the additive-only automated subset: new tables, new non-unique indexes, new nullable or default-backed columns, or default-relaxing alters. Renames, drops, unique/constraint-tightening changes, `SET NOT NULL`, and unconstrained `ADD COLUMN ... NOT NULL` changes need a separate manual rollout task.
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
- `DATABASE_URL` should be the Supabase transaction-pooler runtime URL for Cloud Run.
- `DIRECT_URL` is intentionally not injected into Cloud Run because the API runtime should not need the migration/operator URL.
- Current beta deploy posture also keeps Cloud Run at `min-instances=0` and `max-instances=1`.
- The deploy workflow still needs Secret Manager access to `DIRECT_URL` so it can run `prisma migrate deploy` and `prisma db seed` before shipping a new revision.
- Automated dev-branch migrations intentionally allow only a narrow additive SQL subset; anything outside that subset must use a manual rollout task instead of relying on regex guesses about backward compatibility.
- `FRONTEND_URL` is required for production boot because the API uses it for CORS and OAuth redirect targets.
- If a social provider is enabled with `<PROVIDER>_CLIENT_ID`, the matching `<PROVIDER>_CALLBACK_URL` must also be present.
- The deploy workflow only validates repo-managed variables. OAuth provider client IDs and secrets still live in external Cloud Run or Secret Manager state, so API boot-time validation remains the final guard against stale provider callback config.

### Local Docker Compose

- Copy `.env.production.example` to `.env.production`
- Populate production-like values before running the stack
- Run the compose stack with `docker compose --env-file .env.production -f docker-compose.prod.yml ...`.
- The API service reads `DATABASE_URL` from that env file and falls back to the local `db` service only when `DATABASE_URL` is unset.
- `DIRECT_URL` is not consumed by the API container; keep it in `.env.production` as an operator value and export it into the host shell before running Prisma CLI commands.
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

### Supabase Connection Contract

- Use Supabase transaction pooler URLs for runtime/serverless workloads such as Cloud Run:
  - append `pgbouncer=true`
  - append `connection_limit=1`
  - keep `sslmode=require`
- Use the Supabase session pooler URL on port `5432` for Prisma CLI tasks such as migrate, db push, seed, and Studio.
- Supabase Free is acceptable for initial bring-up and internal verification, but it is not the target for dependable public beta uptime because projects can be paused.

## Local Production-Like Verification

### 1. Prepare environment

```bash
cp .env.production.example .env.production
```

### 2. Start the stack

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

### 3. Verify API health

```bash
pnpm deploy:verify -- http://localhost:4000
```

### 4. Check logs

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
```

### 5. Stop the stack

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

## Current Dev Deploy Flow

1. Merge or push the release commit to `dev`.
2. GitHub Actions validates repo-managed deploy vars and additive-only migration safety.
3. GitHub Actions builds and pushes the API image.
4. GitHub Actions loads `DIRECT_URL` from Secret Manager.
5. GitHub Actions runs `pnpm db:migrate:deploy` and `pnpm db:seed`.
6. GitHub Actions deploys that image to Cloud Run.
7. GitHub Actions runs `scripts/verify-deployment.sh` against the deployed service URL.

`main` remains the intended future production branch, but automated API deploy is intentionally disabled there during the current prelaunch phase.

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

Run production/shared-environment migrations only with the intended session-pooler operator URL.

```bash
export DIRECT_URL=postgresql://<db-user>.<project-ref>:<db-password>@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
pnpm db:migrate:deploy
pnpm db:seed
```

`pnpm db:migrate` remains the local development command and maps to `prisma migrate dev`.
If a migration contains SQL outside the additive-only subset, the automated deploy workflow will fail and require a separate manual rollout plan.

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

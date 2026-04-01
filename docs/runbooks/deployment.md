# Deployment Runbook

This runbook explains how deployment works in this repository, what to verify before and after rollout, and which commands are the source of execution.

## Source of Execution

- CI test gate: `.github/workflows/ci.yml`
- Current branch-aware deploy workflow: `.github/workflows/deploy.yml`
- Automated migration safety guard: `scripts/check-safe-production-migrations.sh`
- Production-like local stack: `docker-compose.prod.yml`
- Post-deploy verification script: `scripts/verify-deployment.sh`
- Cloudflare Pages web build entrypoint: `package.json` -> `pnpm build:web`
- Web response-header contract: `apps/web/public/_headers`

## Deployment Surfaces

### API Rollout Lanes

- Target: Google Cloud Run
- Trigger: push to `dev` and `main`
- Markdown-only pushes are ignored by the deploy workflow; at least one non-`*.md` file change is required to trigger rollout.
- Artifact: Docker image built from `apps/api/Dockerfile`
- Branch-to-service mapping:
  - `dev` -> `masters-runners-api-dev`
  - `main` -> `masters-runners-api`
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
- Health verification should target `GET /api/v1/health`; legacy `GET /health` remains available for compatibility.
- Deployment verification should prove repo-tracked response headers on the direct API origin and, when `WEB_VERIFY_URL` is available, on the Pages web root.
- Runbook and workflow still describe the same deployment path.

## Environment Contract

### Cloud Run

- The deploy workflow selects a GitHub environment by branch:
  - `dev` branch -> `dev` GitHub environment
  - `main` branch -> `production` GitHub environment
- Each GitHub environment should provide the lane-scoped deployment contract:
  - secrets: `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`
  - variables: `CLOUD_RUN_SERVICE_NAME`, `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT`, `FRONTEND_URL`
  - optional variables: `API_PUBLIC_URL`, `KAKAO_CALLBACK_URL`, `GOOGLE_CALLBACK_URL`
- Expected GitHub environment variable values for the current rollout:
  - `dev` environment:
    - `CLOUD_RUN_SERVICE_NAME=masters-runners-api-dev`
    - `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT=cloud-run-runtime@mastersrunners-dev-20260331.iam.gserviceaccount.com`
    - `FRONTEND_URL=https://dev.mastersrunners.com`
  - `production` environment:
    - `CLOUD_RUN_SERVICE_NAME=masters-runners-api`
    - `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT=cloud-run-runtime@mastersrunners-prod-20260331.iam.gserviceaccount.com`
    - `FRONTEND_URL=https://mastersrunners.com`
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
- If matching Secret Manager entries exist, the deploy workflow also forwards optional OAuth provider credentials:
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL` should be the Supabase transaction-pooler runtime URL for Cloud Run.
- `JWT_ACCESS_TTL` and `JWT_REFRESH_TTL` may be either numeric seconds or jsonwebtoken-style timespan strings such as `15m` and `30d`.
- `DIRECT_URL` is intentionally not injected into Cloud Run because the API runtime should not need the migration/operator URL.
- Current beta deploy posture also keeps Cloud Run at `min-instances=0` and `max-instances=1`.
- `CLOUD_RUN_SERVICE_NAME` must be provided per GitHub environment so the deploy lane can target the correct Cloud Run service.
- `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT` must also be provided per GitHub environment so first-time service creation does not fall back to the default Compute Engine service account.
- The deploy workflow still needs Secret Manager access to `DIRECT_URL` so it can run `prisma migrate deploy` and `prisma db seed` before shipping a new revision.
- Automated branch deploy migrations intentionally allow only a narrow additive SQL subset; anything outside that subset must use a manual rollout task instead of relying on regex guesses about backward compatibility.
- `FRONTEND_URL` is required for branch deploy boot because the API uses it for CORS and OAuth redirect targets.
- Browser auth now also depends on `FRONTEND_URL` because the API derives cookie redirect and `Secure` behavior from it.
- Public feature exposure is controlled by the repo-tracked runtime config module at `apps/api/src/config/feature-flags.ts`.
- Provider credentials still live in Secret Manager and callback URLs still live in GitHub environment variables.
- If Kakao is enabled in the repo-tracked runtime config, `KAKAO_CALLBACK_URL` must be present in GitHub vars and the runtime must also receive `KAKAO_CLIENT_ID`.
- If Google is enabled in the repo-tracked runtime config, `GOOGLE_CALLBACK_URL` must be present in GitHub vars and the runtime must also receive `GOOGLE_CLIENT_ID` plus `GOOGLE_CLIENT_SECRET`.
- The API exposes `GET /config/public` as the public runtime contract used by the web for feature and auth-provider availability.
- Current repo defaults are:
  - Kakao auth enabled
  - Google auth disabled
  - challenges disabled
  - events disabled
- If Kakao or Google is missing from `/config/public`, first confirm the repo-tracked runtime config enables it, then confirm the matching callback URL variable exists in GitHub and the matching credentials exist in Secret Manager.
- Browser auth transport contract for current deploys:
  - OAuth callback redirects never include app tokens in the URL
  - browser auth tokens live only in `HttpOnly` cookies scoped to `/api/v1`
  - the SPA must call the API with credentials included and cannot rely on `localStorage` token persistence
  - SSE connections also depend on browser cookies, so same-domain `/api/*` routing or localhost CORS+credentials must stay aligned with `FRONTEND_URL`

### Secret Manager Bootstrap

- Use `scripts/bootstrap-gcp-secrets.sh` to upsert Secret Manager values from a local env file without pasting secrets into chat or the repo.
- The script expects a shell-style env file that stays local to your machine, for example `.env.gcp.dev` or `.env.gcp.prod`.
- Example `dev` bootstrap:

```bash
bash scripts/bootstrap-gcp-secrets.sh mastersrunners-dev-20260331 .env.gcp.dev
```

- Example `production` bootstrap:

```bash
bash scripts/bootstrap-gcp-secrets.sh mastersrunners-prod-20260331 .env.gcp.prod
```

- Dry-run before the real write if you want to validate the secret names only:

```bash
bash scripts/bootstrap-gcp-secrets.sh --dry-run mastersrunners-dev-20260331 .env.gcp.dev
```

- Required secret names for the current workflow:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `JWT_SECRET`
  - `JWT_ACCESS_TTL`
  - `JWT_REFRESH_TTL`
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_URL`
- The API derives the standard Cloudflare R2 S3 endpoint from `R2_ACCOUNT_ID`, so `R2_ENDPOINT` does not need to be stored as a separate secret for the normal Cloudflare R2 path.
- Only set `R2_ENDPOINT` explicitly when you need to override the standard Cloudflare R2 host shape for a non-default environment.
- Optional social-login secrets can also be stored if they are present in the env file:
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- Keep callback URLs in GitHub environment variables, not in Secret Manager.

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
- Pages should also honor the repo-tracked response-header policy from `apps/web/public/_headers`.
- Required Pages variable for every non-local deployment:
  - `VITE_API_URL`
- Never store OAuth secrets, JWT secrets, database credentials, or R2 secrets in Pages env.
- Current header posture for Pages:
  - `Content-Security-Policy` is defined in `_headers` for the SPA document surface.
  - `Strict-Transport-Security` is repo-tracked with `max-age=31536000`.
  - do not add `includeSubDomains` or `preload` while `mastersrunners.com` and `www.mastersrunners.com` still point at the placeholder site.

### Current Host Matrix

- Current pre-launch app host:
  - `dev` branch -> `dev.mastersrunners.com`
- Deferred launch host:
  - `main` branch -> `mastersrunners.com`
- Current placeholder hosts:
  - `mastersrunners.com`
  - `www.mastersrunners.com`
- Same-domain API routing is an external Cloudflare dashboard responsibility.
- Current expected routing:
  - `dev.mastersrunners.com/api/*` -> dev API origin
- 2026-04-01 runtime checks confirmed the current same-domain dev host reaches the API successfully on:
  - `https://dev.mastersrunners.com/api/v1/health`
  - `https://dev.mastersrunners.com/api/v1/auth/providers`
- Deferred routing after the placeholder host is retired:
  - `mastersrunners.com/api/*` -> production API origin
- Local non-development web builds should provide `VITE_API_URL` through the shell environment or an env file resolved from `apps/web`.

### Supabase Connection Contract

- Use Supabase transaction pooler URLs for runtime/serverless workloads such as Cloud Run:
  - append `pgbouncer=true`
  - append `connection_limit=1`
  - keep `sslmode=require`
- Use the Supabase session pooler URL on port `5432` for Prisma CLI tasks such as migrate, db push, seed, and Studio.
- Current verified rollout posture on 2026-04-01:
  - organization `nerdchanii's Org` is on the Supabase `free` plan
  - active dev project is `mastersrunners-dev` (`ziocdlargynmjxjhijqj`) in `ap-northeast-2`
- Supabase Free is acceptable for the current dev-lane rollout and internal verification, but it is not a dependable public-beta uptime promise because projects can be paused.

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

- Local API-only verification skips the web-root header check unless `WEB_VERIFY_URL` is set.
- Public lane verification should pass both the direct API origin and the Pages host:

```bash
WEB_VERIFY_URL=https://dev.mastersrunners.com pnpm deploy:verify -- https://SERVICE_URL.run.app
```

- `scripts/verify-deployment.sh` now checks:
  - `GET /api/v1/health` reachability and required headers
  - `/api-docs` headers on the direct API origin
  - web-root headers on `WEB_VERIFY_URL` when that host is provided or when the base URL is already the public app host

### 4. Check logs

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
```

### 5. Stop the stack

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

## Branch-Aware API Deploy Flow

1. Merge or push the release commit to `dev` or `main`.
2. GitHub Actions selects the matching GitHub environment:
   - `dev` -> `dev`
   - `main` -> `production`
3. GitHub Actions validates repo-managed deploy vars and additive-only migration safety.
4. GitHub Actions builds and pushes the API image.
5. GitHub Actions loads `DIRECT_URL` from Secret Manager.
6. GitHub Actions runs `pnpm db:migrate:deploy` and `pnpm db:seed`.
7. GitHub Actions deploys that image to the branch-mapped Cloud Run service.
8. GitHub Actions runs `scripts/verify-deployment.sh` against the deployed service URL.

The existence of a `main` API deploy lane does not by itself mean the public main web host is live. Cloudflare host switching still controls when `mastersrunners.com` stops serving the placeholder site.

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
- Critical runtime integrations boot correctly:
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

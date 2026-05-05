# Deployment Runbook

This runbook explains how deployment works in this repository, what to verify before and after rollout, and which commands are the source of execution.

## Source of Execution

- CI test gate: `.github/workflows/ci.yml`
- Current branch-aware deploy workflow: `.github/workflows/deploy.yml`
- Automated migration safety guard: `scripts/check-safe-production-migrations.sh`
- Production-like local stack: `docker-compose.prod.yml`
- Post-deploy verification script: `scripts/verify-deployment.sh`
- Cloudflare Pages web build entrypoint: `package.json` -> `pnpm build:web`
- Cloudflare Pages ops-web build entrypoint: `package.json` -> `pnpm build:ops-web`
- Web response-header contract: `apps/web/public/_headers`
- Ops-web response-header contract: `apps/ops-web/public/_headers`

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

### Ops Web Static Hosting

- Target: Cloudflare Pages
- Trigger: Git-connected preview and production deployments
- Build artifact: `apps/ops-web/dist`
- Build contract source of truth: this runbook plus the root `build:ops-web` script

## Pre-Deploy Checklist

- CI is green on the commit being deployed.
- Required secrets exist for the deploy workflow.
- `DIRECT_URL` exists in Secret Manager for the migration job.
- Database migrations required by the release are already prepared.
- Any migration SQL in the release stays inside the additive-only automated subset: new tables, new non-unique indexes, new nullable or default-backed columns, or default-relaxing alters. Renames, drops, unique/constraint-tightening changes, `SET NOT NULL`, and unconstrained `ADD COLUMN ... NOT NULL` changes need a separate manual rollout task.
- Health verification should target `GET /api/v1/health`; legacy `GET /health` remains available for compatibility.
- Deployment verification should always prove repo-tracked response headers on the direct API origin.
- Web-root header verification remains available through `WEB_VERIFY_URL`, but automated API deploys should not block on the external Pages host because that routing/domain surface is tracked under `EX-0004`.
- Public app hosts should not be treated as the source of truth for Swagger exposure; `api-docs` belongs on the direct API origin for deploy verification today and on the future ops host once that staff-only surface exists.
- Browser direct uploads require the target R2 bucket to allow preflight requests from the active frontend host; on the current dev lane that means `https://dev.mastersrunners.com`.
- Runbook and workflow still describe the same deployment path.

## Environment Contract

### Cloud Run

- The deploy workflow selects a GitHub environment by branch:
  - `dev` branch -> `dev` GitHub environment
  - `main` branch -> `production` GitHub environment
- Each GitHub environment should provide the lane-scoped deployment contract:
  - secrets: `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`
  - variables: `CLOUD_RUN_SERVICE_NAME`, `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT`, `FRONTEND_URL`, `KAKAO_CALLBACK_URL`
  - dev-lane variables: `OPS_FRONTEND_URL`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `R2_PUBLIC_URL`
  - optional variables: `API_PUBLIC_URL`
- Expected GitHub environment variable values for the current rollout:
  - `dev` environment:
    - `CLOUD_RUN_SERVICE_NAME=masters-runners-api-dev`
    - `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT=cloud-run-runtime@mastersrunners-dev-20260331.iam.gserviceaccount.com`
    - `FRONTEND_URL=https://dev.mastersrunners.com`
    - `OPS_FRONTEND_URL=https://ops.dev.mastersrunners.com`
    - `R2_PUBLIC_URL=https://assets.dev.mastersrunners.com`
  - `production` environment:
    - `CLOUD_RUN_SERVICE_NAME=masters-runners-api`
    - `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT=cloud-run-runtime@mastersrunners-prod-20260331.iam.gserviceaccount.com`
    - `FRONTEND_URL=https://mastersrunners.com`
    - `KAKAO_CALLBACK_URL=https://mastersrunners.com/api/v1/auth/kakao/callback`
- Deployment workflow injects:
  - GitHub environment variables:
    - `NODE_ENV=production`
    - `FRONTEND_URL`
    - `OPS_FRONTEND_URL`
    - `JWT_ACCESS_TTL` when the lane has migrated off Secret Manager for JWT policy values
    - `JWT_REFRESH_TTL` when the lane has migrated off Secret Manager for JWT policy values
    - `R2_PUBLIC_URL` when the lane has migrated off Secret Manager for the public asset host
    - `KAKAO_CALLBACK_URL` when the lane exposes Kakao login through GitHub env metadata
  - Secret Manager runtime secrets:
    - `DATABASE_URL`
    - `JWT_SECRET`
    - `R2_ACCOUNT_ID`
    - `R2_ACCESS_KEY_ID`
    - `R2_SECRET_ACCESS_KEY`
    - `R2_BUCKET_NAME`
    - `KAKAO_CLIENT_ID`
    - `KAKAO_CLIENT_SECRET`
  - Legacy fallback secrets on lanes not yet migrated:
    - `JWT_ACCESS_TTL`
    - `JWT_REFRESH_TTL`
    - `R2_PUBLIC_URL`
- Additional ops-auth runtime values:
  - `CF_ACCESS_TEAM_DOMAIN`
  - `CF_ACCESS_POLICY_AUD`
- Optional runtime values:
  - `API_PUBLIC_URL`
- `DATABASE_URL` should be the Supabase transaction-pooler runtime URL for Cloud Run.
- `JWT_ACCESS_TTL` and `JWT_REFRESH_TTL` may be either numeric seconds or jsonwebtoken-style timespan strings such as `15m` and `30d`.
- `DIRECT_URL` is intentionally not injected into Cloud Run because the API runtime should not need the migration/operator URL.
- Current beta deploy posture also keeps Cloud Run at `min-instances=0` and `max-instances=1`.
- `CLOUD_RUN_SERVICE_NAME` must be provided per GitHub environment so the deploy lane can target the correct Cloud Run service.
- `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT` must also be provided per GitHub environment so first-time service creation does not fall back to the default Compute Engine service account.
- The deploy workflow still needs Secret Manager access to `DIRECT_URL` so it can run `prisma migrate deploy` and `prisma db seed` before shipping a new revision.
- Automated branch deploy migrations intentionally allow only a narrow additive SQL subset; anything outside that subset must use a manual rollout task instead of relying on regex guesses about backward compatibility.
- `FRONTEND_URL` is required for branch deploy boot because the API uses it for CORS and OAuth redirect targets.
- `OPS_FRONTEND_URL` is also required once the ops backoffice is enabled because the API allows that origin for ops-host API traffic.
- Browser auth now also depends on `FRONTEND_URL` because the API derives cookie redirect and `Secure` behavior from it.
- The current dev lane now takes `R2_PUBLIC_URL` from GitHub environment variables because it is a public asset host, not a Secret Manager value.
- The deploy workflow still falls back to legacy Secret Manager values for `JWT_*` and `R2_PUBLIC_URL` on lanes that have not been migrated yet.
- Public feature exposure is controlled by the repo-tracked runtime config module at `apps/api/src/config/feature-flags.ts`.
- Provider credentials still live in Secret Manager and callback URLs still live in GitHub environment variables.
- The current repo-tracked auth contract is Kakao enabled and Google disabled.
- While Kakao remains enabled in the repo runtime config, `KAKAO_CALLBACK_URL` must be present in GitHub vars and the runtime must also receive `KAKAO_CLIENT_ID` plus `KAKAO_CLIENT_SECRET`.
- Google and Naver runtime wiring are intentionally outside the current deploy contract; re-enable them only in a dedicated follow-up task that changes the repo-tracked runtime config and operator docs together.
- The API exposes `GET /config/public` as the public runtime contract used by the web for feature and auth-provider availability.
- Current repo defaults are:
  - Kakao auth enabled
  - Google auth disabled
  - challenges disabled
  - events disabled
- If Kakao is missing from `/config/public`, first confirm the repo-tracked runtime config still enables it, then confirm `KAKAO_CALLBACK_URL` exists in GitHub and both Kakao credentials exist in Secret Manager.
- Browser auth transport contract for current deploys:
  - OAuth callback redirects never include app tokens in the URL
  - browser auth tokens live only in `HttpOnly` cookies scoped to `/api/v1`
  - the SPA must call the API with credentials included and cannot rely on `localStorage` token persistence
  - the `/realtime` socket.io connection also depends on browser cookies, so same-domain `/api/*` routing or localhost CORS+credentials must stay aligned with `FRONTEND_URL`

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
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
- These values no longer belong in Secret Manager for the migrated dev lane:
  - `JWT_ACCESS_TTL`
  - `JWT_REFRESH_TTL`
  - `R2_PUBLIC_URL`
- Keep those non-secret values in GitHub environment variables instead once a lane is migrated.
- Lanes that have not been migrated yet may still carry legacy Secret Manager copies of `JWT_*` and `R2_PUBLIC_URL` until the follow-up rollout finishes.
- The API derives the standard Cloudflare R2 S3 endpoint from `R2_ACCOUNT_ID`, so `R2_ENDPOINT` does not need to be stored as a separate secret for the normal Cloudflare R2 path.
- Only set `R2_ENDPOINT` explicitly when you need to override the standard Cloudflare R2 host shape for a non-default environment.
- Bucket-side CORS is a separate external setting from the runtime secrets above. The current browser direct-upload contract expects the target bucket to allow:
  - origins: the lane frontend host
  - methods: at least `PUT`
  - headers: `Content-Type`, `x-amz-checksum-crc32`, and `x-amz-sdk-checksum-algorithm`
- Keep callback URLs and other public runtime host values in GitHub environment variables, not in Secret Manager.

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
- Optional Pages variable when Cloudflare Web Analytics should load from repo-owned code:
  - `VITE_CLOUDFLARE_ANALYTICS_TOKEN`
- Never store OAuth secrets, JWT secrets, database credentials, or R2 secrets in Pages env.
- Current header posture for Pages:
  - `Content-Security-Policy` is defined in `_headers` for the SPA document surface.
  - `script-src` allows the explicit Cloudflare Insights beacon host and still rejects inline script execution.
  - `connect-src` allows `https://cloudflareinsights.com` for manual beacon reporting.
  - `Cache-Control: public, no-transform` is set on the Pages response contract so Cloudflare does not re-inject inline analytics HTML that would violate the repo CSP.
  - `Strict-Transport-Security` is repo-tracked with `max-age=31536000`.
  - do not add `includeSubDomains` or `preload` while `mastersrunners.com` and `www.mastersrunners.com` still point at the placeholder site.
- Planned operator-host posture:
  - `ops.dev.mastersrunners.com` should be the single staff-only host for backoffice UI, operator API routes, and Swagger.
  - Cloudflare Access should protect the entire ops host before any app content is reachable.
  - The backoffice should ship as a dedicated `mastersrunners-ops` Pages project built from `apps/ops-web/dist`.
  - A secret-less Pages frontend plus same-host Worker routes for `/api/*` and `/api-docs*` is the preferred implementation shape.
  - 2026-04-02 external proof: Cloudflare now has an active `ops.dev.mastersrunners.com` custom domain, Worker routes for `ops.dev.mastersrunners.com/api/*` plus `ops.dev.mastersrunners.com/api-docs*`, and an Access app that gates `ops.dev.mastersrunners.com/*` before content is served.

### Cloudflare Pages For Ops Web

- Set the Pages build command to `pnpm build:ops-web`
- Set the Pages build output directory to `apps/ops-web/dist`
- Prefer same-host API routing and let deployed ops-web builds default to `/api/v1`
- Do not store Access private keys or database secrets in Pages env
- Optional Pages variable for preview/local override:
  - `VITE_API_URL`

### Current Host Matrix

- Current pre-launch app host:
  - `dev` branch -> `dev.mastersrunners.com`
- Deferred launch host:
  - `main` branch -> `mastersrunners.com`
- Current placeholder hosts:
  - `mastersrunners.com`
  - `www.mastersrunners.com`
- Same-domain API routing is an external Cloudflare dashboard responsibility.
- The dev R2 bucket `mastersrunners-dev-assets` also needs a browser-upload CORS rule aligned to the dev web host. Verified rule shape on 2026-04-01 after tightening the allowlist:
  - origins: `https://dev.mastersrunners.com`
  - methods: `PUT`, `GET`, `HEAD`, `DELETE`
  - headers: `Content-Type`, `x-amz-checksum-crc32`, `x-amz-sdk-checksum-algorithm`, `x-amz-content-sha256`
  - expose headers: `ETag`
  - max age: `3600`
- Current expected routing:
  - `dev.mastersrunners.com/api/*` -> dev API origin
- Public dev host non-goal:
  - `dev.mastersrunners.com/api-docs*` should not be relied on as a public route once the ops host exists.
- Planned operator routing:
  - `ops.dev.mastersrunners.com/*` -> Cloudflare Access-protected `apps/ops-web` UI
  - `ops.dev.mastersrunners.com/api/*` -> dev API origin
  - `ops.dev.mastersrunners.com/api-docs*` -> dev API origin
- 2026-04-02 observed external state:
  - DNS record exists for `ops.dev.mastersrunners.com -> mastersrunners-ops.pages.dev`
  - Worker routes exist for `ops.dev.mastersrunners.com/api/*` and `ops.dev.mastersrunners.com/api-docs*`
  - Access now protects `ops.dev.mastersrunners.com/*`, and live probes against the published edge return Cloudflare Access `302` responses for `/`, `/api/v1/health`, and `/api-docs`
  - a dedicated Pages project `mastersrunners-ops` now exists with build command `pnpm run build:ops-web` and output `apps/ops-web/dist`
  - the custom domain now resolves through the dedicated `mastersrunners-ops` Pages project
  - the shared `mastersrunners-api-proxy` Worker must allow both `dev.mastersrunners.com` and `ops.dev.mastersrunners.com`, and must proxy `/api-docs*` in addition to `/api/*`
  - the dev Cloud Run service must include `OPS_FRONTEND_URL`, `CF_ACCESS_TEAM_DOMAIN`, and `CF_ACCESS_POLICY_AUD` once the ops backoffice is enabled
- 2026-04-01 runtime checks confirmed the current same-domain dev host reaches the API successfully on:
  - `https://dev.mastersrunners.com/api/v1/health`
  - `https://dev.mastersrunners.com/api/v1/auth/providers`
- Deferred routing after the placeholder host is retired:
  - `mastersrunners.com/api/*` -> production API origin
- Local non-development web builds should provide `VITE_API_URL` through the shell environment or an env file resolved from `apps/web`.
- Local ops-web builds may omit `VITE_API_URL` when they are intended to run on the deployed ops host, but local preview outside that host should still provide an explicit override.

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
- Optional public-lane verification can also probe the Pages host when the operator wants live web-header proof:

```bash
WEB_VERIFY_URL=https://dev.mastersrunners.com pnpm deploy:verify -- https://SERVICE_URL.run.app
```

- `scripts/verify-deployment.sh` now checks:
  - `GET /api/v1/health` reachability and required headers
  - `/api-docs` headers on the direct API origin
  - web-root headers on `WEB_VERIFY_URL` when that host is provided or when the base URL is already the public app host
- Realtime live verification should use a browser or socket.io client against `/realtime`; SSE endpoints are no longer deployment proof surfaces.
- Do not use `pnpm deploy:verify -- https://dev.mastersrunners.com` as the canonical proof once Swagger is treated as an ops-only surface; prefer a direct API origin base URL plus optional `WEB_VERIFY_URL`.

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
7. GitHub Actions deploys that image to the branch-mapped Cloud Run service with the reduced runtime secret inventory and GitHub-managed non-secret env vars.
8. GitHub Actions runs `scripts/verify-deployment.sh` against the deployed service URL.
9. If operator-facing proof of the Pages header contract is needed, rerun the script manually with `WEB_VERIFY_URL=https://dev.mastersrunners.com` after the API deploy succeeds.

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

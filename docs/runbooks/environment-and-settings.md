# Environment and Settings Index

Use this page as the first hop for runtime configuration in `mastersrunners`.

This document is intentionally an index. It does not duplicate every environment variable or setting contract.

## Start Here

- Local production-like example values: `.env.production.example`
- Deployment and runtime contract: `docs/runbooks/deployment.md#environment-contract`
- Rollback and deploy recovery: `docs/runbooks/rollback.md`

## Common Configuration Paths

### API Runtime Environment

- The NestJS API loads env files through `ConfigModule` in `apps/api/src/app.module.ts`.
- Local and container runs should treat repo-root `.env` or `.env.local` as the default development entrypoints.
- Parallel worktree bootstrap may generate `apps/api/.env.local` so a dedicated worktree can override `API_PORT`, `API_PUBLIC_URL`, and `FRONTEND_URL` without mutating the shared repo-root `.env`.
- Production-like Docker verification should pass `.env.production` explicitly with `docker compose --env-file .env.production`.
- Branch deploy lanes also depend on GitHub environment metadata documented in `docs/runbooks/deployment.md`, including `CLOUD_RUN_SERVICE_NAME`, `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT`, `FRONTEND_URL`, and `OPS_FRONTEND_URL`.
- Ops backoffice runtime on the API also depends on `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_POLICY_AUD`.
- Repo-tracked public feature exposure lives in `apps/api/src/config/feature-flags.ts`.
- If a branch lane should expose social login, keep callback URLs in GitHub environment variables and keep provider credentials in Secret Manager so Cloud Run can receive them at deploy time.

### Web Runtime and Build Settings

- The web app reads `VITE_API_URL` in `apps/web/src/lib/api-client.ts`.
- The ops web app reads `VITE_API_URL` in `apps/ops-web/src/lib/api-client.ts`, but deployed builds can intentionally omit it and fall back to same-host `/api/v1`.
- If Cloudflare Web Analytics is enabled for a Pages lane, the web app also reads `VITE_CLOUDFLARE_ANALYTICS_TOKEN` and loads the beacon from repo-owned code instead of relying on HTML mutation.
- The Vite dev server reads `VITE_PORT` in `apps/web/vite.config.ts`; worktree bootstrap may generate `apps/web/.env.local` so each worktree can bind a unique local dev port.
- The ops-web Vite dev server reads `VITE_PORT` in `apps/ops-web/vite.config.ts`; use a separate local port from the consumer app when running both together.
- Non-development web builds must provide `VITE_API_URL`; only local Vite development may fall back to `http://localhost:4000/api/v1`.
- Repository analysis/build automation may inject a placeholder `VITE_API_URL=http://localhost:4000` so tools such as `knip` and workspace-wide builds can load the Vite config without weakening the runtime deployment contract.
- `VITE_*` values are public build-time configuration, not secret storage. Keep OAuth, JWT, database, and storage secrets out of Pages environment variables.
- If a user-facing environment-specific web setting changes, update both the relevant runbook and the web design doc if the behavior contract changes.

### Database and Auth

- Runtime database connectivity is anchored on `DATABASE_URL`.
- Prisma CLI and operator commands should prefer `DIRECT_URL` when it is available.
- For the Supabase rollout, treat `DATABASE_URL` as the Supabase transaction-pooler runtime URL and `DIRECT_URL` as the Supabase session-pooler migration/operator URL.
- Current rollout posture keeps the live dev lane on Supabase Free; operational limits such as project pausing should be treated as an explicit launch constraint, not an implicit uptime guarantee.
- Prisma CLI in this repo auto-loads repo-root `.env`; if you keep operator URLs only in `.env.production`, export `DIRECT_URL` into the shell before running host-side Prisma commands.
- JWT and OAuth settings are documented in `docs/runbooks/deployment.md` and exemplified in `.env.production.example`. Public feature defaults live in the repo-tracked runtime config module.

### Storage

- Storage adapter selection is controlled by `STORAGE_TYPE`.
- R2 and disk-storage details are documented in `docs/runbooks/deployment.md`.
- For the standard Cloudflare R2 path, the API derives the S3 endpoint from `R2_ACCOUNT_ID`; do not treat `R2_ENDPOINT` as a required runtime secret unless you intentionally override the default host.
- Browser direct uploads to R2 also require the bucket CORS allowlist to cover `FRONTEND_URL`; do not treat localhost browser origins as implicitly allowed against deployed lane buckets.
- Upload request flow, file-type rules, and storage ownership boundaries live in `design/backend/upload-ingestion.md`.

## Update Rules

- If deploy/runtime env requirements change, update `docs/runbooks/deployment.md` in the same task.
- If new baseline example values are needed for production-like local verification, update `.env.production.example` in the same task.
- If a setting changes user-visible behavior or system design, update the matching design doc in the same task rather than treating this page as the only source of truth.

## Parallel Worktree Notes

- Use `pnpm worktree:bootstrap -- --path <worktree-path> ...` when a task needs a dedicated worktree.
- The bootstrap flow can expose a shared repo env inside the worktree with `--env-source <path>` and writes gitignored worktree-local files instead of mutating the shared repo env:
  - `.env`
  - `.env.worktree`
  - `apps/api/.env.local`
  - `apps/web/.env.local`
  - `apps/ops-web/.env.local`
- The bootstrap flow also prepares shared workspace artifacts that local API startup expects, notably `packages/types/dist` and `packages/database/dist`.
- Generated port mapping should stay aligned:
  - `apps/api/.env.local` sets `API_PORT`
  - `apps/api/.env.local` sets `FRONTEND_URL=http://localhost:<web-port>`
  - `apps/web/.env.local` sets `VITE_PORT=<web-port>`
  - `apps/web/.env.local` sets `VITE_API_URL=http://localhost:<api-port>/api/v1`
  - `apps/ops-web/.env.local` can set `VITE_PORT=<ops-web-port>`
  - `apps/ops-web/.env.local` can set `VITE_API_URL=http://localhost:<api-port>/api/v1`

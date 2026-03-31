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
- Production-like Docker verification should pass `.env.production` explicitly with `docker compose --env-file .env.production`.

### Web Runtime and Build Settings

- The web app reads `VITE_API_URL` in `apps/web/src/lib/api-client.ts`.
- Non-development web builds must provide `VITE_API_URL`; only local Vite development may fall back to `http://localhost:4000/api/v1`.
- Repository analysis/build automation may inject a placeholder `VITE_API_URL=http://localhost:4000` so tools such as `knip` and workspace-wide builds can load the Vite config without weakening the runtime deployment contract.
- `VITE_*` values are public build-time configuration, not secret storage. Keep OAuth, JWT, database, and storage secrets out of Pages environment variables.
- If a user-facing environment-specific web setting changes, update both the relevant runbook and the web design doc if the behavior contract changes.

### Database and Auth

- Runtime database connectivity is anchored on `DATABASE_URL`.
- Prisma CLI and operator commands should prefer `DIRECT_URL` when it is available.
- For the Supabase rollout, treat `DATABASE_URL` as the Supabase transaction-pooler runtime URL and `DIRECT_URL` as the Supabase session-pooler migration/operator URL.
- Prisma CLI in this repo auto-loads repo-root `.env`; if you keep operator URLs only in `.env.production`, export `DIRECT_URL` into the shell before running host-side Prisma commands.
- JWT and OAuth settings are documented in `docs/runbooks/deployment.md` and exemplified in `.env.production.example`.

### Storage

- Storage adapter selection is controlled by `STORAGE_TYPE`.
- R2 and disk-storage details are documented in `docs/runbooks/deployment.md`.
- Upload request flow, file-type rules, and storage ownership boundaries live in `design/backend/upload-ingestion.md`.

## Update Rules

- If deploy/runtime env requirements change, update `docs/runbooks/deployment.md` in the same task.
- If new baseline example values are needed for production-like local verification, update `.env.production.example` in the same task.
- If a setting changes user-visible behavior or system design, update the matching design doc in the same task rather than treating this page as the only source of truth.

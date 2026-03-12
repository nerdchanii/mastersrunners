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
- Production-like Docker verification should use `.env.production`, copied from `.env.production.example`.

### Web Runtime and Build Settings

- The web app reads `VITE_API_URL` in `apps/web/src/lib/api-client.ts`.
- If a user-facing environment-specific web setting changes, update both the relevant runbook and the web design doc if the behavior contract changes.

### Database and Auth

- Database connection requirements are anchored on `DATABASE_URL`.
- JWT and OAuth settings are documented in `docs/runbooks/deployment.md` and exemplified in `.env.production.example`.

### Storage

- Storage adapter selection is controlled by `STORAGE_TYPE`.
- R2 and disk-storage details are documented in `docs/runbooks/deployment.md`.
- Module-specific upload configuration notes live in `apps/api/src/uploads/README.md`.

## Update Rules

- If deploy/runtime env requirements change, update `docs/runbooks/deployment.md` in the same task.
- If new baseline example values are needed for production-like local verification, update `.env.production.example` in the same task.
- If a setting changes user-visible behavior or system design, update the matching design doc in the same task rather than treating this page as the only source of truth.

---
doc_state: current
owner: architecture
last_verified: 2026-04-22
sources:
  - package.json
  - pnpm-workspace.yaml
  - apps/web/package.json
  - apps/web/src/lib/api-client.ts
  - apps/web/src/pages/workouts/new/index.tsx
  - apps/web/src/pages/settings/profile/index.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/lib/realtime-context.tsx
  - apps/web/src/pages/messages/[id]/index.tsx
  - apps/api/src/realtime/realtime.gateway.ts
  - apps/api/package.json
  - packages/database/package.json
  - packages/types/package.json
  - apps/api/src/app.module.ts
---

# Repo Structure

## Summary

`mastersrunners` is a pnpm monorepo with two deployable apps and two shared workspace packages.

## Workspace Layout

| Path                | Role                 | Current responsibility                                 |
| ------------------- | -------------------- | ------------------------------------------------------ |
| `apps/web`          | browser app          | Vite SPA, routing, client state, user-facing UI        |
| `apps/api`          | backend app          | NestJS HTTP API, auth, domain modules, Swagger, health |
| `packages/database` | shared infra package | Prisma schema, generated client, transaction typing    |
| `packages/types`    | shared types package | shared API-facing TypeScript types                     |

The workspace is defined in `pnpm-workspace.yaml` and orchestrated from the root `package.json`.

## Boundary Rules

- Feature behavior lives in `apps/web` or `apps/api`, not in the root.
- `packages/database` owns the Prisma client boundary. The API imports the client through `@masters/database`, not by generating its own Prisma client.
- `packages/types` is for shared type contracts only. It is not a runtime logic package.
- Root scripts coordinate install, build, lint, local CI approximation, and database commands across the workspace.

## Runtime Shape

The current runtime path is:

1. `apps/web` runs in the browser and mostly calls the API through `apps/web/src/lib/api-client.ts`.
2. `apps/api` exposes HTTP endpoints under `/api/v1`, except public health at `/health`.
3. `apps/api` talks to PostgreSQL through `DatabaseService` and the Prisma client exported from `@masters/database`.
4. The browser also owns some direct integration edges, including upload PUTs against presigned or disk endpoints and one shared realtime WebSocket for chat and notification updates.

## Current Constraints

- `packages/database/generated` is generated output and not editable source.
- `packages/types` is intentionally thin today. Most contract truth still lives in API DTOs, Prisma schema, and web hooks.
- The repo is a SPA + API split. Old Next.js residue may still exist in dependencies or artifacts, but it is not the active app architecture.
- Storage and realtime logic terminate inside API modules, but the browser still participates directly in upload flows and the shared realtime socket.

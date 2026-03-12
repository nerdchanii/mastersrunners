---
doc_state: current
owner: backend
last_verified: 2026-03-12
sources:
  - packages/database/package.json
  - packages/database/src/index.ts
  - packages/database/prisma/schema.prisma
  - apps/api/src/database/database.service.ts
  - apps/api/src/database/database.module.ts
  - apps/api/src/workouts/workouts.service.ts
  - apps/api/src/workouts/repositories/workout.repository.ts
  - apps/api/src/profile/profile.service.ts
---

# Persistence Model

## Summary

PostgreSQL persistence is centralized through Prisma in `packages/database`, and the API consumes that client through `DatabaseService`.

## Ownership

- `packages/database/prisma/schema.prisma` is the canonical relational model.
- `packages/database` builds and exports the Prisma client.
- `apps/api` does not define a separate ORM or duplicate schema layer.
- `DatabaseService` exposes the shared Prisma client as a global dependency.

## Current Data Shape

The schema currently concentrates multiple domains in one relational model:

- auth and accounts
- workouts, workout files, routes, laps, shoes
- posts and workout social interactions
- follow and block
- crews, attendance, boards, bans
- challenges and events
- conversations, messages, notifications

## Transaction Model

- persistence style is mixed: some domains go through repositories, while some services call `db.prisma` directly
- multi-record writes use Prisma transactions when needed
- transaction callback typing comes from `@masters/database`

## Current Constraints

- Generated client code under `packages/database/generated` is build output, not editable source.
- Most domain contracts still live close to Prisma models and Nest DTO/service logic. There is not yet a separate repository-wide domain-model package.

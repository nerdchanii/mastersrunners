---
doc_state: current
owner: backend
last_verified: 2026-03-12
sources:
  - apps/api/package.json
  - apps/api/src/main.ts
  - apps/api/src/app.module.ts
  - apps/api/src/database/database.module.ts
  - apps/api/src/common/filters/http-exception.filter.ts
  - apps/api/src/health/health.controller.ts
---

# API Runtime Boundary

## Summary

The backend is a single NestJS application with global config, validation, auth guard, throttling, and exception handling applied at the app boundary.

## Runtime Composition

- `main.ts` creates one Nest app with custom raw/json body parsing.
- CORS is enabled with explicit frontend URL allowance and localhost development exceptions.
- Validation uses a global `ValidationPipe` with `whitelist`, `transform`, and `forbidNonWhitelisted`.
- The API prefix is `/api/v1`, with `GET /health` intentionally excluded.
- Swagger is mounted at `/api-docs`.

## Module Boundary

`AppModule` assembles feature modules directly:

- auth
- feed
- workouts and workout types
- shoes
- posts and social interactions
- profile, follow, block
- crews, crew boards
- challenges, events
- uploads
- conversations and notifications
- health

`DatabaseModule` is global and exports `DatabaseService`, so feature modules do not own separate ORM clients.

## Cross-Cutting Guards and Filters

- `JwtAuthGuard` is a global app guard.
- `ThrottlerGuard` is also global.
- `AllExceptionsFilter` normalizes `HttpException` and common Prisma errors into one response shape.

## Current Constraints

- The repo does not yet publish a formal module-boundary or dependency-direction check.
- Feature modules are all loaded in one process; there is no internal service split or queue worker process in the current repo.

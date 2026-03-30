---
doc_state: target
owner: backend
last_verified: 2026-03-30
sources:
  - apps/api/package.json
  - apps/api/src/main.ts
  - apps/api/src
  - packages/database/prisma/schema.prisma
---

# Backend Conventions

This document defines the preferred backend coding style for `apps/api`. Some modules still diverge. Fix those gaps with follow-up tasks rather than lowering this design.

## Layering

- Controllers are transport boundaries only.
- Business rules belong in services.
- Persistence access belongs behind repositories or explicit persistence boundaries.
- Controllers must not call Prisma directly.

## DTO and Validation

- Request DTOs use `class-validator` and `class-transformer`.
- Validation stays at the transport boundary.
- Controllers should accept DTOs or explicit transport contracts instead of inline `@Body("field")` extraction or ad hoc string query parsing.
- Domain services should receive already-validated inputs or clear internal contracts.

## Service Shape

- Large services should act as orchestration facades over narrower internal services.
- Split membership, activity, tagging, storage, or feed concerns when one service becomes a hotspot.
- Keep cross-module calls explicit and minimal.

## External Dependencies

- S3/R2, disk storage, Redis, and similar integrations should be hidden behind adapters or boundary services.
- Avoid spreading vendor-specific calls across unrelated services.

## Error and Auth Patterns

- Reuse shared guards, filters, and decorators before inventing module-local variants.
- Keep API contract, auth, validation, and failure handling consistent with NestJS module boundaries.

## Naming

- Prefer responsibility-driven names such as `crew-membership.service.ts` or `notification.repository.ts`.
- Avoid generic names that hide the boundary, such as `helpers.ts` or `manager.ts`.

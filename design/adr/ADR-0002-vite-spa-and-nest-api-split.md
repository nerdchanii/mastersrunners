# ADR-0002: Use a Vite SPA plus a separate NestJS API

## Status

Accepted

## Date

2026-03-12

## Context

The product is implemented as a browser-first web app and a separate API/runtime layer. The repository already contains:

- `apps/web` as a Vite + React SPA
- `apps/api` as a NestJS API with Swagger, auth, validation, and health checks
- shared types and database packages in `packages/`

The harness needs this split documented because framework and deployment choices affect routing, auth flow, data fetching, testing, and where agents should place code.

## Decision

Keep the product split as:

- `apps/web`: Vite + React SPA with React Router
- `apps/api`: NestJS API
- shared contracts in `packages/types`
- shared data model in `packages/database`

The SPA remains client-rendered. Server-side rendering and full-stack framework conventions are not the current source of truth for this repository.

## Alternatives Considered

- Move the frontend to Next.js as the active app model
  - Rejected because the implemented repository is a Vite SPA and old `.next` artifacts are not the active source of truth.
- Collapse frontend and backend into a single full-stack framework runtime
  - Rejected because the current boundary, deployment shape, and harness structure already assume separate browser and API applications.
- Keep framework choice implicit in code only
  - Rejected because agents repeatedly need an explicit statement that the frontend is not an active Next.js app.

## Consequences

- Frontend routing and data-loading decisions stay SPA-oriented.
- Backend concerns such as auth, validation, persistence, and realtime transport stay in NestJS modules.
- Shared contracts remain explicit rather than hidden in one app runtime.
- Future framework migrations would require a superseding ADR rather than ad hoc drift.

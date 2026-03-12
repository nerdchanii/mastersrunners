---
doc_state: current
owner: backend
last_verified: 2026-03-12
sources:
  - apps/api/package.json
  - apps/api/src/main.ts
  - apps/api/src/app.module.ts
  - apps/api/src/auth/auth.module.ts
---

# Backend Design

Use this folder for backend-specific design decisions and intended service architecture.

Belongs here:

- API boundary design
- module responsibilities
- auth and authorization design
- file upload and storage flow
- background processing or integration boundaries

Does not belong here:

- raw test output
- one-off debugging notes
- deployment procedures

Current docs:

- `api-runtime-boundary.md`
- `auth-session.md`
- `conventions.md`
- `crew-platform.md`
- `events-challenges.md`
- `messaging-realtime.md`
- `persistence-model.md`
- `social-feed-notifications.md`
- `upload-ingestion.md`

## Public Boundary Map

- runtime and cross-cutting app boundary
  - `api-runtime-boundary.md`
- auth, token, and session contract
  - `auth-session.md`
- persistence ownership and schema boundary
  - `persistence-model.md`
- upload/storage adapter boundary
  - `upload-ingestion.md`
- social feed, interactions, and notifications boundary
  - `social-feed-notifications.md`
- direct messaging and SSE boundary
  - `messaging-realtime.md`
- crews, boards, and attendance boundary
  - `crew-platform.md`
- events, registrations, results, and challenges boundary
  - `events-challenges.md`

## Current Module Boundary Rules

- Controllers expose transport boundaries and pagination limits.
- Services own orchestration and authorization checks.
- Repositories or adapters own persistence and vendor-specific calls.
- External dependencies should stay behind explicit seams such as:
  - `StorageAdapter`
  - repository classes
  - SSE fan-out services

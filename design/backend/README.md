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
- `persistence-model.md`
- `upload-ingestion.md`

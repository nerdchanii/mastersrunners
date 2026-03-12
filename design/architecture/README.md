---
doc_state: current
owner: architecture
last_verified: 2026-03-12
sources:
  - package.json
  - pnpm-workspace.yaml
  - apps/web/src/main.tsx
  - apps/api/src/main.ts
  - apps/api/src/app.module.ts
---

# Architecture Design

Use this folder for cross-cutting technical design that affects multiple parts of the system.

Examples:

- repo structure and boundaries
- deployment architecture
- auth/session architecture
- storage architecture
- data flow across web, API, and database

Current docs:

- `repo-structure.md`
- `auth-session.md`
- `storage-realtime-data-flow.md`
- `deployment.md`

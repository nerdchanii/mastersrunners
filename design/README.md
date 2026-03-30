# Design Docs

`design/` stores the intended technical structure of the system.

Use this area for:

- frontend design
- backend design
- system architecture
- architectural decisions
- large change initiatives

Do not use this area for:

- operational runbooks
- QA reports
- progress logs
- release notes
- temporary work notes

## Structure

- `architecture/`: system-wide structure, boundaries, deployment architecture
- `frontend/`: UI architecture, routing, client data flow, component conventions
- `backend/`: API, module boundaries, auth, storage, integration design
- `adr/`: architecture decision records for durable technical choices
- `initiatives/`: large change framing, scope, and task decomposition
- `operating-rules/`: repository-wide harness rules such as document-state, exception, and commit policies

## Relationship to Other Folders

- `docs/domain/` holds business/domain rules
- `docs/runbooks/` holds operational guidance
- `tasks/` holds execution state

## Authoring Order

Use this sequence when a change spans multiple docs:

1. Create or update an initiative in `initiatives/` if the change is larger than one task.
2. Create tasks under `tasks/todo/` and keep the initiative `Task Breakdown` aligned.
3. Update the relevant design doc in `architecture/`, `frontend/`, or `backend/` as the technical source of truth.
4. Record a new ADR in `adr/` only when the change introduces a durable architectural decision worth preserving separately.

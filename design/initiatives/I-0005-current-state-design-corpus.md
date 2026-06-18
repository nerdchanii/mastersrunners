# I-0005: Current-State Design Corpus

## Summary

Populate `design/frontend`, `design/backend`, and `design/architecture` with current-state technical design docs grounded in code, then sync conflicting `docs/domain` material.

## Problem

Most durable design knowledge still lives in transitional phase plans, `.omc` notes, or code only. That keeps documentation, source-of-truth, and architecture scores below target.

## Goals

- create a current-state design corpus for frontend, backend, and architecture
- sync stale `docs/domain` documents against code and schema
- seed the first real ADRs required by the new scoring model

## Non-Goals

- introducing new product features
- complete readability refactors
- full operational hardening

## Scope

- `design/frontend/`
- `design/backend/`
- `design/architecture/`
- `design/adr/`
- `docs/domain/`

## Design References

- `design/operating-rules/document-states.md`
- `docs/reports/history/`
- `.omc/` legacy sources (salvage-only)

## Review Plan

- frontend docs: frontend review
- backend/runtime docs: backend review
- cross-cutting architecture/doc-boundary changes: workflow review
- PO review checks whether the design corpus reflects the implemented product rather than aspirational future scope

## Task Breakdown

- `tasks/archive/I-0005-010-architecture-repo-runtime-foundation.md`
- `tasks/archive/I-0005-020-web-frontend-foundation.md`
- `tasks/archive/I-0005-030-web-social-workout-design.md`
- `tasks/archive/I-0005-040-web-crew-events-design.md`
- `tasks/archive/I-0005-050-api-backend-foundation.md`
- `tasks/archive/I-0005-060-api-domain-feature-design.md`
- `tasks/archive/I-0005-070-docs-domain-sync-pack.md`
- `tasks/archive/I-0005-080-meta-adr-seed-pack.md`

## Success Criteria

- the required frontend/backend/architecture docs exist with current-state frontmatter
- domain docs no longer contradict code/schema on the known stale concepts
- historical planning material and `.omc` stop being needed to understand current implementation shape

## Progress Notes

- `I-0005-010`, `I-0005-020`, and `I-0005-050` established the architecture, frontend, and backend foundation docs.
- `I-0005-030` and `I-0005-040` now complete the current-state frontend corpus for social/profile, workouts, crews, events, and challenges.
- `I-0005-060` now adds backend feature-boundary docs for social/feed, messaging, crews, and events/challenges, and expands the backend boundary index.
- `I-0005-070` now syncs canonical domain docs to the current schema and design corpus, removing stale phase-era model names.
- `I-0005-080` seeded the first accepted ADR pack.
- `I-0005` is now landed; `design/` and `docs/domain/` should be the primary durable references instead of `.omc` or archived plans.

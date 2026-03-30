# I-0011: Domain Truth and Boundary Hardening

## Summary

Restore `docs/domain/` as a reliable current-state source of truth, then turn the most repeated frontend/backend boundary violations into explicit execution tasks instead of leaving them as convention-only debt.

## Problem

The repository now has a strong design corpus, but several high-value domain docs have drifted away from the schema and implemented behavior. At the same time, the live task queue is empty even though `TBD` domain surfaces, route-fetch debt, controller transport shortcuts, and service-layer boundary drift are still visible in the codebase.

## Goals

- normalize `docs/domain/` to the repository-wide `current` or `target` document-state model
- resync the most drifted domain rules against schema, API behavior, and implemented UI
- convert open `TBD` and drift into concrete live tasks instead of leaving them implicit
- harden the frontend route-fetch boundary and API transport/persistence boundaries with explicit follow-up work
- make programming-rule additions concrete enough to review and enforce

## Non-Goals

- landing the full docs sync and boundary refactor in one changeset
- introducing new product features or future-state behavior
- weakening approved design docs to match incomplete implementation

## Scope

- `docs/domain/`
- `design/operating-rules/document-states.md`
- `scripts/check-doc-frontmatter.sh`
- `tasks/todo/`
- `apps/web/src/pages/`
- `apps/api/src/`

## Design References

- `design/operating-rules/document-states.md`
- `design/frontend/conventions.md`
- `design/backend/conventions.md`
- `design/backend/events-challenges.md`
- `design/backend/upload-ingestion.md`
- `tasks/README.md`
- `docs/guides/review-harness.md`

## Review Plan

- docs and state-normalization tasks: `docs-reviewer` plus `harness-reviewer` or `backend-reviewer` as needed
- frontend boundary work: `frontend-reviewer` plus `refactor-reviewer` and `harness-reviewer` where the rule surface changes
- backend boundary work: `backend-reviewer` plus `architecture-reviewer`, with `harness-reviewer` when rule or logging policy changes
- PO review checks whether the backlog restores trustworthy current-state docs and turns repeated engineering debt into actionable tasks

## Task Breakdown

- `tasks/archive/I-0011-005-meta-backlog-seed.md`
- `tasks/archive/I-0011-010-meta-domain-doc-state-normalization.md`
- `tasks/archive/I-0011-020-docs-challenge-current-sync.md`
- `tasks/archive/I-0011-030-docs-social-profile-messaging-integration-sync.md`
- `tasks/archive/I-0011-040-docs-delete-lifecycle-matrix.md`
- `tasks/archive/I-0011-050-web-route-fetch-boundary-enforcement.md`
- `tasks/archive/I-0011-060-api-transport-boundary-hardening.md`
- `tasks/archive/I-0011-070-api-persistence-and-runtime-logging-boundary.md`

## Success Criteria

- `docs/domain/` no longer mixes current truth and future intent without explicit document state
- the highest-risk domain docs are resynced against schema and implemented behavior
- open `TBD` and divergence are represented by live tasks or explicit exceptions
- frontend and backend boundary debt has concrete, review-routed follow-up tasks instead of only abstract convention text

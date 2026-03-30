---
id: I-0005-010
title: Write architecture repo and runtime foundation docs
parent: I-0005-current-state-design-corpus
scope: docs
owner: codex
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0004-010
blocked_by: []
verify:
  - bash scripts/check-doc-frontmatter.sh
artifacts:
  - design/architecture/repo-structure.md
  - design/architecture/auth-session.md
  - design/architecture/storage-realtime-data-flow.md
---

## Goal

Document the repo boundary, auth/session runtime, and storage/realtime flow as current-state architecture docs.

## Done Criteria

- required architecture docs exist with current-state frontmatter
- docs are grounded in code and legacy sources are cited as salvage-only inputs

## Notes

- This task should not migrate feature-level frontend/backend detail yet.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- These docs unblock the frontend/backend design packs and guardrail boundary rules.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: added current-state architecture docs for repo structure, auth/session, and storage/realtime data flow; pending specialist and PO review.

## Review Notes

- Specialist review: harness-reviewer approved after removing repo-unproven web hosting and Redis assumptions, documenting browser-owned upload/SSE edges, and correcting conversation SSE wording so it no longer implies true group-chat fan-out. backend-reviewer also passed the architecture pack with no blockers.
- PO review: accepted after the docs stopped over-normalizing current boundaries and accurately exposed the remaining drift risk around realtime and host-level architecture.

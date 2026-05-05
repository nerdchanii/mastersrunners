---
id: I-0005-050
title: Write backend runtime and persistence foundation docs
parent: I-0005-current-state-design-corpus
scope: docs
owner: codex
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0005-010
blocked_by: []
verify:
  - bash scripts/check-doc-frontmatter.sh
artifacts:
  - design/backend/api-runtime-boundary.md
  - design/backend/auth-session.md
  - design/backend/persistence-model.md
  - design/backend/upload-ingestion.md
---

## Goal

Create the backend foundation docs for runtime behavior, auth/session, persistence, and upload/ingestion.

## Done Criteria

- required backend foundation docs exist with current-state frontmatter
- runtime docs match code, not future intent

## Notes

- Redis-backed future ideas must be marked target-state elsewhere, not mixed into current docs.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Backend feature-design tasks should assume this foundation exists.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: added current-state backend foundation docs for runtime boundary, auth/session, persistence, and upload/ingestion; pending specialist and PO review.

## Review Notes

- Specialist review: backend-reviewer passed after the docs distinguished bearer JWT vs SSE auth, documented stateless refresh and dev-login, clarified mixed repository/direct Prisma usage, and separated shared upload boundaries from workout-specific ingestion. harness-reviewer also passed after the auth-session source grounding was corrected and the pack remained current-state accurate.
- PO review: accepted. The remaining risk is documentation drift rather than hidden current-state traps.

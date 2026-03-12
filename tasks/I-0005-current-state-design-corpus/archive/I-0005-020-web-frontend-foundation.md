---
id: I-0005-020
title: Write frontend foundation design docs
parent: I-0005-current-state-design-corpus
scope: docs
owner: codex
reviewers:
  - frontend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0005-010
blocked_by: []
verify:
  - bash scripts/check-doc-frontmatter.sh
artifacts:
  - design/frontend/README.md
  - design/frontend/app-shell-routing.md
  - design/frontend/client-data-state.md
  - design/frontend/ui-system.md
---

## Goal

Create the core frontend design docs that define routing, state/data flow, and UI system contracts.

## Done Criteria

- required frontend foundation docs exist with current-state frontmatter
- direct legacy-plan references are replaced by current source docs

## Notes

- Known exception pages may remain but must be listed explicitly in `client-data-state.md`.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Later frontend feature-design tasks should build on this foundation rather than restating it.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: added current-state frontend foundation docs for routing, client data/state, and UI system; pending specialist and PO review.

## Review Notes

- Specialist review: frontend-reviewer passed after the docs broadened direct-fetch exceptions, noted page-local auth/bootstrap duplication, and documented duplicate DM SSE subscriptions. harness-reviewer also passed after the source list and exception wording were tightened to stay explicitly current-state and non-exhaustive.
- PO review: accepted. Remaining risk is drift in the illustrative exception list, not misleading current-state claims.

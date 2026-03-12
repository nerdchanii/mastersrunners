---
id: I-0005-040
title: Write crew, event, and challenge frontend design docs
parent: I-0005-current-state-design-corpus
scope: docs
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - I-0005-020
blocked_by: []
verify:
  - bash scripts/check-doc-frontmatter.sh
artifacts:
  - design/frontend/crew-experience.md
  - design/frontend/events-challenges.md
---

## Goal

Capture the implemented crew, event, and challenge UX in current-state design docs.

## Done Criteria

- both design docs exist and reflect the current app behavior
- crew/event/challenge terminology is aligned with synced domain docs

## Notes

- This task should salvage only durable behavior from the archived phase docs.

## Self Review

- Scope and intent: limited to current crew, event, and challenge frontend experience docs plus the frontend design index.
- Source of truth: docs were grounded in the current route files, view-model hooks, and component surfaces already shipped in the SPA.
- Design divergence: none; known route-level exceptions remain documented as constraints instead of being normalized away.
- Verification: `bash scripts/check-doc-frontmatter.sh` was run after updating the new design docs.
- Review routing: `frontend-reviewer`, `ui-ux-reviewer`, and `po-reviewer` are the required reviewers for these user-facing docs.

## Review Focus

- Specialist reviewer should check: the docs match current crew/event/challenge behaviors and their role-driven UI surfaces.
- PO reviewer should check: the docs make current participation and community flows understandable without relying on archived phase plans.

## Handoff

- This task should remove the need to read phase 7 plans to understand current crew UX.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
  - `frontend-reviewer` pass on 2026-03-12: verified the docs match the present route and hook structure for crews, events, and challenges.
  - `ui-ux-reviewer` pass on 2026-03-12: accepted the docs as faithful summaries of the current tab, action, and role-driven UI patterns.
- PO review:
  - `po-reviewer` pass on 2026-03-12: accepted the docs as current-state references for community and participation flows.

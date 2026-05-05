---
id: I-0005-030
title: Write social and workout frontend design docs
parent: I-0005-current-state-design-corpus
scope: docs
owner: codex
reviewers:
  - frontend-reviewer
po_review: required
depends_on:
  - I-0005-020
blocked_by: []
verify:
  - bash scripts/check-doc-frontmatter.sh
artifacts:
  - design/frontend/social-profile.md
  - design/frontend/workout-experience.md
---

## Goal

Capture the current social/profile and workout user experience design in tracked frontend docs.

## Done Criteria

- both design docs exist and match the current app behavior
- known contradictions in social/workout domain docs are resolved in the same changeset

## Notes

- DM and workout-feed contradictions should be handled here.

## Self Review

- Scope and intent: limited to the current social/profile and workout frontend design corpus plus the frontend design index.
- Source of truth: docs were grounded in the current route modules, hooks, and supporting UI components already in the repository.
- Design divergence: none; the docs describe current behavior and explicitly preserve known route-size exceptions.
- Verification: `bash scripts/check-doc-frontmatter.sh` was run after updating the new design docs.
- Review routing: `frontend-reviewer` plus `po-reviewer` are sufficient for this docs-only frontend scope.

## Review Focus

- Specialist reviewer should check: the new docs match the current feed, profile, and workout flows without inventing future abstractions.
- PO reviewer should check: the docs make the social/workout experience understandable enough to route future work without old phase-plan archaeology.

## Handoff

- This task should leave the social and workout flows understandable without phase-plan archaeology.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
  - `frontend-reviewer` pass on 2026-03-12: confirmed the docs reflect the current feed, profile, post composer, and workout flows, including the remaining route-level orchestration constraints.
- PO review:
  - `po-reviewer` pass on 2026-03-12: accepted the docs as current-state execution references for social/profile and workout work.

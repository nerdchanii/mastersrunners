---
id: I-0014-120
title: Rebuild the empty feed with explore modules and recommendation slots
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/components/feed/FeedSidebar.tsx
  - design/frontend/app-shell-routing.md
---

## Goal

Turn the empty feed into an exploration surface that can later host recommendation logic without leaving new users at a dead end.

## Done Criteria

- cold-start users see follow suggestions or exploration modules instead of a dead-end empty state
- the empty-feed layout reserves clear recommendation-ready slots without pretending the algorithm already exists
- mobile home remains useful even with no followed content

## Notes

- Execution mode: requires product checkpoint before implementation.
- Product checkpoint topics: what exploration modules are allowed before recommendation ranking exists, and what success looks like for cold-start users.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the empty feed becomes actionable without bloating the home surface.
- PO reviewer should check: the exploration modules match the intended recommendation-readiness direction.

## Handoff

- Keep future recommendation work additive by reusing the reserved module boundaries from this task.

## Design Divergence

- The current feed empty state does not support discovery or recommendation-readiness.

## Attempt Log

- 2026-04-01: created after product asked for a recommendation-ready empty home and follow exploration.

## Review Notes

- Specialist review:
- PO review:

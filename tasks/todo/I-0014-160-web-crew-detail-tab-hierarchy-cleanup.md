---
id: I-0014-160
title: Rebuild crew detail tab hierarchy for faster scanning
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
  - pnpm --filter @masters/web exec playwright test e2e/crew-boards.spec.ts e2e/crew-posts.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/components/crew/
  - design/frontend/crew-experience.md
---

## Goal

Improve the information hierarchy on crew detail so members can scan activities, chat, posts, stats, and moderation areas without tab overload.

## Done Criteria

- crew detail navigation hierarchy is clearer than the current flat tab strip
- high-frequency member areas and lower-frequency admin areas are visually differentiated
- icon or grouping use improves scanning without hiding important destinations

## Notes

- Execution mode: requires product checkpoint before implementation.
- Product checkpoint topics: preferred grouping order for members vs admins and which destinations deserve primary prominence.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the new hierarchy improves scanning and reduces clutter without harming reachability.
- PO reviewer should check: the destination order and grouping match intended crew priorities.

## Handoff

- If moderation surfaces later move into a separate admin mode, keep the grouping rules established here.

## Design Divergence

- Current crew detail navigation is too flat for the number of destinations it exposes.

## Attempt Log

- 2026-04-01: created after product requested a clearer crew detail hierarchy and possible icon-led scanning.

## Review Notes

- Specialist review:
- PO review:

---
id: I-0014-130
title: Add shareable crew invite URL entry points
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/settings/index.tsx
  - apps/api/src/crews/
  - design/frontend/crew-experience.md
---

## Goal

Let crew operators invite members through a shareable crew URL instead of relying on hidden or manual invite flows.

## Done Criteria

- crews expose a discoverable invite/share action
- the invite flow can be expressed as a stable URL
- the first version handles the permission and destination rules cleanly

## Notes

- Execution mode: autonomous unless the final invite-auth rules require a narrower product checkpoint.
- Keep this task on invite URL entry and shareability, not on broader crew settings cleanup.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: invite URLs are safe, understandable, and fit the current crew permission model.
- PO reviewer should check: the invite flow is easier than the current state and matches crew-growth expectations.

## Handoff

- If crew join policy later expands, reuse the invite URL structure instead of inventing a second invite surface.

## Design Divergence

- Current crew surfaces do not provide an obvious invite-by-URL flow.

## Attempt Log

- 2026-04-01: created after product requested a crew URL share/invite workflow.

## Review Notes

- Specialist review:
- PO review:

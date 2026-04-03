---
id: I-0016-030
title: Align consumer web copy and auth prompts with the new UX rules
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-010-meta-web-ux-guardrail-foundation.md
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/frontend/writing-and-copy.md
  - design/frontend/ux-principles.md
---

## Goal

Remove remaining explanation-heavy, demo-like, or over-instructional copy from consumer web surfaces and align auth prompt wording with action-boundary UX.

## Done Criteria

- remaining copy on targeted routes follows the writing rules
- auth prompts read as action-specific utility copy rather than generic service persuasion

## Notes

- Expected focus areas include empty states, auth modals, and surface-level helper copy on public and social routes.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- If a route still needs explanatory copy to remain understandable, record why the layout alone is not sufficient.

## Design Divergence

- Record any remaining copy exception here.

## Attempt Log

- 2026-04-03: seeded from `I-0016-010`.

## Review Notes

- Specialist review:
- PO review:

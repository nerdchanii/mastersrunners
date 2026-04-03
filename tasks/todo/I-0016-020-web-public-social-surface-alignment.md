---
id: I-0016-020
title: Align remaining public social surfaces with the UX guardrail contract
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
  - design/frontend/social-surface-patterns.md
  - design/frontend/ux-principles.md
---

## Goal

Apply the new public social UX contract to remaining user-facing routes that still drift from the documented read-versus-participate patterns.

## Done Criteria

- remaining public social routes follow the documented gating and back-navigation rules
- any still-protected reads are called out explicitly as temporary divergence

## Notes

- Expected focus areas include public profile reads and any remaining route-local auth redirects on public tree pages.

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

- Record unresolved route exceptions explicitly instead of treating them as silent defaults.

## Design Divergence

- Record any remaining public-route mismatch here.

## Attempt Log

- 2026-04-03: seeded from `I-0016-010`.

## Review Notes

- Specialist review:
- PO review:

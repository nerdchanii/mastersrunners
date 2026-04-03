---
id: I-0016-040
title: Expand UX guardrail checks beyond the first-wave baseline
parent: I-0016-design-system-and-ux-guardrails
scope: meta
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - harness-reviewer
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
  - apps/web/e2e/ux-contract.spec.ts
  - scripts/check-ux-copy-patterns.mjs
  - docs/runbooks/ui-ux-guardrail-review.md
---

## Goal

Widen the UX automation baseline after the first-wave rules prove stable and low-noise.

## Done Criteria

- Playwright UX contracts cover more public routes and more modal/back-navigation cases
- static copy checking covers more banned phrase classes without high false-positive noise

## Notes

- Keep the checker narrow enough that teams do not have to fight the automation to do normal product work.

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

- Prefer expanding high-signal rules over adding many taste-based style bans.

## Design Divergence

- Record any known false positives or intentionally unguarded gaps here.

## Attempt Log

- 2026-04-03: seeded from `I-0016-010`.

## Review Notes

- Specialist review:
- PO review:

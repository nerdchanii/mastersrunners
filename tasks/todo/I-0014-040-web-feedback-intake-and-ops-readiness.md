---
id: I-0014-040
title: Add lightweight user feedback intake before backoffice
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
  - pnpm --filter @masters/api test
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/router.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/components/common/BottomNav.tsx
  - apps/api/src/
  - design/frontend/app-shell-routing.md
  - docs/reports/i-0014-ui-bug-board.md
---

## Goal

Ship an in-product feedback intake path so users can submit bug reports and improvement requests before a dedicated staff backoffice exists.

## Done Criteria

- authenticated users can reach a feedback entry surface from a stable, discoverable location
- the first version collects structured feedback with clear submission confirmation
- submissions land in a durable sink that future operator tooling can read
- failure, retry, and empty-form states are explicitly handled

## Notes

- Execution mode: autonomous unless storage or policy questions force a narrower product checkpoint.
- Submission comes first; staff review tooling can follow in a separate task.
- Keep the first version lightweight, but do not make it disposable or chat-only.
- If data storage is introduced, document the contract and reviewer scope in the same task.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the intake is easy to find, easy to submit, and stores durable data safely.
- PO reviewer should check: the intake captures the minimum bug/feedback information needed for product follow-up.

## Handoff

- A future backoffice task should read the same feedback stream instead of forking a second intake path.

## Design Divergence

- The current product has no feedback intake route or API surface.
- Add the intake path through implementation rather than treating external chat as an acceptable permanent substitute.

## Attempt Log

- 2026-04-01: created after product review requested user bug-report submission before any backoffice buildout.

## Review Notes

- Specialist review:
- PO review:

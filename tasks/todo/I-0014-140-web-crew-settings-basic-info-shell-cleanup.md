---
id: I-0014-140
title: Flatten crew settings basic-info shells and trim form chrome
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
  - apps/web/src/pages/crews/[id]/settings/index.tsx
  - apps/web/src/components/crew/CrewForm.tsx
  - design/frontend/crew-experience.md
---

## Goal

Remove the card-inside-card crew settings treatment and simplify basic-info form chrome such as excessive labels and required markers.

## Done Criteria

- crew settings no longer present nested generic cards in the basic-info area
- labels, helper copy, and required indicators are trimmed to what actually improves form comprehension
- the resulting form still remains accessible and understandable on mobile

## Notes

- Execution mode: autonomous.
- Keep this task on shell cleanup and form chrome only; crew media fields and tab hierarchy have separate tasks.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the form feels flatter and cleaner without reducing clarity.
- PO reviewer should check: the settings screen no longer looks like “card inside card” UI.

## Handoff

- Crew media and hierarchy tasks should reuse this flatter settings shell rather than reintroducing wrapper cards.

## Design Divergence

- Current crew settings still stack a page shell and a `CrewForm` card on top of each other.

## Attempt Log

- 2026-04-01: created after product called out nested cards and unnecessary form chrome in crew settings.

## Review Notes

- Specialist review:
- PO review:

---
id: I-0004-020
title: Clean root and docs entrypoints
parent: I-0004-truth-model-cleanup
scope: docs
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0004-010
blocked_by: []
verify:
  - rg -n "phase7-plan|I-0002-060" README.md AGENTS.md docs/README.md docs/reports/README.md
artifacts:
  - README.md
  - AGENTS.md
  - docs/README.md
  - docs/reports/README.md
---

## Goal

Remove stale references from the root and docs entrypoints so new readers land on the current harness structure.

## Done Criteria

- root/docs entrypoints no longer point at archived warning debt or old phase plans as the main status source
- entrypoints mention the scorecard and operating-rules layer

## Notes

- This is a truth-model change, not a design-corpus migration.

## Review Focus

- Specialist reviewer should check: the new entrypoints reduce ambiguity and align with the repo’s real source-of-truth map.
- PO reviewer should check: the entrypoint cleanup improves onboarding without hiding still-open work.

## Handoff

- Future initiatives should update these entrypoints only when the source-of-truth map changes.

## Attempt Log

- 2026-03-12: refreshed the root/doc entrypoints to point at the checklist, operating-rules, and current initiatives rather than stale phase status notes.

## Review Notes

- Specialist review: harness-reviewer and docs-reviewer confirmed the entrypoints now point to current harness layers, with remaining env/config work explicitly routed to I-0004-060 instead of stale archived tasks.
- PO review: accepted once the cleanup stopped overstating completeness and preserved a clear path for remaining onboarding gaps.

---
id: I-0005-080
title: Seed the first real ADR pack
parent: I-0005-current-state-design-corpus
scope: docs
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0005-010
blocked_by: []
verify:
  - find design/adr -maxdepth 1 -type f | sort
artifacts:
  - design/adr/
---

## Goal

Replace the ADR template-only state with the first accepted architectural decisions required by the harness scorecard.

## Done Criteria

- the first four ADRs exist and are accepted
- ADRs explain decision, drivers, alternatives, consequences, and follow-ups

## Notes

- ADRs should match current implemented decisions.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Future score-math or source-of-truth changes should require ADR updates.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

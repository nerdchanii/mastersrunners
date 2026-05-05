---
id: I-0004-010
title: Add canonical scorecard and document-state rules
parent: I-0004-truth-model-cleanup
scope: docs
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - test -f design/operating-rules/document-states.md
artifacts:
  - design/operating-rules/document-states.md
---

## Goal

Create the in-repo checklist registry, scored snapshot format, and document-state rules that the 90% program will use.

## Done Criteria

- checklist authority and score math live in one tracked doc
- scorecard rows can point to durable exceptions by ID
- document-state rules define `current` vs `target` and ban `mixed`

## Notes

- This task defines the scoring system, not the full migration itself.

## Review Focus

- Specialist reviewer should check: score math, document-state rules, and authority boundaries are explicit enough to avoid future drift.
- PO reviewer should check: the scoring system is useful for delivery prioritization rather than bureaucratic noise.

## Handoff

- Later tasks should update `harness-scorecard.md` instead of inventing their own scoring language.

## Attempt Log

- 2026-03-12: created canonical checklist and score snapshot docs, plus document-state rules under `design/operating-rules/`.

## Review Notes

- Specialist review: harness-reviewer and docs-reviewer flagged score snapshot math drift and archive-task pointers during review; the scorecard totals, live follow-up tasks, and legacy source warnings were corrected before acceptance.
- PO review: accepted after the score model was made internally consistent and the governance rule was softened so ADRs are only required for material scoring-model changes.

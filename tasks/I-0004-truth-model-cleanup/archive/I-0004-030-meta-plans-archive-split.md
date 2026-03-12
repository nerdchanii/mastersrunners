---
id: I-0004-030
title: Split docs plans into archive and report classes
parent: I-0004-truth-model-cleanup
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-010
blocked_by: []
verify:
  - test -d docs/plans/archive
  - test -f docs/reports/pre-phase5-fixes.md
  - test -f docs/reports/phase6-qa-report.md
artifacts:
  - docs/plans/README.md
  - docs/plans/archive/
  - docs/reports/pre-phase5-fixes.md
  - docs/reports/phase6-qa-report.md
---

## Goal

Make `docs/plans/` clearly legacy-oriented by introducing archive/report boundaries.

## Done Criteria

- report-like docs live under `docs/reports/`
- historical phase/decision docs are archived under `docs/plans/archive/`
- remaining root `docs/plans/` content is explicitly treated as migration input, not current source of truth

## Notes

- The cross-cutting crew design doc remains a migration input until I-0005 extracts it.

## Review Focus

- Specialist reviewer should check: plan/report/archive boundaries are consistent and do not strand current readers without a path to the right docs.
- PO reviewer should check: history is preserved while current work is still understandable.

## Handoff

- I-0005 should extract durable design from archived plan material and then reduce further reliance on `docs/plans/`.

## Attempt Log

- 2026-03-12: introduced `docs/plans/archive/`, moved report-like docs to `docs/reports/`, and marked remaining plan files as migration-only legacy inputs.

## Review Notes

- Specialist review: docs-reviewer requested repaired links inside archived plans and an in-file legacy banner on `docs/plans/crew-system-v2-design.md`; both were added before acceptance.
- PO review: accepted after open release-history work was moved to live follow-up task I-0004-070 instead of pointing readers at archived cleanup tasks.

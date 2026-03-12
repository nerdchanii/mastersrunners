---
id: I-0004-070
title: Add release-history home for reports and milestones
parent: I-0004-truth-model-cleanup
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-030
blocked_by: []
verify:
  - test -f docs/reports/README.md
artifacts:
  - docs/reports/README.md
  - docs/plans/README.md
---

## Goal

Create a durable release-history and milestone index so scorecard readers do not rely on archived plan files directly.

## Done Criteria

- `docs/reports/README.md` explains where release notes, QA reports, and milestone summaries live
- scorecard and entry docs can point to a live release-history home instead of archived cleanup tasks

## Notes

- This does not require a full conventional changelog. It needs a stable repository home for release-history evidence.

## Review Focus

- Specialist reviewer should check: the release-history home is durable and does not blur archived plans with current guidance.
- PO reviewer should check: the repository preserves milestone history in a way that is useful for delivery tracking.

## Handoff

- Later reporting or release automation tasks should extend the release-history home rather than reintroducing ad hoc history docs.

## Attempt Log

- 2026-03-12: created as follow-up when the scorecard still marked release-history coverage as open after the archive/report split.

## Review Notes

- Specialist review:
- PO review:

# I-0004: Truth-Model Cleanup

## Summary

Establish the canonical scoring, document-state, and exception system so the repository can measure progress toward a 90% harness target without relying on ad hoc interpretation.

## Problem

The repository has a useful harness shape, but score math, exception handling, source-of-truth boundaries, and legacy-document retirement rules are not yet fixed in-repo.

## Goals

- define one authoritative checklist registry and one scored snapshot format
- define document-state and exception rules
- remove stale entrypoint references
- make `docs/plans/` and `.omc` clearly legacy-only

## Non-Goals

- completing the full design corpus migration
- adding all future CI/guardrail tooling
- refactoring large code files

## Scope

- `docs/checklists/`
- `design/operating-rules/`
- `README.md`
- `AGENTS.md`
- `docs/README.md`
- `docs/plans/README.md`
- `docs/plans/archive/`
- `docs/reports/`

## Design References

- `AGENTS.md`
- `docs/README.md`
- `design/README.md`

## Review Plan

- Harness/process changes: `harness-reviewer`
- Human-facing entrypoints and doc boundaries: `docs-reviewer`
- PO review checks whether the new truth model reduces ambiguity without making routine work heavier than necessary

## Task Breakdown

- `tasks/I-0004-truth-model-cleanup/archive/I-0004-010-meta-scorecard-and-doc-states.md`
- `tasks/I-0004-truth-model-cleanup/archive/I-0004-020-meta-entrypoint-cleanup.md`
- `tasks/I-0004-truth-model-cleanup/archive/I-0004-030-meta-plans-archive-split.md`
- `tasks/I-0004-truth-model-cleanup/archive/I-0004-040-meta-omc-salvage-matrix.md`
- `tasks/I-0004-truth-model-cleanup/archive/I-0004-050-meta-exceptions-register.md`
- `tasks/I-0004-truth-model-cleanup/archive/I-0004-060-docs-env-and-settings-index.md`
- `tasks/I-0004-truth-model-cleanup/archive/I-0004-070-docs-release-history-home.md`

## Success Criteria

- the repository contains a canonical checklist definition and score snapshot
- exception handling is documented with durable IDs and external-proof rules
- root/doc entrypoints no longer point to stale phase plans or closed tasks
- `docs/plans/` and `.omc` are explicitly treated as legacy inputs, not source of truth

## Progress Notes

- `I-0004-070` now turns `docs/reports/README.md` into the durable release-history home for milestone summaries, QA reports, and future release notes.

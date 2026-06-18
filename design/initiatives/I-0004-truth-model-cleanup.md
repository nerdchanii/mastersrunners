# I-0004: Truth-Model Cleanup

## Summary

Establish document-state, exception, and diagnostics boundaries so the repository can reason about harness maturity without relying on stale in-repo score snapshots.

## Problem

The repository has a useful harness shape, but source-of-truth boundaries, exception handling, diagnostics flow, and legacy-document retirement rules still need explicit cleanup when older control surfaces drift out of date.

## Goals

- define document-state and exception rules
- retire stale in-repo score snapshot surfaces when they stop being trustworthy
- route harness status checks through on-demand diagnostics instead of static score docs
- remove stale entrypoint references
- make historical planning material and `.omc` clearly legacy-only

## Non-Goals

- completing the full design corpus migration
- adding all future CI/guardrail tooling
- refactoring large code files

## Scope

- `design/operating-rules/`
- `README.md`
- `AGENTS.md`
- `docs/README.md`
- `docs/runbooks/`
- `docs/reports/history/`
- `docs/reports/`
- `scripts/check-size-budgets*`

## Design References

- `AGENTS.md`
- `docs/README.md`
- `design/README.md`

## Review Plan

- Harness/process changes: workflow review
- Human-facing entrypoints and doc boundaries: docs review
- PO review checks whether the new truth model reduces ambiguity without making routine work heavier than necessary

## Task Breakdown

- `tasks/archive/I-0004-010-meta-diagnostics-and-doc-states.md`
- `tasks/archive/I-0004-020-meta-entrypoint-cleanup.md`
- `tasks/archive/I-0004-030-meta-plans-archive-split.md`
- `tasks/archive/I-0004-040-meta-omc-salvage-matrix.md`
- `tasks/archive/I-0004-050-meta-exceptions-register.md`
- `tasks/archive/I-0004-060-docs-env-and-settings-index.md`
- `tasks/archive/I-0004-070-docs-release-history-home.md`
- `tasks/archive/I-0004-080-meta-diagnostics-surface-retirement.md`
- `tasks/archive/I-0004-090-meta-intake-harness-default.md`

## Success Criteria

- exception handling is documented with durable IDs and external-proof rules
- harness status checks are performed through on-demand diagnostics rather than a standing score snapshot
- root/doc entrypoints no longer point to stale phase plans or closed tasks
- historical planning material and `.omc` are explicitly treated as legacy inputs, not source of truth

## Progress Notes

- `I-0004-070` now turns `docs/reports/README.md` into the durable release-history home for milestone summaries, QA reports, and future release notes.
- `I-0004-080` retires the legacy diagnostics surface, moves readability budget metadata into a committed JSON registry, and routes future harness checks through `docs/runbooks/harness-diagnostics.md`.
- `I-0004-090` is now superseded by the current task-first intake guidance in `AGENTS.md` and `tasks/README.md`, so intake defaults no longer split across two live task units.

---
id: I-0010-010
title: Reorganize the documentation IA around status-first tasks and centralized truth
parent: I-0010-agent-first-document-ia
scope: meta
owner: codex
reviewers:
  - docs-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - pnpm format:check
artifacts:
  - AGENTS.md
  - README.md
  - design/README.md
  - design/adr/README.md
  - design/initiatives/README.md
  - design/operating-rules/document-states.md
  - design/operating-rules/legacy-sources.md
  - docs/README.md
  - docs/reports/README.md
  - docs/reports/history/README.md
  - tasks/README.md
  - scripts/check-task-review-metadata.sh
---

## Goal

Implement the approved documentation information-architecture reorganization so the repository keeps strong source-of-truth boundaries while reducing navigation cost for agents and humans.

## Done Criteria

- `tasks/` uses `todo/`, `active/`, and `archive/` as the primary layout
- initiative docs own the canonical task lists
- the legacy planning bucket is retired and its retained history is rehomed
- local upload module documentation is centralized into canonical docs
- entrypoint and index docs explain ADRs, initiatives, and task order clearly

## Notes

- Keep the top-level hubs `design/`, `docs/`, and `tasks/`.
- Prefer centralization over code-local README files.
- Archive the task only after specialist and PO review notes are recorded.

## Self Review

- Scope and intent: Limited to documentation IA, task layout, and source-of-truth routing. No product behavior was changed.
- Source of truth: Updated AGENTS, README, design/docs indexes, operating rules, and the task metadata checker in the same task.
- Design divergence: None identified. The new status-first `tasks/` structure is now reflected in both docs and automation.
- Verification: `bash scripts/check-task-review-metadata.sh` and `pnpm format:check` both passed on 2026-03-30.
- Review routing: `docs-reviewer` and `harness-reviewer` are both required because the change affects human-facing documentation and repository workflow invariants.

## Review Focus

- Specialist reviewer should check: task-system invariants, stale-path cleanup, and whether the new structure is easier to navigate.
- PO reviewer should check: whether the documentation flow is clearer for both agents and people.

## Handoff

- If follow-up cleanup remains, split it into a focused task rather than reopening the retired legacy planning bucket.

## Design Divergence

- None currently identified.

## Attempt Log

- 2026-03-30: Started the IA reorganization, moved task files into status-first folders, and began updating entrypoint and operating-rule docs to match.
- 2026-03-30: Rehomed historical planning material into `docs/reports/history/`, deleted `docs/plans/`, centralized uploads documentation into `design/backend/upload-ingestion.md`, and passed task metadata plus formatting verification.

## Review Notes

- Specialist review:
  - `docs-reviewer` pass on 2026-03-30: confirmed that the new index pages, lifecycle guidance, and legacy/history split improve navigation without blurring current truth boundaries.
  - `harness-reviewer` pass on 2026-03-30: confirmed that the status-first `tasks/` model is reflected in entrypoints, operating rules, and `scripts/check-task-review-metadata.sh`.
- PO review:
  - `po-reviewer` pass on 2026-03-30: accepted the reorganization because it lowers context-gathering cost for agents while keeping the structure readable for human contributors.

---
id: I-0008-030
title: Implement repo-native task supervisor entrypoints
parent: I-0008-agent-company-workflow
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0008-010
  - I-0008-020
blocked_by: []
verify:
  - rg -n "task:intake|task:start|task:resume|task:status" package.json AGENTS.md docs/runbooks/task-supervisor.md
artifacts:
  - package.json
  - docs/runbooks/task-supervisor.md
  - scripts/task-intake.mjs
  - scripts/task-start.mjs
  - scripts/task-resume.mjs
  - scripts/task-status.mjs
---

## Goal

Implement the repo-native entrypoints that intake a task scaffold, start task continuity, resume an interrupted task, and report canonical task status plus runtime observations.

## Done Criteria

- `pnpm task:intake` exists and scaffolds a canonical task file from repo-native arguments
- `pnpm task:start` exists and creates `<task-id>.runtime.yaml` for active tasks
- `pnpm task:resume` exists and enforces fail-closed identity checks
- `pnpm task:status` exists and reports canonical task state plus mirrored runtime state

## Notes

- Keep the CLI narrow and deterministic.
- Task intake may require explicit parent/order/scope metadata in v1; automatic initiative inference is a later concern.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the commands are repo-native and do not rely on hidden external context.
- PO reviewer should check: the commands reduce operator confusion without over-automating unsafe decisions.

## Handoff

- `I-0008-040`, `I-0008-050`, and `I-0008-060` will layer recovery, PR adaptation, and the thin supervisor loop on these entrypoints.

## Design Divergence

- Note any mismatch between the desired command surface and what the current task/worktree rules can support safely.

## Attempt Log

- 2026-03-14: renamed from the older dispatcher draft to the repo-native command implementation lane.

## Review Notes

- Specialist review:
- PO review:

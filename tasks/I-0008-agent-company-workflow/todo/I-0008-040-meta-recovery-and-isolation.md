---
id: I-0008-040
title: Implement recovery and isolation rules
parent: I-0008-agent-company-workflow
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0008-020
  - I-0008-030
blocked_by: []
verify:
  - rg -n "blocked|interrupted|resume|lease|worktree|branch" docs/runbooks/task-supervisor.md tasks/I-0008-agent-company-workflow
artifacts:
  - docs/runbooks/task-supervisor.md
  - scripts/task-start.mjs
  - scripts/task-resume.mjs
---

## Goal

Implement fail-closed recovery rules for stale runtime files, branch lease contention, interrupted tasks, and cross-worktree isolation.

## Done Criteria

- stale runtime deletion is recoverable from canonical task and git state
- ambiguous resume fails closed
- branch lease contention is enforced
- recovery and isolation are covered by concrete tests

## Notes

- Recovery paths must be explicit and testable.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: recovery does not depend on oral history or one agent’s memory.
- PO reviewer should check: people are only pulled back in for real decisions or risk, not routine workflow churn.

## Handoff

- `I-0008-050` and `I-0008-060` should consume these recovery and isolation rules directly.

## Design Divergence

- Record any place where recovery still depends on hidden workstation state.

## Attempt Log

- 2026-03-14: renamed from the older repair-model draft to the concrete recovery and isolation lane.

## Review Notes

- Specialist review:
- PO review:

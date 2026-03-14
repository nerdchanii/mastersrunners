---
id: I-0008-060
title: Implement the thin supervisor loop
parent: I-0008-agent-company-workflow
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0008-020
  - I-0008-030
  - I-0008-040
  - I-0008-050
blocked_by: []
verify:
  - rg -n "running|blocked|interrupted|completed|one-safe-transition-per-tick" design/initiatives/I-0008-agent-company-workflow.md docs/runbooks/task-supervisor.md tasks/I-0008-agent-company-workflow
artifacts:
  - docs/runbooks/task-supervisor.md
  - scripts/task-start.mjs
  - scripts/task-resume.mjs
  - scripts/task-status.mjs
---

## Goal

Implement the branch-scoped thin supervisor loop that takes one safe transition at a time using canonical task truth and the sidecar runtime contract.

## Done Criteria

- supervisor states are explicit
- branch-scoped lease behavior is explicit
- one-safe-transition-per-tick is explicit
- escalation paths are explicit and fail closed on ambiguity

## Notes

- The thin loop is not an always-on daemon in v1.
- The thin loop must never invent task completion truth.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the supervisor remains continuity-only and cannot drift into a second workflow system.
- PO reviewer should check: the loop reduces human operator work without hiding unsafe transitions.

## Handoff

- `I-0008-070` will use this loop for cutover and cleanup.

## Design Divergence

- Record any point where the thin loop would require a guess instead of a provable next safe action.

## Attempt Log

- 2026-03-14: renamed from the old template draft to the thin supervisor loop lane.

## Review Notes

- Specialist review:
- PO review:

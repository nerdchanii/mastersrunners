---
id: I-0008-070
title: Cut over to the repo-native supervisor path
parent: I-0008-agent-company-workflow
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0008-030
  - I-0008-040
  - I-0008-050
  - I-0008-060
blocked_by: []
verify:
  - rg -n "task:intake|task:start|task:resume|task:status|task-supervisor" AGENTS.md tasks/README.md docs/runbooks design/initiatives/I-0008-agent-company-workflow.md package.json
artifacts:
  - AGENTS.md
  - tasks/README.md
  - docs/runbooks/task-supervisor.md
---

## Goal

Cut the repo over to the task-sidecar supervisor path, remove duplicate intake/readiness guidance, and leave one canonical set of task commands and runbooks behind.

## Done Criteria

- duplicate intake guidance is removed
- duplicate readiness logic is removed or clearly downgraded
- the repo points to one canonical supervisor runbook and one canonical task command set
- follow-up work is pushed into later tasks instead of being half-adopted

## Notes

- This task is the cleanup and adoption step after the repo-native pieces exist.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the repo no longer presents multiple competing control surfaces for the same workflow.
- PO reviewer should check: the cutover lowers operator confusion without cutting off safe recovery paths.

## Handoff

- Any older intake or PR control surface should either point here or be explicitly marked historical.

## Design Divergence

- Capture any residual duplicate control surface that still competes with the repo-native supervisor path.

## Attempt Log

- 2026-03-14: renamed from the older intake entrypoint draft to the cutover and cleanup lane.

## Review Notes

- Specialist review:
- PO review:

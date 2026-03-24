# I-0008: Agent Company Workflow

## Summary

Define a repo-native agent operating model where humans provide goals and constraints, agents work from canonical task artifacts, and a task-sidecar runtime plus thin supervisor loop preserve continuity without creating a second workflow system.

## Problem

The repository has useful task, review, and diagnostics harnesses, but they still behave like adjacent subsystems instead of one coherent operating model. Intake, execution ownership, delivery readiness, and recovery after session loss are not yet defined as one end-to-end workflow.

## Goals

- define a top-level Goal -> Task -> Delivery -> Closeout operating model
- keep `tasks/` as the only canonical execution truth
- add repo-native continuity through `<task-id>.runtime.yaml` sidecars
- add stable `task:intake`, `task:start`, `task:resume`, and `task:status` entrypoints
- treat PRs as optional delivery artifacts rather than a second readiness workflow
- preserve repair surfaces and resumption paths as documented support interfaces

## Actor Model

- Human goal owner:
  - provides goals, constraints, out-of-scope boundaries, and escalation decisions through conversation
- Supervising agent:
  - turns those inputs into canonical tasks, invokes the repo-native `task:*` entrypoints, and owns continuity/recovery
- Worker agent:
  - performs implementation, verify, and task-note updates in the claimed branch/worktree context

## Non-Goals

- shipping an always-on background supervisor daemon in v1
- replacing task review and PO review with PR state or branch automation
- allowing multi-task feature orchestration in v1
- changing product behavior outside the harness workflow itself

## Scope

- `AGENTS.md`
- `tasks/README.md`
- `tasks/_templates/TASK-TEMPLATE.md`
- `design/initiatives/`
- `docs/runbooks/`
- `scripts/task-*.mjs`
- task-sidecar runtime files under `tasks/*/active/<task-id>.runtime.yaml`

## Design References

- `AGENTS.md`
- `tasks/README.md`
- `design/initiatives/I-0004-truth-model-cleanup.md`
- `docs/runbooks/task-supervisor.md`

## Review Plan

- Harness/process/state-model changes: `harness-reviewer`
- PO review checks whether the workflow keeps humans at the goal-and-escalation layer without hiding recovery paths or creating a second task system

## Task Breakdown

- `tasks/I-0008-agent-company-workflow/archive/I-0008-010-meta-agent-company-workflow-spec.md`
- `tasks/I-0008-agent-company-workflow/todo/I-0008-020-meta-execution-contract-spec.md`
- `tasks/I-0008-agent-company-workflow/todo/I-0008-030-meta-task-supervisor-entrypoints.md`
- `tasks/I-0008-agent-company-workflow/todo/I-0008-040-meta-recovery-and-isolation.md`
- `tasks/I-0008-agent-company-workflow/todo/I-0008-050-meta-pr-adapter.md`
- `tasks/I-0008-agent-company-workflow/todo/I-0008-060-meta-thin-supervisor-loop.md`
- `tasks/I-0008-agent-company-workflow/todo/I-0008-070-meta-cutover-and-cleanup.md`

## Success Criteria

- the repository has a documented authority matrix for task truth, PR truth, and continuity-only runtime state
- each active task can carry a resumable `<task-id>.runtime.yaml` sidecar without depending on one agent's memory
- the repo exposes stable `task:*` entrypoints for intake, start, resume, and status
- optional PR metadata never overrides task truth or creates a second readiness model
- repair and recovery paths are documented before enforcement is tightened
- the public model says explicitly that humans provide goals through conversation while supervising agents handle repo-native task routing details such as parent/order/scope/slug

## Progress Notes

- `I-0008-010` defines the top-level authority model, absorbs the local intake follow-up from `I-0004-090`, establishes the task-sidecar runtime pattern, and lands the first repo-native `task:*` command surface with integration coverage.
- `I-0008-020` through `I-0008-070` roll the model out as repo-native scripts, recovery rules, optional PR attachment rules, and cutover.

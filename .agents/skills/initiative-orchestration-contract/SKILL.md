---
name: initiative-orchestration-contract
description: Use when coordinating multi-task initiatives, including task order, dependencies, readiness, blocked/completed state, and initiative progress.
---

# Initiative Orchestration Contract

Use this contract only for initiative-level coordination.

Do not use it for:

- source exploration
- implementation
- test writing
- code review

## Initiative State Model

Track initiative state from repository task and initiative artifacts using these normalized buckets:

- `queued`: initiative exists but no task is ready to start yet
- `ready`: at least one next task is unblocked and sufficiently specified
- `in_progress`: at least one task is active and the initiative still has unfinished work
- `blocked`: the next meaningful task cannot proceed because a dependency, decision, proof, or prerequisite is missing
- `complete`: every planned task is archived or explicitly superseded with documented rationale

## Allowed Status Transitions

Allowed initiative transitions:

- `queued -> ready`
- `ready -> in_progress`
- `in_progress -> ready`
- `in_progress -> blocked`
- `blocked -> ready`
- `in_progress -> complete`
- `ready -> blocked`

Do not skip to `complete` while actionable tasks remain outside `tasks/archive/`.

## When To Open A Task

Open or recommend opening a task when all of the following are true:

1. The initiative goal or sub-goal is already documented.
2. Scope can be expressed as one executable unit of work.
3. Required design, domain, or operational truth is sufficiently available.
4. The task does not depend on unfinished prerequisite tasks.

If the repository already has a clear task-creation convention, follow it. Otherwise recommend the exact task that should be opened without creating a new artifact.

## When To Block A Task

Block a task when any of these applies:

1. prerequisite task not archived or not ready for handoff
2. required design, domain, or runbook truth is missing or contradictory
3. proof or validation environment required by the task is unavailable
4. external blocker must be captured in `design/operating-rules/exceptions.md`
5. task scope widened beyond one executable unit

## When To Close A Task

Treat a task as closeable only when:

1. task-owned implementation and docs are complete
2. required validation has passed or the task explicitly documents accepted partial verification
3. required review, if any, is complete
4. task closeout state is consistent with repository task workflow
5. the task can move to `tasks/archive/` without leaving required follow-up undocumented

## Required Handoff Evidence

Every initiative-level recommendation or update must cite the evidence used:

- initiative file path
- task file path or paths
- dependency or blocker source
- current lifecycle state for the next relevant task
- missing proof, if blocked
- next recommended handoff role

When status is uncertain, say so explicitly instead of inferring completion.

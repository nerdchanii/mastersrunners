---
name: worker-handoff-closeout-contract
description: Use when a worker hands results back to an orchestrator, when a task is ready for critic review or closeout, or when a task is blocked.
---

# Worker Handoff Closeout Contract

Use this contract whenever a worker returns results to an orchestrator, a task is handed to critic review, a task is proposed for closeout, or work is blocked.

## Required Handoff Fields

Every handoff must include:

- `task id/name`
- `scope`
- `agent role`
- `files inspected`
- `files changed`
- `validation command`
- `validation result`
- `blockers`
- `risks`
- `assumptions`
- `next recommended action`
- `ready for critic review`
- `ready for staging/commit`

## Field Expectations

- `task id/name`
  - use the repository task id when available; otherwise use the exact task name supplied by the orchestrator
- `scope`
  - describe the approved boundary, not the whole initiative
- `agent role`
  - must match the worker that produced the handoff
- `files inspected`
  - list the files actually used to make the decision or change
- `files changed`
  - list only files edited by that worker; use `none` for read-only roles
- `validation command`
  - give the exact command run, or `not run` with a reason
- `validation result`
  - record `passed`, `failed`, `not run`, or `blocked`, with the shortest useful evidence
- `blockers`
  - list concrete blockers; use `none` if clear
- `risks`
  - list remaining regression, scope, or proof risks
- `assumptions`
  - record anything relied on but not proven
- `next recommended action`
  - name the next role or exact step
- `ready for critic review`
  - `yes` only when implementation and task-scoped validation evidence are present
- `ready for staging/commit`
  - `yes` only when critic approval and staging safety are both established

## Closeout Rules

- A blocked handoff must say what specifically is needed to unblock it.
- A critic-ready handoff must include validation evidence and a clean scope summary.
- A staging-ready handoff must also confirm unrelated changes were checked before staging.
- When information is missing, say `unknown` instead of filling the gap with inference.

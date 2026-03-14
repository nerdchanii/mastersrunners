---
id: I-0008-010
title: Define the task-truth-first supervisor workflow
parent: I-0008-agent-company-workflow
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - rg -n "I-0008-agent-company-workflow|I-0008-010|I-0004-090" AGENTS.md design/initiatives tasks
  - rg -n "task:intake|task:start|task:resume|task:status|runtime.yaml" AGENTS.md design/initiatives/I-0008-agent-company-workflow.md docs/runbooks/task-supervisor.md
  - node --test scripts/task-runtime-lib.test.mjs scripts/task-commands.test.mjs
artifacts:
  - AGENTS.md
  - design/initiatives/I-0008-agent-company-workflow.md
  - tasks/I-0008-agent-company-workflow/archive/I-0008-010-meta-agent-company-workflow-spec.md
  - docs/runbooks/task-supervisor.md
  - tasks/I-0004-truth-model-cleanup/archive/I-0004-090-meta-intake-harness-default.md
---

## Goal

Introduce the top-level initiative and lock the v1 operating model for canonical task truth, task-sidecar runtime continuity, repo-native task commands, and branch-level PR subflow boundaries before downstream automation expands.

## Done Criteria

- `I-0008` exists as the authoritative initiative for the repo-native supervisor workflow
- the initiative document defines canonical truth, continuity-only runtime state, and public `task:*` entrypoints
- `I-0004-090` is transitioned canonically so no duplicate live intake task remains
- the rollout queue is reduced to the repo-native 020-070 sequence

## Notes

- This task establishes the decision-making frame, not the full implementation.
- The thin supervisor is branch-scoped and one-safe-transition-per-tick. It is not a daemon in v1.
- V1 uses `task_id` as the only durable identity and stores continuity in `<task-id>.runtime.yaml`.
- The task started in a dedicated worktree because the main working tree already held unrelated uncommitted `I-0003` review-harness changes.
- This changeset seeds the repo-native rollout queue, task commands, runtime sidecar runbook, and the canonical intake transition for `I-0004-090`.

## Self Review

- Scope and intent: Restricted this task to the repo-native operating model, task-sidecar runtime contract, public `task:*` entrypoints, and the canonical intake transition from `I-0004-090`.
- Source of truth: Kept `tasks/` canonical, documented runtime sidecars as continuity-only, and left PR readiness under the existing `I-0003` lane.
- Design divergence: Avoided introducing any new readiness model or daemon semantics; `task:status` was tightened to fail closed on runtime identity drift instead.
- Verification: Ran the grep checks in `verify`, `node --check` on all `scripts/task-*.mjs`, `node --test scripts/task-runtime-lib.test.mjs scripts/task-commands.test.mjs`, and a sequential smoke of `pnpm task:start|resume|status` on `I-0008-010`.
- Review routing: Harness specialist review covered authority boundaries and fail-closed behavior; PO review covered actor clarity and the human goal-owner model.

## Review Focus

- Specialist reviewer should check: the authority matrix is explicit enough that runtime continuity cannot drift into a second task system.
- PO reviewer should check: the workflow keeps humans at the goal/escalation layer without making ordinary delivery harder to understand.

## Handoff

- `I-0008-020` through `I-0008-070` should implement the runtime sidecar, public commands, recovery rules, PR adapter, and cutover without reopening canonical truth boundaries.

## Design Divergence

- If any runtime sidecar field starts acting like task truth, stop and fix the authority boundary before adding more automation.

## Attempt Log

- 2026-03-14: started the new initiative to define the repo-native supervisor workflow before expanding intake or delivery automation.
- 2026-03-14: revised the initiative around task-sidecar runtime, repo-native `task:*` commands, and explicit intake transition from `I-0004-090`.
- 2026-03-14: added command-level integration tests and tightened `task:status` so runtime identity and PR attachment drift fail closed instead of printing stale state.
- 2026-03-14: clarified supervisor vs human responsibilities, bootstrap use of `task:intake --state active`, and runtime closeout rules in the runbook and initiative docs.

## Review Notes

- Specialist review: `harness-reviewer` internal review pass on 2026-03-14. Confirmed the repo-native command surface is coherent after `task:status` was updated to validate branch/worktree identity and PR attachment consistency before reporting runtime state.
- PO review: `po-reviewer` internal review pass on 2026-03-14. Accepted the actor model once the docs made it explicit that humans provide goals through conversation while the supervising agent owns task routing, continuity commands, and closeout sequencing.

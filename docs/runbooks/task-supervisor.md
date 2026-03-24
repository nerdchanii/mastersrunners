# Task Supervisor

Use this runbook for the repo-native task continuity commands and the thin supervisor loop.

## Actors

- Human goal owner:
  - provides the goal, constraints, out-of-scope, and escalation decisions through conversation
  - does not need to invoke repo commands directly in the normal path
- Supervising agent:
  - chooses the initiative, task id/order/scope/slug, and invokes `task:intake`, `task:start`, `task:resume`, and `task:status`
  - owns continuity, recovery, and handoff between implementation and any optional delivery artifacts such as branches or PRs
- Worker agent:
  - executes the task in the claimed branch/worktree context
  - updates the canonical task notes and verify evidence

## Canonical Rule

- `tasks/` remains the only source of truth for claim, active/archive location, verify satisfaction, specialist review, PO review, and completion readiness.
- `<task-id>.runtime.yaml` is continuity-only. It may record branch, worktree, lease, last safe action, and optional mirrored PR observations.
- If a runtime file is stale, missing, or deleted, reconstruct from the canonical task file, folder location, current git branch/worktree state, and any attached PR state before proceeding.

## Public Commands

- Intake a task scaffold:
  - `pnpm task:intake --goal "<goal>" --parent <initiative-slug> --order <NNN> --scope <scope> --slug <slug>`
  - this is a supervisor/operator entrypoint, not a human-facing CLI contract
  - `--state active` is only a bootstrap shortcut when the supervising agent is claiming the task immediately in the same session; it must still be followed by `pnpm task:start`
- Start continuity on an active task:
  - `pnpm task:start --task <task_id>`
- Resume a task after interruption:
  - `pnpm task:resume --task <task_id>`
- Show task status:
  - `pnpm task:status --task <task_id>`

## Runtime Fields

Required before PR attachment:

- `task_id`
- `run_id`
- `branch`
- `worktree_path`
- `state`
- `next_safe_action`
- `lease_owner`
- `lease_expires_at`
- `last_heartbeat_at`

Optional before PR attachment:

- `pr_number`
- `head_sha`

Required after PR attachment:

- `pr_number`
- `head_sha`

## States

- `running`
- `blocked`
- `interrupted`
- `completed`

The runtime file must never set task completion by itself. `completed` is only valid after the canonical task file and folder state already indicate completion.

## Closeout Mapping

- Canonical completion still comes from the task file, review notes, verify evidence, and `active/ -> archive/` transition.
- The runtime sidecar may move to `completed` only after the supervising agent has confirmed the task is ready for archive.
- The runtime sidecar should be removed or left behind with the `active/` directory state change; it must not become an archive-state signal.
- If a PR exists, its state is informational only and must not override canonical task closeout.

## Lease Rules

- One active supervisor lease per branch.
- `run_id` is a continuity handle, not the isolation boundary.
- `resume` must fail closed unless `task_id`, `branch`, and `worktree_path` still match.
- Different worktrees may run in parallel as long as they do not contend on the same branch.

## Optional PR Attachment

- `pr_number` may mirror the attached branch PR when one exists.
- `head_sha` may mirror the current attached branch head for continuity and fail-closed resume behavior.
- Once PR mirroring begins, `resume`, `status`, and supervisor actions must refuse to proceed if `pr_number` or `head_sha` is missing, or if `head_sha` no longer matches the branch head.
- PR attachment does not create a second readiness model and does not decide task completion.

## Recovery

1. Read the canonical task file and confirm it is still in `active/`.
2. Confirm the current branch and worktree match the runtime file.
3. If PR fields exist, confirm they still match the attached branch head.
4. If the runtime file is missing, recreate it from canonical task state and current git state.
5. If any identity check is ambiguous, stop and escalate instead of guessing.

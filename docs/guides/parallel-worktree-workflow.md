# Parallel Worktree Workflow

Use this guide when multiple agents are executing tasks at the same time.

## Relationship

```text
task
  └─ dedicated worktree
       └─ reviewed commit(s)
            └─ merge or cherry-pick back to main
```

## Workflow

1. Check the current worktree for unrelated dirty changes.
2. If dirty changes exist, leave them alone.
3. Create a new worktree from a clean commit for the task.
4. Prefer `pnpm worktree:bootstrap -- --path <path> --task-file tasks/todo/<task>.md` so the worktree also gets isolated ports, scoped env files, optional dependency install, and task activation in one step.
5. If you did not use the bootstrap command, move the task from `tasks/todo/` to `tasks/active/` inside that worktree manually.
6. Implement, self-review, verify, and complete specialist plus PO review.
7. Move the task to `tasks/archive/` in the same changeset.
8. Commit in the task worktree.
9. Integrate the reviewed commit back by merge or cherry-pick.
10. Remove the worktree when the task is fully integrated.

## Bootstrap Command

```bash
pnpm worktree:bootstrap -- \
  --path /tmp/mastersrunners-i0014-020 \
  --task-file tasks/todo/I-0014-020-web-messaging-room-identity-and-hub.md \
  --env-source /Users/you/project/mastersrunners/.env
```

What it does:

- creates or prepares the worktree
- chooses a non-conflicting local web/api port pair unless you override them
- writes gitignored worktree-local env files
  - `.env` (symlink or copy from the chosen shared env source)
  - `.env.worktree`
  - `apps/api/.env.local`
  - `apps/web/.env.local`
- optionally installs dependencies if the worktree has not been installed yet
- prepares required shared workspace build artifacts when local runtime depends on them
- activates the referenced task by moving it to `tasks/active/`

## Practical Rule

- isolate execution in worktrees
- integrate through commits
- preserve unrelated local changes
- prefer the bootstrap command over ad hoc env copying or fixed-port assumptions
- never treat copy-paste between worktrees as the merge strategy
- PR branch fix loops are a separate integration path and do not replace worktree isolation for multi-agent task execution

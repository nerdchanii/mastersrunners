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
4. Move the task from `todo/` to `active/` inside that worktree.
5. Implement, self-review, verify, and complete specialist plus PO review.
6. Move the task to `archive/` in the same changeset.
7. Commit in the task worktree.
8. Integrate the reviewed commit back by merge or cherry-pick.
9. Remove the worktree when the task is fully integrated.

## Practical Rule

- isolate execution in worktrees
- integrate through commits
- preserve unrelated local changes
- never treat copy-paste between worktrees as the merge strategy
- PR branch fix loops are a separate integration path and do not replace worktree isolation for multi-agent task execution

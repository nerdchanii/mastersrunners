---
doc_state: current
owner: harness
last_verified: 2026-03-30
sources:
  - AGENTS.md
  - tasks/README.md
  - git worktree usage in harness tasks and recent repo history
---

# Parallel Worktree Lifecycle

Use dedicated git worktrees when running multiple agent tasks in parallel.

## Why

- the main worktree may already contain unrelated dirty changes
- each task needs isolated verify, review, and commit history
- integration should happen through explicit commits, not mixed local edits

## Core Rule

- Preserve unrelated dirty changes in the current worktree.
- Start new parallel task work in a dedicated worktree from a clean commit.
- Each worktree owns one task branch unless the task owner explicitly subdivides further.
- Integration back to the main line happens through reviewed commits via merge or cherry-pick.

## Lifecycle

```text
main worktree may be dirty
   ↓
create dedicated worktree from clean HEAD
   ↓
move task tasks/todo -> tasks/active in that worktree
   ↓
implement + self-review + verify
   ↓
specialist review + PO review
   ↓
move task tasks/active -> tasks/archive
   ↓
commit in the worktree branch
   ↓
integrate commit back to main by merge or cherry-pick
   ↓
close or prune the worktree
```

## Dirty Main Worktree Rule

- Do not reset, discard, or overwrite unrelated dirty changes in the main worktree.
- If the main worktree is not clean, treat it as protected state and do new task work elsewhere.
- Only integrate commits that do not trample those unrelated changes.

## Integration Rule

- Prefer one reviewed commit per task.
- If the worktree branch contains one clear task commit, `cherry-pick` is acceptable.
- If the branch contains multiple reviewed commits that should stay together, merge is acceptable.
- The integration method must preserve explicit task history and commit intent.

## Task Ownership

- One agent owns one task branch by default.
- If the owner agent decides the task can be subdivided safely, it may spawn child worktrees or child branches and later integrate them.
- Subdivision still ends in explicit reviewed commits, not ad hoc file copying.

## Notes

- Worktree lifecycle is an execution rule, not a substitute for the task system.
- Review and verification still happen per task before integration.
- GitHub PR auto-fix loops operate on the PR head branch. They are not a replacement for dedicated worktree isolation when multiple agents split implementation work.

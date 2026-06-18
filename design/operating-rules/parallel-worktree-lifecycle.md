---
doc_state: current
owner: harness
last_verified: 2026-03-30
sources:
  - AGENTS.md
  - tasks/README.md
  - git worktree usage in recent repo history
---

# Parallel Worktree Lifecycle

Use dedicated git worktrees when running multiple agent tasks in parallel.

## Why

- the main worktree may already contain unrelated dirty changes
- each task needs isolated verification and commit history
- integration should happen through explicit commits, not mixed local edits

## Core Rule

- Preserve unrelated dirty changes in the current worktree.
- Start new parallel task work in a dedicated worktree from a clean commit.
- Each worktree owns one task branch unless the task owner explicitly subdivides further.
- Integration back to the main line happens through validated task-owned commits via merge or cherry-pick.

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
optional human or agent review, if explicitly requested
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

- Prefer one validated commit per task.
- If the worktree branch contains one clear task commit, `cherry-pick` is acceptable.
- If the branch contains multiple validated commits that should stay together, merge is acceptable.
- The integration method must preserve explicit task history and commit intent.

## Task Ownership

- One agent owns one task branch by default.
- If the owner agent decides the task can be subdivided safely, it may spawn child worktrees or child branches and later integrate them.
- Subdivision still ends in explicit validated commits, not ad hoc file copying.

## Notes

- Worktree lifecycle is an execution rule, not a substitute for the task system.
- When local dev ports or env files matter, prefer the repo bootstrap entrypoint (`pnpm worktree:bootstrap -- ...`) over handwritten setup.
- Verification happens per task before integration. Review is task-specific and optional.
- GitHub PR auto-fix loops operate on the PR head branch. They are not a replacement for dedicated worktree isolation when multiple agents split implementation work.

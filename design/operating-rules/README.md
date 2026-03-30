# Operating Rules

`design/operating-rules/` stores repository-wide harness rules that are neither feature design nor operational runbooks.

Use this area for:

- document-state rules
- source-of-truth boundaries
- exception handling rules
- legacy-source salvage rules
- commit and divergence policies

Do not use this area for:

- feature architecture docs
- one-off migration notes
- runtime procedures

## Files

- `document-states.md`: what `current` and `target` mean for tracked docs
- `exceptions.md`: out-of-repo exception register for controls that cannot be proven inside the repo
- `legacy-sources.md`: salvage policy for `docs/reports/history/` and `.omc`
- `commit-conventions.md`: commit subject/trailer rules for task-based work
- `parallel-worktree-lifecycle.md`: how parallel agent branches split and integrate through worktrees

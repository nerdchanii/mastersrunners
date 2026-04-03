# Review Harness

Use this guide before committing any completed task.

## Rule

- Every task needs self-review before specialist review.
- Every task needs at least one specialist review.
- Every task needs a PO review.
- Docs-only tasks are not exempt.
- Multi-scope tasks need multiple specialist reviewers.
- GitHub PR comments, approvals, or AI feedback may help collaboration, but they do not replace specialist review or PO review for task completion.

## Reviewer Roles

See `docs/guides/reviewer-taxonomy.md` for the full reviewer catalog, including escalation reviewers.

- `docs-reviewer`
  - checks clarity, structure, cross-reference quality, and source-of-truth alignment
- `frontend-reviewer`
  - checks routing, component boundaries, state/data flow, loading/error handling, and accessibility basics
- `ui-ux-reviewer`
  - checks interaction flow, copy, hierarchy, responsiveness, and user feedback states
- `backend-reviewer`
  - checks API contracts, validation, auth/authz, data integrity, failure modes, and operational risk
- `harness-reviewer`
  - checks task boundaries, automation impact, CI/hook behavior, and repository invariant safety
- `po-reviewer`
  - checks user value, acceptance criteria, scope fit, release risk, and whether the task solves the intended problem

## Routing Matrix

- `docs` scope
  - `docs-reviewer` + `po-reviewer`
- `web` scope with visible UX impact
  - `frontend-reviewer` + `ui-ux-reviewer` + `po-reviewer`
- `web` scope without meaningful UX change
  - `frontend-reviewer` + `po-reviewer`
- `api` or `db` scope
  - `backend-reviewer` + `po-reviewer`
- `ci`, `repo`, `meta`, deploy, or harness scope
  - `harness-reviewer` + `po-reviewer`
- cross-cutting tasks
  - union of all relevant specialist reviewers + `po-reviewer`

## Commit Gate

Before commit, the task must satisfy all of these:

1. Implementation is complete for the task scope.
2. The agent self-review checklist has been completed.
3. The task `verify` commands have been run.
4. Required specialist review has been completed.
5. PO review has been completed.
6. The task file has been updated with review notes.
7. The task is moved from `tasks/active/` to `tasks/archive/` in the same changeset that finalizes the work.

## UX Guardrail Reminder

- user-facing consumer web tasks should cite the relevant docs under `design/frontend/` when they affect public social routes, auth gates, product copy, or visual-system usage
- start with:
  - `design/frontend/ux-principles.md`
  - `design/frontend/social-surface-patterns.md`
  - `design/frontend/writing-and-copy.md`
  - `design/frontend/visual-system-rules.md`

## Deterministic Active-State Gate

Active tasks now carry machine-readable closeout fields in frontmatter:

- `execution_status`: `in_progress`, `blocked`, or `ready_for_archive`
- `review_status`: `pending` or `approved`
- `verification_status`: `pending`, `partial`, or `passed`
- `closeout_blocker`: required when `execution_status: blocked`

The repository check `bash scripts/check-active-task-closeout.sh` enforces these rules:

- every task under `tasks/active/` must declare the fields above
- blocked tasks must explain the blocker in `closeout_blocker`
- `execution_status: ready_for_archive` is not allowed to remain in `tasks/active/`
- `review_status: approved` plus `verification_status: passed` cannot remain `execution_status: in_progress`

This turns “forgot to archive a finished task” into a failing CI/pre-push signal instead of a doc hygiene suggestion.

## Manual PR Use

- Pull requests are optional collaboration artifacts, not a second completion workflow.
- If you open a PR, keep it lightweight: link the task and initiative, summarize verification, and note any risk or rollback context.
- Handle review comments manually in GitHub. The repository no longer defines a special AI review lane, thread-resolution loop, or merge-readiness state machine.
- Merge timing is governed by human judgment and normal branch protection, not by a repo-specific PR harness.

## Commit Intent Rule

- Commit subjects should describe intent with normal types such as `feat`, `fix`, `refactor`, `docs`, `ci`, or `test`.
- Task IDs belong in trailers, not as the commit type.
- Commit subject validation runs in the `commit-msg` hook via commitlint, not in `pre-commit`.
- If work uncovers implementation/design divergence, keep the design intact and create a follow-up task before calling the change done.
- If a pushed or merged change is wrong, route the recovery through a dedicated `fix` or `revert` task and commit rather than silently replacing shared history.
- Use `docs/runbooks/correction-commit-flow.md` when deciding whether the recovery should be a forward `fix` or an operational `revert`.

## Review Notes Convention

Record review outcomes in the task file.

- specialist review should note the reviewer role and the main concern checked
- PO review should note whether acceptance criteria and scope are satisfied
- if review finds issues, reopen or keep the task in `tasks/active/` rather than archiving it

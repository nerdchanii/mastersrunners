# Review Harness

Use this guide before committing any completed task.

## Rule

- Every task needs self-review before specialist review.
- Every task needs at least one specialist review.
- Every task needs a PO review.
- Docs-only tasks are not exempt.
- Multi-scope tasks need multiple specialist reviewers.
- GitHub AI reviews may trigger PR autofix loops, but they do not replace specialist review or PO review for task completion.

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
7. The task is moved to `archive/` in the same changeset that finalizes the work.

## PR Automation Boundary

- Dev-targeted PR automation is documented in `docs/guides/ai-pr-review-workflow.md`.
- Gemini and Copilot reviews may be used as inputs to a Codex autofix loop on PR branches.
- That loop is advisory and branch-scoped. It must not be treated as a substitute for the repository's task review requirements.
- PR autofix commits may land on the PR head branch before specialist and PO review. That is allowed because the branch remains under review and protected-branch merge rules still apply. It must not be confused with a task being ready for archive or final commit on the main line.

## Commit Intent Rule

- Commit subjects should describe intent with normal types such as `feat`, `fix`, `refactor`, `docs`, `ci`, or `test`.
- Task IDs belong in trailers, not as the commit type.
- Commit subject validation runs in the `commit-msg` hook via commitlint, not in `pre-commit`.
- If work uncovers implementation/design divergence, keep the design intact and create a follow-up task before calling the change done.

## Review Notes Convention

Record review outcomes in the task file.

- specialist review should note the reviewer role and the main concern checked
- PO review should note whether acceptance criteria and scope are satisfied
- if review finds issues, reopen or keep the task in `active/` rather than archiving it

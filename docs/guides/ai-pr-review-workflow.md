# AI PR Review Workflow

Use this guide for `dev`-targeted PRs that opt into Gemini review and Codex auto-fix.

## Scope

- target branch: `dev`
- AI reviewer of record: Gemini
- auto-fix trigger: `ai-fix` label or `/codex fix`
- auto-fix stop: remove `ai-fix` label or comment `/codex stop`
- state refresh trigger: comment `/codex refresh` or manually dispatch `PR AI Review Gate` with the PR number
- execution host: self-hosted macOS runner with label `codex-runner`
- runner auth: the runner account must already pass `codex login status` before auto-fix can execute

## Core Rule

- AI review does not replace specialist review or PO review.
- Codex auto-fix only operates on the PR head branch.
- Protected branches are never pushed directly.
- The auto-fix workflow refuses protected head branches such as `main` or `dev`.
- Forked PRs may receive AI review, but they must not run the self-hosted auto-fix workflow.
- The self-hosted auto-fix workflow is limited to same-repo PRs authored by the repository owner.

## Review Detection

Detection is `login first, marker fallback`.

- If `GEMINI_REVIEW_LOGIN` is set, Gemini review is detected by login only.
- If `GEMINI_REVIEW_MARKER` is set, the workflow can use that marker as a temporary fallback until the login is known.
- Configured reviewer logins are normalized before matching, so `gemini-code-assist` and `gemini-code-assist[bot]` are treated as the same reviewer identity.
- If Gemini identity is not configured yet, the workflow waits for a seed PR to capture the reviewer login or fallback marker before opening the fix gate.

Marker fallback is only trusted for bot-authored PR reviews when the reviewer login is not configured yet. Human-authored prose that copies the marker text must not satisfy the gate. Bot-authored review comments may still be collected as fix input after the gate opens, but they do not open the gate by themselves.

The fix gate only opens when Gemini review is present for the current PR head SHA.
If the gate state or status check remains stale after Gemini review lands, use the explicit refresh path instead of treating reviewer detection itself as broken.

## Control Surface

### Start auto-fix

- add the `ai-fix` label to the PR as the repository owner, or
- comment exactly `/codex fix` as the repository owner

### Stop auto-fix

- remove the `ai-fix` label as the repository owner, or
- comment exactly `/codex stop` as the repository owner

### Refresh review state

- comment exactly `/codex refresh` as the repository owner when the PR already has AI reviews but the state comment or status check still looks stale, or
- manually dispatch `PR AI Review Gate` with the PR number when you need the workflow to recompute the machine state comment from the current PR head

## Iteration Loop

- The loop is limited to `5` iterations per PR branch.
- Each iteration updates a machine-readable PR state comment.
- The workflow only trusts the machine-readable state comment when it was written by `github-actions[bot]`.
- Each queued request also carries a unique request ID so duplicate same-head dispatches can be rejected safely.
- Internal workflow dispatches always use the `dev` workflow definitions so the dev-targeted harness can evolve on `dev` without waiting for `main`.
- A new iteration only starts when all of these are true:
  - the PR still targets `dev`
  - the PR is not from a fork
  - the PR is enabled for auto-fix
  - Gemini has reviewed the current head SHA
  - the current head SHA has not already been requested
  - the iteration count is still below `5`

This prevents the workflow from reusing stale reviews after Codex pushes a new commit.
If the PR head moves before push, the workflow stops instead of applying fixes to an unreviewed newer head.
If workflow dispatch fails immediately after a request is queued, the gate rewrites the state to `retry_required` so the next explicit trigger can retry cleanly.
If a request remains marked as queued for too long without starting, the queue entry is treated as stale after a short timeout and the state moves to `retry_required` until a fresh explicit trigger arrives.
If the queued request later fails validation before the self-hosted job starts, the state is rewritten to a reason-specific wait state, `retry_required`, or a terminal `failed` state instead of remaining stuck at `queued`.

## Seed PR Setup

Use the first `dev` PR to confirm the actual reviewer identities.

1. Let Gemini review the PR.
2. Capture the actual reviewer login shown in the PR UI.
3. Store the login in the repository variables:
   - `GEMINI_REVIEW_LOGIN`
     Store the stable base login shown in GitHub, with or without `[bot]`; the workflow normalizes that suffix during matching.
4. If Gemini login is not yet stable, store a temporary fallback marker in `GEMINI_REVIEW_MARKER`.

## Status Model

The workflows report states such as:

- `paused`: auto-fix is not currently enabled for the PR head, either because no fix request is active yet or because it was stopped via `/codex stop` or label removal.
- `waiting_for_gemini_identity`: the seed PR has not yet established a stable Gemini login or fallback marker.
- `waiting_for_gemini_review`: Gemini has not reviewed the current PR head SHA yet.
- `ready`: Gemini review is present for the current head and the PR can be queued for auto-fix.
- `retry_required`: a previous queue attempt did not start successfully, so a fresh explicit trigger is required before the same head can be queued again.
- `queued`: an auto-fix request has been accepted and is waiting for a matching self-hosted runner.
- `running`: the self-hosted runner is actively executing the Codex fix loop.
- `succeeded`: the last auto-fix run completed and pushed a new commit back to the PR branch.
- `no_changes`: the last auto-fix run finished without producing a commit.
- `failed`: the last auto-fix run aborted because validation, execution, or verification failed.
- `already_requested`: the current head SHA already has a queued or completed auto-fix request, so a duplicate request is ignored.
- `max_iterations_reached`: the PR branch hit the five-iteration safety cap and will not queue another run.
- `fork_blocked`: the PR is from a fork, so self-hosted auto-fix is intentionally disabled.
- `untrusted_pr_author`: the PR is not authored by the repository owner, so self-hosted auto-fix is intentionally disabled on the shared runner.

## Troubleshooting Split

- If the self-hosted runner is online and idle, first check whether a `Codex PR Fix` `workflow_dispatch` run exists for the PR.
- If no `Codex PR Fix` dispatch exists yet, the blocker is still in the review gate or dispatch path, not the runner.
- If Gemini has already reviewed the current PR head but the state comment still says review is missing, trigger `/codex refresh` or manually dispatch `PR AI Review Gate` before debugging the runner.
- If a `Codex PR Fix` dispatch exists and its `fix` job stays queued on `[self-hosted, macos, codex-runner]`, then treat the runner as the active bottleneck.

## Relationship to Task Review

- PR auto-fix is a branch-level automation loop.
- PR auto-fix may push review-fix commits before human review, but that does not mark any task complete.
- Repository task completion still requires self-review, specialist review, PO review, verification, and task archival.
- If AI review uncovers a design gap, keep the design truth intact and create a follow-up task instead of lowering the design doc.

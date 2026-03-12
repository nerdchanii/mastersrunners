# AI PR Review Workflow

Use this guide for `dev`-targeted PRs that opt into AI review and Codex auto-fix.

## Scope

- target branch: `dev`
- AI reviewers: Gemini and GitHub Copilot
- auto-fix trigger: `ai-fix` label or `/codex fix`
- auto-fix stop: remove `ai-fix` label or comment `/codex stop`
- execution host: self-hosted macOS runner with label `codex-runner`
- runner auth: the runner account must already pass `codex login status` before auto-fix can execute

## Core Rule

- AI review does not replace specialist review or PO review.
- Codex auto-fix only operates on the PR head branch.
- Protected branches are never pushed directly.
- The auto-fix workflow refuses protected head branches such as `main` or `dev`.
- Forked PRs may receive AI review, but they must not run the self-hosted auto-fix workflow.

## Review Detection

Detection is `login first, marker fallback`.

- If `COPILOT_REVIEW_LOGIN` is set, Copilot review is detected by login first.
- If that variable is not set, the workflow falls back to a review-body marker. The current Copilot fallback marker is `Copilot AI`.
- If `GEMINI_REVIEW_LOGIN` is set, Gemini review is detected by login first.
- If `GEMINI_REVIEW_MARKER` is set, the workflow can use that marker as a temporary fallback until the login is known.
- If Gemini identity is not configured yet, the workflow waits for a seed PR to capture the reviewer login or fallback marker before opening the fix gate.

The fix gate only opens when both AI reviews are present for the current PR head SHA.

## Control Surface

### Start auto-fix

- add the `ai-fix` label to the PR, or
- comment `/codex fix` from a repository `OWNER`, `MEMBER`, or `COLLABORATOR`

### Stop auto-fix

- remove the `ai-fix` label, or
- comment `/codex stop` from a repository `OWNER`, `MEMBER`, or `COLLABORATOR`

## Iteration Loop

- The loop is limited to `5` iterations per PR branch.
- Each iteration updates a machine-readable PR state comment.
- A new iteration only starts when all of these are true:
  - the PR still targets `dev`
  - the PR is not from a fork
  - the PR is enabled for auto-fix
  - Gemini and Copilot have both reviewed the current head SHA
  - the current head SHA has not already been requested
  - the iteration count is still below `5`

This prevents the workflow from reusing stale reviews after Codex pushes a new commit.
If the PR head moves before push, the workflow stops instead of applying fixes to an unreviewed newer head.

## Seed PR Setup

Use the first `dev` PR to confirm the actual reviewer identities.

1. Let Gemini and Copilot review the PR.
2. Capture the actual reviewer login shown in the PR UI.
3. Store the login in the repository variables:
   - `GEMINI_REVIEW_LOGIN`
   - `COPILOT_REVIEW_LOGIN`
4. If Gemini login is not yet stable, store a temporary fallback marker in `GEMINI_REVIEW_MARKER`.
5. Keep the Copilot marker fallback until the login is confirmed stable.

## Status Model

The workflows report states such as:

- `paused`: auto-fix is not currently enabled for the PR head, either because no fix request is active yet or because it was stopped via `/codex stop` or label removal.
- `waiting_for_gemini_identity`: the seed PR has not yet established a stable Gemini login or fallback marker.
- `waiting_for_gemini_review`: Gemini has not reviewed the current PR head SHA yet.
- `waiting_for_copilot_review`: GitHub Copilot has not reviewed the current PR head SHA yet.
- `ready`: both AI reviews are present for the current head and the PR can be queued for auto-fix.
- `queued`: an auto-fix request has been accepted and is waiting for a matching self-hosted runner.
- `running`: the self-hosted runner is actively executing the Codex fix loop.
- `succeeded`: the last auto-fix run completed and pushed a new commit back to the PR branch.
- `no_changes`: the last auto-fix run finished without producing a commit.
- `failed`: the last auto-fix run aborted because validation, execution, or verification failed.
- `already_requested`: the current head SHA already has a queued or completed auto-fix request, so a duplicate request is ignored.
- `max_iterations_reached`: the PR branch hit the five-iteration safety cap and will not queue another run.
- `fork_blocked`: the PR is from a fork, so self-hosted auto-fix is intentionally disabled.

## Relationship to Task Review

- PR auto-fix is a branch-level automation loop.
- PR auto-fix may push review-fix commits before human review, but that does not mark any task complete.
- Repository task completion still requires self-review, specialist review, PO review, verification, and task archival.
- If AI review uncovers a design gap, keep the design truth intact and create a follow-up task instead of lowering the design doc.

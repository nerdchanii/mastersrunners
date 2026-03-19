# AI PR Review Workflow

Use this guide for the `dev`-targeted PR delivery subflow under `I-0008`. It covers the branch-level Gemini review signal, review-thread reconciliation, connector-state publication, merge readiness, and the agent-first merge lane. It does not redefine task intake, task runtime continuity, or the repo-wide supervisor model.

## Scope

- target branch: `dev`
- AI reviewer of record: Gemini
- Gemini PR summary: disabled in `.gemini/config.yaml`
- AI review signal: actual current-head Gemini PR review only
- execution model: agent-owned connector control surface
- default fix behavior: same-repo owner-authored `dev` PRs publish connector-ready state on current-head Gemini review unless explicitly stopped or skipped
- retrigger: `ai-fix` label or `/codex fix`
- stop: remove `ai-fix` label or comment `/codex stop`
- skip connector execution for the current head: comment `/codex skip`
- state refresh trigger: comment `/codex refresh` as the repository owner or manually dispatch `PR AI Review Gate`
- top-level review action: `gh pr review`
- thread-level reconciliation: `gh api graphql` through `node scripts/reconcile-pr-review-threads.mjs`
- merge entrypoint: `bash scripts/merge-dev-pr.sh`

## Core Rule

- AI review does not replace specialist review or PO review.
- Gemini summary comments are not review signals.
- Connector execution only operates on the PR head branch when the supervising agent actually launches a connector task.
- Protected branches are never pushed directly.
- Forked PRs may receive AI review, but they must not enter the same-repo connector lane.
- `PR Merge Readiness` is the machine gate for merge timing on `dev` PRs.
- Current-head actionable open review threads block merge until they are replied to and resolved.
- The top-level task/supervisor model continues to live in `design/initiatives/I-0008-agent-company-workflow.md` and `docs/runbooks/task-supervisor.md`.

## Review Detection

Detection is `login first, marker fallback`.

- If `GEMINI_REVIEW_LOGIN` is set, Gemini review is detected by login only.
- If `GEMINI_REVIEW_MARKER` is set, the workflow can use that marker as a temporary fallback until the login is known.
- Configured reviewer logins are normalized before matching, so `gemini-code-assist` and `gemini-code-assist[bot]` are treated as the same identity.
- Marker fallback is trusted only for bot-authored PR reviews when the reviewer login is not configured yet.

The gate opens only when Gemini review is present for the current PR head SHA.  
Because summary comments are disabled, the PR should show only the actual Gemini review surface that matters for readiness.

## Control Surface

### Default connector-ready state

- Same-repo owner-authored `dev` PRs auto-publish connector-ready state when Gemini reviews the current head.
- Actual connector execution remains agent-owned and is only proven live after a smoke PR validates the current `dev` workflow definitions.

### Re-trigger connector work

- add the `ai-fix` label to the PR as the repository owner, or
- comment exactly `/codex fix` as the repository owner

### Stop connector work

- remove the `ai-fix` label as the repository owner, or
- comment exactly `/codex stop` as the repository owner

### Skip connector execution for the current head

- comment exactly `/codex skip` as the repository owner
- use this when the current head already has actual Gemini review and you want to close the lifecycle without another connector task
- skip does not auto-resolve review threads

### Refresh machine state

- comment exactly `/codex refresh` as the repository owner when the state comment or status checks look stale, or
- manually dispatch `PR AI Review Gate` with the PR number

## Agent-Owned Connector Loop

1. Export actionable review input:
   - `node scripts/export-pr-review-bundle.mjs --pr <number>`
2. Create a ChatGPT Codex connector task against the PR head branch.
3. Prefer literal suggestion application when the context is safe.
4. Fall back to semantic fixes when there is no safe literal apply.
5. Run repository verification inside the connector task or immediately after it.
6. Record progress with:
   - `node scripts/update-pr-connector-state.mjs --pr <number> --status running --refresh`
   - `node scripts/update-pr-connector-state.mjs --pr <number> --status succeeded --fixed-sha <sha> --last-result succeeded --refresh`
   - `node scripts/update-pr-connector-state.mjs --pr <number> --status no_changes --last-result no_changes --refresh`
7. Reconcile review threads with:
   - `node scripts/reconcile-pr-review-threads.mjs --input <manifest.json>`
8. If a new commit was pushed, wait for fresh current-head Gemini review.

This loop documents the intended branch-level operator path. Treat full connector executor replacement as staged work until `I-0003-180` and `I-0003-200` close with live smoke validation on `dev`.

## Thread Hygiene

- Use `gh pr review` only for top-level PR review comments or approvals.
- Use `gh api graphql` through the repo script for thread replies and resolution.
- Current-head actionable thread means:
  - open
  - not outdated
  - still relevant to the current PR head
- Stale or outdated threads do not block merge.
- Human and Gemini current-head actionable threads are treated the same for merge readiness.

## Merge Readiness

`PR Merge Readiness` is the machine-readable gate that agents use to decide whether a `dev` PR may merge.

States:

- `waiting_for_gemini_review`
- `waiting_for_connector_fix`
- `connector_fix_running`
- `waiting_for_post_fix_review`
- `waiting_for_thread_resolution`
- `waiting_for_fix_or_skip_resolution`
- `ready_to_merge`
- `blocked`

Interpretation:

- `waiting_for_gemini_review`: current head does not yet have an actual Gemini review
- `waiting_for_connector_fix`: current-head review exists, actionable threads are open, and no connector run has started for this head
- `connector_fix_running`: the connector lane is actively working on the current head
- `waiting_for_post_fix_review`: the connector pushed the current head and Gemini has not yet reviewed that head
- `waiting_for_thread_resolution`: connector work or skip has happened, but current-head actionable threads still need reply-plus-resolve closure
- `waiting_for_fix_or_skip_resolution`: the lifecycle needs another connector run or an explicit exception decision
- `ready_to_merge`: the current head has actual Gemini review, no actionable open current-head threads, and the machine lifecycle is closed
- `blocked`: the PR is outside the supported agent lane, for example forked, untrusted, or on a shared/protected head branch

## Troubleshooting Split

- If Gemini has already reviewed the current PR head but the gate still says review is missing, trigger `/codex refresh` or manually dispatch `PR AI Review Gate`.
- If connector execution happened but the state comment still shows an older status, rerun `node scripts/update-pr-connector-state.mjs --refresh`.
- If readiness is stuck at `waiting_for_thread_resolution`, export the current review bundle and confirm all current-head actionable threads have either a `resolved` or explicit `open` disposition in the reconciliation manifest.
- If readiness is stuck at `waiting_for_fix_or_skip_resolution`, decide whether to rerun the connector lane or keep the thread open with a reasoned reply.

## Smoke Validation

Use a fresh same-repo `dev` PR to validate the topology after workflow changes merge to `dev`.

1. Open a very small PR after the workflow change lands on `dev`.
2. Let Gemini review the current head.
3. Confirm `PR AI Review Gate`, `Codex Connector Execution Status`, and `PR Merge Readiness` update from the `dev` workflow definitions.
4. Export the review bundle and run a connector task.
5. If the loop needs no changes, record `no_changes`, reconcile any remaining thread dispositions, and wait for readiness.
6. If the connector pushes a new commit, wait for fresh Gemini review, then reconcile current-head actionable threads.
7. Merge through `bash scripts/merge-dev-pr.sh --pr <number>` and confirm remote branch cleanup happens only after merge succeeds.

Until that smoke run is complete, treat connector execution as a staged branch-level control surface rather than a fully proven default executor.

## Relationship to Task Review

- PR fix automation is a branch-level automation loop.
- PR merge readiness and the agent merge lane are also branch-level automation surfaces.
- PR fix commits may land before specialist and PO review, but that does not mark any task complete.
- Repository task completion still requires self-review, specialist review, PO review, verification, and task archival.
- If AI review uncovers a design gap, keep the design truth intact and create a follow-up task instead of lowering the design doc.

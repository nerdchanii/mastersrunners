# Codex Connector PR Fix

Use this runbook for the staged, branch-level connector control surface on `dev` PRs. This is a delivery subflow under `I-0008`, not a replacement for the repository's task-supervisor model.

## Core Model

- Gemini is the AI reviewer of record.
- Actual current-head Gemini PR review is the only AI review signal.
- GitHub workflows publish gate and readiness state.
- The supervising agent owns connector task creation, result recording, and review-thread reconciliation.
- `PR Merge Readiness` is the machine gate for merge timing.
- Full executor replacement is not considered proven until a fresh same-repo smoke PR validates the live `dev` topology.

## Standard Lane

1. Let Gemini review the current PR head.
2. Export actionable review input with `node scripts/export-pr-review-bundle.mjs --pr <number>`.
3. Create a ChatGPT Codex connector task against the PR head branch using that bundle.
4. If the connector changes code, let it push to the same PR head branch.
5. Record execution progress with `node scripts/update-pr-connector-state.mjs`.
6. Reconcile addressed review threads with `node scripts/reconcile-pr-review-threads.mjs --input <manifest.json>`.
7. Wait for fresh current-head Gemini review if the connector pushed a new head.
8. Merge only through `bash scripts/merge-dev-pr.sh --pr <number>`.

This is the intended operator path for the branch-level PR lane. If smoke validation has not yet proven the connector executor end to end on `dev`, treat these steps as staged operator guidance rather than a blanket repository guarantee.

## State Rules

- `summary` comments are not signals.
- Current-head actionable open review threads block merge, including human reviewer threads.
- `/codex skip` skips connector execution for the current head, but it does not bypass open actionable threads.
- Thread resolution should leave a short reply before `resolve`.
- Outdated or stale threads do not block merge readiness.

## Required Scripts

- `node scripts/export-pr-review-bundle.mjs --pr <number>`
- `node scripts/update-pr-connector-state.mjs --pr <number> --status <state> --refresh`
- `node scripts/reconcile-pr-review-threads.mjs --input <manifest.json>`
- `bash scripts/merge-dev-pr.sh --pr <number>`

## Smoke Validation

Use a fresh same-repo `dev` PR before treating the connector executor as the live default.

1. Confirm Gemini leaves only actual PR review, not a summary signal.
2. Confirm `PR AI Review Gate`, `Codex Connector Execution Status`, and `PR Merge Readiness` refresh on the current head.
3. Export the review bundle and run a connector task.
4. Validate either:
   - `no_changes` path, or
   - fix-commit path with fresh Gemini post-fix review.
5. Reconcile current-head actionable review threads and confirm they are replied to and resolved.
6. Confirm `PR Merge Readiness` becomes `ready_to_merge`.
7. Merge via `bash scripts/merge-dev-pr.sh --pr <number>` and verify branch cleanup happens only after merge succeeds.

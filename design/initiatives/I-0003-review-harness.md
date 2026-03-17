# I-0003: Review Harness

## Summary

Maintain the repository's branch-level PR review lane so `dev`-targeted PRs can detect actual Gemini review, reconcile current-head review threads, publish machine-readable merge readiness, and merge cleanly without redefining the top-level task operating model that now lives in `I-0008`.

## Problem

The repository already has task review policy and a top-level agent operating model, but the branch-level PR lane still needs to reconcile AI review threads, connector state publication, and merge readiness without drifting into a second workflow truth.

## Goals

- preserve the repository's specialist-review and PO-review rules while keeping PR automation clearly subordinate to task completion
- normalize actual Gemini current-head review as the only AI review signal
- add branch-level review-thread export and reconciliation tooling
- extend machine-readable merge readiness so current-head actionable threads block merge
- document the staged connector control surface without overstating a fully proven executor cutover

## Non-Goals

- automated reviewer assignment
- redefining task/supervisor/intake semantics that are already owned by `I-0008`
- treating branch-level PR automation as a replacement for specialist review, PO review, or task archival

## Scope

- `AGENTS.md`
- `.github/workflows/pr-ai-review-gate.yml`
- `.github/workflows/pr-merge-readiness.yml`
- `.github/workflows/codex-pr-fix-status.yml`
- `.github/scripts/pr-merge-readiness.cjs`
- `.github/scripts/pr-review-threads.cjs`
- `docs/guides/review-harness.md`
- `docs/guides/ai-pr-review-workflow.md`
- `docs/guides/parallel-worktree-workflow.md`
- `docs/runbooks/codex-connector-pr-fix.md`
- `docs/runbooks/self-hosted-runner-macos.md`
- `scripts/merge-dev-pr.sh`
- `scripts/export-pr-review-bundle.mjs`
- `scripts/reconcile-pr-review-threads.mjs`
- `scripts/update-pr-connector-state.mjs`

## Design References

- `AGENTS.md`
- `docs/guides/review-harness.md`
- `docs/guides/ai-pr-review-workflow.md`
- `design/initiatives/I-0008-agent-company-workflow.md`

## Review Plan

- Harness and process changes should be reviewed by `harness-reviewer`
- PO review checks whether the workflow remains aligned with the intended product and delivery model

## Task Breakdown

- `tasks/I-0003-review-harness/archive/I-0003-010-meta-review-harness-policy.md`
- `tasks/I-0003-review-harness/archive/I-0003-020-meta-review-metadata-enforcement.md`
- `tasks/I-0003-review-harness/archive/I-0003-030-meta-divergence-and-conventions.md`
- `tasks/I-0003-review-harness/archive/I-0003-040-meta-agent-self-review-and-reviewer-taxonomy.md`
- `tasks/I-0003-review-harness/archive/I-0003-050-meta-commit-message-lint.md`
- `tasks/I-0003-review-harness/archive/I-0003-060-meta-parallel-worktree-lifecycle.md`
- `tasks/I-0003-review-harness/archive/I-0003-070-meta-ai-pr-review-autofix.md`
- `tasks/I-0003-review-harness/archive/I-0003-080-docs-ai-pr-review-clarifications.md`
- `tasks/I-0003-review-harness/archive/I-0003-090-meta-copilot-review-followups.md`
- `tasks/I-0003-review-harness/archive/I-0003-100-meta-bot-review-login-normalization.md`
- `tasks/I-0003-review-harness/archive/I-0003-110-meta-gemini-only-ai-review-gate.md`
- `tasks/I-0003-review-harness/archive/I-0003-120-meta-gemini-codex-smoke-sequence.md`
- `tasks/I-0003-review-harness/archive/I-0003-130-meta-gemini-review-signal-normalization.md`
- `tasks/I-0003-review-harness/archive/I-0003-140-meta-pr-merge-readiness-state.md`
- `tasks/I-0003-review-harness/archive/I-0003-150-meta-agent-merge-lane.md`
- `tasks/I-0003-review-harness/archive/I-0003-160-meta-auto-fix-default-and-required-check-rollout.md`
- `tasks/I-0003-review-harness/active/I-0003-170-meta-pr-review-thread-reconciler.md`
- `tasks/I-0003-review-harness/todo/I-0003-180-meta-codex-connector-executor-cutover.md`
- `tasks/I-0003-review-harness/active/I-0003-190-meta-merge-readiness-thread-hygiene.md`
- `tasks/I-0003-review-harness/todo/I-0003-200-meta-connector-rollout-and-smoke-pr.md`

## Success Criteria

- branch-level PR lane uses actual current-head Gemini reviews as its only AI review signal
- current-head actionable review threads can be exported, replied to, and resolved through repo-standard tooling
- `PR Merge Readiness` blocks merge until current-head actionable threads are clean
- branch-level state publication does not override task review, PO review, or the `I-0008` task-supervisor model
- connector cutover and rollout promises are staged and not documented as fully proven before smoke validation

## Progress Notes

- `I-0003-070` through `I-0003-090` established the dev-targeted AI PR review and Codex auto-fix harness, including current-head review gating, explicit triggers, and queued-request recovery.
- `I-0003-100` closed the login-normalization gap that showed up during the dual-review rollout and documented how to distinguish gate/dispatch failures from runner failures while that model was still active.
- `I-0003-110` simplified the AI PR review harness to a Gemini-only gate.
- `I-0003-120` validated the earlier self-hosted topology before the connector cutover work began.
- `I-0003-130` through `I-0003-150` normalized Gemini signals, added machine-readable merge readiness, and introduced the repo-standard agent merge lane.
- `I-0003-160` is now historical rollout context after the work split moved into narrower follow-up tasks.
- `I-0003-170` and `I-0003-190` are the live near-term branch-level tasks for review-thread reconciliation and thread-aware merge readiness.
- `I-0003-180` and `I-0003-200` remain deferred until the connector executor cutover and smoke validation can be proven without weakening the `I-0008` top-level operating model.
- Further unification of intake, task-sidecar runtime continuity, and supervisor-owned delivery sequencing belongs to `I-0008-agent-company-workflow`, not `I-0003`.

# I-0003: Review Harness

## Summary

Add explicit specialist-review and PO-review gates so completed tasks are not committed without the right review context.

## Problem

The repository now has task and verification harnesses, but it does not yet define who should review completed work before commit. That makes commit quality depend too much on ad hoc judgment.

## Goals

- define specialist reviewer roles by work type
- require PO review for every task
- wire review requirements into task and initiative templates
- document the review gate before commit

## Non-Goals

- automated reviewer assignment
- GitHub branch protection policy outside the repository
- skill or subagent implementation for each reviewer persona

## Scope

- `AGENTS.md`
- `.github/workflows/pr-ai-review-gate.yml`
- `.github/workflows/codex-pr-fix.yml`
- `.github/workflows/codex-pr-fix-status.yml`
- `docs/guides/review-harness.md`
- `docs/guides/ai-pr-review-workflow.md`
- `docs/guides/agent-self-review.md`
- `docs/guides/parallel-worktree-workflow.md`
- `docs/guides/reviewer-taxonomy.md`
- `docs/guides/design-divergence-workflow.md`
- `docs/runbooks/self-hosted-runner-macos.md`
- `tasks/README.md`
- `tasks/_templates/TASK-TEMPLATE.md`
- `design/initiatives/INITIATIVE-TEMPLATE.md`
- `design/operating-rules/commit-conventions.md`
- `design/operating-rules/document-states.md`
- `design/operating-rules/parallel-worktree-lifecycle.md`
- `design/frontend/conventions.md`
- `design/backend/conventions.md`

## Design References

- `AGENTS.md`
- `docs/guides/review-harness.md`
- `tasks/_templates/TASK-TEMPLATE.md`

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
- `tasks/I-0003-review-harness/active/I-0003-110-meta-gemini-only-ai-review-gate.md`
- `tasks/I-0003-review-harness/active/I-0003-120-meta-gemini-codex-smoke-sequence.md`

## Success Criteria

- every new task template includes reviewer and PO review requirements
- the repository has one clear review routing guide
- pre-commit completion rules explicitly mention specialist and PO review
- approved design is not downgraded to excuse incomplete implementation
- commit subjects explain intent while task linkage lives in trailers
- every task has one consistent self-review step before specialist review
- commit subjects are enforced by repository automation
- parallel task execution has an explicit split and integration rule
- dev-targeted PRs can wait for Gemini review before an explicitly requested Codex auto-fix loop runs on the self-hosted runner

## Progress Notes

- `I-0003-070` through `I-0003-090` established the dev-targeted AI PR review and Codex auto-fix harness, including current-head review gating, explicit triggers, and queued-request recovery.
- `I-0003-100` closed the login-normalization gap that showed up during the dual-review rollout and documented how to distinguish gate/dispatch failures from runner failures while that model was still active.
- `I-0003-110` is active to simplify the AI PR review harness to a Gemini-only gate after PR #8 and PR #9 showed that Copilot-specific gating added more operational complexity than value.
- `I-0003-120` is active to validate the merged Gemini-only topology on a fresh same-repo PR so the team can watch the default-branch `Gemini review -> /codex fix -> self-hosted Codex` sequence end to end.

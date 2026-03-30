---
id: I-0003-160
title: Roll out default auto-fix and readiness enforcement
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-140
  - I-0003-150
blocked_by: []
verify:
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ai-review-gate.yml")'
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/codex-pr-fix-status.yml")'
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-merge-readiness.yml")'
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/workflows/pr-ai-review-gate.yml
  - .github/workflows/codex-pr-fix-status.yml
  - .github/workflows/pr-merge-readiness.yml
  - docs/guides/ai-pr-review-workflow.md
  - docs/runbooks/codex-connector-pr-fix.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

This staged rollout task is now superseded by the connector cutover tasks `I-0003-170` through `I-0003-200`.

## Done Criteria

- supersession is recorded so operators do not treat the old self-hosted rollout as the active implementation path
- deleted workflow references are removed from the live task metadata

## Notes

- This task may use a temporary smoke PR for validation after the workflow changes land on `dev`.
- Historical context only after supersession. Near-term branch work should focus on `I-0003-170` and `I-0003-190`.

## Self Review

- Scope and intent: keep rollout scoped to same-repo owner `dev` PRs, default auto-fix enablement after current-head Gemini review, and later smoke validation plus required-check enforcement.
- Source of truth: `pr-ai-review-gate.yml`, `codex-pr-fix-status.yml`, `pr-merge-readiness.yml`, and the AI PR workflow guide.
- Design divergence: branch protection enforcement and smoke validation still need to complete after the workflow changes land on `dev`.
- Verification: `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ai-review-gate.yml"); YAML.load_file(".github/workflows/codex-pr-fix-status.yml"); YAML.load_file(".github/workflows/pr-merge-readiness.yml")'`, `node --test .github/scripts/pr-autofix-state.spec.cjs .github/scripts/pr-review-threads.spec.cjs .github/scripts/pr-merge-readiness.spec.cjs`, `pnpm format:check`, and `bash scripts/check-task-review-metadata.sh`.
- Review routing: `harness-reviewer` checks rollout safety and guardrails, `docs-reviewer` checks operator guidance, and `po-reviewer` checks staged enforcement.

## Review Focus

- Specialist reviewers should check: default auto-fix does not open for forks, untrusted authors, or protected/shared head branches, and enforcement waits until smoke validation is complete.
- PO reviewer should check: the staged rollout improves autonomy without creating surprise branch-policy regressions.

## Handoff

- If rollout exposes new ambiguity, preserve the machine-readable state contract and create a narrow follow-up task instead of weakening the lifecycle.
- Do not treat this task as the live implementation surface for the current branch. The active near-term work is review-thread tooling plus thread-aware readiness.

## Design Divergence

- None.

## Attempt Log

- 2026-03-14: created to complete the transition from explicit fix-only operation to default same-repo owner auto-fix plus staged readiness enforcement.
- 2026-03-14: updated `pr-ai-review-gate.yml` so same-repo owner-authored `dev` PRs auto-enable the Codex fix loop after current-head Gemini review, while keeping `/codex fix` for retrigger and `/codex stop` plus `/codex skip` for exceptions.
- 2026-03-14: wired gate and fix workflows to refresh `PR Merge Readiness`, and updated docs to describe staged smoke validation and later branch protection enforcement.
- 2026-03-14: bootstrap-tested the first rollout PR, found that dispatching follow-up workflows against `dev` failed before the new workflows existed on the base branch, and switched refresh dispatches to the PR head branch so staged rollout can validate before merge.
- 2026-03-14: removed direct `pull_request_review` triggering from `pr-merge-readiness.yml` after GitHub denied readiness comment writes on that event, keeping readiness refresh driven by gate and fix workflow dispatches instead.
- 2026-03-14: found that `workflow_dispatch` readiness runs can still fail to write issue comments, so the readiness workflow now treats PR comments as best-effort and emits a machine-readable JSON block in the `PR Merge Readiness` check output for the merge lane to consume.
- 2026-03-14: extracted merge-lane readiness readers into dedicated `.github/scripts/internal/` helpers and tightened `findReadinessComment` to scan backward without allocating a reversed copy, following Gemini maintainability feedback on the staged rollout PR.
- 2026-03-14: rollout remains active until the workflow changes land on `dev`, a fresh smoke PR validates the lifecycle, and `PR Merge Readiness` is enforced on `dev`.
- 2026-03-14: superseded by `I-0003-170` through `I-0003-200`, which replace the self-hosted executor with an agent-owned connector lane and thread reconciliation model.

## Review Notes

- Specialist review: `harness-reviewer` internal review pass on 2026-03-17. Accepted archival/supersession positioning so this task no longer reads as the live implementation surface for the near-term branch.
- PO review: `po-reviewer` internal review pass on 2026-03-17. Accepted the trim/defer split because rollout enforcement and smoke authority remain deferred until the branch-level primitive work is proven on `dev`.

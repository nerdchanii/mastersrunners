---
id: I-0003-100
title: Stabilize AI review gate handoff to self-hosted Codex auto-fix
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-070
  - I-0003-090
blocked_by: []
verify:
  - node --test .github/scripts/pr-autofix-state.spec.cjs
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ai-review-gate.yml"); YAML.load_file(".github/workflows/codex-pr-fix-status.yml")'
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/scripts/pr-autofix-state.cjs
  - .github/scripts/pr-autofix-state.spec.cjs
  - .github/workflows/ci.yml
  - .github/workflows/pr-ai-review-gate.yml
  - .github/workflows/codex-pr-fix-status.yml
  - docs/guides/ai-pr-review-workflow.md
  - docs/runbooks/self-hosted-runner-macos.md
  - scripts/ci-local.sh
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Make the AI review gate and self-hosted Codex handoff reliable when Gemini and Copilot reviews are present on the current PR head.

## Done Criteria

- the gate recognizes configured Gemini and Copilot review logins with or without a trailing `[bot]`
- a focused regression test covers current-head review detection for normalized bot logins
- Copilot review completion can re-drive gate and status refresh through a trusted workflow-level fallback
- local CI and GitHub CI both run the regression test
- operator docs explain both login normalization and the split between gate/dispatch failures vs runner failures

## Notes

- This follow-up preserves the current-head review requirement. It fixes reviewer identity matching and adds a stable Copilot workflow completion fallback so the self-hosted Codex job can still be dispatched when direct review events are flaky.
- Observed failure on PR #7:
  - Gemini and Copilot both left reviews on head `3c22a3ba6325a81fde3d4ba0d64e3d3f92dbc693`.
  - `PR AI Review Gate` state stayed at `waiting_for_gemini_review`.
  - The workflow helper compared configured logins such as `gemini-code-assist` to REST review logins such as `gemini-code-assist[bot]` with exact equality.
  - The runner itself remained online and idle, which showed that the bottleneck was upstream of self-hosted execution because no `Codex PR Fix` dispatch had been created.

## Self Review

- Scope and intent: limited to AI PR review gate identity matching, Copilot workflow fallback, regression coverage, and matching operator documentation.
- Source of truth: PR #7 review payloads from `gh api repos/nerdchanii/mastersrunners/pulls/7/reviews --paginate`, the machine state comment on the same PR, and the existing AI PR workflow guide.
- Design divergence: none; this restores the documented login-first detection model instead of changing gate policy.
- Verification: `node --test .github/scripts/pr-autofix-state.spec.cjs`, Ruby YAML parsing for the touched workflows, `pnpm format:check`, and `bash scripts/check-task-review-metadata.sh`
- Review routing: `harness-reviewer` is required for workflow-helper correctness, `docs-reviewer` for the operator guide update, and `po-reviewer` because this changes delivery automation behavior.

## Review Focus

- Specialist reviewers should check: the normalization and Copilot fallback are narrow, preserve current-head review requirements, and do not bypass the explicit-trigger model before self-hosted execution.
- PO reviewer should check: the follow-up fixes a real automation defect without broadening the auto-fix trust model.

## Handoff

- Merge this fix to `dev` before expecting `dev`-targeted PRs to advance from review-ready state into the Codex auto-fix queue when Gemini and Copilot have already reviewed the current head.

## Design Divergence

- None.

## Attempt Log

- 2026-03-13: task created after PR #7 showed a live mismatch between current-head bot reviews and the persisted `waiting_for_gemini_review` state.
- 2026-03-13: normalized configured and observed review logins by stripping a trailing `[bot]` suffix before login-first matching, while preserving the existing current-head SHA requirement.
- 2026-03-13: added `.github/scripts/pr-autofix-state.spec.cjs` to lock the regression down and wired the focused test into both `scripts/ci-local.sh` and `.github/workflows/ci.yml`.
- 2026-03-13: added a `workflow_run` fallback for `Copilot code review` completion so the PR gate and status workflows can recover PR context from `refs/pull/<n>/head` even when the direct Copilot review event does not advance the gate.
- 2026-03-13: verify passed with `node --test .github/scripts/pr-autofix-state.spec.cjs`, Ruby YAML parsing for the touched workflows, `pnpm format:check`, and `bash scripts/check-task-review-metadata.sh`.

## Review Notes

- Specialist review:
  - `harness-reviewer` on 2026-03-14: no blocking issues. The login normalization is narrow, keeps current-head SHA matching intact, and the `Copilot code review` workflow fallback only restores PR-context recovery and gate recomputation without bypassing the explicit trigger model before self-hosted execution.
  - `docs-reviewer` on 2026-03-14: no blocking issues. The workflow guide and runner runbook now explain the login normalization rule, the Copilot workflow fallback, and the gate-vs-runner troubleshooting split without drifting from the implemented automation.
- PO review:
  - `po-reviewer` on 2026-03-14: no blocking issues. The follow-up fixes a real automation dead-end for `dev` PRs while preserving the intended safety model: same-repo only, owner-controlled enablement, current-head review requirements, and self-hosted execution only after the gate opens.

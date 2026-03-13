---
id: I-0003-110
title: Add explicit recovery path for stale AI review readiness state
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-090
  - I-0003-100
blocked_by: []
verify:
  - node --test .github/scripts/pr-autofix-state.spec.cjs
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ai-review-gate.yml"); YAML.load_file(".github/workflows/codex-pr-fix-status.yml")'
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/scripts/pr-autofix-state.cjs
  - .github/scripts/pr-autofix-state.spec.cjs
  - .github/workflows/pr-ai-review-gate.yml
  - docs/guides/ai-pr-review-workflow.md
  - docs/runbooks/self-hosted-runner-macos.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Provide a repo-controlled recovery path when Gemini/Copilot reviews exist on the current head but the persisted AI review state comment does not refresh.

## Done Criteria

- maintainers can explicitly recompute the AI review gate state without enabling auto-fix
- the gate supports manual workflow dispatch with a PR number for recovery from blocked bot-triggered events
- operator docs explain when to use the explicit refresh path
- regression coverage includes the new explicit refresh command parsing

## Notes

- Observed on PR #8:
  - Gemini and Copilot both reviewed head `8af158b857c104233d26a7e4dc52c3839b59af61`
  - `.github/scripts/pr-autofix-state.cjs` reports both reviewers as ready for that head
  - the machine state comment still showed `copilot_review_ready: false`
  - the follow-up `pull_request_review` and `workflow_run` refreshes triggered by Copilot ended as `action_required`, so the stale comment was never rewritten
- This task should not weaken the explicit `/codex fix` enablement model. Refreshing state and enabling auto-fix stay separate actions.

## Self Review

- Scope and intent: limited to stale AI review state recovery, not a redesign of the auto-fix state machine.
- Source of truth: PR #8 review payloads, the persisted state comment on PR #8, and the review-harness workflow/docs already committed in-repo.
- Design divergence: none; this adds a safe recovery path when external bot-triggered events fail to advance the documented state.
- Verification: `node --test .github/scripts/pr-autofix-state.spec.cjs`, Ruby YAML parsing for touched workflows, `pnpm format:check`, and `bash scripts/check-task-review-metadata.sh`
- Review routing: `harness-reviewer` for workflow correctness, `docs-reviewer` for operator guidance, and `po-reviewer` because this changes delivery automation recovery behavior.

## Review Focus

- Specialist reviewers should check: the refresh path only recomputes state, preserves owner-only control for fix/stop actions, and does not bypass current-head review requirements.
- PO reviewer should check: operators can recover from stale review state without turning routine review into extra ceremony.

## Handoff

- If this lands, use `/codex refresh` or the manual `PR AI Review Gate` workflow dispatch before assuming Copilot review detection is broken.

## Design Divergence

- None.

## Attempt Log

- 2026-03-14: task created after PR #8 showed a live mismatch between the review payloads and the stale `copilot_review_ready: false` state comment.
- 2026-03-14: confirmed the underlying review matcher was already correct by running `.github/scripts/pr-autofix-state.cjs` against PR #8 reviews; both Gemini and Copilot resolved to `true` for head `8af158b857c104233d26a7e4dc52c3839b59af61`.
- 2026-03-14: added two explicit repo-controlled recovery paths that do not enable auto-fix by themselves: owner comment `/codex refresh` and manual `workflow_dispatch` support for `PR AI Review Gate` with a PR number.
- 2026-03-14: verify passed with `node --test .github/scripts/pr-autofix-state.spec.cjs`, Ruby YAML parsing for `.github/workflows/pr-ai-review-gate.yml` and `.github/workflows/codex-pr-fix-status.yml`, `pnpm format:check`, and `bash scripts/check-task-review-metadata.sh`.

## Review Notes

- Specialist review:
- PO review:

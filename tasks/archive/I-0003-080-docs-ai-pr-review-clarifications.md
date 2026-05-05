---
id: I-0003-080
title: Clarify AI PR status states and runner secret handling
parent: I-0003-review-harness
scope: docs
owner: codex
reviewers:
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-070
blocked_by: []
verify:
  - pnpm format:check
artifacts:
  - docs/guides/ai-pr-review-workflow.md
  - docs/runbooks/self-hosted-runner-macos.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Address Gemini review feedback by making the AI PR workflow status list easier to interpret and by adding explicit secret-handling guidance for runner API-key auth.

## Done Criteria

- each published AI PR status has a short operator-facing explanation
- the runner runbook tells operators to source `OPENAI_API_KEY` from secure secret storage instead of plaintext shell config
- the review harness initiative references this clarification task

## Notes

- This task is docs-only and should not change workflow behavior.
- The clarified wording should stay aligned with the actual machine states emitted by the workflows.

## Self Review

- Scope and intent: limited to operator-facing clarification in existing docs; no workflow logic changed.
- Source of truth: the wording stays aligned with the machine states emitted by the PR AI review workflows and the existing runner registration contract.
- Design divergence: none; this task explains current behavior more explicitly rather than changing the design.
- Verification: `pnpm format:check`
- Review routing: docs-only scope, so `docs-reviewer` and `po-reviewer`

## Review Focus

- Specialist reviewer should check: status descriptions match the documented workflow behavior and the secret-handling guidance is practical for operators.
- PO reviewer should check: the added explanations reduce operator confusion without changing the explicit-trigger control model.

## Handoff

- If the workflow adds new machine states later, update the status model explanations in the same task that introduces them.

## Design Divergence

- None.

## Attempt Log

- 2026-03-13: created to address Gemini review comments on PR #6 without changing workflow behavior.

## Review Notes

- Specialist review: `docs-reviewer` found one blocking issue in the initial draft because `paused` was described too narrowly. After clarifying that it also covers the default not-yet-enabled state, the reviewer reported no blocking issues.
- PO review: `po-reviewer` reported no blocking issues. The clarification improves operator understanding without changing the explicit-trigger safety model.

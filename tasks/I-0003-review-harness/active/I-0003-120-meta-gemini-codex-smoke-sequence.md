---
id: I-0003-120
title: Validate Gemini to Codex smoke sequence on fresh PR
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-110
blocked_by: []
verify:
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - docs/guides/ai-pr-review-workflow.md
  - design/initiatives/I-0003-review-harness.md
  - tasks/I-0003-review-harness/active/I-0003-120-meta-gemini-codex-smoke-sequence.md
---

## Goal

Validate the merged Gemini-only PR review topology on a fresh `dev`-targeted PR so the team can confirm `Gemini review -> /codex fix -> self-hosted Codex` works end to end on default branch workflow definitions.

## Done Criteria

- a fresh same-repo PR exists after `I-0003-110` merged to `dev`
- the PR scope is intentionally small and safe for smoke validation
- the AI PR workflow guide tells operators to run topology validation from a fresh PR after workflow changes land on `dev`
- the task records the expected smoke sequence and what counts as a successful validation run

## Notes

- This task is for operational validation, not for adding a new review gate feature.
- A successful smoke run may end in `no_changes`; the key signal is that the dispatch and self-hosted execution path activates from a fresh PR on `dev`.

## Self Review

- Scope and intent: keep the smoke PR intentionally small so it validates topology rather than mixing in unrelated code risk.
- Source of truth: `I-0003-110`, the merged `dev` workflows, and the AI PR workflow guide.
- Design divergence: none.
- Verification: formatting and task review metadata checks passed.
- Review routing: `harness-reviewer` for workflow-operability framing, `docs-reviewer` for operator guidance, and `po-reviewer` because this changes the validation path the team will follow.

## Review Focus

- Specialist reviewers should check: the new smoke-validation guidance is precise about when to use a fresh PR and what outcomes are considered success.
- PO reviewer should check: the smoke-validation path is small enough to keep operational overhead low while still proving the end-to-end review sequence.

## Handoff

- After this PR opens, request Gemini review on the PR head and then trigger `/codex fix` from the repository owner to validate the self-hosted lane on `dev` workflow definitions.

## Design Divergence

- None.

## Attempt Log

- 2026-03-14: created after PR #9 merged to `dev` so the team can validate the Gemini-only review topology on a fresh PR instead of relying on branch-ref dispatches.
- 2026-03-14: kept the smoke scope to docs and task metadata so the validation PR stays safe even if the self-hosted fix loop produces `no_changes`.

## Review Notes

- Specialist review:
- PO review:

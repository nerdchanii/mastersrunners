---
id: I-0003-170
title: Add PR review thread export and reconciliation tooling
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-140
blocked_by: []
verify:
  - node --test .github/scripts/pr-review-threads.spec.cjs
  - node --check scripts/export-pr-review-bundle.mjs
  - node --check scripts/reconcile-pr-review-threads.mjs
  - node --check scripts/update-pr-connector-state.mjs
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/scripts/pr-review-threads.cjs
  - scripts/export-pr-review-bundle.mjs
  - scripts/reconcile-pr-review-threads.mjs
  - scripts/update-pr-connector-state.mjs
  - docs/guides/ai-pr-review-workflow.md
---

## Goal

Give the `I-0008` delivery subflow a repo-standard way to export actionable PR review threads and reconcile them with reply-and-resolve behavior through `gh`.

## Done Criteria

- `scripts/export-pr-review-bundle.mjs` exports current-head actionable and stale review threads in a machine-readable format
- `scripts/reconcile-pr-review-threads.mjs` replies to and resolves review threads through `gh api graphql`
- thread classification uses `isResolved` and `isOutdated` so stale discussion does not block merge
- docs describe `gh pr review` for top-level review actions and `gh api graphql` for thread reconciliation

## Notes

- This remains a live branch-level PR lane task under `I-0008-agent-company-workflow`; it does not redefine the repo-wide task supervisor model.
- Thread reconciliation must work for both Gemini and human current-head review threads.
- Literal suggestion blocks should be extracted into the review bundle for deterministic apply when possible.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: thread export and reconciliation stay current-head scoped and do not resolve stale or unrelated discussions.
- PO reviewer should check: the automation keeps PR discussion cleaner without hiding unresolved review concerns.

## Handoff

- If GitHub thread mutation shapes drift, update the bundle/reconciler helpers instead of inlining GraphQL throughout workflows.
- Keep this task focused on implemented branch-level export and reconciliation primitives; broader executor cutover remains deferred to follow-up work.

## Design Divergence

- None.

## Attempt Log

- 2026-03-14: created to standardize review-thread export and reply-plus-resolve reconciliation for the agent-first PR lane.
- 2026-03-16: reaffirmed as a live near-term task after `I-0008` merged the repo-wide task-supervisor model.

## Review Notes

- Specialist review: `harness-reviewer` internal review pass on 2026-03-17. No blocking findings; current-head actionable thread export/reconcile stays branch-scoped and the reply-after-review regression is covered by spec.
- PO review: `po-reviewer` internal review pass on 2026-03-17. No blocking findings; this remains a narrow PR delivery subflow improvement under `I-0008` and does not overclaim connector maturity.

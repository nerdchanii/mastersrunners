---
id: I-0006-240
title: Codify fix and revert correction history flow
parent: I-0006-guardrail-hardening
scope: meta
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm exec prettier --check AGENTS.md design/operating-rules/commit-conventions.md docs/guides/agent-self-review.md docs/guides/review-harness.md docs/runbooks/README.md docs/runbooks/rollback.md docs/runbooks/correction-commit-flow.md design/initiatives/I-0006-guardrail-hardening.md tasks/active/I-0006-240-meta-fix-revert-history-flow.md
  - bash scripts/check-active-task-closeout.sh
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - AGENTS.md
  - design/operating-rules/commit-conventions.md
  - docs/guides/agent-self-review.md
  - docs/guides/review-harness.md
  - docs/runbooks/README.md
  - docs/runbooks/rollback.md
  - docs/runbooks/correction-commit-flow.md
  - design/initiatives/I-0006-guardrail-hardening.md
---

## Goal

Make correction history explicit so pushed or merged mistakes are preserved through follow-up `fix` or `revert` commits instead of being hidden by silent replacement.

## Done Criteria

- repo rules explain when to use a follow-up `fix` commit versus a `revert` commit
- shared-history corrections are documented as separate tasks and separate commits
- review and rollback guidance point to the same correction-history flow

## Notes

- This task governs already-shared history. It should not encourage committing unreviewed work into `dev`.
- The flow should preserve the existing task-centric harness instead of rebuilding a PR-specific process.

## Self Review

- Scope and intent: stayed on workflow governance only; the task codifies correction history for bad shared commits without widening into new automation or PR process changes.
- Source of truth: `AGENTS.md`, `design/operating-rules/commit-conventions.md`, `docs/guides/review-harness.md`, `docs/guides/agent-self-review.md`, and the new `docs/runbooks/correction-commit-flow.md` now describe the same `fix` versus `revert` decision.
- Design divergence: none intended; the new flow preserves the existing rule that unfinished work stays in the task branch and only shared-history mistakes get additive correction commits.
- Verification: `pnpm exec prettier --check AGENTS.md design/operating-rules/commit-conventions.md docs/guides/agent-self-review.md docs/guides/review-harness.md docs/runbooks/README.md docs/runbooks/rollback.md docs/runbooks/correction-commit-flow.md design/initiatives/I-0006-guardrail-hardening.md tasks/active/I-0006-240-meta-fix-revert-history-flow.md`, `bash scripts/check-active-task-closeout.sh`, and `bash scripts/check-task-review-metadata.sh` all passed.
- Review routing: `harness-reviewer` plus `po-reviewer` remained sufficient because the task changes repository workflow rules and runbooks rather than product behavior.

## Review Focus

- Specialist reviewer should check: the new correction-history rule fits the existing task/review harness and does not weaken the current commit gate.
- PO reviewer should check: the flow makes mistakes understandable in `git log` without adding unnecessary ceremony to normal delivery.

## Handoff

- Future meta workflow changes should reuse the same `fix` versus `revert` decision language instead of inventing lane-specific correction rules.

## Design Divergence

- None intended.

## Attempt Log

- 2026-04-03: created after repeated public-route recovery work made it clear that the repo documented commit syntax but not the operating flow for preserving bad shared commits through explicit corrections.
- 2026-04-03: added a dedicated correction-history runbook, updated start-here rules plus review/commit guidance, and clarified that smaller executable units should be split into smaller tasks rather than published as half-finished shared commits.

## Review Notes

- Specialist review:
  - `harness-reviewer` internal role review pass on 2026-04-03: confirmed the new flow preserves the existing task-centric harness by keeping unfinished work inside the task branch and only requiring additive `fix` or `revert` commits after history is shared.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-03: accepted the change because it makes mistakes understandable in `git log` while still encouraging smaller reviewed task units instead of more noisy half-finished commits.

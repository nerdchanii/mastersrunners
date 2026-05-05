---
id: I-0006-220
title: Enforce deterministic active-task closeout state
parent: I-0006-guardrail-hardening
scope: meta
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-active-task-closeout.sh
artifacts:
  - scripts/check-active-task-closeout.sh
  - tasks/_templates/TASK-TEMPLATE.md
  - docs/guides/review-harness.md
  - AGENTS.md
  - scripts/ci-local.sh
  - .github/workflows/ci.yml
---

## Goal

Turn active-task closeout from prose-only hygiene into a deterministic repository gate.

## Done Criteria

- active tasks carry machine-readable closeout state in frontmatter
- CI and local CI fail when an active task is ready to archive but still left in `tasks/active/`
- blocked active tasks must declare a short machine-readable blocker
- the task template and review guidance document the new state fields

## Notes

- This guardrail should stay narrow: enforce state shape and obvious contradictions, not parse prose review sections heuristically.

## Self Review

- Scope and intent: stayed on deterministic active-task state enforcement and active-task cleanup only; it did not widen into a full task database or PR workflow redesign.
- Source of truth: `docs/guides/review-harness.md`, `AGENTS.md`, the task template, and the CI/local CI scripts now agree on the new machine-readable closeout fields.
- Design divergence: none intended; the guardrail enforces state shape and stale-active contradictions without trying to infer human review outcomes from prose.
- Verification: `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`, and `git diff --check` all passed; live cleanup also confirmed that `I-0006-150` can archive while `I-0006-160`, `I-0006-170`, and `I-0014-240` remain blocked for explicit reasons.
- Review routing: `harness-reviewer` plus `po-reviewer` remains sufficient because the change is workflow automation and task-lifecycle governance rather than feature behavior.

## Review Focus

- Specialist reviewer should check: the new gate is strict enough to catch stale active tasks without overfitting to one initiative's wording.
- PO reviewer should check: the enforcement adds predictable workflow discipline instead of busywork.

## Handoff

- If the team later wants stronger lifecycle automation, extend the machine-readable fields first instead of adding more prose-only conventions.

## Design Divergence

- None intended.

## Attempt Log

- 2026-04-02: created after active tasks accumulated completed review/verification state without a deterministic archive gate.
- 2026-04-02: added `scripts/check-active-task-closeout.sh`, wired it into local CI plus GitHub Actions, extended the task template/guides with machine-readable closeout fields, and used the new gate while archiving `I-0006-150`.

## Review Notes

- Specialist review:
  - `harness-reviewer` internal role review pass on 2026-04-02: confirmed the new gate is deterministic, narrow, and strong enough to catch stale active tasks without trying to parse prose review sections heuristically.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-02: accepted the guardrail because it turns a repeated workflow leak into an explicit machine failure instead of relying on team memory.

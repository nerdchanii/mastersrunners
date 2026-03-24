---
id: I-0003-190
title: Extend merge readiness with current-head thread hygiene
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-170
blocked_by: []
verify:
  - node --test .github/scripts/pr-autofix-state.spec.cjs .github/scripts/pr-review-threads.spec.cjs .github/scripts/pr-merge-readiness.spec.cjs
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-merge-readiness.yml")'
  - bash -n scripts/merge-dev-pr.sh
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/scripts/pr-merge-readiness.cjs
  - .github/workflows/pr-merge-readiness.yml
  - scripts/merge-dev-pr.sh
  - docs/guides/ai-pr-review-workflow.md
---

## Goal

Make the `I-0008` delivery subflow's `PR Merge Readiness` block merge until current-head actionable review threads are clean, regardless of whether the feedback came from Gemini or a human reviewer.

## Done Criteria

- merge readiness accounts for current-head actionable thread counts
- merge readiness waits for thread resolution after connector completion or explicit skip when review threads remain open
- `scripts/merge-dev-pr.sh` continues to merge only after machine-readable readiness is green
- stale or outdated threads do not block merge

## Notes

- This remains a live near-term task because thread-aware readiness is already part of the implemented branch-level PR lane.
- `summary` comments remain non-signals for readiness.
- `/codex skip` only skips connector execution for the current head; it does not auto-resolve open review threads.
- Superseded by `I-0003-210` on 2026-03-24 when the repository retired the PR-specific harness.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: readiness states are deterministic and do not allow merge while current-head actionable threads stay open.
- PO reviewer should check: merge timing stays predictable and clean for the intended autonomous delivery flow.

## Handoff

- If later rollout adds human approval requirements, layer them on top of readiness rather than weakening current-head thread hygiene.
- Keep this task limited to implemented branch-level readiness and merge gating; full connector cutover and smoke rollout stay in deferred follow-up tasks.

## Design Divergence

- None.

## Attempt Log

- 2026-03-14: created to fold review-thread hygiene into the machine-readable merge gate for dev PRs.
- 2026-03-16: kept live after `I-0008` because current-head thread hygiene is part of the near-term PR delivery subflow.
- 2026-03-24: archived as superseded after the repository removed the PR-specific harness instead of keeping a merge-readiness lane.

## Review Notes

- Specialist review: `harness-reviewer` internal review pass on 2026-03-17. No blocking findings; thread-aware readiness remains deterministic, branch-level, and covered by the readiness spec suite.
- PO review: `po-reviewer` internal review pass on 2026-03-17. No blocking findings; merge timing remains predictable while the broader connector rollout stays staged and deferred.

---
id: I-0008-050
title: Clarify optional PR attachment metadata in the supervisor model
parent: I-0008-agent-company-workflow
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0008-030
  - I-0008-040
blocked_by: []
verify:
  - rg -n "pr_number|head_sha|attachment|optional PR" docs/runbooks/task-supervisor.md design/initiatives/I-0008-agent-company-workflow.md tasks/I-0008-agent-company-workflow
artifacts:
  - docs/runbooks/task-supervisor.md
  - design/initiatives/I-0008-agent-company-workflow.md
---

## Goal

Define how the task-sidecar supervisor may mirror optional PR metadata for continuity without creating a second readiness workflow.

## Done Criteria

- PR attachment rules are explicit
- `pr_number` and `head_sha` become mandatory once PR mirroring begins
- PR-backed resume is fail-closed on identity mismatch
- no alternate readiness logic is introduced

## Notes

- The repository no longer maintains a PR-specific harness. This task is only about optional continuity metadata.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: optional PR attachment stays continuity-only and does not create another workflow truth.
- PO reviewer should check: task truth remains primary even when a branch or PR is present.

## Handoff

- `I-0008-060` and `I-0008-070` will layer the thin supervisor and cutover rules on top of this continuity model.

## Design Divergence

- Record any place where optional PR metadata would be forced to guess state instead of reading canonical branch state.

## Attempt Log

- 2026-03-14: renamed from the older intake-interview draft to the PR adapter lane.
- 2026-03-24: repointed after the repository retired the PR-specific harness and kept only optional PR attachment metadata.

## Review Notes

- Specialist review:
- PO review:

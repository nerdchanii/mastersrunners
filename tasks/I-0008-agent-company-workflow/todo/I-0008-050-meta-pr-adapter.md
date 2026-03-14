---
id: I-0008-050
title: Adapt the existing PR lane as a mirror-only subflow
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
  - rg -n "merge-dev-pr.sh|pr_number|head_sha|readiness|thread" docs/guides/ai-pr-review-workflow.md docs/runbooks/task-supervisor.md tasks/I-0008-agent-company-workflow
artifacts:
  - docs/guides/ai-pr-review-workflow.md
  - scripts/merge-dev-pr.sh
---

## Goal

Define how the task-sidecar supervisor attaches to an existing PR and mirrors branch-level readiness and thread truth without creating a second PR state machine.

## Done Criteria

- PR attachment rules are explicit
- `pr_number` and `head_sha` become mandatory once PR mirroring begins
- PR-backed resume is fail-closed on identity mismatch
- no alternate readiness logic is introduced

## Notes

- Existing I-0003 branch-level truth remains canonical for PR readiness and review threads.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the adapter consumes the existing PR lane instead of forking it.
- PO reviewer should check: the branch-level automation remains subordinate to task truth.

## Handoff

- `I-0008-060` and `I-0008-070` will layer the thin supervisor and cutover rules on top of this adapter.

## Design Divergence

- Record any place where the adapter would be forced to guess PR truth instead of reading canonical branch state.

## Attempt Log

- 2026-03-14: renamed from the older intake-interview draft to the PR adapter lane.

## Review Notes

- Specialist review:
- PO review:

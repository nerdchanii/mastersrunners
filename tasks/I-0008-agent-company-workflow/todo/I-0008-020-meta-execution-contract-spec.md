---
id: I-0008-020
title: Define task-sidecar runtime contract schema
parent: I-0008-agent-company-workflow
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0008-010
blocked_by: []
verify:
  - rg -n "runtime.yaml|lease|heartbeat|next_safe_action|branch" design/initiatives/I-0008-agent-company-workflow.md tasks/I-0008-agent-company-workflow docs/runbooks/task-supervisor.md
artifacts:
  - design/initiatives/I-0008-agent-company-workflow.md
  - docs/runbooks/task-supervisor.md
---

## Goal

Define the location, schema, and update rules for a resumable per-task sidecar runtime contract.

## Done Criteria

- the runtime sidecar path is fixed as `<task-id>.runtime.yaml`
- required fields are fixed
- update cadence and resumption procedure are documented
- the sidecar is framed as source of continuity only, not task status duplication

## Notes

- Keep the sidecar machine-readable and minimal.
- It must survive total agent/session loss.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the sidecar is sufficient for resumption without becoming a second task file.
- PO reviewer should check: the contract improves reliability without turning routine work into metadata busywork.

## Handoff

- `I-0008-030`, `I-0008-040`, and `I-0008-060` will consume this schema directly.

## Design Divergence

- Record any mismatch between desired resumability and what the current task layout can support.

## Attempt Log

- 2026-03-14: seeded after the top-level initiative to formalize resumable execution state.

## Review Notes

- Specialist review:
- PO review:

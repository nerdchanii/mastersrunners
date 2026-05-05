---
id: I-0001-030
title: Split deployment design runbook and verification
parent: I-0001-harness-foundation
scope: ops
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0001-020
blocked_by: []
verify:
  - bash -n scripts/verify-deployment.sh
artifacts:
  - design/architecture/deployment.md
  - docs/runbooks/deployment.md
  - docs/runbooks/rollback.md
  - scripts/verify-deployment.sh
  - .github/workflows/deploy.yml
---

## Goal

Separate deployment architecture, operational runbook, rollback procedure, and executable verification.

## Done Criteria

- deployment architecture is documented separately from operations
- runbook and rollback docs exist
- deploy workflow uses the shared verification script

## Notes

- Fixed the health-check contract to use `/health`

## Handoff

- Future deploy changes must update workflow, script, and runbooks together

## Attempt Log

- 2026-03-11: added deployment harness documents and verification script

## Review Notes

- Specialist review: harness-reviewer - deployment structure, runbook split, and shared verification script are consistent, and the `/health` contract mismatch is fixed.
- PO review: accepted - deployment knowledge is now easier to operate and audit without mixing design, runbook, and execution concerns.

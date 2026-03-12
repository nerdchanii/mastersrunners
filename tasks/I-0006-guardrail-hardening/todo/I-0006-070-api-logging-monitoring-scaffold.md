---
id: I-0006-070
title: Add API logging and monitoring scaffold
parent: I-0006-guardrail-hardening
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-050
blocked_by: []
verify:
  - pnpm --filter @masters/api build
artifacts:
  - apps/api/src/
  - design/operating-rules/exceptions.md
---

## Goal

Introduce structured logging and env-gated monitoring scaffolding without pretending live vendor hookup is complete in-repo.

## Done Criteria

- structured logging baseline is implemented
- monitoring scaffold exists behind env flags
- live vendor hookup remains tracked as an exception until externally proven

## Notes

- Actual DSN/project hookup is not part of this task.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Follow-up ops work can remove the exception when external proof exists.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

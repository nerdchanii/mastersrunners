---
id: I-0006-050
title: Add dead-code guard
parent: I-0006-guardrail-hardening
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0006-010
blocked_by: []
verify:
  - pnpm knip
artifacts:
  - knip.json
  - package.json
---

## Goal

Introduce a dead-code detector with an explicit ignore policy.

## Done Criteria

- knip config exists
- CI blocks new dead code according to the committed policy

## Notes

- Ignore list must be justified, not blanket.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Readability refactors should use knip output as a cleanup aid, not as a behavior spec.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

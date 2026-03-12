---
id: I-0006-040
title: Add dependency and security automation
parent: I-0006-guardrail-hardening
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-050
blocked_by: []
verify:
  - test -f .github/dependabot.yml
  - find .github/workflows -maxdepth 1 -type f | sort
artifacts:
  - .github/dependabot.yml
  - .github/workflows/
---

## Goal

Add in-repo dependency and security automation that does not rely on external policy memory.

## Done Criteria

- Dependabot config exists
- CodeQL and dependency review automation exist

## Notes

- External alert routing remains an exception until proven outside the repo.

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Monitoring hookup exceptions should remain separate from this automation task.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.

## Review Notes

- Specialist review:
- PO review:

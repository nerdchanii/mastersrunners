---
id: I-0006-040
title: Add dependency and security automation
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
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

- Specialist reviewer should check: Dependabot and security workflows are repo-native, minimal, and do not depend on out-of-band admin memory.
- PO reviewer should check: automated update and security signals are proportionate to maintenance risk without inventing external operations policy.

## Handoff

- Monitoring hookup exceptions should remain separate from this automation task.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: Added `.github/dependabot.yml` for weekly npm and GitHub Actions updates.
- 2026-03-12: Added `codeql.yml` and `dependency-review.yml` so security automation exists in-repo for push/pull-request paths.

## Review Notes

- Specialist review: `harness-reviewer` approved. Dependabot, CodeQL, and dependency review automation are committed in-repo and stay within the documented scope.
- PO review: approved. The task adds useful update/security automation without overclaiming external operations closure.

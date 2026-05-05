---
id: I-0002-020
title: Add formatter and pre-commit hook foundation
parent: I-0002-harness-verification
scope: ci
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0002-010
blocked_by: []
verify:
  - test -f .husky/pre-commit
artifacts:
  - .husky/pre-commit
  - scripts/pre-commit.sh
  - package.json
---

## Goal

Introduce fast local guardrails before work reaches CI.

## Done Criteria

- formatter choice is explicit
- pre-commit hook exists
- hook runtime stays fast enough for agent loops

## Notes

- Prettier is now the explicit formatter for harness-owned paths.
- The hook runs a staged-file Prettier check and then workspace lint instead of formatting the entire repository on every commit.
- Husky installation is active through `core.hooksPath=.husky/_`.

## Handoff

- If hook runtime becomes too expensive, split lint by touched workspace rather than lowering the guardrails entirely.

## Attempt Log

- 2026-03-11: added Prettier, Husky, `.husky/pre-commit`, and a staged-file `scripts/pre-commit.sh` guard instead of a whole-repo formatting gate

## Review Notes

- Specialist review: harness-reviewer - the staged-file formatter check avoids whole-repo churn and keeps the pre-commit loop usable for agent work.
- PO review: accepted with follow-up - the local guardrail is materially better, but review/task metadata enforcement still needs to be added separately.

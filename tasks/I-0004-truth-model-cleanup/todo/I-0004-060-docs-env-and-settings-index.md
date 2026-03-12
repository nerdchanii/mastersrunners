---
id: I-0004-060
title: Add environment and settings index to entry docs
parent: I-0004-truth-model-cleanup
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-020
blocked_by: []
verify:
  - rg -n "Environment|configuration|env" README.md AGENTS.md docs/runbooks -g '*.md'
artifacts:
  - README.md
  - AGENTS.md
  - docs/runbooks/
---

## Goal

Make environment-variable and runtime-configuration guidance discoverable from the repo entrypoints.

## Done Criteria

- entry docs link to the authoritative env/config guidance
- readers can find setup-sensitive runtime settings without searching old plans

## Notes

- This task should add index-level guidance, not duplicate every env var in multiple files.

## Review Focus

- Specialist reviewer should check: the entrypoint guidance points to the right current runbooks and avoids duplicating volatile config details.
- PO reviewer should check: onboarding friction drops for a first-time agent or developer.

## Handoff

- I-0005 design corpus tasks may add deeper runtime docs, but the entrypoint index should remain the first hop.

## Attempt Log

- 2026-03-12: created as follow-up when the scorecard showed env/config guidance was still incomplete at the repo entrypoint level.

## Review Notes

- Specialist review:
- PO review:

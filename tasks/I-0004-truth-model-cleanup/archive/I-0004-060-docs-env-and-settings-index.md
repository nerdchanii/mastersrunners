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

## Self Review

- Scope and intent: limited to root entrypoint docs and a runbook index so env/config guidance becomes a first-hop path.
- Source of truth: root docs will point to the runbook index, which in turn points to the deployment runbook, `.env.production.example`, and module-specific config docs.
- Design divergence: no design downgrade is involved; this task improves discoverability only.
- Verification: run the task `rg` command after updating `README.md`, `AGENTS.md`, and `docs/runbooks/`.
- Review routing: `docs-reviewer` checks discoverability and duplication risk, `harness-reviewer` checks source-of-truth boundaries, and `po-reviewer` checks onboarding value.

## Review Focus

- Specialist reviewer should check: the entrypoint guidance points to the right current runbooks and avoids duplicating volatile config details.
- PO reviewer should check: onboarding friction drops for a first-time agent or developer.

## Handoff

- I-0005 design corpus tasks may add deeper runtime docs, but the entrypoint index should remain the first hop.

## Attempt Log

- 2026-03-12: created as follow-up when the scorecard showed env/config guidance was still incomplete at the repo entrypoint level.
- 2026-03-12: started by adding a dedicated runbook index instead of copying variable lists into multiple entry docs.
- 2026-03-12: added `docs/runbooks/environment-and-settings.md`, routed `README.md` and `AGENTS.md` to it, and updated the score snapshot after verification passed.

## Review Notes

- Specialist review: `docs-reviewer` found no blocking issues. Root entry docs now point to one stable env/config index instead of duplicating volatile variable lists. `harness-reviewer` found no blocking issues. The new runbook preserves source-of-truth boundaries by routing readers to deployment/runbook sources and the example env file instead of turning `README.md` into a config spec.
- PO review: `po-reviewer` found no blocking issues. A first-time agent or developer can now find runtime settings from the repository entrypoints without searching legacy plans or code.

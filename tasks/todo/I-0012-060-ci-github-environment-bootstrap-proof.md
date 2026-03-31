---
id: I-0012-060
title: Bootstrap GitHub deploy environments and external proof for dual API lanes
parent: I-0012-supabase-postgres-rollout
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0012-050
blocked_by: []
verify:
  - pnpm exec prettier --check docs/runbooks/deployment.md design/operating-rules/exceptions.md tasks/todo/I-0012-060-ci-github-environment-bootstrap-proof.md
artifacts:
  - docs/runbooks/deployment.md
  - design/operating-rules/exceptions.md
---

## Goal

Prove and record the external GitHub/GCP environment bootstrap needed for the branch-aware API deploy lanes.

## Done Criteria

- GitHub environments `dev` and `production` exist with the expected branch protections
- each environment has the required secrets and variables for its API deploy lane
- any remaining unproven dashboard-only state is captured as a durable exception instead of chat-only knowledge

## Notes

- This task is intentionally external-state heavy.
- The repo-side workflow/docs contract is already tracked in `I-0012-050`.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
  - external bootstrap proof is explicit and does not leak secret values
- PO reviewer should check:
  - the deploy environments match the intended dev/main release process

## Handoff

- Complete this task while creating the actual GitHub environments, GCP project(s), service accounts, Secret Manager entries, and Cloud Run services.

## Design Divergence

- None intended. This task exists so external environment setup is provable.

## Attempt Log

- 2026-03-31: created as the follow-up proof task after `I-0012-050` established the repo-side dual-lane deploy contract.

## Review Notes

- Specialist review:
- PO review:

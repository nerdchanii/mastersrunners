---
id: I-0012-030
title: Prepare Supabase Pro upgrade before public beta uptime commitments
parent: I-0012-supabase-postgres-rollout
scope: db
owner: unassigned
reviewers:
  - backend-reviewer
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0012-020
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/auth
artifacts:
  - docs/runbooks/deployment.md
  - design/operating-rules/exceptions.md
---

## Goal

Upgrade the Supabase rollout from Free-plan bring-up to a public-beta-ready posture with an explicit uptime and billing decision.

## Done Criteria

- the chosen Supabase plan supports the intended public beta uptime expectations
- dashboard proof for the live project and billing posture is captured without leaking secrets
- any Cloud Run scaling or connection-pool changes needed for the paid plan are documented and verified

## Notes

- Free is acceptable for initial setup only; this task exists so that risk does not disappear into tribal knowledge.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
  - uptime/billing assumptions are concrete and externally provable
- PO reviewer should check:
  - the public beta promise matches the chosen paid posture

## Handoff

- Carry forward the actual project ref, billing proof, and any Cloud Run scaling adjustments made at upgrade time.

## Design Divergence

- Current rollout intentionally stops short of claiming Free-plan uptime is acceptable for public beta.

## Attempt Log

- 2026-03-31: created as the explicit follow-up so the Free-plan bring-up choice does not become an untracked launch assumption.

## Review Notes

- Specialist review:
- PO review:

---
id: I-0006-090
title: Expand explicit typecheck coverage to API and database packages
parent: I-0006-guardrail-hardening
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0006-080
blocked_by: []
verify:
  - pnpm --filter @masters/api exec tsc -p tsconfig.build.json --noEmit
  - pnpm --filter @masters/database db:generate
  - pnpm --filter @masters/database exec tsc -p tsconfig.json --noEmit
artifacts:
  - apps/api/tsconfig.build.json
  - packages/database/tsconfig.json
  - .github/workflows/ci.yml
---

## Goal

Roll the explicit typecheck guard forward to API and database packages once the current type debt is split and addressed.

## Done Criteria

- API explicit typecheck passes without relying on build side effects
- database explicit typecheck passes after generation setup
- CI typecheck coverage includes those packages

## Notes

- This task was split out of `I-0006-080` because the current API/database type errors are broader than a quick guardrail task.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- none

## Design Divergence

- none

## Attempt Log

- 2026-03-12: created as an explicit follow-up once API/database typecheck attempts exposed broader code debt.

## Review Notes

- Specialist review:
- PO review:

---
id: I-0006-090
title: Expand explicit typecheck coverage to API and database packages
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
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
  - package.json
---

## Goal

Roll the explicit typecheck guard forward to API and database packages once the current type debt is split and addressed.

## Done Criteria

- API explicit typecheck passes without relying on build side effects
- database explicit typecheck passes after generation setup
- CI typecheck coverage includes those packages

## Notes

- This task was split out of `I-0006-080` because the current API/database type errors were broader than a quick guardrail task at the time.
- 2026-03-12: targeted type-only fixes reduced the remaining debt enough to close the rollout in one task.

## Self Review

- Scope and intent: expanded explicit typecheck coverage to API and database without widening into unrelated refactors.
- Source of truth: root `pnpm typecheck`, CI, and this task now agree on database/types/API/web coverage.
- Design divergence: none; this closes the follow-up instead of weakening the guardrail claim.
- Verification: `pnpm --filter @masters/api exec tsc -p tsconfig.build.json --noEmit`, `pnpm --filter @masters/database db:generate`, `pnpm --filter @masters/database exec tsc -p tsconfig.json --noEmit`, and `pnpm typecheck` are the completion gates.
- Review routing: `harness-reviewer`, `backend-reviewer`, and `po-reviewer` cover this CI/runtime boundary lane.

## Review Focus

- Specialist reviewer should check: API/database are truly covered by explicit typecheck and the supporting type fixes are behavior-preserving.
- PO reviewer should check: the rollout makes CI and local guardrails more trustworthy without broadening scope.

## Handoff

- none

## Design Divergence

- none

## Attempt Log

- 2026-03-12: created as an explicit follow-up once API/database typecheck attempts exposed broader code debt.
- 2026-03-12: added targeted type annotations across API services/repositories and expanded the root `typecheck` command to include database and API coverage.

## Review Notes

- Specialist review:
  - `harness-reviewer` pass on 2026-03-12: confirmed the guardrail claim now matches what CI and `pnpm typecheck` actually execute.
  - `backend-reviewer` pass on 2026-03-12: confirmed the API type-only fixes are behavior-preserving and sufficient for explicit typecheck rollout.
- PO review:
  - `po-reviewer` pass on 2026-03-12: accepted because the rollout removes ambiguity from the autonomous feedback loop.

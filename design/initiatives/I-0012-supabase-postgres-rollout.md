# I-0012: Supabase Postgres Rollout

## Summary

Move the managed database target from an unspecified PostgreSQL host to Supabase Postgres while preserving the current Cloud Run API and Cloudflare Pages/R2 hosting split.

## Problem

The repository currently documents generic PostgreSQL deployment assumptions, but the active rollout path now favors Supabase for lower operator pain. The repo also lacks a first-class split between runtime DB access and migration/operator DB access.

## Goals

- make Supabase Postgres the documented managed DB target
- split runtime and migration/operator connection handling
- keep Cloud Run runtime lean and cost-capped for the beta phase
- track external Supabase and Cloudflare proof without leaking secrets into the repo

## Non-Goals

- moving the API runtime off Cloud Run
- adopting Supabase Auth, Storage, Realtime, or Edge Functions
- promoting Supabase Free to the final public-beta uptime target

## Scope

- `packages/database`
- `.env.production.example`
- `.github/workflows/deploy.yml`
- `docs/runbooks/`
- `design/architecture/`
- `design/backend/`
- `tasks/`

## Design References

- `docs/runbooks/deployment.md`
- `docs/runbooks/environment-and-settings.md`
- `design/architecture/deployment.md`
- `design/backend/persistence-model.md`
- `design/operating-rules/exceptions.md`

## Review Plan

- DB/runtime contract work: `backend-reviewer`
- deploy workflow and task-state work: `harness-reviewer`
- doc clarity and source-of-truth sync: `docs-reviewer`
- PO review checks whether the rollout reduces setup pain without hiding free-plan uptime risk

## Task Breakdown

- `tasks/archive/I-0012-010-db-supabase-runtime-contract.md`
- `tasks/archive/I-0012-020-docs-supabase-rollout-and-proof.md`
- `tasks/archive/I-0012-040-ci-dev-only-deploy-gating.md`
- `tasks/archive/I-0012-050-ci-dual-branch-api-deploy-lanes.md`
- `tasks/active/I-0012-060-ci-dev-lane-proof-and-cloudflare-api-routing.md`
- `tasks/archive/I-0012-070-ci-fix-dev-pipeline-regressions.md`
- `tasks/archive/I-0012-080-api-stabilize-challenge-coverage-dates.md`
- `tasks/active/I-0012-090-ci-cloud-run-runtime-service-account-rollout.md`
- `tasks/active/I-0012-100-api-use-nest-body-parser-api.md`
- `tasks/active/I-0012-110-ci-wire-optional-oauth-runtime-secrets.md`
- `tasks/archive/I-0012-120-api-accept-jwt-timespan-envs.md`
- `tasks/archive/I-0012-130-ci-skip-markdown-only-runs.md`
- `tasks/todo/I-0012-030-docs-supabase-free-tier-rollout-posture.md`
- `tasks/todo/I-0012-140-api-prefixed-health-endpoint-alignment.md`

## Success Criteria

- repo runtime and Prisma CLI use the intended Supabase connection paths
- current branch deploy lanes apply only additive automated migrations and seed data before rollout
- deployment docs and env examples match the Supabase rollout
- Cloud Run beta posture is capped to a low-cost default
- external platform proof is tracked without committing secrets

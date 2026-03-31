---
id: I-0012-090
title: Wire branch deploy lanes to explicit Cloud Run runtime service accounts
parent: I-0012-supabase-postgres-rollout
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0012-050
  - I-0012-060
blocked_by: []
verify:
  - pnpm exec prettier --check .github/workflows/deploy.yml docs/runbooks/deployment.md docs/runbooks/environment-and-settings.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/active/I-0012-090-ci-cloud-run-runtime-service-account-rollout.md
  - gh api repos/nerdchanii/mastersrunners/environments/dev/variables | rg 'CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT'
  - gh api repos/nerdchanii/mastersrunners/environments/production/variables | rg 'CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT'
  - gcloud run services describe masters-runners-api-dev --project mastersrunners-dev-20260331 --region asia-northeast3 --format='value(status.url)'
artifacts:
  - .github/workflows/deploy.yml
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Keep branch-aware API deploys from falling back to the default Compute Engine service account by wiring each lane to the explicit Cloud Run runtime service account that was bootstrapped in GCP.

## Done Criteria

- deploy workflow validates and uses `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT`
- GitHub environments `dev` and `production` each define the expected runtime service account value
- the dev deploy lane can create `masters-runners-api-dev` successfully with the explicit runtime identity

## Notes

- The external GCP bootstrap already created `cloud-run-runtime@...` identities and granted `iam.serviceAccountUser` on them to the GitHub deployer identities.
- This task is a follow-up because `gcloud run deploy` otherwise tries to act as the default Compute Engine service account on first service creation.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
  - the workflow no longer relies on implicit default service accounts during Cloud Run creation
- PO reviewer should check:
  - the deploy contract stays understandable for operators bootstrapping dev and production lanes

## Handoff

- After this task, the next operational step is wiring the Cloudflare `/api/*` proxy to the created Cloud Run service URL.

## Design Divergence

- None intended.

## Attempt Log

- 2026-03-31: observed dev deploy failures after DB bootstrap succeeded because `gcloud run deploy` tried to act as `407655598720-compute@developer.gserviceaccount.com` instead of the dedicated `cloud-run-runtime@...` identity.
- 2026-03-31: added `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT` to both GitHub environments so branch deploy lanes can target `cloud-run-runtime@mastersrunners-dev-20260331.iam.gserviceaccount.com` and `cloud-run-runtime@mastersrunners-prod-20260331.iam.gserviceaccount.com`.

## Review Notes

- Specialist review:
- PO review:

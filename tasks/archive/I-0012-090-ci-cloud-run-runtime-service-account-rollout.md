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
  - pnpm exec prettier --check .github/workflows/deploy.yml docs/runbooks/deployment.md docs/runbooks/environment-and-settings.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/archive/I-0012-090-ci-cloud-run-runtime-service-account-rollout.md
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

- Scope and intent: keep the change on deploy-lane identity wiring so first-time Cloud Run creation never falls back to the default Compute Engine service account.
- Source of truth: `.github/workflows/deploy.yml`, `docs/runbooks/deployment.md`, and `docs/runbooks/environment-and-settings.md` define the runtime identity contract.
- Design divergence: none intended; the task makes the documented GCP bootstrap contract explicit inside the deploy workflow.
- Verification: `pnpm exec prettier --check ...`, `gh api` checks for dev/production environment variables, and `gcloud run services describe masters-runners-api-dev ... --format='value(status.url,spec.template.spec.serviceAccountName)'` all passed on 2026-04-01.
- Review routing: `harness-reviewer` covers workflow/runtime identity correctness, `docs-reviewer` covers operator clarity, and `po-reviewer` covers rollout usability.

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
- 2026-04-01: re-verified the repo contract and external lane state. GitHub environments expose `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT`, and `masters-runners-api-dev` now reports `cloud-run-runtime@mastersrunners-dev-20260331.iam.gserviceaccount.com` as the live Cloud Run runtime identity.

## Review Notes

- Specialist review: harness-reviewer and docs-reviewer lenses say the deploy workflow now validates and uses the explicit runtime identity, and the runbooks explain that contract without leaving first-service creation behavior implicit.
- PO review: deploy operators now have a clearer bootstrap contract with no product-facing behavior change beyond removing a fragile first-deploy failure mode.

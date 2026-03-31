---
id: I-0012-060
title: Capture dev-lane deploy proof and Cloudflare same-domain API routing
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
  - bash -n scripts/bootstrap-gcp-secrets.sh
  - pnpm exec prettier --check docs/runbooks/deployment.md docs/runbooks/environment-and-settings.md design/operating-rules/exceptions.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/active/I-0012-060-ci-dev-lane-proof-and-cloudflare-api-routing.md
artifacts:
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - scripts/bootstrap-gcp-secrets.sh
  - design/operating-rules/exceptions.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Prove and record the external dev-lane bootstrap and same-domain API routing needed for the current pre-launch environment.

## Done Criteria

- the `dev` GitHub/GCP environment and Cloud Run service proof is explicit and durable
- Cloudflare same-domain routing from `dev.mastersrunners.com` to the dev API is externally checked and recorded
- intentionally deferred `main` or apex cutover work is called out as future rollout work instead of being mixed into current dev acceptance

## Notes

- This task is intentionally external-state heavy.
- The repo-side workflow/docs contract is already tracked in `I-0012-050`.
- The current rollout phase treats `dev` as the live verification lane while `mastersrunners.com` stays on the placeholder host.

## Self Review

- Scope and intent: the task now focuses on the current dev lane and its same-domain API routing instead of treating deferred production rollout work as an immediate blocker.
- Source of truth: the task records external GitHub, GCP, and Cloudflare state without committing secret values.
- Design divergence: none intended; the remaining gap is Cloudflare routing proof and health-path alignment for the dev host.
- Verification: pending targeted `prettier --check` once the narrowed scope notes settle.
- Review routing: `harness-reviewer` and `docs-reviewer` remain appropriate because this is operator-facing proof and rollout evidence.

## Review Focus

- Specialist reviewer should check:
  - dev-lane proof is explicit, current, and does not leak secret values
- PO reviewer should check:
  - the task reflects the current rollout strategy where dev proof comes first and apex launch is intentionally deferred

## Handoff

- Follow-up health-path alignment is tracked separately in `I-0012-140`; future `main` or apex launch proof should be handled when the placeholder host is retired.

## Design Divergence

- None intended. This task exists so external environment setup is provable.

## Attempt Log

- 2026-03-31: created as the follow-up proof task after `I-0012-050` established the repo-side dual-lane deploy contract.
- 2026-03-31: created GCP projects `mastersrunners-dev-20260331` and `mastersrunners-prod-20260331`, linked both to billing account `016BB0-159A97-CD605F`, and placed them under organization `510739070146`.
- 2026-03-31: enabled Cloud Run, Artifact Registry, Secret Manager, IAM, IAM Credentials, STS, and Cloud Resource Manager APIs in both projects.
- 2026-03-31: created Artifact Registry repo `masters-runners` in `asia-northeast3` for both projects.
- 2026-03-31: created service accounts `github-deployer@mastersrunners-dev-20260331.iam.gserviceaccount.com`, `cloud-run-runtime@mastersrunners-dev-20260331.iam.gserviceaccount.com`, `github-deployer@mastersrunners-prod-20260331.iam.gserviceaccount.com`, and `cloud-run-runtime@mastersrunners-prod-20260331.iam.gserviceaccount.com`.
- 2026-03-31: granted `run.admin`, `artifactregistry.writer`, `secretmanager.secretAccessor`, and `iam.serviceAccountUser` bindings needed for the deployer/runtime split in both projects.
- 2026-03-31: created workload identity pools/providers per project with repo restriction `nerdchanii/mastersrunners` and branch restriction per lane:
  - dev provider: `projects/407655598720/locations/global/workloadIdentityPools/github-actions/providers/github-dev`
  - prod provider: `projects/96526066749/locations/global/workloadIdentityPools/github-actions/providers/github-main`
- 2026-03-31: created GitHub environments `dev` and `production`, then populated lane-scoped secrets `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, and `GCP_SERVICE_ACCOUNT` for each environment.
- 2026-03-31: set GitHub environment variables `CLOUD_RUN_SERVICE_NAME=masters-runners-api-dev` and `FRONTEND_URL=https://dev.mastersrunners.com` for `dev`, plus `CLOUD_RUN_SERVICE_NAME=masters-runners-api` and `FRONTEND_URL=https://mastersrunners.com` for `production`.
- 2026-03-31: added `scripts/bootstrap-gcp-secrets.sh` so local operator env files can upsert the required Secret Manager values into `mastersrunners-dev-20260331` and `mastersrunners-prod-20260331` without committing or sharing raw secrets.
- 2026-03-31: synced the dev Secret Manager lane with corrected Supabase transaction/session pooler URLs after proving locally that `pnpm db:migrate:deploy` and `pnpm db:seed` require `uselibpqcompat=true` in both connection strings.
- 2026-03-31: first `dev` branch deploy created Cloud Run service `masters-runners-api-dev` and published stable URL `https://masters-runners-api-dev-e2m534vcpa-du.a.run.app`; `scripts/verify-deployment.sh` now passes against that service.
- 2026-04-01: confirmed `https://dev.mastersrunners.com/api/v1/auth/providers` returns provider availability, so OAuth provider secret population is no longer an open dev-lane blocker.
- 2026-04-01: narrowed the task to current dev-lane proof and Cloudflare same-domain API routing because `mastersrunners.com` intentionally remains on the placeholder host until later rollout work.

## Review Notes

- Specialist review:
- PO review:

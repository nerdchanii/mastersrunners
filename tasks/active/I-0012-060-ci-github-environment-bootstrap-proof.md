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
  - bash -n scripts/bootstrap-gcp-secrets.sh
  - pnpm exec prettier --check docs/runbooks/deployment.md docs/runbooks/environment-and-settings.md design/operating-rules/exceptions.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/active/I-0012-060-ci-github-environment-bootstrap-proof.md
artifacts:
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - scripts/bootstrap-gcp-secrets.sh
  - design/operating-rules/exceptions.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
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

- Scope and intent: this task is now in progress for external bootstrap proof only; repo-side branch-aware deploy logic already shipped in `I-0012-050`.
- Source of truth: the task records external GCP and GitHub environment bootstrap facts without committing secret values.
- Design divergence: none intended yet; the remaining gap is unproven GitHub environment settings and missing Secret Manager/Cloud Run runtime state.
- Verification: pending targeted `prettier --check` once the proof notes and any matching exception updates settle.
- Review routing: `harness-reviewer` and `docs-reviewer` remain appropriate because the task is about durable external-state proof and operator-facing evidence.

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
- 2026-03-31: remaining external work is OAuth provider secret population per lane, Cloudflare `/api/*` proxy wiring, production-lane proof, and optional cleanup/deletion of the old `mastersrunners` project after cutover.

## Review Notes

- Specialist review:
- PO review:

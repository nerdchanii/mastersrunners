---
id: I-0012-110
title: Wire optional OAuth runtime secrets into Cloud Run deploy lanes
parent: I-0012-supabase-postgres-rollout
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0012-060
blocked_by: []
verify:
  - pnpm exec prettier --check .github/workflows/deploy.yml docs/runbooks/deployment.md docs/runbooks/environment-and-settings.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/active/I-0012-110-ci-wire-optional-oauth-runtime-secrets.md
  - gh api repos/nerdchanii/mastersrunners/environments/dev/variables | rg 'KAKAO_CALLBACK_URL|GOOGLE_CALLBACK_URL|NAVER_CALLBACK_URL'
  - gh api repos/nerdchanii/mastersrunners/environments/production/variables | rg 'KAKAO_CALLBACK_URL|GOOGLE_CALLBACK_URL|NAVER_CALLBACK_URL'
artifacts:
  - .github/workflows/deploy.yml
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Make branch deploy lanes capable of exposing configured OAuth providers by wiring optional provider credentials from Secret Manager into Cloud Run and documenting the remaining operator contract.

## Done Criteria

- deploy workflow forwards optional OAuth client IDs and secrets when matching Secret Manager entries exist
- GitHub environments define branch-scoped OAuth callback URLs
- docs explain why `/auth/providers` stays empty until provider credentials exist in Secret Manager

## Notes

- Provider secrets remain optional because some lanes may intentionally ship without social login.
- Callback URLs stay in GitHub environment variables because they are branch-domain metadata, not secrets.

## Self Review

- Scope and intent: keep the change on deploy wiring and operator docs; do not redesign auth flows or token transport here.
- Source of truth: `.github/workflows/deploy.yml` defines runtime secret injection and `docs/runbooks/deployment.md` defines the operator contract.
- Design divergence: none intended; the repo already treated provider credentials as external runtime state.
- Verification: targeted `prettier --check` plus GitHub environment variable reads prove the repo/workflow side of the contract.
- Review routing: `harness-reviewer` covers workflow correctness and `docs-reviewer` covers operator-facing clarity.

## Review Focus

- Specialist reviewer should check:
  - optional provider secrets do not break lanes that intentionally omit social login
- PO reviewer should check:
  - operators have a clear explanation for why login buttons appear or disappear by lane

## Handoff

- After this task, populate `KAKAO_*`, `GOOGLE_*`, and/or `NAVER_*` secrets in Secret Manager for the lane that should expose those providers.

## Design Divergence

- None intended.

## Attempt Log

- 2026-03-31: dev Cloud Run boot and `/health` verification succeeded, but the login page still showed no providers because the deploy workflow did not pass optional OAuth credentials through to runtime.
- 2026-03-31: confirmed `mastersrunners-dev-20260331` Secret Manager currently contains only DB/JWT/R2 secrets, so `/auth/providers` on the dev lane cannot expose Kakao, Google, or Naver until the operator adds `*_CLIENT_ID` and `*_CLIENT_SECRET` entries.
- 2026-03-31: added branch-scoped `KAKAO_CALLBACK_URL`, `GOOGLE_CALLBACK_URL`, and `NAVER_CALLBACK_URL` variables to both GitHub environments so the remaining external work is limited to provider credentials.
- 2026-03-31: after provider secrets were added, Cloud Run still reported all providers unavailable because the deploy workflow probed optional secret existence with `gcloud secrets describe`, which the GitHub deployer identity did not effectively use for this branch lane. Switched the probe to `gcloud secrets versions access latest --project "${PROJECT_ID}" >/dev/null` so it matches the granted Secret Accessor capability.

## Review Notes

- Specialist review: harness-reviewer lens says optional secret discovery in the deploy workflow keeps provider-less lanes stable while letting configured lanes surface OAuth providers without another workflow fork.
- PO review: operator-facing behavior is clearer now because the runbook explicitly ties hidden login buttons to missing provider runtime config instead of leaving that state implicit.

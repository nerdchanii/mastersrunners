---
doc_state: current
owner: harness
last_verified: 2026-04-02
sources:
  - AGENTS.md
  - docs/runbooks/harness-diagnostics.md
---

# Exceptions Register

Exceptions are only for repository controls that cannot be fully proven or closed inside the repository.

## Schema

- `id`: stable `EX-xxxx` identifier
- `related_principles`: one or more `P1`-`P12` principle ids from `harness-diagnostics`
- `repo_control`: stable label for the blocked repository control
- `reason_not_repo_controllable`: why the repo alone cannot satisfy the item
- `external_owner`: who controls the missing proof or setting
- `required_external_proof`: what evidence would close the exception
- `revisit_date`: next required review date
- `unblock_condition`: concrete condition for removing the exception

## Active Exceptions

### EX-0001

- `related_principles`: `P3`, `P10`
- `repo_control`: `branch-protection`
- `reason_not_repo_controllable`: GitHub branch protection and required status checks are repository-host settings, not files in the repo.
- `external_owner`: repository admin
- `required_external_proof`: screenshot or admin confirmation that main is protected and required checks match CI
- `revisit_date`: 2026-04-01
- `unblock_condition`: branch protection is enabled and recorded by external proof

### EX-0002

- `related_principles`: `P8`
- `repo_control`: `monitoring-live-hookup`
- `reason_not_repo_controllable`: monitoring vendor/project hookup and DSN configuration require external project provisioning and secrets.
- `external_owner`: project owner
- `required_external_proof`: active Sentry or equivalent project with DSN configured for web/api
- `revisit_date`: 2026-04-01
- `unblock_condition`: monitoring scaffold is connected to a live project and verified externally

### EX-0003

- `related_principles`: `P8`
- `repo_control`: `prod-alert-routing`
- `reason_not_repo_controllable`: alert routing and production notification destinations live outside the repository.
- `external_owner`: project owner
- `required_external_proof`: alert policy or routing destination for production errors
- `revisit_date`: 2026-04-01
- `unblock_condition`: alert routing is configured and externally verified

### EX-0004

- `related_principles`: `P3`, `P8`, `P10`
- `repo_control`: `cloudflare-pages-runtime-config-and-api-proxy`
- `reason_not_repo_controllable`: Cloudflare Pages branch aliases, custom domains, build environment variables, and same-domain `/api/*` proxy rules are dashboard-managed external state.
- `external_owner`: project owner
- `required_external_proof`: dashboard evidence plus runtime checks showing `dev.mastersrunners.com` points at the `dev` branch build, `VITE_API_URL` is set, and `/api/*` reaches the intended API origin
- `latest_observed_external_state`: 2026-04-02 runtime checks show `https://dev.mastersrunners.com/api/v1/health` and `https://dev.mastersrunners.com/api/v1/auth/providers` still reach the dev API lane through the same-domain Cloudflare route, while public `dev.mastersrunners.com` is no longer being treated as the desired Swagger host.
- `revisit_date`: 2026-05-06
- `unblock_condition`: branch/domain mapping and `/api/*` proxy behavior are externally verified and no longer rely on implicit dashboard state

### EX-0007

- `related_principles`: `P3`, `P8`, `P10`
- `repo_control`: `cloudflare-ops-host-zero-trust-and-operator-routing`
- `reason_not_repo_controllable`: Cloudflare Access applications and policies, custom domains, and Worker routes for the future ops host are dashboard-managed external state.
- `external_owner`: project owner
- `required_external_proof`: evidence that `ops.dev.mastersrunners.com` exists, is fronted by Cloudflare Access, uses the intended same-host Worker route pattern for `/api/*` and `/api-docs*`, and no longer relies on public `dev.mastersrunners.com/api-docs*`.
- `latest_observed_external_state`: 2026-04-02 Cloudflare now has an active `ops.dev.mastersrunners.com` custom domain on the `mastersrunners-ops` Pages project, Worker routes for `ops.dev.mastersrunners.com/api/*` and `ops.dev.mastersrunners.com/api-docs*`, and an Access self-hosted app with an allow policy for `nerdchanii@gmail.com`; follow-up repair `I-0014-280` was opened after live investigation showed the shared `mastersrunners-api-proxy` Worker still only accepted `dev.mastersrunners.com` and only proxied `/api/*`, while the dev Cloud Run service also lacked the ops-specific runtime env needed after Access auth.
- `revisit_date`: 2026-05-06
- `unblock_condition`: the ops host, its Access policy, and its operator-route proxy behavior are externally verified end-to-end

### EX-0005

- `related_principles`: `P3`, `P8`, `P10`
- `repo_control`: `supabase-project-runtime-credentials-and-plan`
- `reason_not_repo_controllable`: Supabase project plan, database password, connect-page URLs, and billing posture are dashboard-managed external state and must not be committed to the repository.
- `external_owner`: project owner
- `required_external_proof`: dashboard evidence showing the intended Supabase project (`mastersrunners-dev`, ref `ziocdlargynmjxjhijqj`) remains in `ap-northeast-2`, runtime and migration URLs are copied into the right secret/operator surfaces, and the chosen `free` plan posture is still intentional for the current dev lane.
- `latest_observed_external_state`: 2026-04-01 checks show organization `nerdchanii's Org` on the `free` plan with `mastersrunners-dev` active in `ap-northeast-2`.
- `revisit_date`: 2026-05-06
- `unblock_condition`: Supabase runtime credentials and plan proof are externally verified and no longer depend on undocumented dashboard state

### EX-0006

- `related_principles`: `P3`, `P8`, `P10`
- `repo_control`: `github-gcp-dual-lane-deploy-environment-bootstrap`
- `reason_not_repo_controllable`: GitHub environment secrets/vars, Cloud Run service creation, Secret Manager secret values, and any eventual deletion of the old `mastersrunners` GCP project are external project settings and credentials that the repo must not embed.
- `external_owner`: project owner
- `required_external_proof`: evidence that the `dev` GitHub environment contains the intended GCP project/WIF/service-account values plus `FRONTEND_URL=https://dev.mastersrunners.com`, `OPS_FRONTEND_URL=https://ops.dev.mastersrunners.com`, `JWT_ACCESS_TTL=15m`, `JWT_REFRESH_TTL=7d`, `R2_PUBLIC_URL=https://assets.dev.mastersrunners.com`, and `KAKAO_CALLBACK_URL=https://dev.mastersrunners.com/api/v1/auth/kakao/callback`; that the `production` GitHub environment still contains the baseline branch deploy values plus `KAKAO_CALLBACK_URL=https://mastersrunners.com/api/v1/auth/kakao/callback` while its JWT/R2 env migration remains deferred; that Cloud Run services `masters-runners-api-dev` and `masters-runners-api` exist in projects `mastersrunners-dev-20260331` and `mastersrunners-prod-20260331`; and that the dev Secret Manager inventory has been reduced to `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_BUCKET_NAME`, and `R2_SECRET_ACCESS_KEY` without leaking credential values.
- `latest_observed_external_state`: 2026-04-22 checks confirmed the dev lane serves `masters-runners-api-dev` revision `masters-runners-api-dev-00059-zct` under `cloud-run-runtime@mastersrunners-dev-20260331.iam.gserviceaccount.com`, the dev GitHub environment now includes `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, and `R2_PUBLIC_URL`, the dev Secret Manager inventory was pruned to nine secrets with one enabled version each, and `/api/v1/health` plus `/api/v1/auth/providers` still report healthy Kakao-only runtime state. The production GitHub environment still exposes `KAKAO_CALLBACK_URL=https://mastersrunners.com/api/v1/auth/kakao/callback` while its JWT/R2 env migration remains intentionally deferred.
- `revisit_date`: 2026-05-06
- `unblock_condition`: branch-aware GitHub/GCP deploy environments are externally verified end-to-end and no longer depend on undocumented dashboard or credential state

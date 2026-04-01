---
id: I-0006-180
title: Derive the R2 runtime endpoint so production lanes do not fall back to disk storage
parent: I-0006-guardrail-hardening
scope: api
owner: codex
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/uploads/storage/r2-storage.adapter.spec.ts src/uploads/storage/r2-runtime.spec.ts
  - pnpm --filter @masters/api build
  - pnpm --filter @masters/api lint
  - pnpm exec prettier --check --ignore-unknown apps/api/src/uploads/storage/r2-storage.adapter.ts apps/api/src/uploads/storage/r2-runtime.ts apps/api/src/uploads/storage/r2-runtime.spec.ts apps/api/src/uploads/uploads.module.ts docs/runbooks/deployment.md docs/runbooks/environment-and-settings.md design/backend/upload-ingestion.md design/initiatives/I-0006-guardrail-hardening.md tasks/active/I-0006-180-api-r2-runtime-endpoint-derivation.md
artifacts:
  - apps/api/src/uploads/storage/r2-storage.adapter.ts
  - apps/api/src/uploads/storage/r2-runtime.ts
  - apps/api/src/uploads/uploads.module.ts
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - design/backend/upload-ingestion.md
---

## Goal

Keep production-like lanes on the R2 adapter when the runtime has the standard Cloudflare R2 account credentials, even if `R2_ENDPOINT` is not explicitly injected as a separate environment variable.

## Done Criteria

- the API derives the standard Cloudflare R2 endpoint from `R2_ACCOUNT_ID` when `R2_ENDPOINT` is absent
- storage-adapter selection no longer falls back to disk mode in production solely because the explicit endpoint variable is missing
- the deploy/runtime docs describe which R2 values are required and which can be derived

## Notes

- 2026-04-01 evidence: the dev Cloud Run service includes `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL`, but not `R2_ENDPOINT`.
- Current code treats `R2_ENDPOINT` as required both for adapter selection in `UploadsModule` and for the S3 client endpoint in `R2StorageAdapter`.
- When the runtime misses `R2_ENDPOINT`, production falls back to `DiskStorageAdapter`, which then derives public URLs from `API_PUBLIC_URL` or localhost defaults and leaks `localhost` URLs back to clients.

## Self Review

- Scope and intent: fix the runtime contract mismatch without widening into a broader upload architecture redesign.
- Source of truth: the R2 runtime helper plus upload docs should define the endpoint derivation contract once.
- Design divergence: the current deploy lane does not inject `R2_ENDPOINT`, so the app should handle the standard derived endpoint instead of silently falling back to disk mode.
- Verification: focused storage unit tests plus API build/lint should be enough for the code path; live dev proof still depends on redeploying the new revision.
- Review routing: both backend and harness review are required because the bug spans runtime adapter selection and deployment contract assumptions.

## Review Focus

- Specialist reviewer should check: the derived endpoint matches the standard Cloudflare R2 host format and does not weaken local disk-mode behavior.
- PO reviewer should check: the fix closes the observed dev bug without changing the intended upload flow.

## Handoff

- After merge, redeploy the dev lane and re-check `/uploads/presign` output so the live host returns R2-backed public URLs instead of localhost disk URLs.

## Design Divergence

- The current repo docs describe the R2 secret set incompletely relative to the code, which made a production runtime look partially configured and caused an unintended disk fallback.

## Attempt Log

- 2026-04-01: created after confirming the dev Cloud Run runtime lacks `R2_ENDPOINT` even though the repo only wires the other R2 values through Secret Manager and the deploy workflow.
- 2026-04-01: added a shared R2 runtime helper that derives the standard Cloudflare endpoint from `R2_ACCOUNT_ID`, switched adapter selection to the derived-runtime check, added focused unit coverage for endpoint derivation plus adapter construction, and updated the storage/deployment docs to match the runtime contract.

## Review Notes

- Specialist review:
  - `backend-reviewer` internal role review pass on 2026-04-01: confirmed the fix restores the intended R2 adapter selection path without changing the direct-upload architecture or weakening local disk-mode behavior.
  - `harness-reviewer` internal role review pass on 2026-04-01: confirmed the repo-side contract is now coherent across code, tests, and deployment docs, and no new secret wiring is required for the standard Cloudflare R2 lane.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-01: accepted the change because it fixes the observed dev upload bug by restoring the intended storage backend rather than redesigning the upload flow.

---
id: I-0006-190
title: Align dev R2 bucket CORS for browser direct uploads
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - curl -i -X OPTIONS "$R2_PRESIGNED_URL" -H "Origin: https://dev.mastersrunners.com" -H "Access-Control-Request-Method: PUT" -H "Access-Control-Request-Headers: content-type,x-amz-checksum-crc32,x-amz-sdk-checksum-algorithm"
artifacts:
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - design/backend/upload-ingestion.md
  - docs/domain/external-integration.md
  - design/initiatives/I-0006-guardrail-hardening.md
---

## Goal

Restore browser direct uploads on the dev lane by adding the missing R2 bucket CORS policy and documenting the required origin/header contract.

## Done Criteria

- the dev R2 bucket has a browser-upload CORS rule for `https://dev.mastersrunners.com` and local Vite development
- preflight `OPTIONS` for a presigned upload no longer fails with `CORS not configured for this bucket`
- the upload design and deployment runbooks explicitly describe the bucket-side CORS requirement for direct uploads

## Notes

- Current repro from 2026-04-01: browser uploads reached a valid presigned R2 `PUT` URL, but the R2 bucket returned `Unauthorized` with `CORS not configured for this bucket` on the preflight request.
- The app architecture is still `browser -> API /uploads/presign -> browser uploads directly to R2`; this task fixes the bucket policy rather than proxying upload bytes through the API.
- The dev lane only needs to allow `https://dev.mastersrunners.com` plus `http://localhost:3000` for local Vite development.

## Self Review

- Scope and intent: fix the external bucket policy and repo docs without redesigning the upload boundary.
- Source of truth: the deployment runbook plus upload design/domain docs should state that browser direct uploads require an R2 bucket CORS allowlist aligned to `FRONTEND_URL`.
- Design divergence: before this task the repo documented direct uploads but did not explicitly capture the bucket-side CORS dependency, so dev could look correctly configured at the API layer while still failing in the browser.
- Verification: Cloudflare API readback plus a live preflight `OPTIONS` check against a presigned R2 upload URL prove the bucket policy change.
- Review routing: backend plus harness review are both required because the issue spans runtime upload behavior and deployment/platform contract documentation.

## Review Focus

- Specialist reviewer should check: the CORS allowlist is narrow, matches the current dev/browser upload flow, and the docs do not imply a backend-proxy upload architecture that the app does not use.
- PO reviewer should check: the fix restores the intended upload UX on dev without widening the product surface or adding new operator burden.

## Handoff

- If production later uses browser direct uploads against a separate R2 bucket, copy the same CORS policy shape with the production frontend host instead of reusing the dev bucket.

## Design Divergence

- External bucket CORS is now part of the effective upload contract even though it is not yet managed from this repository as code.

## Attempt Log

- 2026-04-01: reproduced the failure with a presigned dev upload URL; the bucket returned `Unauthorized` and `CORS not configured for this bucket` on the preflight request.
- 2026-04-01: verified the Cloudflare account connector could read/write R2 bucket CORS, added a narrow `browser-direct-uploads` rule to `mastersrunners-dev-assets`, and confirmed the bucket now returns `204 No Content` with `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, and `Access-Control-Allow-Methods` for the dev preflight request.

## Review Notes

- Specialist review:
  - `backend-reviewer` internal role review pass on 2026-04-01: confirmed the change preserves the intended direct-to-R2 upload architecture and only adds the browser preflight permissions the current presigned flow requires.
  - `harness-reviewer` internal role review pass on 2026-04-01: confirmed the external platform dependency is now documented in the repo truth so future deploy/debug work does not stop at API env validation.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-01: accepted the change because it restores the blocked upload flow on the current dev lane without introducing a broader storage redesign.

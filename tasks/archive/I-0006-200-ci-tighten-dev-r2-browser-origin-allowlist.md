---
id: I-0006-200
title: Tighten the dev R2 browser-upload origin allowlist
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
  - curl -i -X OPTIONS "$R2_PRESIGNED_URL" -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: PUT" -H "Access-Control-Request-Headers: content-type,x-amz-checksum-crc32,x-amz-sdk-checksum-algorithm"
artifacts:
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - design/backend/upload-ingestion.md
  - docs/domain/external-integration.md
  - design/initiatives/I-0006-guardrail-hardening.md
---

## Goal

Remove the unnecessary localhost origin from the dev R2 browser-upload CORS policy so the bucket only allows the deployed dev web host by default.

## Done Criteria

- the dev R2 bucket no longer allows `http://localhost:3000` for browser direct-upload preflight requests
- the current deployed dev host `https://dev.mastersrunners.com` still passes the upload preflight
- repo docs describe browser-upload CORS as a lane-host contract rather than a blanket localhost convenience rule

## Notes

- Review follow-up from 2026-04-01: localhost allowance is not required by the current dev deployment contract and should not stay enabled by default just because the bucket once needed an emergency CORS restore.
- The current deployed API only allows `FRONTEND_URL` for production-style CORS and the auth cookie contract is not designed to support localhost-to-dev cross-site browser sessions.

## Self Review

- Scope and intent: tighten the existing bucket rule and documentation without redesigning the upload boundary or changing the direct-upload architecture.
- Source of truth: the deployment runbook plus upload design/domain docs should state that bucket CORS follows the active lane host by default and localhost requires an explicit separate decision.
- Design divergence: the earlier emergency fix temporarily documented localhost as allowed, but that convenience origin is outside the actual deployed dev-lane browser contract.
- Verification: Cloudflare API readback plus live preflight requests for both the dev host and localhost prove the allowlist was tightened correctly.
- Review routing: backend plus harness review are required because the change tightens a runtime platform policy and the repo-side deployment contract.

## Review Focus

- Specialist reviewer should check: the narrowed allowlist still supports the current dev upload UX and does not leave stale docs that imply localhost is supported against the deployed bucket.
- PO reviewer should check: the hardening change removes an unnecessary allowance without taking away a product flow that is intentionally supported today.

## Handoff

- If future work intentionally supports localhost browser uploads against a deployed lane, reopen that decision as a separate task and align API auth/CORS behavior with the bucket policy instead of widening the bucket alone.

## Design Divergence

- External bucket CORS remains an operator-managed setting, but the repo now records that the default allowlist should stay narrow and lane-specific.

## Attempt Log

- 2026-04-01: created after review flagged that `http://localhost:3000` was unnecessarily left in the dev bucket allowlist even though the deployed dev lane does not actually support localhost browser sessions by default.
- 2026-04-01: updated the dev bucket CORS rule so `https://dev.mastersrunners.com` still returns `204 No Content` for the upload preflight while `http://localhost:3000` now returns `403` with `CORS not configured for this bucket`; aligned the deployment and upload docs to describe localhost as an explicit exception rather than the default posture.

## Review Notes

- Specialist review:
  - `backend-reviewer` internal role review pass on 2026-04-01: confirmed localhost removal matches the current deployed auth/CORS contract and preserves the intended dev host upload flow.
  - `harness-reviewer` internal role review pass on 2026-04-01: confirmed the repo docs now describe localhost as an explicit exception case rather than the default bucket posture.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-01: accepted the hardening because it removes an unnecessary allowance without taking away the current dev web experience.

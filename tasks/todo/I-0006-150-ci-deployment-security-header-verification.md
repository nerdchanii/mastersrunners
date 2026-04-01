---
id: I-0006-150
title: Add deployment verification for security headers
parent: I-0006-guardrail-hardening
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0006-130
  - I-0006-140
blocked_by: []
verify:
  - pnpm deploy:verify -- https://dev.mastersrunners.com
  - curl -I https://dev.mastersrunners.com
  - curl -I https://dev.mastersrunners.com/api/v1/health
artifacts:
  - scripts/verify-deployment.sh
  - .github/workflows/deploy.yml
  - docs/runbooks/deployment.md
  - design/architecture/deployment.md
---

## Goal

Extend deployment verification so it proves the expected security-header contract on live web and API surfaces instead of checking health reachability alone.

## Done Criteria

- deployment verification asserts the required header set for at least the dev web root and API health endpoint
- failure output names the missing header and the surface that regressed
- runbook/design docs explain which parts of the header proof are repo-controlled and which still depend on external Cloudflare state

## Notes

- `scripts/verify-deployment.sh` currently polls only `GET /api/v1/health` for a successful JSON response and does not inspect headers or the web root at all.
- The 2026-04-01 live probes that created `I-0006-130` and `I-0006-140` showed that header regressions can survive despite a passing health check.
- Keep this verification compatible with the current dev-lane routing model and the external Pages proxy/custom-domain state tracked in `EX-0004`.
- Prefer repo-versioned checks over one-off manual scanning so future deploys fail fast when the hardening contract drifts.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the verify path is stable in CI and locally, and it distinguishes repo-controlled header regressions from external routing drift.
- PO reviewer should check: the task adds proportionate release protection instead of a brittle deployment gate.

## Handoff

- Keep the verified header contract aligned with the implementation tasks `I-0006-130` and `I-0006-140`; do not let the deploy check silently drift from the documented policy.

## Design Divergence

- Current deployment verification proves service reachability but not hardening posture on either the Pages HTML surface or the API responses behind the same-domain route.

## Attempt Log

- 2026-04-01: follow-up created after repo inspection showed `scripts/verify-deployment.sh` verifies only health reachability while live dev responses still lack the expected security headers.

## Review Notes

- Specialist review:
- PO review:

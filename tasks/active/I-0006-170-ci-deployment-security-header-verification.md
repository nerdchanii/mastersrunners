---
id: I-0006-170
title: Add deployment verification for security headers
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0006-150
  - I-0006-160
blocked_by: []
execution_status: blocked
review_status: approved
verification_status: partial
closeout_blocker: deploy verification still fails on same-domain /api-docs because the route serves Pages HTML instead of the Swagger API surface.
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

- The repo now extends `scripts/verify-deployment.sh` beyond health reachability, but live lane proof still depends on a deployed revision plus the externally managed Pages host.
- The 2026-04-01 live probes that created `I-0006-150` and `I-0006-160` showed that header regressions can survive despite a passing health check.
- Keep this verification compatible with the current dev-lane routing model and the external Pages proxy/custom-domain state tracked in `EX-0004`.
- Prefer repo-versioned checks over one-off manual scanning so future deploys fail fast when the hardening contract drifts.

## Self Review

- Scope and intent: keep the deploy hardening focused on proving the header contract without turning the script into a full synthetic browser probe.
- Source of truth: `scripts/verify-deployment.sh`, `.github/workflows/deploy.yml`, and the deployment docs now define which surfaces are checked and how web-vs-API URLs are separated.
- Design divergence: same-domain `/api/*` proxy routing and the live Pages host remain external Cloudflare state, so the automated deploy gate now blocks only on repo-controlled API headers at the direct API origin while keeping manual `WEB_VERIFY_URL` proof available for the Pages host.
- Verification: local script behavior can be exercised with `pnpm deploy:verify -- http://localhost:4000` for API-only and with `WEB_VERIFY_URL=https://dev.mastersrunners.com pnpm deploy:verify -- https://SERVICE_URL.run.app` after deploy when live web-host proof is needed.
- Review routing: `harness-reviewer` and `po-reviewer` remain required because the change affects local CI/deploy automation and release gates.

## Review Focus

- Specialist reviewer should check: the verify path is stable in CI and locally, and it distinguishes repo-controlled header regressions from external routing drift.
- PO reviewer should check: the task adds proportionate release protection instead of a brittle deployment gate.

## Handoff

- Keep the verified header contract aligned with the implementation tasks `I-0006-150` and `I-0006-160`; do not let the deploy check silently drift from the documented policy.

## Design Divergence

- Current deployment verification proves service reachability but not hardening posture on either the Pages HTML surface or the API responses behind the same-domain route.
- Current CI recovery for this branch also carries a temporary `knip` `types` ignore on the conversations repository; that cleanup is intentionally split into follow-up `I-0006-210` so this deploy task does not widen into an API type-boundary refactor.

## Attempt Log

- 2026-04-01: follow-up created after repo inspection showed `scripts/verify-deployment.sh` verifies only health reachability while live dev responses still lack the expected security headers.
- 2026-04-01: extended `scripts/verify-deployment.sh` to assert the required header set on the direct API health/docs surfaces and, when a Pages host is available, the web root. The first deploy attempt showed that the externally managed Pages host currently returns `403` to GitHub Actions, so the automated deploy gate was narrowed back to the direct API origin while preserving manual `WEB_VERIFY_URL` proof for operators.
- 2026-04-01: added a defensive `--` argument shim so `pnpm deploy:verify -- <url>` still works, then proved the local API-only path with `pnpm deploy:verify -- http://localhost:4100`, which now checks `/api/v1/health`, `/api-docs`, and skips the web-root probe when `WEB_VERIFY_URL` is absent.
- 2026-04-01: branch CI recovery temporarily added a `knip` `types` ignore for the conversations repository; the structural cleanup is tracked separately in `I-0006-210` instead of being folded into this deploy verification task.
- 2026-04-02: live `pnpm deploy:verify -- https://dev.mastersrunners.com` now proves API health and web-root headers, but it still fails on `/api-docs` because the same-domain route currently resolves to the Pages HTML surface instead of Swagger.

## Review Notes

- Specialist review:
  - `harness-reviewer` internal role review pass on 2026-04-01: confirmed the verify path now distinguishes direct API proof from web-host proof, preserves local API-only verification, and fails loudly when a required header is missing.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-01: accepted the gate because it adds proportionate release protection while leaving external live-host proof to the deploy lane instead of blocking local implementation work.

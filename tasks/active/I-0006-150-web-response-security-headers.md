---
id: I-0006-150
title: Add web response security headers for Cloudflare Pages
parent: I-0006-guardrail-hardening
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build
  - curl -I https://dev.mastersrunners.com
artifacts:
  - apps/web/public/_headers
  - docs/runbooks/deployment.md
  - design/architecture/deployment.md
---

## Goal

Version the Cloudflare Pages response-header policy in the repo so the dev web host serves deliberate security headers instead of relying on dashboard defaults.

## Done Criteria

- `apps/web/public/_headers` defines the intended response-header contract for HTML and static asset responses
- the live dev web host serves deliberate `Content-Security-Policy`, anti-framing, and `Permissions-Policy` headers after deployment
- HSTS rollout posture is documented without assuming the scanner's `includeSubDomains` recommendation is safe for every current host

## Notes

- Current evidence from 2026-04-01: `curl -I https://dev.mastersrunners.com` returned `referrer-policy` and `x-content-type-options`, but not `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, or `Permissions-Policy`.
- The repo now includes `apps/web/public/_headers` beside `_redirects`, so the Pages header contract is versioned locally and waiting on deployment proof.
- Cloudflare Pages custom domains and same-domain `/api/*` routing remain externally managed under `EX-0004`; deployment proof for this task must use the live dev host rather than repo-only assumptions.
- HSTS needs an explicit rollout decision because `mastersrunners.com` and `www.mastersrunners.com` still serve a placeholder site outside the current app rollout.

## Self Review

- Scope and intent: keep the web-side change inside the Cloudflare Pages surface instead of widening into API bootstrap or proxy routing.
- Source of truth: `apps/web/public/_headers`, the deployment runbook, and the deployment architecture doc now define the intended Pages header contract.
- Design divergence: the repo can version the Pages header contract, but live proof still depends on the externally managed Pages deploy lane and custom domain state tracked under `EX-0004`.
- Verification: local completion relies on `VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build`; the live `curl -I https://dev.mastersrunners.com` proof remains pending until this branch is deployed.
- Review routing: `frontend-reviewer`, `harness-reviewer`, and `po-reviewer` remain the required closeout reviewers because the task changes deploy-time Pages behavior plus deployment docs.

## Review Focus

- Specialist reviewer should check: the header policy is versioned in the repo, narrow enough for the current SPA asset model, and does not assume unsupported Cloudflare dashboard behavior.
- PO reviewer should check: the task improves launch readiness without forcing an unsafe HSTS posture on hosts that are not yet in the active app lane.

## Handoff

- Coordinate with `I-0006-170` so deployment verification starts asserting the same header contract after this task lands.

## Design Divergence

- The response-header contract is now versioned in the repo, but the live Pages/custom-domain rollout still depends on external Cloudflare state tracked under `EX-0004`.

## Attempt Log

- 2026-04-01: follow-up created after a live `curl -I https://dev.mastersrunners.com` probe confirmed the missing header set reported by the security scan.
- 2026-04-01: added `apps/web/public/_headers` with a repo-tracked CSP, HSTS, anti-framing, and Permissions-Policy contract for the current SPA asset model; local web build proof is now available and live dev-host proof is pending deployment.
- 2026-04-01: `VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build` passed and confirmed the generated Pages artifact includes `apps/web/dist/_headers`.

## Review Notes

- Specialist review:
  - `frontend-reviewer` internal role review pass on 2026-04-01: confirmed the `_headers` policy matches the current SPA surface, allows the known Google Fonts and map/image flows, and keeps HSTS scoped to `max-age` without overcommitting placeholder hosts.
  - `harness-reviewer` internal role review pass on 2026-04-01: confirmed the Pages header contract is now repo-versioned and that live proof is correctly left pending under the externally managed Cloudflare lane.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-01: accepted the scoped hardening because it improves launch posture without forcing the deferred apex/www rollout.

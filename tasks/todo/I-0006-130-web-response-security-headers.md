---
id: I-0006-130
title: Add web response security headers for Cloudflare Pages
parent: I-0006-guardrail-hardening
scope: web
owner: unassigned
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
- `apps/web/public` currently contains `_redirects` only, so Pages has no repo-tracked `_headers` contract today.
- Cloudflare Pages custom domains and same-domain `/api/*` routing remain externally managed under `EX-0004`; deployment proof for this task must use the live dev host rather than repo-only assumptions.
- HSTS needs an explicit rollout decision because `mastersrunners.com` and `www.mastersrunners.com` still serve a placeholder site outside the current app rollout.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the header policy is versioned in the repo, narrow enough for the current SPA asset model, and does not assume unsupported Cloudflare dashboard behavior.
- PO reviewer should check: the task improves launch readiness without forcing an unsafe HSTS posture on hosts that are not yet in the active app lane.

## Handoff

- Coordinate with `I-0006-150` so deployment verification starts asserting the same header contract after this task lands.

## Design Divergence

- The current deployment design expects a static web build on Cloudflare Pages, but the repository does not yet define a response-header contract for that Pages surface.

## Attempt Log

- 2026-04-01: follow-up created after a live `curl -I https://dev.mastersrunners.com` probe confirmed the missing header set reported by the security scan.

## Review Notes

- Specialist review:
- PO review:

---
id: I-0006-230
title: Move Swagger and operator routes behind an ops-only Zero Trust host
parent: I-0006-guardrail-hardening
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - WEB_VERIFY_URL=https://dev.mastersrunners.com pnpm deploy:verify -- https://masters-runners-api-dev-e2m534vcpa-du.a.run.app
  - curl -I https://dev.mastersrunners.com
  - curl -I https://ops.dev.mastersrunners.com
  - curl -I https://ops.dev.mastersrunners.com/api-docs
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - scripts/verify-deployment.sh
  - docs/runbooks/deployment.md
  - design/architecture/deployment.md
  - design/operating-rules/exceptions.md
---

## Goal

Stop treating Swagger and other operator-only API surfaces as part of the public `dev.mastersrunners.com` host contract, and reopen them later behind a single Access-protected ops host.

## Done Criteria

- `dev.mastersrunners.com` keeps public app traffic plus `/api/*`, but does not expose Swagger on a public same-domain route
- `ops.dev.mastersrunners.com` is defined as the single staff-only host for operator UI, `/api/*`, and `/api-docs*`
- Cloudflare Access protects the ops host before any application content is reachable
- deployment verification and docs treat Swagger proof as direct-origin or ops-host work, not as a public dev-host requirement
- external Cloudflare proof for custom domain, worker routes, and Access policy is recorded in the exceptions register or linked task notes

## Notes

- Execution mode: requires Cloudflare dashboard/API changes plus repo docs and verification updates.
- Prefer one ops host over split `ops` and `ops-api` hosts unless scaling pressure appears later.
- The public host should keep `/api/*` routing for browser auth and app traffic, but `/api-docs*` should move off the public lane.
- Access remains the edge gate, but any operator-only API should still verify staff authorization server-side.

## Self Review

- Scope and intent: keep this task on the host/routing boundary for operator-only surfaces; the backoffice UX and feedback workflows stay in `I-0014-230`, `I-0014-260`, and `I-0014-270`.
- Source of truth: `docs/runbooks/deployment.md`, `design/architecture/deployment.md`, `design/operating-rules/exceptions.md`, and the Cloudflare route/Access state they describe.
- Design divergence: the repo can document and verify the desired host contract, but the actual `ops.dev.mastersrunners.com` custom domain, Access policy, and worker routing still require external Cloudflare execution.
- Verification: deployed proof should keep `WEB_VERIFY_URL=https://dev.mastersrunners.com pnpm deploy:verify -- https://masters-runners-api-dev-e2m534vcpa-du.a.run.app` green while `curl -I https://ops.dev.mastersrunners.com` and `curl -I https://ops.dev.mastersrunners.com/api-docs` confirm the new operator host is present and protected.
- Review routing: `harness-reviewer`, `backend-reviewer`, and `po-reviewer` remain required because this task changes deploy verification posture, host routing, and the operator-only API/docs boundary.

## Review Focus

- Specialist reviewer should check: the public app host, direct API origin, and future ops host are clearly separated so deploy verification does not accidentally require public Swagger exposure.
- PO reviewer should check: the chosen ops-host boundary is proportionate, operationally simple, and does not create a second public-facing admin surface.

## Handoff

- `I-0014-230`, `I-0014-260`, and `I-0014-270` should build their operator UX on top of this ops-host boundary instead of inventing a second host pattern.

## Design Divergence

- Current dev routing still relies on external Cloudflare configuration, and the ops host does not exist yet.
- Until this task lands, public-host Swagger exposure should be treated as undesirable rather than as a required deploy property.

## Attempt Log

- 2026-04-02: created after deciding that `dev.mastersrunners.com/api-docs*` should not remain public and that the future feedback backoffice plus Swagger should share one Access-protected `ops.dev.mastersrunners.com` host.

## Review Notes

- Specialist review:
- PO review:

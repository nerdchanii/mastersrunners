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
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - WEB_VERIFY_URL=https://dev.mastersrunners.com pnpm deploy:verify -- https://masters-runners-api-dev-e2m534vcpa-du.a.run.app
  - curl -I https://dev.mastersrunners.com
  - dig +short ops.dev.mastersrunners.com
  - curl --resolve ops.dev.mastersrunners.com:443:$(dig +short ops.dev.mastersrunners.com | head -n 1) -I https://ops.dev.mastersrunners.com
  - curl --resolve ops.dev.mastersrunners.com:443:$(dig +short ops.dev.mastersrunners.com | head -n 1) -I https://ops.dev.mastersrunners.com/api/v1/health
  - curl --resolve ops.dev.mastersrunners.com:443:$(dig +short ops.dev.mastersrunners.com | head -n 1) -I https://ops.dev.mastersrunners.com/api-docs
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
- 2026-04-02 external progress: created Worker routes for `ops.dev.mastersrunners.com/api/*` and `ops.dev.mastersrunners.com/api-docs*`, created the proxied `ops.dev.mastersrunners.com -> mastersrunners.pages.dev` CNAME, and confirmed DNS propagation started via `dig +short ops.dev.mastersrunners.com`.
- 2026-04-02 final external state: the Pages custom domain is active, the Access app `MastersRunners Dev Ops` protects `ops.dev.mastersrunners.com/*`, and the owner allow policy permits `nerdchanii@gmail.com`.

## Self Review

- Scope and intent: keep this task on the host/routing boundary for operator-only surfaces; the backoffice UX and feedback workflows stay in `I-0014-230`, `I-0014-260`, and `I-0014-270`.
- Source of truth: `docs/runbooks/deployment.md`, `design/architecture/deployment.md`, `design/operating-rules/exceptions.md`, and the Cloudflare route/Access state they describe.
- Design divergence: the repo truth and the external Cloudflare state now match for the dev ops-host boundary.
- Verification: deployed proof kept `WEB_VERIFY_URL=https://dev.mastersrunners.com pnpm deploy:verify -- https://masters-runners-api-dev-e2m534vcpa-du.a.run.app` green, while `dig +short ops.dev.mastersrunners.com` plus edge probes against the published ops-host IP returned Cloudflare Access `302` responses for `/`, `/api/v1/health`, and `/api-docs`.
- Review routing: `harness-reviewer`, `backend-reviewer`, and `po-reviewer` remain required because this task changes deploy verification posture, host routing, and the operator-only API/docs boundary.

## Review Focus

- Specialist reviewer should check: the public app host, direct API origin, and future ops host are clearly separated so deploy verification does not accidentally require public Swagger exposure.
- PO reviewer should check: the chosen ops-host boundary is proportionate, operationally simple, and does not create a second public-facing admin surface.

## Handoff

- `I-0014-230`, `I-0014-260`, and `I-0014-270` should build their operator UX on top of this ops-host boundary instead of inventing a second host pattern.

## Design Divergence

- Current dev routing still relies on external Cloudflare configuration, but the ops host boundary is now provisioned and externally verified.
- Until this task lands, public-host Swagger exposure should be treated as undesirable rather than as a required deploy property.

## Attempt Log

- 2026-04-02: created after deciding that `dev.mastersrunners.com/api-docs*` should not remain public and that the future feedback backoffice plus Swagger should share one Access-protected `ops.dev.mastersrunners.com` host.
- 2026-04-02: confirmed the existing Worker script `mastersrunners-api-proxy` already serves `dev.mastersrunners.com/api/*`, then added new routes for `ops.dev.mastersrunners.com/api/*` and `ops.dev.mastersrunners.com/api-docs*`.
- 2026-04-02: created the Pages custom-domain object for `ops.dev.mastersrunners.com`; initial status reported `pending` with `CNAME record not set`.
- 2026-04-02: after Cloudflare DNS scope refresh, created the proxied `ops.dev.mastersrunners.com -> mastersrunners.pages.dev` CNAME and confirmed propagation started with `dig +short ops.dev.mastersrunners.com`.
- 2026-04-02: after the Access scope refresh landed, confirmed the Zero Trust organization, created the self-hosted Access app `MastersRunners Dev Ops` for `ops.dev.mastersrunners.com/*`, and added the allow policy `Allow nerdchanii owner` for `nerdchanii@gmail.com`.
- 2026-04-02: confirmed the custom domain is now `active`, and verified Access gating on `/`, `/api/v1/health`, and `/api-docs` by probing the published edge IP with `curl --resolve` while the local resolver cache was still catching up.

## Review Notes

- Specialist review:
  - 2026-04-02 harness-reviewer: no remaining process finding after aligning the verify commands with the actual proof method and marking the task approved for archive.
  - 2026-04-02 backend-reviewer: no remaining material routing/proof finding after softening `EX-0007` to note that post-auth origin behavior is inferred from the shared `mastersrunners-api-proxy` route setup.
- PO review:
  - 2026-04-02 po-reviewer: no findings; confirmed that one `ops.dev.mastersrunners.com` host is the simplest operator boundary and that widening operator access can remain a deliberate follow-up.

---
id: I-0006-160
title: Add API response security headers
parent: I-0006-guardrail-hardening
scope: api
owner: codex
reviewers:
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api test:e2e -- --runTestsByPath test/security-headers.e2e-spec.ts
  - curl -I https://dev.mastersrunners.com/api/v1/health
  - curl -I https://masters-runners-api-dev-e2m534vcpa-du.a.run.app/api-docs
artifacts:
  - apps/api/src/bootstrap/configure-app.ts
  - apps/api/src/bootstrap/security-headers.ts
  - apps/api/src/main.ts
  - apps/api/jest-e2e.config.ts
  - apps/api/test/setup.ts
  - apps/api/test/security-headers.e2e-spec.ts
  - docs/runbooks/deployment.md
---

## Goal

Apply a centralized API response-header policy at bootstrap so public API and Swagger surfaces stop shipping without baseline security headers.

## Done Criteria

- the Nest bootstrap applies a deliberate security-header policy instead of relying on upstream defaults
- the live dev API surfaces include the intended anti-framing, HSTS, and `Permissions-Policy` headers after deployment
- any HTML-serving API surface such as Swagger UI has an explicit CSP decision and focused test coverage

## Notes

- Current evidence from 2026-04-01: `curl -I https://dev.mastersrunners.com/api/v1/health` and `curl -I https://dev.mastersrunners.com/api-docs` show no `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, or `Permissions-Policy`.
- The repo now routes runtime and E2E bootstrap through a shared helper so the API header contract is defined once and exercised in tests.
- Bootstrap-level header behavior should be verified with a bootstrap-aware E2E path, not a controller unit test, because header middleware will likely live above controller scope.
- The current E2E harness in `apps/api/test/setup.ts` also bootstraps the app separately from `main.ts`, so this task may need to extract shared bootstrap wiring rather than asserting headers from a partially configured test app.
- Keep CORS, OAuth redirects, SSE, and Swagger UI behavior working; avoid a blanket header policy that breaks preflight requests or blocks required docs assets.
- Prefer one bootstrap-level policy with documented exceptions over per-controller ad hoc header setting.
- Public-host same-domain `/api-docs` is no longer part of the desired dev-host contract; future operator-only Swagger exposure now lives in follow-up `I-0006-230`.

## Self Review

- Scope and intent: centralize the API header policy at bootstrap and share it with the E2E harness instead of scattering per-controller headers.
- Source of truth: the shared bootstrap helper plus the deployment runbook now define the intended API header contract for JSON and Swagger surfaces.
- Design divergence: Swagger needs a route-specific CSP, so the implementation keeps one bootstrap-level policy with a deliberate Swagger exception rather than pretending a single deny-all CSP works everywhere.
- Verification: local proof is `pnpm --filter @masters/api test:e2e -- --runTestsByPath test/security-headers.e2e-spec.ts`; live proof now uses `curl -I https://dev.mastersrunners.com/api/v1/health` plus direct-origin Swagger headers at `https://masters-runners-api-dev-e2m534vcpa-du.a.run.app/api-docs`, while public-host Swagger exposure is intentionally deferred to `I-0006-230`.
- Review routing: `backend-reviewer` plus `po-reviewer` remain required because the change alters API bootstrap behavior and docs-facing runtime posture.

## Review Focus

- Specialist reviewer should check: the bootstrap policy covers the intended routes without breaking CORS, Swagger UI, or event-stream transport behavior.
- PO reviewer should check: the task closes a concrete launch hardening gap without widening into a broader auth/session redesign.

## Handoff

- Keep the direct-origin Swagger proof aligned with `I-0006-170`; any future ops-host-only Swagger exposure belongs to `I-0006-230` instead of reopening public same-domain docs on `dev.mastersrunners.com`.

## Design Divergence

- The API bootstrap path now carries a repo-tracked response-header contract, but live proof still depends on the external deploy lane and Cloud Run origin for Swagger because public-host docs are intentionally no longer part of the dev-host contract.

## Attempt Log

- 2026-04-01: follow-up created after live header probes on `/api/v1/health` and `/api-docs` confirmed the missing header set reported by the security scan.
- 2026-04-01: extracted shared bootstrap wiring for runtime and E2E, added centralized response-header middleware with Swagger-aware CSP handling, added focused E2E coverage for `/api/v1/health` plus `/api-docs`, and aligned the E2E Jest mapper to the workspace `@masters/database` source so the new verify path can execute locally; live host verification is pending deployment.
- 2026-04-01: `pnpm --filter @masters/api test:e2e -- --runTestsByPath test/security-headers.e2e-spec.ts` passed after the shared bootstrap and E2E mapper adjustments.
- 2026-04-02: live `curl -I https://dev.mastersrunners.com/api/v1/health` now shows the intended API header set, and deploy-lane/direct-origin Swagger proof confirms the matching header contract at `https://masters-runners-api-dev-e2m534vcpa-du.a.run.app/api-docs`.
- 2026-04-02: public same-domain `/api-docs` on `dev.mastersrunners.com` is no longer treated as desired task proof; the remaining operator-only Swagger exposure work moved to `I-0006-230` so this runtime hardening task can close on the repo-controlled API contract.
- 2026-04-02: reran the final live probes with `curl -I https://dev.mastersrunners.com/api/v1/health` and `curl -I https://masters-runners-api-dev-e2m534vcpa-du.a.run.app/api-docs`; both still return the expected hardening headers on the current dev lane.

## Review Notes

- Specialist review:
  - `backend-reviewer` internal role review pass on 2026-04-01: confirmed the bootstrap helper keeps CORS, Swagger, and health behavior intact while adding a deliberate header policy and focused E2E coverage.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-01: accepted the change as a contained hardening follow-up that does not widen into broader auth/session redesign work.

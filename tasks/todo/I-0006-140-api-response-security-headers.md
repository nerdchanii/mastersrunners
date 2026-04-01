---
id: I-0006-140
title: Add API response security headers
parent: I-0006-guardrail-hardening
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api test:e2e -- --runTestsByPath test/security-headers.e2e-spec.ts
  - curl -I https://dev.mastersrunners.com/api/v1/health
  - curl -I https://dev.mastersrunners.com/api-docs
artifacts:
  - apps/api/src/main.ts
  - apps/api/package.json
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
- `apps/api/src/main.ts` currently configures body parsers, CORS, validation, global prefixing, and Swagger, but no centralized security-header middleware.
- Bootstrap-level header behavior should be verified with a bootstrap-aware E2E path, not a controller unit test, because header middleware will likely live above controller scope.
- The current E2E harness in `apps/api/test/setup.ts` also bootstraps the app separately from `main.ts`, so this task may need to extract shared bootstrap wiring rather than asserting headers from a partially configured test app.
- Keep CORS, OAuth redirects, SSE, and Swagger UI behavior working; avoid a blanket header policy that breaks preflight requests or blocks required docs assets.
- Prefer one bootstrap-level policy with documented exceptions over per-controller ad hoc header setting.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the bootstrap policy covers the intended routes without breaking CORS, Swagger UI, or event-stream transport behavior.
- PO reviewer should check: the task closes a concrete launch hardening gap without widening into a broader auth/session redesign.

## Handoff

- Coordinate final live checks with `I-0006-150` so the deployment verify path fails loudly if headers regress later.

## Design Divergence

- The current API bootstrap path exposes runtime surfaces without a repo-tracked response-header contract.

## Attempt Log

- 2026-04-01: follow-up created after live header probes on `/api/v1/health` and `/api-docs` confirmed the missing header set reported by the security scan.

## Review Notes

- Specialist review:
- PO review:

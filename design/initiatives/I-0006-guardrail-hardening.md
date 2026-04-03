# I-0006: Guardrail Hardening

## Summary

Add the missing formatting, boundary, coverage, dependency, security, dead-code, and PR guardrails required to lift invariant-enforcement and operations scores toward 90%.

## Problem

The repository now has lint, CI, and review metadata enforcement, but it still lacks several guardrails needed for stable autonomous work and clear diagnostic evidence.

## Goals

- codify formatting/import order/boundary rules
- add coverage, dead-code, security, and dependency automation
- document test-stability and flaky-test policy
- add structured logging and monitoring scaffolding

## Non-Goals

- live vendor hookup for external services
- full readability refactors
- feature delivery unrelated to harness hardening

## Scope

- lint/format configuration
- `.github/workflows/`
- CI/local verification scripts
- PR and maintenance templates/docs
- logging/monitoring scaffolding

## Design References

- `docs/runbooks/harness-diagnostics.md`
- `design/operating-rules/exceptions.md`

## Review Plan

- harness/CI/tooling work: `harness-reviewer`
- backend runtime changes: `backend-reviewer`
- PO review checks whether the new gates are proportionate to the risk they prevent

## Task Breakdown

- `tasks/archive/I-0006-010-meta-formatting-import-order.md`
- `tasks/archive/I-0006-020-meta-boundary-cycle-enforcement.md`
- `tasks/archive/I-0006-030-ci-api-coverage-gate.md`
- `tasks/archive/I-0006-040-meta-dependency-security-automation.md`
- `tasks/archive/I-0006-050-meta-dead-code-guard.md`
- `tasks/archive/I-0006-060-meta-pr-template-test-stability.md`
- `tasks/archive/I-0006-070-api-logging-monitoring-scaffold.md`
- `tasks/archive/I-0006-080-ci-explicit-typecheck-guard.md`
- `tasks/archive/I-0006-090-ci-api-database-typecheck-rollout.md`
- `tasks/archive/I-0006-100-ci-cloudflare-pages-preview-failure.md`
- `tasks/archive/I-0006-110-ci-deployment-env-contract-hardening.md`
- `tasks/archive/I-0006-120-api-auth-token-transport-hardening.md`
- `tasks/archive/I-0006-130-ci-knip-cookie-session-followup.md`
- `tasks/archive/I-0006-140-ci-pre-push-local-ci-gate.md`
- `tasks/archive/I-0006-150-web-response-security-headers.md`
- `tasks/archive/I-0006-160-api-response-security-headers.md`
- `tasks/archive/I-0006-170-ci-deployment-security-header-verification.md`
- `tasks/archive/I-0006-220-meta-active-task-closeout-state-enforcement.md`
- `tasks/archive/I-0006-205-ci-header-rollout-regression-recovery.md`
- `tasks/archive/I-0006-180-api-r2-runtime-endpoint-derivation.md`
- `tasks/archive/I-0006-190-ci-dev-r2-browser-upload-cors.md`
- `tasks/archive/I-0006-200-ci-tighten-dev-r2-browser-origin-allowlist.md`
- `tasks/archive/I-0006-230-meta-ops-host-swagger-and-zero-trust-boundary.md`
- `tasks/archive/I-0006-210-api-conversation-type-leak-knip-cleanup.md`
- `tasks/archive/I-0006-240-meta-fix-revert-history-flow.md`

## Success Criteria

- new blocking checks run locally and in CI
- CI includes an explicit typecheck step instead of relying on build side effects
- import/boundary/cycle rules are automated, not convention-only
- security/dependency/dead-code automation exists in-repo
- monitoring/logging scaffolding is documented and implemented to the extent possible in-repo

## Progress Notes

- `I-0006-010`, `I-0006-020`, and `I-0006-030` now have passing verification and closed review notes.
- `I-0006-040` now adds Dependabot plus in-repo CodeQL and dependency-review automation with closed review notes.
- `I-0006-050` now adds a blocking `knip` baseline plus dead-code maintenance policy for CI and local CI.
- `I-0006-060` now adds the PR template, test-stability runbook, flaky-test ledger, and task-linked TODO/FIXME policy with closed review notes.
- `I-0006-070` adds the API structured logger, request interceptor, and env-gated monitoring stub while correctly leaving live vendor hookup as external exception `EX-0002`.
- `I-0006-080` originally split API/database rollout out of the first explicit typecheck lane, and `I-0006-090` closed the remaining explicit API/database typecheck rollout.
- `I-0006-100` captured the Cloudflare Pages preview failure, codified the repo-side build contract, passed preview deploys on PR #7 after the Pages dashboard was aligned to `pnpm build:web` and `apps/web/dist`, and is now archived with closeout verification plus recorded backend review.
- `I-0006-110` now archives the deployment env contract hardening so public web bundles and Cloud Run runtime config fail fast instead of silently falling back to localhost.
- `I-0006-120` now closes the browser auth transport hardening by moving OAuth callback, refresh, logout, and SSE browser auth to `HttpOnly` cookies instead of query-string or `localStorage` token transport.
- `I-0006-130` closes the immediate CI follow-up by removing unused cookie helper exports and making local `ci:local` pass the same `VITE_API_URL` contract into `knip` as GitHub Actions.
- `I-0006-140` adds a `pre-push` gate so `pnpm ci:local` runs before publishing changes, reducing the chance of pushing commits that only fail in remote CI.
- 2026-04-01 live header probes on `https://dev.mastersrunners.com`, `https://dev.mastersrunners.com/api-docs`, and `https://dev.mastersrunners.com/api/v1/health` confirmed that `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, and `Permissions-Policy` are still missing on repo-controlled response surfaces, so the initiative now carries follow-up tasks `I-0006-150` through `I-0006-170` for Pages HTML, API runtime, and deployment verification hardening.
- 2026-04-01 follow-up implementation is now active: the repo adds a versioned Pages `_headers` contract, centralized API bootstrap header middleware with Swagger-aware CSP coverage, and deployment verification that checks direct API plus web-root header surfaces. Live dev-host proof remains pending until the branch is deployed.
- 2026-04-02 recovery task `I-0006-205` restored green local branch health after that rollout by narrowing the automated deploy gate back to direct API proof, removing true dead exports caught by `knip`, and logging the remaining conversations type leak as follow-up `I-0006-210`.
- 2026-04-01 CI recovery also added a temporary `knip` `types` ignore for the conversations repository because the Nest public return contract still leaks repository helper types; follow-up `I-0006-210` now tracks the explicit boundary cleanup needed to remove that exception.
- 2026-04-02 active-task cleanup found that completed work could still remain in `tasks/active/` without a deterministic gate, so follow-up `I-0006-220` now adds machine-readable closeout state plus CI enforcement for stale active tasks.
- 2026-04-02 live proof now closes `I-0006-150`; the remaining Swagger exposure concern is no longer “make public same-domain `/api-docs` work” but “move operator-only docs behind the future ops host,” which is now tracked by `I-0006-230`.
- 2026-04-02 `I-0006-160` is now archived after direct-origin Swagger proof and live `dev` API-health checks confirmed the bootstrap header contract without treating public same-domain Swagger as a required property.
- 2026-04-02 `I-0006-170` is now archived after `scripts/verify-deployment.sh` was aligned to the repo-tracked Cloudflare Insights CSP and the canonical deploy proof moved to direct API origin plus optional public web-root verification; operator-only Swagger exposure remains in `I-0006-230`.
- 2026-04-02 `I-0006-210` now removes the temporary `knip` `types` ignore for the conversations repository by keeping conversation context helpers repository-internal and shifting the public conversations response contract to explicit service/controller-owned types.
- 2026-04-01 dev upload triage found that the Cloud Run runtime carries the R2 account/public URL secrets but not `R2_ENDPOINT`, and `I-0006-180` is now closed after deriving the standard R2 endpoint from `R2_ACCOUNT_ID`, redeploying dev, and confirming live `/api/v1/uploads/presign` returns R2-backed URLs instead of localhost disk fallbacks.
- 2026-04-01 browser upload triage then found the dev R2 bucket itself was missing a CORS policy, so `I-0006-190` now captures the bucket-side fix and the repo documentation needed to keep direct uploads aligned with the active frontend origins.
- 2026-04-01 follow-up review then tightened that bucket rule further: `I-0006-200` removes `http://localhost:3000` from the deployed dev-bucket allowlist because the current dev lane does not intentionally support localhost browser sessions against the live bucket.
- In-repo guardrail hardening is effectively complete; the remaining blockers are external platform settings and the exceptions recorded in `design/operating-rules/exceptions.md`.
- 2026-04-03 repeated public-route recovery work exposed a workflow gap: the repo documented commit syntax and deploy rollback, but not how to preserve correction history for bad shared commits through explicit `fix` or `revert` follow-up tasks. `I-0006-240` now closes that gap.

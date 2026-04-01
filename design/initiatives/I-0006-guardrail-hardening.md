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
- In-repo guardrail hardening is effectively complete; the remaining blockers are external platform settings and the exceptions recorded in `design/operating-rules/exceptions.md`.

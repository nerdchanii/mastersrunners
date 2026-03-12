# I-0006: Guardrail Hardening

## Summary

Add the missing formatting, boundary, coverage, dependency, security, dead-code, and PR guardrails required to lift invariant-enforcement and operations scores toward 90%.

## Problem

The repository now has lint, CI, and review metadata enforcement, but it still lacks several guardrails needed for stable autonomous work and measurable checklist progress.

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

- `docs/checklists/README.md`
- `docs/checklists/harness-scorecard.md`
- `design/operating-rules/exceptions.md`

## Review Plan

- harness/CI/tooling work: `harness-reviewer`
- backend runtime changes: `backend-reviewer`
- PO review checks whether the new gates are proportionate to the risk they prevent

## Task Breakdown

- `tasks/I-0006-guardrail-hardening/archive/I-0006-010-meta-formatting-import-order.md`
- `tasks/I-0006-guardrail-hardening/archive/I-0006-020-meta-boundary-cycle-enforcement.md`
- `tasks/I-0006-guardrail-hardening/archive/I-0006-030-ci-api-coverage-gate.md`
- `tasks/I-0006-guardrail-hardening/archive/I-0006-040-meta-dependency-security-automation.md`
- `tasks/I-0006-guardrail-hardening/archive/I-0006-050-meta-dead-code-guard.md`
- `tasks/I-0006-guardrail-hardening/archive/I-0006-060-meta-pr-template-test-stability.md`
- `tasks/I-0006-guardrail-hardening/todo/I-0006-070-api-logging-monitoring-scaffold.md`
- `tasks/I-0006-guardrail-hardening/archive/I-0006-080-ci-explicit-typecheck-guard.md`
- `tasks/I-0006-guardrail-hardening/todo/I-0006-090-ci-api-database-typecheck-rollout.md`

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
- `I-0006-080` adds an explicit `pnpm typecheck` CI/local gate for the currently supported packages and tracks API/database rollout separately in `I-0006-090`.
- The remaining work is the operations lane: logging/monitoring scaffolding and API/database typecheck rollout.

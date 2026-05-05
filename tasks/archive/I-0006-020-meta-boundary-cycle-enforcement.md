---
id: I-0006-020
title: Add dependency boundary and cycle enforcement
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0005-010
  - I-0006-010
blocked_by: []
verify:
  - pnpm depcruise
artifacts:
  - .dependency-cruiser.cjs
  - package.json
---

## Goal

Automate import-boundary and cycle checks based on the documented architecture.

## Done Criteria

- dependency-cruiser config exists and runs in CI/local
- boundary rules reference the documented repo-level app/package dependency map

## Notes

- Suppression policy must be explicit and minimal.

## Review Focus

- Specialist reviewer should check: boundary rules match the documented repo-level map, include type-only edges, and the resolver configuration is valid for current imports.
- PO reviewer should check: the guardrail limits architecture drift without pretending to enforce module boundaries that are not yet documented.

## Handoff

- Readability tasks can then refactor against enforced boundaries.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: Added `.dependency-cruiser.cjs`, introduced `tsconfig.depcruise.json`, and wired `pnpm depcruise` into CI and `ci:local`.
- 2026-03-12: Fixed the initial config mismatch by switching from invalid alias config to a dedicated TypeScript resolver config. Verified with `pnpm depcruise`.
- 2026-03-12: Enabled `tsPreCompilationDeps` and added a config-level reference to `design/architecture/repo-structure.md` so the gate covers type-only edges and points at the enforced repo-level dependency map.

## Review Notes

- Specialist review: `harness-reviewer` approved after the type-only dependency loophole was closed and the config was anchored to the documented repo-level map.
- Specialist review: `backend-reviewer` approved. Boundary and cycle enforcement now includes type-only edges and the resolver setup remains valid for current imports.
- PO review: approved. The task wording now matches the implemented repo-level architecture guardrail without overclaiming module-boundary coverage.

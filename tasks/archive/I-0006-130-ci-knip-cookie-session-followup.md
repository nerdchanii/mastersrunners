---
id: I-0006-130
title: Restore knip and local CI parity after cookie-session auth rollout
parent: I-0006-guardrail-hardening
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0006-120
blocked_by: []
verify:
  - pnpm knip
  - pnpm ci:local
  - pnpm exec prettier --check --ignore-unknown apps/api/src/auth/auth-cookie.util.ts apps/api/test/helpers/auth.helper.ts scripts/ci-local.sh scripts/run-knip.sh design/initiatives/I-0006-guardrail-hardening.md tasks/archive/I-0006-130-ci-knip-cookie-session-followup.md
artifacts:
  - apps/api/src/auth/auth-cookie.util.ts
  - apps/api/test/helpers/auth.helper.ts
  - scripts/ci-local.sh
  - scripts/run-knip.sh
  - design/initiatives/I-0006-guardrail-hardening.md
---

## Goal

Close the immediate CI regression from the cookie-session auth rollout and keep local `ci:local` behavior aligned with GitHub Actions.

## Done Criteria

- `pnpm knip` no longer fails on unused auth-cookie exports introduced by `I-0006-120`
- local `pnpm ci:local` passes `VITE_API_URL` into `knip` the same way the GitHub Actions CI job does
- the follow-up is documented and archived with the guardrail initiative

## Notes

- The failing remote run was GitHub Actions CI run `23826386770` on commit `ae15894`.
- The failure happened in `Check dead code baseline`, not in auth runtime behavior.

## Self Review

- Scope and intent: kept to CI parity and dead-code follow-up only; no auth contract redesign was mixed back in.
- Source of truth: CI behavior lives in `.github/workflows/ci.yml`, `scripts/ci-local.sh`, and the touched auth helper files.
- Design divergence: none intended; the change removes accidental API surface and restores local-vs-remote CI parity.
- Verification: `pnpm knip`, `pnpm ci:local`, and targeted Prettier are the completion signal.
- Review routing: `harness-reviewer` covers CI/local parity and `backend-reviewer` covers the auth helper surface reduction.

## Review Focus

- Specialist reviewer should check:
  - the fix removes the dead exports instead of teaching `knip` to ignore a real regression
  - local `ci:local` now mirrors the CI job's `VITE_API_URL` environment for `knip`
- PO reviewer should check:
  - the post-push CI regression is closed without reopening the broader cookie-session task

## Handoff

- If another non-development web tool starts evaluating `vite.config.ts`, prefer inheriting the same explicit `VITE_API_URL` contract instead of reintroducing silent localhost fallbacks.

## Design Divergence

- None intended.

## Attempt Log

- 2026-04-01: follow-up created after GitHub Actions CI run `23826386770` failed `pnpm knip` on unused auth-cookie exports from `I-0006-120`.
- 2026-04-01: removed the unused exported helpers from `auth-cookie.util.ts`, kept test-only cookie header assembly local to the e2e helper, and exported `VITE_API_URL` inside both `scripts/ci-local.sh` and `scripts/run-knip.sh` so local dead-code checks see the same env contract as CI.
- 2026-04-01: verification passed with `pnpm knip`, `pnpm ci:local`, and targeted Prettier.

## Review Notes

- Specialist review:
  - harness/backend lenses say the fix closes the actual dead-export regression and tightens local CI parity instead of hiding the failure in `knip` config.
- PO review:
  - the release signal is more trustworthy again because the same post-push failure now reproduces locally before deploy.

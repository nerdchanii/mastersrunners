---
id: I-0012-070
title: Fix dev pipeline regressions for env-gated web builds and API Docker image
parent: I-0012-supabase-postgres-rollout
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0012-050
blocked_by: []
verify:
  - VITE_API_URL=http://localhost:4000 pnpm knip
  - VITE_API_URL=http://localhost:4000 pnpm -r run build
  - docker build -t masters-runners-api:test -f apps/api/Dockerfile .
  - pnpm exec prettier --check --ignore-unknown .github/workflows/ci.yml apps/api/Dockerfile docs/runbooks/environment-and-settings.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/active/I-0012-070-ci-fix-dev-pipeline-regressions.md
artifacts:
  - .github/workflows/ci.yml
  - apps/api/Dockerfile
  - docs/runbooks/environment-and-settings.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Restore green `dev` branch CI and deploy pipelines after the web `VITE_API_URL` guard and Supabase rollout changes.

## Done Criteria

- CI analysis/build steps use a safe placeholder `VITE_API_URL` where runtime config is not under test
- API Docker image build succeeds in CI and deploy workflows again
- the repo docs explain the tooling-only placeholder env behavior so the guard contract stays clear

## Notes

- The intended runtime rule remains unchanged: non-development web builds still require a real `VITE_API_URL`.
- The failing Docker build currently happens before Cloud Run deployment because the builder image misses repo-root TS config needed by workspace packages.

## Self Review

- Scope and intent: limited the fix to the two regressions introduced during the Supabase rollout follow-up, without weakening the runtime env guard or changing deploy targets.
- Source of truth: updated the CI workflow, API image build path, helper fixtures, and env runbook note in the same task.
- Design divergence: none intended; non-dev runtime builds still require a real `VITE_API_URL`, and the API image still builds the same artifacts.
- Verification: `VITE_API_URL=http://localhost:4000 pnpm knip`, `VITE_API_URL=http://localhost:4000 pnpm -r run build`, `docker build -t masters-runners-api:test -f apps/api/Dockerfile .`, and targeted `prettier --check --ignore-unknown` all passed locally.
- Review routing: `harness-reviewer` and `docs-reviewer` cover the CI/runtime contract and the runbook clarification; PO review confirms the fix restores deploy reliability without hiding missing deploy config.

## Review Focus

- Specialist reviewer should check:
  - CI/env fixes do not weaken runtime safeguards
- PO reviewer should check:
  - deploy reliability is restored without hiding missing production config

## Handoff

- After this task, re-run the `dev` branch pipeline and continue Cloud Run bring-up.

## Design Divergence

- None intended.

## Attempt Log

- 2026-03-31: created after `dev` branch CI/deploy failed on `VITE_API_URL` guard during `knip` and on missing `tsconfig.base.json` inside the API Docker builder image.
- 2026-03-31: patched CI to inject a tooling-only `VITE_API_URL`, copied `tsconfig.base.json` into the API image, internalized unused messaging fixture helpers, and stabilized `NaverStrategy` export typing for Docker declaration emit under pnpm symlink installs.

## Review Notes

- Specialist review:
  - 2026-03-31 `harness-reviewer`: approved after CI-only placeholder env injection stayed scoped to analysis/build automation, the Docker image regained the missing repo-root TS config, and the Naver strategy export became portable inside pnpm-based container builds.
  - 2026-03-31 `docs-reviewer`: approved after the runbook note clarified the tooling-only `VITE_API_URL` placeholder without weakening the non-development runtime contract.
- PO review:
  - 2026-03-31: approved by the user direction to keep execution moving, restore the failing `dev` pipeline, and preserve the real deploy-time env guard instead of papering it over.

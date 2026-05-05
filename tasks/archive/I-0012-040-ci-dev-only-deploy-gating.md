---
id: I-0012-040
title: Gate API deploy automation to the dev branch during prelaunch
parent: I-0012-supabase-postgres-rollout
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0012-010
  - I-0012-020
blocked_by: []
verify:
  - pnpm exec prettier --check .github/workflows/deploy.yml .github/workflows/ci.yml docs/runbooks/deployment.md design/architecture/deployment.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/archive/I-0012-040-ci-dev-only-deploy-gating.md
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/workflows/deploy.yml
  - .github/workflows/ci.yml
  - docs/runbooks/deployment.md
  - design/architecture/deployment.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Keep automated API deployment aligned with the current prelaunch phase by deploying only from `dev`, while preserving `main` as the future production branch.

## Done Criteria

- the API deploy workflow triggers only on `dev`
- the current Cloud Run service name and docs reflect a dev-only rollout posture
- CI coverage includes the `dev` branch so the deploy branch still gets the standard checks

## Notes

- This task does not reintroduce `main` production deploys yet.
- Production rollout remains deferred until the public launch posture is explicit.

## Self Review

- Scope and intent: limited the change to branch gating, current service naming, CI coverage for the deploy branch, and matching deploy docs.
- Source of truth: updated the deploy workflow, CI workflow, rollout runbook, architecture doc, and initiative task breakdown in the same task.
- Design divergence: none intended; the repo now states explicitly that only `dev` auto-deploys during prelaunch while `main` remains deferred.
- Verification: targeted `prettier --check` and `bash scripts/check-task-review-metadata.sh` passed.
- Review routing: requested `harness-reviewer` and `docs-reviewer` because the task changes CI automation and deployment source-of-truth docs together.

## Review Focus

- Specialist reviewer should check:
  - the branch gating and service naming are internally consistent across workflow and docs
- PO reviewer should check:
  - the rollout posture matches the current “dev only” release stage

## Handoff

- Follow with a dedicated production rollout task when `main` becomes the intended API deploy branch again.

## Design Divergence

- None intended. This task should make the current prelaunch deploy posture explicit.

## Attempt Log

- 2026-03-31: task created to align API deploy automation with the current dev-only prelaunch phase.
- 2026-03-31: changed the API deploy workflow to trigger only on `dev`, renamed the active Cloud Run service target to `masters-runners-api-dev`, and expanded CI push/PR coverage to include `dev`.
- 2026-03-31: updated deployment docs so the current phase is explicitly “dev deploy only, main deferred.”

## Review Notes

- Specialist review:
  - 2026-03-31 `harness-reviewer`: approved after deploy automation, CI coverage, task state, and initiative wiring all agreed on `dev` as the only automated API deploy branch during prelaunch.
  - 2026-03-31 `docs-reviewer`: approved after the runbook, architecture doc, initiative, and task wording consistently described the current `dev`-only deploy posture and deferred `main` production rollout.
- PO review:
  - 2026-03-31: approved by the user direction that the current stage should deploy only from `dev`, while `main` stays undeployed until the later production launch posture is ready.

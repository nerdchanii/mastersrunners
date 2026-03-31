---
id: I-0012-050
title: Restore separate API deploy lanes for dev and main branches
parent: I-0012-supabase-postgres-rollout
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0012-040
blocked_by: []
verify:
  - pnpm exec prettier --check .github/workflows/deploy.yml docs/runbooks/deployment.md docs/runbooks/rollback.md design/architecture/deployment.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/archive/I-0012-040-ci-dev-only-deploy-gating.md tasks/archive/I-0012-050-ci-dual-branch-api-deploy-lanes.md
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/workflows/deploy.yml
  - docs/runbooks/deployment.md
  - docs/runbooks/rollback.md
  - design/architecture/deployment.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Make automated API deploys branch-aware again so `dev` and `main` each deploy to their own Cloud Run lane, while keeping the current host-matrix docs explicit about what is and is not user-facing yet.

## Done Criteria

- the deploy workflow triggers on both `dev` and `main`
- `dev` deploys to a dedicated dev Cloud Run service and `main` deploys to a dedicated production Cloud Run service
- the deploy docs explain the branch-to-service and branch-to-host split without implying that `main` is already the live app host

## Notes

- This task is about API deploy lanes, not about switching the public web host to `main`.
- GitHub environment-scoped secrets/vars are expected so each branch can resolve its own GCP project/service identity and frontend URL values cleanly.

## Self Review

- Scope and intent: kept the change on branch-aware API deploy automation and matching deploy docs; did not change web-host switching or external Cloudflare dashboard state.
- Source of truth: updated the deploy workflow, deployment runbook, rollback runbook, architecture doc, and initiative task breakdown together.
- Design divergence: none intended; `dev` and `main` now each have an API deploy lane while the docs still make it explicit that the public main web host is deferred.
- Verification: targeted `prettier --check` and `bash scripts/check-task-review-metadata.sh` passed after the review-driven doc updates.
- Review routing: requested `harness-reviewer` and `docs-reviewer` because the task changes branch-aware deploy automation and the matching rollout docs.

## Review Focus

- Specialist reviewer should check:
  - branch-aware deploy environment selection is consistent and does not collapse dev/prod settings together
- PO reviewer should check:
  - the docs still reflect that the public main-host launch is deferred even though the main API lane exists

## Handoff

- Follow with GCP environment bootstrap so the new `dev` and `production` GitHub environments have matching secrets and variables.

## Design Divergence

- None intended. This task should restore the intended dual-lane API deploy posture while keeping the host rollout staged.

## Attempt Log

- 2026-03-31: task created after product direction changed from dev-only deploys back to branch-specific dev/main deploy lanes.
- 2026-03-31: rewired `.github/workflows/deploy.yml` to trigger on both `dev` and `main`, select a branch-matched GitHub environment, and require `CLOUD_RUN_SERVICE_NAME` from environment-scoped variables.
- 2026-03-31: updated deployment docs so the repo now distinguishes branch-aware API deploy lanes from the still-deferred public main-host launch.
- 2026-03-31: aligned `docs/runbooks/rollback.md` with the new dev/prod Cloud Run service split and branch-specific revert path.

## Review Notes

- Specialist review:
  - 2026-03-31 `harness-reviewer`: approved after deploy automation, rollback guidance, architecture docs, and initiative/task state all aligned on the dual `dev`/`main` API lane model, with external GitHub environment bootstrap split into a follow-up proof task.
  - 2026-03-31 `docs-reviewer`: approved after the workflow, deploy runbook, rollback runbook, architecture doc, and initiative consistently described branch-matched GitHub environments, lane-scoped env contracts, and the still-deferred public main web-host launch.
- PO review:
  - 2026-03-31: approved by the user direction that CI should run on both `dev` and `main`, and each branch should deploy to its own API lane even if `main` is not being pushed yet.

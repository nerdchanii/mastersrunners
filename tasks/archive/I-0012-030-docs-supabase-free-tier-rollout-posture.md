---
id: I-0012-030
title: Clarify Supabase Free-tier rollout posture and operating limits
parent: I-0012-supabase-postgres-rollout
scope: docs
owner: unassigned
reviewers:
  - docs-reviewer
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0012-020
blocked_by: []
verify:
  - pnpm exec prettier --check docs/runbooks/deployment.md docs/runbooks/environment-and-settings.md design/initiatives/I-0012-supabase-postgres-rollout.md design/operating-rules/exceptions.md tasks/archive/I-0012-030-docs-supabase-free-tier-rollout-posture.md
artifacts:
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
  - design/operating-rules/exceptions.md
---

## Goal

Align the rollout docs with the current decision to keep Supabase Free in place for now, while making its operating limits explicit.

## Done Criteria

- rollout docs explicitly state that the current dev deployment uses Supabase Free
- docs separate the current dev-stability posture from any future production uptime promise
- remaining pause, availability, or billing risks are recorded as limitations or exceptions instead of a placeholder Pro-upgrade task

## Notes

- The dev lane is already deployed on Supabase Free.
- This task is source-of-truth cleanup, not a database migration or pricing change by itself.

## Self Review

- Scope and intent: keep the change on documented rollout posture only; no database plan change, migration, or billing mutation is being hidden inside this task.
- Source of truth: deployment/env runbooks, the initiative summary, and the exceptions register now describe the chosen Supabase posture consistently.
- Design divergence: none intended; the task removes stale Pro-upgrade framing and replaces it with the current Free-tier operating truth plus its explicit limits.
- Verification: targeted Prettier checks passed locally, and external Supabase state was rechecked on 2026-04-01 via the connected project/org tooling.
- Review routing: `docs-reviewer`, `backend-reviewer`, `harness-reviewer`, and `po-reviewer` remain appropriate because this is source-of-truth cleanup across runtime, rollout, and exception surfaces.

## Review Focus

- Specialist reviewer should check:
  - the docs reflect the actual Supabase plan in use without hiding Free-tier constraints
- PO reviewer should check:
  - the documented posture matches the current launch strategy instead of an outdated paid-plan assumption

## Handoff

- If the rollout later needs a paid Supabase plan, create a new task from the updated operating posture instead of reviving the stale Pro-upgrade framing.

## Design Divergence

- The current rollout plan is to stay on Supabase Free for now, but the task previously implied that a Pro upgrade was the active next step.

## Attempt Log

- 2026-03-31: created as a follow-up to keep Supabase plan assumptions explicit during the rollout.
- 2026-04-01: retitled and reframed after confirming the current plan is to keep Supabase Free in place rather than treat a Pro upgrade as the active next step.
- 2026-04-01: verified the connected Supabase organization is currently on the `free` plan and documented that the active dev project `mastersrunners-dev` (`ziocdlargynmjxjhijqj`) remains in `ap-northeast-2`.

## Review Notes

- Specialist review: docs/backend/harness lenses say the rollout docs now match the actual Supabase posture and keep the Free-tier availability caveat explicit instead of burying it in stale assumptions.
- PO review: the written rollout story now reflects the current plan to stay on Supabase Free for the dev lane without overpromising public uptime.

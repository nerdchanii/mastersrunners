---
id: I-0012-020
title: Provision Supabase dev project and record external proof
parent: I-0012-supabase-postgres-rollout
scope: meta
owner: unassigned
reviewers:
  - docs-reviewer
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0012-010
blocked_by: []
verify:
  - pnpm exec prettier --check design/initiatives/I-0012-supabase-postgres-rollout.md design/operating-rules/exceptions.md tasks/archive/I-0012-010-db-supabase-runtime-contract.md tasks/archive/I-0012-020-docs-supabase-rollout-and-proof.md tasks/todo/I-0012-030-docs-supabase-free-tier-rollout-posture.md
artifacts:
  - design/initiatives/I-0012-supabase-postgres-rollout.md
  - design/operating-rules/exceptions.md
---

## Goal

Provision the Supabase dev project, record the external proof surfaces, and turn the remaining paid-plan risk into an explicit follow-up instead of chat-only intent.

## Done Criteria

- the Supabase dev project exists in the intended region
- the initiative and task queue reflect the rollout and its remaining follow-up
- external proof expectations stay secret-safe

## Notes

- The preview/app host remains `dev.mastersrunners.com` in repo truth.
- Cloudflare and Supabase dashboard state remain external proof surfaces.

## Self Review

- Scope and intent: covered the external proof bookkeeping for the Supabase rollout without reopening unrelated launch or auth tasks.
- Source of truth: synced the initiative, exceptions register, and follow-up tasks to the actual provisioned project and external proof model.
- Design divergence: external dashboard proof remains outside the repo by design and is explicitly tracked in `EX-0004` and `EX-0005`.
- Verification: targeted `prettier --check` passed; Supabase project creation, migration application, table-count verification, and seed verification were completed through MCP.
- Review routing: requested `harness-reviewer`, `backend-reviewer`, and `docs-reviewer` because this task touches external proof bookkeeping, DB rollout evidence, and initiative/task clarity.

## Review Focus

- Specialist reviewer should check:
  - the external proof notes do not leak secrets and do not over-claim dashboard state
  - the task breakdown cleanly separates completed rollout work from the Free-to-Pro follow-up
- PO reviewer should check:
  - the remaining paid-plan decision is visible and not hidden inside implementation notes

## Handoff

- The next step is the explicit Free-to-Pro readiness task once uptime expectations move beyond bring-up.

## Design Divergence

- External dashboard proof still lives outside the repo and must not be replaced with guessed values in docs.

## Attempt Log

- 2026-03-31: recorded the remaining paid-plan follow-up and added `EX-0005` for secret-safe external proof of the Supabase project state.
- 2026-03-31: created Supabase project `mastersrunners-dev` (`ziocdlargynmjxjhijqj`) in `ap-northeast-2`, applied the repo migrations, verified 43 public tables, and seeded 13 `WorkoutType` rows.

## Review Notes

- Specialist review:
  - 2026-03-31 `backend-reviewer`: approved after the provisioned Supabase project proof stayed limited to region/ref plus migration and seed verification, without committing live credentials or over-claiming runtime state.
  - 2026-03-31 `harness-reviewer`: approved after the initiative/task split made Free-plan bring-up vs Pro-plan follow-up explicit and the archived tasks carried their completed review notes.
  - 2026-03-31 `docs-reviewer`: approved after the exception register, initiative breakdown, and rollout proof stayed secret-safe and aligned with the repo-side deployment contract.
- PO review:
  - 2026-03-31: approved by the user direction to create a new Seoul-region Supabase project for bring-up, avoid reusing the inactive Singapore project, and track the paid-plan decision as an explicit follow-up before public beta uptime promises.

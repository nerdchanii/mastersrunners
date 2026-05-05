---
id: I-0012-010
title: Roll out Supabase runtime contract across code and operator docs
parent: I-0012-supabase-postgres-rollout
scope: db
owner: unassigned
reviewers:
  - backend-reviewer
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/database db:generate
  - pnpm --filter @masters/api exec tsc -p tsconfig.build.json --noEmit
  - bash scripts/check-safe-production-migrations.sh HEAD HEAD
  - bash -n scripts/check-safe-production-migrations.sh
  - pnpm exec prettier --check package.json packages/database/package.json packages/database/prisma.config.ts packages/database/prisma/seed.ts .env.production.example .github/workflows/deploy.yml docker-compose.prod.yml docs/runbooks/environment-and-settings.md docs/runbooks/deployment.md design/architecture/deployment.md design/backend/persistence-model.md
artifacts:
  - package.json
  - packages/database/package.json
  - packages/database/prisma.config.ts
  - packages/database/prisma/seed.ts
  - .env.production.example
  - .github/workflows/deploy.yml
  - docker-compose.prod.yml
  - docs/runbooks/environment-and-settings.md
  - docs/runbooks/deployment.md
  - design/architecture/deployment.md
  - design/backend/persistence-model.md
  - scripts/check-safe-production-migrations.sh
---

## Goal

Make the repo compatible with a Supabase rollout by separating runtime DB access from Prisma CLI/operator DB access and updating the operator-facing deployment contract in the same task.

## Done Criteria

- Prisma CLI prefers `DIRECT_URL` when present
- API runtime continues to use `DATABASE_URL`
- additive-only automated migration and seed commands exist for shared environments
- seed and deploy posture align with the new split

## Notes

- This task intentionally keeps runtime hosting on Cloud Run.
- Supabase Free is a bring-up target only; public beta readiness is tracked separately.

## Self Review

- Scope and intent: stayed on the runtime/operator DB split plus Cloud Run beta cost posture; did not mix host-routing or auth behavior changes into this task.
- Source of truth: updated `.env.production.example`, the deploy workflow, `docker-compose.prod.yml`, and the deployment/persistence docs in the same task.
- Design divergence: no intentional repo-local divergence remains; runtime still uses `DATABASE_URL` while Prisma CLI now prefers `DIRECT_URL` when provided.
- Verification: `pnpm --filter @masters/database db:generate`, `pnpm --filter @masters/api exec tsc -p tsconfig.build.json --noEmit`, `bash scripts/check-safe-production-migrations.sh HEAD HEAD`, `bash -n scripts/check-safe-production-migrations.sh`, and targeted `prettier --check` passed.
- Review routing: requested `backend-reviewer`, `harness-reviewer`, and `docs-reviewer` because the task changes Prisma behavior, Cloud Run deployment automation, and operator-facing rollout guidance together.

## Review Focus

- Specialist reviewer should check:
  - Prisma CLI/runtime split does not break local development or Cloud Run runtime behavior
  - Cloud Run instance cap is conservative enough for beta cost control
- PO reviewer should check:
  - the rollout still optimizes for lower setup pain and does not hide public-beta uptime risk

## Handoff

- Follow with external proof sync so the provisioned Supabase project and remaining paid-plan decision are tracked without committing secrets.

## Design Divergence

- None intended. The repo now encodes the runtime-vs-operator split instead of leaving it implicit.

## Attempt Log

- 2026-03-31: started the Supabase rollout by preferring `DIRECT_URL` for Prisma CLI and keeping runtime on `DATABASE_URL`.
- 2026-03-31: reduced Cloud Run `max-instances` from `3` to `1` for the beta-stage cost posture.
- 2026-03-31: added `db:migrate:deploy` and `db:seed`, then wired the deploy workflow to run both before Cloud Run rollout.
- 2026-03-31: tightened `scripts/check-safe-production-migrations.sh` so automated main-branch deploys accept only an additive SQL subset instead of relying on a narrow destructive-pattern blacklist.

## Review Notes

- Specialist review:
  - 2026-03-31 `backend-reviewer`: approved after the deploy path switched to `db:migrate:deploy`/`db:seed`, `DIRECT_URL` stayed out of Cloud Run runtime, and the migration guard was narrowed to an additive-only SQL subset for automated main deploys.
  - 2026-03-31 `harness-reviewer`: approved after the task kept code, workflow, and operator docs in the same executable unit and the archive-state review notes were recorded explicitly.
  - 2026-03-31 `docs-reviewer`: approved after the runbook and architecture docs matched the actual deploy workflow, the `.env.production` compose contract, and the additive-only migration posture.
- PO review:
  - 2026-03-31: approved by the user direction to keep API hosting on Cloud Run, switch the managed database target to Supabase Postgres, keep `dev.mastersrunners.com` as the preview host truth, and make public-beta uptime a separate paid-plan follow-up instead of hiding that risk in implementation notes.

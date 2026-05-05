---
id: I-0014-070
title: Extend the auth funnel with runner identity fields
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/api test -- --runTestsByPath src/profile/profile.service.spec.ts src/auth/repositories/user.repository.spec.ts
  - pnpm --filter @masters/api build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/login/index.tsx
  - apps/web/src/pages/onboarding/index.tsx
  - docs/domain/user-profile.md
  - design/frontend/social-profile.md
---

## Goal

Add the missing runner identity fields and funnel steps needed to make signup feel like a true runner onboarding flow.

## Done Criteria

- the funnel clearly separates login from first-time runner setup
- required runner identity fields are defined before implementation starts
- onboarding and profile truth stay aligned with domain docs

## Notes

- Product checkpoint resolved in this batch: nickname is required; `region`, `subRegion`, `bio`, and PBs stay optional; onboarding exposes a skip path; PB storage is limited to `5K`, `10K`, `HM`, and `FM`.
- Profile editing remains the durable source of truth for the same runner identity fields after onboarding.

## Self Review

- Scope and intent: split intro/login from runner onboarding and extend the shared profile contract with optional runner identity fields instead of speculative funnel-only state.
- Source of truth: `docs/domain/user-profile.md`, `design/frontend/social-profile.md`, `apps/web/src/pages/onboarding/index.tsx`, `apps/web/src/pages/settings/profile/index.tsx`, and `packages/database/prisma/schema.prisma`.
- Design divergence: resolved in this task by making nickname the only required onboarding field and aligning optional `region`, `subRegion`, `bio`, and PB fields across onboarding, settings, API, and persistence.
- Verification: `pnpm --filter @masters/api test -- --runTestsByPath src/profile/profile.service.spec.ts src/auth/repositories/user.repository.spec.ts`; `pnpm --filter @masters/api build`; `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`; `pnpm ci:local`.
- Review routing: frontend, UI/UX, backend, and PO reviews all completed with no findings.

## Review Focus

- Specialist reviewer should check: the funnel/data model stays coherent across auth, onboarding, and profile editing.
- PO reviewer should check: the chosen runner identity fields match the intended member experience.

## Handoff

- Split storage/schema work from UI work if the confirmed field set grows beyond a light onboarding extension.

## Design Divergence

- Resolved in this task: onboarding and profile editing now share the same optional runner identity fields instead of keeping PB-aware runner setup outside the product flow.

## Attempt Log

- 2026-04-01: created after product requested PB-aware onboarding and clearer signup funnel behavior.

## Review Notes

- Specialist review: Pascal (`frontend-reviewer`), Russell (`ui-ux-reviewer`), and Faraday (`backend-reviewer`) reported no findings after checking the intro/login split, optional PB field set, and profile persistence contract.
- PO review: Arendt (`po-reviewer`) reported no findings and confirmed the implemented funnel matches the locked product decisions from this chat.

---
id: I-0014-150
title: Add crew profile and cover media fields
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
  - pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/components/crew/CrewForm.tsx
  - apps/web/src/pages/crews/[id]/settings/index.tsx
  - apps/api/src/crews/
  - design/frontend/crew-experience.md
---

## Goal

Add the crew media fields needed for a profile image and cover representation.

## Done Criteria

- crew operators can understand which media slot is for profile identity and which is for cover use
- URL entry, preview, and persistence behavior are defined before the UI ships
- crew detail and invite surfaces can rely on the new crew media once available

## Notes

- Product checkpoint resolved: the two slots are fixed to `profile image` and `cover image`.
- This batch ships URL entry + preview + persistence for those two roles only.

## Self Review

- Scope and intent: add explicit crew `profile image` and `cover image` semantics to creation, settings, and detail surfaces without inventing a third media role.
- Source of truth: `design/frontend/crew-experience.md`, `docs/domain/crew.md`, `apps/web/src/components/crew/CrewForm.tsx`, `apps/web/src/components/crew/CrewIdentityHero.tsx`, and `apps/api/src/crews/crews.service.ts`.
- Design divergence: resolved in this task by aligning form labels, previews, and persistence with the locked profile-image and cover-image meanings.
- Verification: `pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.service.spec.ts src/crews/repositories/crew.repository.spec.ts`; `pnpm --filter @masters/api build`; `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`; `pnpm ci:local`.
- Review routing: frontend, UI/UX, backend, and PO reviews all completed with no findings.

## Review Focus

- Specialist reviewer should check: the media-field contract is clear and the UI does not confuse the two image roles.
- PO reviewer should check: the field semantics match the intended crew-brand presentation.

## Handoff

- Once product confirms media semantics, keep the naming consistent across settings, crew cards, and share surfaces.

## Design Divergence

- Crew surfaces previously lacked separate profile/cover editing, so the product meaning of the two crew-media slots was not reflected in settings or detail UI.

## Attempt Log

- 2026-04-01: created after product requested both crew profile and cover image support.

## Review Notes

- Specialist review: Pascal (`frontend-reviewer`), Russell (`ui-ux-reviewer`), and Faraday (`backend-reviewer`) reported no findings after checking media-slot semantics, null/clear behavior, and crew detail rendering.
- PO review: Arendt (`po-reviewer`) reported no findings and confirmed the profile-image and cover-image model matches the intended crew-brand presentation.

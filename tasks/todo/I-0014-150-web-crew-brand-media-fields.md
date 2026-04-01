---
id: I-0014-150
title: Add crew profile and thumbnail media fields
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

Add the crew media fields needed for a profile image and thumbnail/banner-like representation.

## Done Criteria

- crew operators can understand which media slot is for profile identity and which is for thumbnail/banner use
- upload, preview, and persistence behavior are defined before the UI ships
- crew detail and invite surfaces can rely on the new crew media once available

## Notes

- Execution mode: requires product checkpoint before implementation.
- Product checkpoint topics: aspect ratios, cropping rules, and whether the second slot behaves as a cover, thumbnail, or share preview image.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the media-field contract is clear and the UI does not confuse the two image roles.
- PO reviewer should check: the field semantics match the intended crew-brand presentation.

## Handoff

- Once product confirms media semantics, keep the naming consistent across settings, crew cards, and share surfaces.

## Design Divergence

- Crew settings currently do not expose the media fields product expects.

## Attempt Log

- 2026-04-01: created after product requested both crew profile and thumbnail image support.

## Review Notes

- Specialist review:
- PO review:

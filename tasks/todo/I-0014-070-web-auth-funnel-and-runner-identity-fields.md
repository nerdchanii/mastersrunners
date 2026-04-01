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
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/api test
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

- Execution mode: requires product checkpoint before implementation.
- Product checkpoint topics: which PB fields are canonical, which are optional, and what can be edited later from profile settings.
- Do not implement speculative PB fields until product confirms the field set and copy.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the funnel/data model stays coherent across auth, onboarding, and profile editing.
- PO reviewer should check: the chosen runner identity fields match the intended member experience.

## Handoff

- Split storage/schema work from UI work if the confirmed field set grows beyond a light onboarding extension.

## Design Divergence

- Current onboarding intentionally excludes PB and runner-history fields even though product now wants them.

## Attempt Log

- 2026-04-01: created after product requested PB-aware onboarding and clearer signup funnel behavior.

## Review Notes

- Specialist review:
- PO review:

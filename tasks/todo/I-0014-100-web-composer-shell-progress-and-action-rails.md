---
id: I-0014-100
title: Simplify composer shell progress and action placement
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/posts/new/index.tsx
  - apps/web/src/pages/posts/new/post-composer-steps.tsx
  - apps/web/src/pages/workouts/new/index.tsx
---

## Goal

Make the post and workout composer shells feel lighter by simplifying progress feedback and moving primary actions into more sensible rails.

## Done Criteria

- step progress can be understood visually without redundant stage labels
- composer actions such as “다음” and “워크아웃 없이 진행” live in a stable shell zone instead of floating awkwardly inside content
- the new shell works on mobile without needing the global nav to compete for the same space

## Notes

- Execution mode: autonomous.
- Keep this task on shell framing, progress, and action placement; media and text inputs have separate tasks.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the composer feels clearer and lighter without losing navigational context.
- PO reviewer should check: the shell matches the intended step-by-step creation flow.

## Handoff

- Media-picker and text-composer tasks should plug into this shell rather than rebuilding their own headers or progress widgets.

## Design Divergence

- The current composer still carries redundant step labels and action placement that product considers awkward.

## Attempt Log

- 2026-04-01: created after product requested progress-bar-only feedback and better placement for composer navigation buttons.

## Review Notes

- Specialist review:
- PO review:

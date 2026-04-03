---
id: I-0014-160
title: Rebuild crew detail tab hierarchy for faster scanning
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/crew-boards.spec.ts e2e/crew-posts.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/components/crew/
  - design/frontend/crew-experience.md
---

## Goal

Improve the information hierarchy on crew detail so members can scan activities, chat, posts, stats, and moderation areas without tab overload.

## Done Criteria

- crew detail navigation hierarchy is clearer than the current flat tab strip
- high-frequency member areas and lower-frequency admin areas are visually differentiated
- icon or grouping use improves scanning without hiding important destinations

## Notes

- Product checkpoint resolved in this batch: the primary member order is `활동 -> 채팅 -> 게시판`, with lower-frequency or operator-only surfaces visually demoted.
- `크루 소식` remains available as a secondary section instead of competing with the main member destinations.

## Self Review

- Scope and intent: simplify crew detail scanning by promoting the core member destinations and reducing competition from low-frequency surfaces.
- Source of truth: `design/frontend/crew-experience.md`, `apps/web/src/pages/crews/[id]/index.tsx`, `apps/web/e2e/crew-boards.spec.ts`, and `apps/web/e2e/crew-posts.spec.ts`.
- Design divergence: resolved in this task by reordering the primary crew destinations around activity, chat, and boards instead of a flatter multi-surface strip.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`; `pnpm --filter @masters/web exec playwright test e2e/crew-boards.spec.ts e2e/crew-posts.spec.ts --project=chromium`; `pnpm ci:local`.
- Review routing: frontend, UI/UX, and PO reviews all completed with no findings.

## Review Focus

- Specialist reviewer should check: the new hierarchy improves scanning and reduces clutter without harming reachability.
- PO reviewer should check: the destination order and grouping match intended crew priorities.

## Handoff

- If moderation surfaces later move into a separate admin mode, keep the grouping rules established here.

## Design Divergence

- Resolved in this task: crew detail navigation now reflects the intended member priority order instead of treating all destinations as peers.

## Attempt Log

- 2026-04-01: created after product requested a clearer crew detail hierarchy and possible icon-led scanning.

## Review Notes

- Specialist review: Pascal (`frontend-reviewer`) and Russell (`ui-ux-reviewer`) reported no findings after checking the new hierarchy, board entry visibility, and mobile scanning.
- PO review: Arendt (`po-reviewer`) reported no findings and confirmed the destination order matches the intended crew priorities.

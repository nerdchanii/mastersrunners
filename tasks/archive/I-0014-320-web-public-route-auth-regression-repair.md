---
id: I-0014-320
title: Repair public route auth regressions on feed, crews, and post detail
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - backend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - I-0014-310
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.controller.spec.ts src/crew-boards/crew-boards.controller.spec.ts src/posts/posts.service.spec.ts src/post-social/post-social.service.spec.ts
  - pnpm --filter @masters/api build
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-active-task-closeout.sh
artifacts:
  - apps/api/src/crews/crews.controller.ts
  - apps/api/src/crew-boards/crew-boards.controller.ts
  - apps/api/src/crews/crews.controller.spec.ts
  - apps/api/src/crew-boards/crew-boards.controller.spec.ts
  - apps/web/src/hooks/useGroupChat.ts
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/components/crew/CrewActivityList.tsx
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/components/crew/CrewMemberList.tsx
  - apps/web/src/components/social/LikeButton.tsx
  - apps/web/src/components/post/PostCard.tsx
  - apps/web/e2e/public-entry-auth.spec.ts
  - design/frontend/app-shell-routing.md
  - design/frontend/crew-experience.md
  - design/initiatives/I-0014-ui-bug-board-and-stabilization.md
---

## Goal

Close the logged-out public route regressions where `/feed`, `/crews`, and public post/crew detail flows still trigger `/login?next=...` redirects instead of staying readable and gating deeper actions with a modal.

## Done Criteria

- `/feed -> /crews` stays on `/crews` for anonymous visitors because the page's read APIs no longer 401-loop into `/login`
- browser back from `/crews` returns to `/feed` instead of bouncing back into `/login`
- public crew detail and public post detail stay readable without login
- protected reactions from those public surfaces open the login/signup dialog instead of hard redirecting to `/login`

## Notes

- This is a regression-repair task split out from `I-0014-310` so the fix history stays visible.
- Playwright reproduction proved the original loop came from protected crew read APIs plus the global `api.fetch()` unauthorized redirect path.

## Self Review

- Scope and intent: Stayed on the regression only. This task repaired the stray `/login?next=...` loops, hardened public route reads, and kept auth prompts at the action boundary instead of reworking the broader public-entry direction again.
- Source of truth: Updated the same app-shell and crew-experience docs that define public exploration behavior, and kept the initiative log explicit about the Playwright-proven root cause and the repair.
- Design divergence: The regression came from implementation drift, not a design change. The fix restored the approved contract that public routes stay readable while participation actions open auth prompts.
- Verification: Reproduced the bug in a real browser, added Playwright coverage for the public-flow regressions and invite/deep-link recovery, ran focused API specs/builds, and reran `pnpm ci:local` after the backend visibility fixes.
- Review routing: Used frontend, backend, UI/UX, and PO review because the repair touched public routing, API visibility boundaries, modal gating, and browser-history behavior.

## Review Focus

- Specialist reviewers should check: public crew reads are really public at the API boundary and public actions use modal gating instead of route redirects.
- UI/UX review should check: the auth prompts feel progressive and do not yank visitors out of the public flow.
- PO review should check: public feed and crew discovery now match the intended “explore first, sign up later” story.

## Handoff

- If later product work makes workout detail public too, reuse the same “public read + modal-gated action” contract instead of reintroducing `/login?next=...` loops from feed cards.

## Design Divergence

- `I-0014-310` established public feed and public crew discovery as current truth, but several crew and social reads were still protected in API/controller or component-level fetches, so the shipped behavior diverged from that design.

## Attempt Log

- 2026-04-03: Playwright reproduction showed `/feed -> /crews` immediately rerouting to `/login?next=%2Fcrews` because `/crews/regions` and `/crews/explore` still returned `401`.
- 2026-04-03: public crew detail audit found the page was also mounting member-only chat queries and protected board/profile/post reads during anonymous visits.

## Review Notes

- Specialist review:
  - `frontend-reviewer`: approved after `ProtectedRoute` preserved `next` targets and Playwright covered invite/deep-link recovery; no findings.
  - `backend-reviewer`: approved after private crew, crew-board, followers-only post, like-status, and block-boundary leaks were closed; no findings.
  - `ui-ux-reviewer`: approved after guest-visible protected entry points were converted to modal gating and no longer behaved like dead or misleading controls; no findings.
- PO review:
  - `po-reviewer`: approved after public comment participation moved to the auth modal and public read failures stopped masquerading as auth walls; no findings.

## Verification Evidence

- `pnpm --filter @masters/api test -- --runTestsByPath src/crews/crews.controller.spec.ts src/crews/crews.service.spec.ts src/crew-boards/crew-boards.controller.spec.ts src/crew-boards/crew-boards.service.spec.ts src/posts/repositories/post.repository.spec.ts src/posts/posts.service.spec.ts src/post-social/post-social.service.spec.ts`
- `pnpm --filter @masters/api build`
- `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
- `pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts --project=chromium`
- Real browser reproduction and recovery verified locally with Playwright CLI on `/feed -> /crews`, guest `내 크루`, public post detail, and invite entry.
- `bash scripts/check-task-review-metadata.sh`
- `bash scripts/check-active-task-closeout.sh`
- `pnpm ci:local`

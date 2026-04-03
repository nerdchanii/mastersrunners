---
id: I-0014-310
title: Replace the logged-out intro with a public feed entry and progressive auth prompts
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - backend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - I-0014-110
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/feed/feed.service.spec.ts src/feed/repositories/feed.repository.spec.ts
  - pnpm --filter @masters/api build
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/api/src/feed/feed.controller.ts
  - apps/api/src/feed/feed.service.ts
  - apps/api/src/feed/repositories/feed.repository.ts
  - apps/web/src/router.tsx
  - apps/web/src/pages/feed/index.tsx
  - apps/web/src/pages/login/index.tsx
  - apps/web/src/pages/crews/index.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/components/common/AuthGateDialog.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/components/feed/FeedSidebar.tsx
  - design/frontend/app-shell-routing.md
  - design/frontend/crew-experience.md
  - design/initiatives/I-0014-ui-bug-board-and-stabilization.md
---

## Goal

Use the public `/feed` surface as the logged-out entry instead of maintaining a separate intro route, and gate deeper actions with lighter signup/login prompts after the user has already explored.

## Done Criteria

- `/` no longer maintains a separate intro experience and resolves into the public feed entry
- anonymous users can read a real public post/workout feed instead of only seeing placeholder discovery copy
- signup/login prompts become progressive, lighter, and more contextual than a full-screen CTA landing
- events and challenges stay out of the logged-out entry because they are still feature-gated off in the current product surface
- signup and login entry labels are visually separated even though both hand off to the same OAuth flow

## Notes

- Treat this as a product-direction pivot from the earlier intro-copy-only pass.
- Keep `/login` as the auth shell, but make its copy reflect whether the visitor arrived from `회원가입` or `로그인`.
- For Kakao and Google OAuth, preserve the current backend truth:
  - existing accounts continue through login
  - brand-new accounts are created on first successful OAuth callback

## Self Review

- Scope and intent: Kept this task focused on the entry pivot itself: `/` now resolves to public `/feed`, anonymous visitors can read real public feed/crew/post surfaces, and auth intent copy is lighter and contextual instead of living in a dedicated intro CTA page.
- Source of truth: Updated `design/frontend/app-shell-routing.md`, `design/frontend/crew-experience.md`, and the initiative log in the same changeset so the public-entry contract is documented alongside the implementation.
- Design divergence: The earlier intro-first direction was intentionally retired. The current truth is public exploration first, with auth only when the visitor crosses into participation.
- Verification: Ran the task verify commands plus the public-route recovery spec and a full `pnpm ci:local` pass after the regression fixes landed.
- Review routing: Collected frontend, backend, UI/UX, and PO review because this task changed both public API reads and user-facing auth prompting.

## Review Focus

- Specialist reviewers should check: public feed access now works end-to-end for anonymous visitors without weakening the authenticated feed path.
- UI/UX review should check: the logged-out flow feels like exploration first, signup second, without turning the feed into a CTA wall.
- PO review should check: the public entry now tells the right product story for crew-led community discovery.

## Handoff

- If future growth work adds richer logged-out discovery, extend the public feed and public crew surfaces before reintroducing a dedicated campaign-style landing page.

## Design Divergence

- The previous `/` intro route was still carrying copy-first assumptions even after product shifted toward public exploration and crew-led acquisition.

## Attempt Log

- 2026-04-03: created as an intro copy pass after product rejected the current tone.
- 2026-04-03: scope widened once product direction clarified that the separate intro may be unnecessary and the public feed should become the first-touch surface.

## Review Notes

- Specialist review:
  - `frontend-reviewer`: approved after `ProtectedRoute` recovery and invite/deep-link coverage were added; no findings.
  - `backend-reviewer`: approved after public reads were re-scoped to public-only/follower-allowed boundaries; no findings.
  - `ui-ux-reviewer`: approved after removing guest-facing protected nav affordances and moving write actions to auth modals; no findings.
- PO review:
  - `po-reviewer`: approved after reply/comment auth prompts and generic public-comment failure messaging aligned with the “explore first, participate later” story; no findings.

## Verification Evidence

- `pnpm --filter @masters/api test -- --runTestsByPath src/feed/feed.service.spec.ts src/feed/repositories/feed.repository.spec.ts`
- `pnpm --filter @masters/api test -- --runTestsByPath src/posts/repositories/post.repository.spec.ts src/posts/posts.service.spec.ts src/post-social/post-social.service.spec.ts`
- `pnpm --filter @masters/api build`
- `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
- `pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts --project=chromium`
- `bash scripts/check-task-review-metadata.sh`
- `bash scripts/check-active-task-closeout.sh`
- `pnpm ci:local`

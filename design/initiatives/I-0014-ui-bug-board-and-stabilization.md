# I-0014: UI Bug Board and Stabilization

## Summary

Turn the current product-owner UI intake into one route-grounded bug board, then use that board to sequence small web follow-up tasks instead of mixing discovery, redesign, and bugfix work into one large patch.

## Problem

The current UI feedback mixes several different problem types:

- discoverability issues where implemented surfaces feel missing
- product gaps where the current web model is too thin for the intended runner experience
- layout and visual-system drift, especially card-heavy detail surfaces and nested settings shells
- mobile navigation and composer friction
- messaging, crew, and workout surfaces that need clearer IA, room identity, and stronger verification
- no lightweight in-product feedback intake even though product-owner bug discovery is currently happening out of band

Without one shared intake artifact, we risk fixing isolated symptoms, weakening current design truth, or skipping the verification and reviewer routing required by the task system.

## Goals

- capture the reported UI issues in one durable report grounded in real routes, components, and docs
- separate bug, discoverability, product-gap, and visual-cleanup work so later tasks stay bounded
- identify which issues already have partial implementation but poor entry points
- capture the highest-confidence follow-up packs as real task files instead of leaving them as report-only notes
- prepare sequenced fix packs without pretending the whole UI refresh can land in one task
- preserve design and domain docs as current truth until implementation really changes them

## Non-Goals

- shipping every reported UI change in one initiative task
- rewriting the entire web app or design system before prioritization
- introducing recommendation algorithms in this intake step
- downgrading current docs to describe unimplemented PB, onboarding, or profile capabilities as live

## Scope

- `docs/reports/i-0014-ui-bug-board.md`
- `docs/reports/README.md`
- `apps/web/src/router.tsx`
- `apps/web/src/components/common/BottomNav.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/pages/search/index.tsx`
- `apps/web/src/pages/onboarding/index.tsx`
- `apps/web/src/pages/messages/index.tsx`
- `apps/web/src/pages/messages/[id]/index.tsx`
- `apps/web/src/hooks/useMessages.ts`
- `apps/web/src/pages/posts/new/index.tsx`
- `apps/web/src/pages/posts/[id]/index.tsx`
- `apps/web/src/pages/workouts/new/index.tsx`
- `apps/web/src/pages/workouts/detail/index.tsx`
- `apps/web/src/pages/profile/index.tsx`
- `apps/web/src/pages/profile/[id]/index.tsx`
- `apps/web/src/pages/crews/[id]/settings/index.tsx`
- `apps/web/src/pages/crews/[id]/index.tsx`
- `apps/web/src/components/profile/ProfileHeader.tsx`
- `apps/web/src/components/crew/CrewForm.tsx`
- `apps/web/src/components/crew/GroupChat.tsx`
- `apps/web/src/components/feed/PostFeedCard.tsx`
- `apps/web/src/components/feed/FeedCard.tsx`
- `apps/web/src/components/post/PostCard.tsx`
- `apps/api/src/conversations/repositories/conversations.repository.ts`
- `design/frontend/app-shell-routing.md`
- `design/frontend/social-profile.md`
- `design/frontend/crew-experience.md`
- `design/frontend/workout-experience.md`
- `design/backend/messaging-realtime.md`
- `docs/domain/user-profile.md`

## Design References

- `design/frontend/app-shell-routing.md`
- `design/frontend/social-profile.md`
- `design/frontend/crew-experience.md`
- `design/frontend/workout-experience.md`
- `design/frontend/conventions.md`
- `design/backend/messaging-realtime.md`
- `design/backend/upload-ingestion.md`
- `docs/domain/user-profile.md`

## Review Plan

- docs intake task: `docs-reviewer`, `frontend-reviewer`, `ui-ux-reviewer`, and `backend-reviewer` check structure, route grounding, messaging truth, and fix-pack framing
- user-facing web follow-ups: `frontend-reviewer` plus `ui-ux-reviewer`
- messaging or persistence follow-ups: add `backend-reviewer` when chat storage or realtime behavior changes
- PO review checks that the board matches the reported pain and that the next fix packs are ordered by user value instead of implementation convenience

## Task Breakdown

### Coordination

- `tasks/archive/I-0014-010-docs-ui-bug-board.md`

### Autonomous Follow-Ups

- `tasks/archive/I-0014-020-web-messaging-room-identity-and-hub.md`
- `tasks/archive/I-0014-030-web-post-media-visibility-and-detail-parity.md`
- `tasks/archive/I-0014-040-web-feedback-intake-and-ops-readiness.md`
- `tasks/archive/I-0014-050-web-post-detail-cardless-layout-and-native-share.md`
- `tasks/archive/I-0014-060-web-search-discovery-and-shell-entry.md`
- `tasks/archive/I-0014-080-web-profile-cover-removal-and-header-cleanup.md`
- `tasks/archive/I-0014-090-web-mobile-create-entry-switcher.md`
- `tasks/archive/I-0014-100-web-composer-shell-progress-and-action-rails.md`
- `tasks/archive/I-0014-130-web-crew-invite-url-share-entry.md`
- `tasks/archive/I-0014-140-web-crew-settings-basic-info-shell-cleanup.md`
- `tasks/archive/I-0014-170-web-date-picker-modernization.md`
- `tasks/archive/I-0014-180-web-post-composer-media-selection.md`
- `tasks/archive/I-0014-190-web-post-composer-text-tagging-and-preview.md`
- `tasks/archive/I-0014-220-api-conversation-context-spec-sync.md`
- `tasks/archive/I-0014-240-web-feed-media-and-analytics-regression-recovery.md`
- `tasks/archive/I-0014-280-meta-ops-feedback-proxy-and-runtime-repair.md`
- `tasks/archive/I-0014-290-api-ops-access-single-gate.md`
- `tasks/archive/I-0014-300-web-workout-analysis-detail-and-post-preview.md`
- `tasks/archive/I-0014-310-web-public-feed-entry-and-auth-prompts.md`
- `tasks/archive/I-0014-320-web-public-route-auth-regression-repair.md`
- `tasks/todo/I-0014-330-web-guest-feed-surface-and-workout-auth-gate.md`
- `tasks/archive/I-0014-340-web-workout-detail-runtime-and-error-recovery.md`
- `tasks/archive/I-0014-350-web-workout-detail-hero-card-removal.md`

### Product Checkpoint Required

- `tasks/archive/I-0014-070-web-auth-funnel-and-runner-identity-fields.md`
- `tasks/archive/I-0014-110-web-service-intro-and-first-visit-orientation.md`
- `tasks/archive/I-0014-120-web-empty-feed-explore-modules-and-recommendation-slots.md`
- `tasks/archive/I-0014-150-web-crew-brand-media-fields.md`
- `tasks/archive/I-0014-160-web-crew-detail-tab-hierarchy-cleanup.md`
- `tasks/archive/I-0014-200-web-workout-attachment-deeplink-and-visuals.md`
- `tasks/archive/I-0014-210-docs-post-video-upload-scope.md`
- `tasks/archive/I-0014-230-web-feedback-backoffice-access-boundary.md`
- `tasks/archive/I-0014-260-web-feedback-ops-inbox-and-triage.md`
- `tasks/archive/I-0014-270-web-feedback-ops-handoff-actions.md`
- `tasks/archive/I-0014-250-web-external-profile-image-https-normalization.md`

## Success Criteria

- every reported UI item is mapped into a named board issue or fix-pack candidate
- every current board issue is backed by either a seeded `tasks/todo` file or an already-completed task in another initiative
- the bug board distinguishes implemented-but-hidden surfaces from truly missing features
- P1 issues are grouped into bounded follow-up packs instead of one broad “UI cleanup” task
- message-room identity collisions, feedback-intake gaps, and post-image visibility regressions are recorded with concrete repo evidence
- the initiative seeds executable task files for every currently reported issue cluster and separates autonomous work from product-checkpoint work
- the report records that GPX and FIT visual/metric work needs a product-user sample review before implementation
- the repo gains a durable UI intake artifact under `docs/reports/` instead of leaving the discussion in chat only

## Progress Notes

- 2026-04-02: follow-up `I-0014-220` synced the conversations repository unit spec with the room-context fields shipped by `I-0014-020`, removing stale DM-only expectations that were failing local CI during push.
- 2026-04-02: seeded `I-0014-230` for the remaining `UI-014` operator-tooling gap so the future feedback backoffice ships on one `ops.dev.mastersrunners.com` host with Cloudflare Access at the edge and API-side staff RBAC behind it.
- 2026-04-02: split the remaining feedback backoffice work into `I-0014-260` for inbox/triage and `I-0014-270` for task/issue/initiative handoff actions so the ops UX can land incrementally on top of the same feedback stream.
- 2026-04-02: revised the operator tooling track to ship as a separate `apps/ops-web` app with shadcn-based UI instead of host-branching inside `apps/web`.
- 2026-04-02: archived `I-0014-230`, `I-0014-260`, and `I-0014-270` after the dedicated `mastersrunners-ops` Pages project deployed from `dev`, `ops.dev.mastersrunners.com` was cut over to that project, and the ops host plus `/api-docs` were re-verified behind Cloudflare Access.
- 2026-04-02: opened `I-0014-240` after the deployed dev lane still showed `/feed` post-image regressions and Cloudflare analytics CSP violations, even though direct reads against the persisted `R2_PUBLIC_URL` remained healthy.
- 2026-04-02: `I-0014-240` is now review-ready with targeted API/web verification complete; only the repo-wide pre-existing Prisma/Jest ESM issue still blocks the task's narrow API e2e command.
- 2026-04-02: `I-0014-240` is now archived after authenticated live `/feed` verification confirmed persisted post images render again on the dev lane and the Cloudflare analytics CSP regression stays closed.
- 2026-04-02: seeded `I-0014-250` for the residual mixed-content warning from third-party `profileImage` URLs observed during the same authenticated `/feed` check; that warning is separate from the post-media regression fixed by `I-0014-240`.
- 2026-04-02: `I-0014-250` is now archived after narrowing the fix to Kakao avatar normalization at the auth boundary, refreshing persisted insecure Kakao URLs on re-login, and keeping authenticated web avatar behavior unchanged.
- 2026-04-02: opened `I-0014-280` after live investigation showed `ops.dev.mastersrunners.com` still used a stale Worker proxy contract and the dev API runtime was missing ops-specific env, which broke both ops-host Swagger rendering and feedback inbox reads despite the separate ops app rollout.
- 2026-04-02: archived `I-0014-280` after repairing the shared ops proxy host allowlist plus `/api-docs*` routing, restoring the missing dev runtime env for Access verification, and updating `ops-web` to show request failures explicitly instead of masquerading as an empty inbox.
- 2026-04-02: opened `I-0014-290` to remove the extra operator-email registry check from the current dev ops lane because the present single-operator setup should trust Cloudflare Access as the sole gate.
- 2026-04-02: archived `I-0014-290` after simplifying the dev ops feedback lane to Access-only gating, removing the runtime dependency on `PlatformOperatorIdentity`, and updating the ops UI plus persistence docs so they no longer instruct the solo operator to perform separate email registration.
- 2026-04-03: opened `I-0014-300` after product rejected the temporary safe-summary workout detail and clarified that workout detail should be a map-first analysis report with linked charts, laps, and a richer post-detail preview.
- 2026-04-03: archived `I-0014-300` after restoring workout detail as a map-first analysis report with linked charts and lap analysis, strengthening post-detail workout previews, and preserving no-GPS workouts through a partial-render lap fallback instead of a summary-only downgrade.
- 2026-04-03: opened `I-0014-310` as a focused intro-copy pass after product rejected the logged-out landing tone as awkward, low-quality placeholder language.
- 2026-04-03: widened `I-0014-310` from intro copy into a public-feed entry pivot once product clarified that a separate `/` CTA screen may be unnecessary and the logged-out first-touch should show real public community activity instead.
- 2026-04-03: opened `I-0014-320` after Playwright reproduction proved the new public-feed/public-crews flow still had protected API reads and global unauthorized redirects that bounced anonymous visitors into `/login` and broke browser back-navigation.
- 2026-04-03: archived `I-0014-310` and `I-0014-320` together after the public `/feed` entry shipped, protected participation actions were consistently modal-gated, public route regressions were reproduced and fixed with Playwright coverage, and backend visibility boundaries were re-tightened so only public or properly follower/member-scoped data stays readable.
- 2026-04-03: opened `I-0014-330` after product rejected the remaining explanatory guest feed chrome and surfaced one more mismatch where attached workout previews on public post detail still redirected anonymous users to `/login` instead of opening the same in-place auth modal used elsewhere.
- 2026-04-04: normalized `I-0014-330` back to `tasks/todo/` so the repo can honor the new single-active-task Stop-hook rule while leaving the already-landed public guest-feed fix pack as a resumable follow-up instead of a second simultaneous active task.
- 2026-04-04: opened `I-0014-340` after `/workouts/:id` started crashing on missing workout social counts and the shared error fallback would keep trapping users on the same UI even after the browser URL changed.
- 2026-04-04: `I-0014-340` restored the workout-detail social summary contract, added navigation escape from the page-scoped error fallback, and unblocked the focused workout API e2e verifier by mapping Prisma runtime `.mjs` imports to the shipped `.js` runtime inside `apps/api/jest-e2e.config.ts`.
- 2026-04-04: opened `I-0014-350` after product rejected the desktop workout detail hero section as too card-like and called out a desktop average-pace line break inside the top summary metrics.
- 2026-04-04: archived `I-0014-350` after flattening the workout detail hero into a cardless analysis layout, keeping map-first hierarchy, and fixing the desktop average-pace wrap regression.

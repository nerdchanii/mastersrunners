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
- `tasks/todo/I-0014-190-web-post-composer-text-tagging-and-preview.md`

### Product Checkpoint Required

- `tasks/todo/I-0014-070-web-auth-funnel-and-runner-identity-fields.md`
- `tasks/todo/I-0014-110-web-service-intro-and-first-visit-orientation.md`
- `tasks/todo/I-0014-120-web-empty-feed-explore-modules-and-recommendation-slots.md`
- `tasks/todo/I-0014-150-web-crew-brand-media-fields.md`
- `tasks/todo/I-0014-160-web-crew-detail-tab-hierarchy-cleanup.md`
- `tasks/todo/I-0014-200-web-workout-attachment-deeplink-and-visuals.md`
- `tasks/todo/I-0014-210-docs-post-video-upload-scope.md`

## Success Criteria

- every reported UI item is mapped into a named board issue or fix-pack candidate
- every current board issue is backed by either a seeded `tasks/todo` file or an already-completed task in another initiative
- the bug board distinguishes implemented-but-hidden surfaces from truly missing features
- P1 issues are grouped into bounded follow-up packs instead of one broad “UI cleanup” task
- message-room identity collisions, feedback-intake gaps, and post-image visibility regressions are recorded with concrete repo evidence
- the initiative seeds executable task files for every currently reported issue cluster and separates autonomous work from product-checkpoint work
- the report records that GPX and FIT visual/metric work needs a product-user sample review before implementation
- the repo gains a durable UI intake artifact under `docs/reports/` instead of leaving the discussion in chat only

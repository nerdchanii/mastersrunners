---
id: I-0014-010
title: Extend the UI bug board and seed all current fix packs
parent: I-0014-ui-bug-board-and-stabilization
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - test -f design/initiatives/I-0014-ui-bug-board-and-stabilization.md
  - test -f docs/reports/i-0014-ui-bug-board.md
  - test -f tasks/todo/I-0014-020-web-messaging-room-identity-and-hub.md
  - test -f tasks/todo/I-0014-030-web-post-media-visibility-and-detail-parity.md
  - test -f tasks/todo/I-0014-040-web-feedback-intake-and-ops-readiness.md
  - test -f tasks/todo/I-0014-050-web-post-detail-cardless-layout-and-native-share.md
  - test -f tasks/todo/I-0014-060-web-search-discovery-and-shell-entry.md
  - test -f tasks/todo/I-0014-070-web-auth-funnel-and-runner-identity-fields.md
  - test -f tasks/todo/I-0014-080-web-profile-cover-removal-and-header-cleanup.md
  - test -f tasks/todo/I-0014-090-web-mobile-create-entry-switcher.md
  - test -f tasks/todo/I-0014-100-web-composer-shell-progress-and-action-rails.md
  - test -f tasks/todo/I-0014-110-web-service-intro-and-first-visit-orientation.md
  - test -f tasks/todo/I-0014-120-web-empty-feed-explore-modules-and-recommendation-slots.md
  - test -f tasks/todo/I-0014-130-web-crew-invite-url-share-entry.md
  - test -f tasks/todo/I-0014-140-web-crew-settings-basic-info-shell-cleanup.md
  - test -f tasks/todo/I-0014-150-web-crew-brand-media-fields.md
  - test -f tasks/todo/I-0014-160-web-crew-detail-tab-hierarchy-cleanup.md
  - test -f tasks/todo/I-0014-170-web-date-picker-modernization.md
  - test -f tasks/todo/I-0014-180-web-post-composer-media-selection.md
  - test -f tasks/todo/I-0014-190-web-post-composer-text-tagging-and-preview.md
  - test -f tasks/todo/I-0014-200-web-workout-attachment-deeplink-and-visuals.md
  - test -f tasks/todo/I-0014-210-docs-post-video-upload-scope.md
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - design/initiatives/I-0014-ui-bug-board-and-stabilization.md
  - tasks/archive/I-0014-010-docs-ui-bug-board.md
  - docs/reports/i-0014-ui-bug-board.md
  - docs/reports/README.md
  - tasks/todo/I-0014-020-web-messaging-room-identity-and-hub.md
  - tasks/todo/I-0014-030-web-post-media-visibility-and-detail-parity.md
  - tasks/todo/I-0014-040-web-feedback-intake-and-ops-readiness.md
  - tasks/todo/I-0014-050-web-post-detail-cardless-layout-and-native-share.md
  - tasks/todo/I-0014-060-web-search-discovery-and-shell-entry.md
  - tasks/todo/I-0014-070-web-auth-funnel-and-runner-identity-fields.md
  - tasks/todo/I-0014-080-web-profile-cover-removal-and-header-cleanup.md
  - tasks/todo/I-0014-090-web-mobile-create-entry-switcher.md
  - tasks/todo/I-0014-100-web-composer-shell-progress-and-action-rails.md
  - tasks/todo/I-0014-110-web-service-intro-and-first-visit-orientation.md
  - tasks/todo/I-0014-120-web-empty-feed-explore-modules-and-recommendation-slots.md
  - tasks/todo/I-0014-130-web-crew-invite-url-share-entry.md
  - tasks/todo/I-0014-140-web-crew-settings-basic-info-shell-cleanup.md
  - tasks/todo/I-0014-150-web-crew-brand-media-fields.md
  - tasks/todo/I-0014-160-web-crew-detail-tab-hierarchy-cleanup.md
  - tasks/todo/I-0014-170-web-date-picker-modernization.md
  - tasks/todo/I-0014-180-web-post-composer-media-selection.md
  - tasks/todo/I-0014-190-web-post-composer-text-tagging-and-preview.md
  - tasks/todo/I-0014-200-web-workout-attachment-deeplink-and-visuals.md
  - tasks/todo/I-0014-210-docs-post-video-upload-scope.md
---

## Goal

Convert the 2026-04-01 UI intake into one durable report that maps each user-reported issue to a concrete route or component, a severity, and a follow-up fix-pack candidate, then seed todo tasks for every current issue cluster.

## Done Criteria

- `I-0014` exists and defines the UI bug-board initiative
- `docs/reports/i-0014-ui-bug-board.md` captures every reported item without losing the raw intake intent
- the report separates discoverability, product-gap, visual-cleanup, and bug work instead of collapsing them into one bucket
- the report index in `docs/reports/README.md` links to the new live artifact
- todo follow-up tasks exist for every current issue cluster in the report
- the tasks are explicitly grouped into autonomous work vs product-checkpoint work

## Notes

- This task documents and structures the work. It does not implement UI changes yet.
- Current design and domain docs remain authoritative unless a later implementation task changes behavior.
- Message persistence questions should be answered from repo truth, not guesswork.
- GPX and FIT visualization work must record a user checkpoint before implementation because the data shape can differ by file format.
- Follow-up intake after the first draft added message-room naming collisions, app-wide card overuse, missing user feedback submission, post-image visibility regression, and a request to classify tasks by required product involvement.

## Self Review

- Scope and intent: stayed within intake, mapping, and task-sequencing work; no opportunistic UI code changes were mixed in.
- Source of truth: grounded the board in current routes, components, design docs, domain docs, and Prisma schema instead of chat memory alone.
- Design divergence: kept PB/profile-field desires, cardless direction, feedback intake, and profile-cover removal as future work rather than rewriting current-truth docs downward or upward.
- Verification: `test -f design/initiatives/I-0014-ui-bug-board-and-stabilization.md`, `test -f docs/reports/i-0014-ui-bug-board.md`, the seeded `tasks/todo/I-0014-0xx-*.md` files, and `bash scripts/check-task-review-metadata.sh`.
- Review routing: includes docs review plus frontend, UI/UX, and backend review because the report now captures active messaging persistence truth, room-identity collisions, and future feedback-intake scope.

## Review Focus

- Specialist reviewer should check: the board accurately reflects current repo truth, preserves the user’s intent, and groups issues into actionable follow-up packs.
- PO reviewer should check: the priorities and language match the product pain, especially around onboarding, profile, messaging, feed empty states, and post/workout flows.

## Handoff

- Use the seeded `I-0014-020` through `I-0014-210` task files as the next implementation lane.
- Prefer autonomous tasks first unless product wants to resolve a checkpoint task immediately.
- Start with messaging room identity and the post-media visibility regression before larger UX reshaping.
- Any workout-visual task must pause for GPX/FIT sample review with the product owner before implementation.

## Design Divergence

- The user wants runner PB fields, lighter profile surfaces, and less card-heavy UI. These are valid future targets but are not current truth yet.
- The report records these as follow-up work instead of revising current design/domain docs to claim they already exist.

## Attempt Log

- 2026-04-01: created `I-0014`, mapped the reported UI issues into a structured bug board, and linked the new report from the reports index.
- 2026-04-01: expanded the board with message-room identity collisions, missing feedback intake, post-image visibility, and a full seeded todo map split between autonomous and product-checkpoint work.

## Review Notes

- Specialist review: reviewed the board against current routes, messaging persistence truth, and the seeded follow-up packs. No blocking mismatches remained in the final report/task split.
- PO review: accepted because the report preserves the raw intake, distinguishes autonomous work from product-checkpoint work, and puts `I-0014-030` and messaging identity at the front of the execution queue.

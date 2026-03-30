---
id: I-0009-010
title: Polish crew, activity chat, direct messages, and unread badge UX
parent: I-0009-crew-messaging-ux
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - backend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations-sse.service.spec.ts
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/crew-group-chat.spec.ts e2e/messages.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - design/initiatives/I-0009-crew-messaging-ux.md
  - design/backend/messaging-realtime.md
  - design/frontend/crew-experience.md
  - docs/domain/dm.md
  - docs/reports/i-0009-crew-messaging-ux-uat-checklist.md
  - apps/api/src/conversations/conversations-sse.service.ts
  - apps/api/src/conversations/conversations-sse.service.spec.ts
  - apps/web/src/components/crew/GroupChat.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/hooks/useUnreadCounts.ts
  - apps/web/src/pages/messages/[id]/useMessageDetailPage.ts
  - apps/web/e2e/crew-group-chat.spec.ts
  - apps/web/e2e/messages.spec.ts
  - tasks/I-0009-crew-messaging-ux/archive/I-0009-010-web-crew-messaging-ux-polish.md
---

## Goal

Polish crew, activity chat, direct messages, and unread badge UX with stronger browser regression coverage.

## Done Criteria

- crew and activity chat show human-readable room identity instead of generic labels
- activity chat route and CTA use the same access rules and explanation copy
- group chat send failure and polling refresh no longer create silent or jumpy UX
- direct message send and unread badge behavior stay consistent across desktop and mobile shells
- browser tests cover contextual labels, gating, failure feedback, and unread synchronization

## Notes

- Prioritize crew/activity chat awkwardness first, then close the adjacent DM unread issues in the same flow.
- Keep the current chat transport unchanged; if SSE parity becomes necessary, create a follow-up task instead of widening this batch.

## Self Review

- Scope and intent: crew/activity chat presentation, DM unread ownership, browser regressions, and the minimal backend SSE multiplexing fix required for DM unread/detail UAT reliability.
- Source of truth: updated `design/frontend/crew-experience.md`, `design/frontend/client-data-state.md`, `design/backend/messaging-realtime.md`, and `docs/domain/dm.md` in the same changeset as the behavior.
- Design divergence: group chat transport remains polling-based by design; this task only reduced scroll and copy awkwardness.
- Verification: `pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations-sse.service.spec.ts`, `pnpm --filter @masters/web lint`, `pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/crew-group-chat.spec.ts e2e/messages.spec.ts --project=chromium`, and `bash scripts/check-task-review-metadata.sh` all pass.
- Review routing: the task now spans user-facing web behavior plus DM SSE delivery reliability, so `frontend-reviewer`, `backend-reviewer`, `ui-ux-reviewer`, and `po-reviewer` are required.

## Review Focus

- Specialist reviewer should check: chat context, route gating, unread state ownership, concurrent DM SSE subscriptions, and regression coverage stay coherent without widening group-chat transport scope.
- PO reviewer should check: crew and messaging flows feel natural to community users and no longer expose awkward identity or access states.

## Handoff

- If realtime parity for crew/activity chat still feels insufficient after these UX fixes, split transport work into a dedicated follow-up instead of mixing it into this task.

## Design Divergence

- Non-member crew tab exposure may still remain broader than the design document intends. If it is not fully normalized inside this task, record the remaining gap here and create a follow-up task.

## Attempt Log

- 2026-03-20: scaffolded as an initiative task for crew/activity chat polish, DM unread cleanup, and stronger browser coverage.
- 2026-03-20: task claimed for crew/activity chat polish, DM unread cleanup, and stronger Playwright coverage.
- 2026-03-21: replaced duplicated shell unread logic with shared unread hooks and route-aware badge hiding for `/messages` and `/notifications`.
- 2026-03-21: added contextual crew/activity chat copy, aligned activity chat CTA and route gating, and softened polling scroll behavior plus send-failure feedback.
- 2026-03-21: added `apps/web/e2e/messages.spec.ts` and expanded `apps/web/e2e/crew-group-chat.spec.ts` to cover contextual labels, gating, send failures, and mobile badge behavior.
- 2026-03-21: verified with `pnpm --filter @masters/web lint`, `pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/crew-group-chat.spec.ts e2e/messages.spec.ts --project=chromium`, and `bash scripts/check-task-review-metadata.sh`.
- 2026-03-24: added `docs/reports/i-0009-crew-messaging-ux-uat-checklist.md` so browser-based manual acceptance can be recorded in a durable report format.
- 2026-03-27: fixed DM SSE fan-out to allow concurrent shell/detail subscriptions and stopped the header SSE listeners from closing on transient errors so unread and live DM updates stay reliable during UAT.
- 2026-03-27: re-verified the initiative with targeted API SSE tests, web lint, web build, Playwright messaging specs, and task review metadata checks after the realtime fix.
- 2026-03-27: archived after specialist review, PO review, and verify gates were recorded in-repo.

## Review Notes

- Specialist review:
  - `frontend-reviewer` pass on 2026-03-27: shared unread ownership stays coherent across header, mobile nav, and message detail, and the targeted Playwright desktop/mobile messaging flows showed no layout breakage in the touched routes.
  - `backend-reviewer` pass on 2026-03-27: the DM SSE registry now supports concurrent subscribers for the same user without changing the public transport contract or widening into group-chat realtime work.
  - `ui-ux-reviewer` pass on 2026-03-27: crew/activity/DM messaging still presents the intended hierarchy and failure feedback, and the tested desktop/mobile shells did not expose broken composition after the realtime fix.
- PO review:
  - `po-reviewer` pass on 2026-03-27: accepted because the fix directly addresses I-0009 acceptance risk around live DM/unread reliability without expanding scope into a separate SSE migration for crew or activity chat.

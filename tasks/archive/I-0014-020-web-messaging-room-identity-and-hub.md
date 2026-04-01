---
id: I-0014-020
title: Disambiguate messaging room identity and unify the hub
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
  - naming-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations.service.spec.ts
  - pnpm --filter @masters/web exec playwright test e2e/messages.spec.ts e2e/crew-group-chat.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/messages/index.tsx
  - apps/web/src/pages/messages/[id]/index.tsx
  - apps/web/src/hooks/useMessages.ts
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/activities/[activityId]/chat.tsx
  - apps/web/src/components/crew/GroupChat.tsx
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/conversations/repositories/conversations.repository.ts
  - design/backend/messaging-realtime.md
  - design/frontend/crew-experience.md
---

## Goal

Turn messaging into one coherent hub that can distinguish DM, crew chat, and activity chat without ambiguous room names.

## Done Criteria

- `/messages` no longer behaves like a DM-only list by construction
- room rows expose clear room identity for DM, crew, and activity contexts
- activity rooms are labeled with crew context such as `크루명 / 활동명`
- user-name search works without collapsing group-room identity
- design docs reflect the shipped room-identity model and hub entry behavior

## Notes

- Execution mode: autonomous once the naming rule in this task is accepted as current truth.
- This task should remove the generic “러너들과 대화하세요” framing from the main hub.
- If API list contracts widen beyond direct messages, keep storage truth, authz, and unread behavior aligned.
- Avoid leaking raw ids or fallback-first participant names as the primary room label for group chat.

## Self Review

- Scope and intent: kept the change on room identity and hub behavior by clarifying labels, search, and navigation without redesigning crew/activity chat transport.
- Source of truth: used the existing conversations storage model, current crew/activity chat routes, and the I-0014 naming direction as the contract to ship against.
- Design divergence: closed the DM-only assumption in the main hub and replaced participant-name fallbacks with explicit room context for crew and activity chat.
- Verification: ran `pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations.service.spec.ts`, `VITE_PORT=3000 VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web exec playwright test e2e/messages.spec.ts e2e/crew-group-chat.spec.ts --project=chromium`, `pnpm --filter @masters/web build`, and `bash scripts/check-task-review-metadata.sh`.
- Review routing: kept `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, and `naming-reviewer` because the change touches both room-label semantics and a mixed conversation contract.

## Review Focus

- Specialist reviewer should check: room identity is unambiguous across DM, crew, and activity contexts, and the hub/search behavior stays understandable on mobile.
- PO reviewer should check: the room naming and grouping model matches the intended communication IA.

## Handoff

- If this task needs a larger conversation-list contract, update the messaging design doc in the same change.
- Keep crew/activity chat entry discoverable from both the hub and their local crew/activity surfaces.

## Design Divergence

- The current repo still treats the user-facing conversations API as DM-centric even though group-chat primitives exist underneath.
- Resolve the hub identity gap by implementation; do not weaken current design docs to claim the hub is already unified.

## Attempt Log

- 2026-04-01: created from the UI bug board after product review flagged ambiguous room names such as DM vs crew vs activity chat collisions.
- 2026-04-01: widened the conversation summary contract with crew/activity context, rebuilt `/messages` as a mixed-room hub with search and type filters, and routed group-room rows back into crew/activity chat surfaces.

## Review Notes

- Specialist review: reviewed room labels, mixed-room navigation, and mobile readability together. The hub now distinguishes `1:1`, `크루`, and `활동` without falling back to ambiguous participant names.
- PO review: accepted because the shipped naming model matches the intended IA of `크루명` for crew chat and `크루명 / 활동명` for activity chat while keeping direct messages searchable by user name.

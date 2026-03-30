---
id: I-0009-020
title: Create reusable Playwright messaging mock fixtures and refactor messaging specs
parent: I-0009-crew-messaging-ux
scope: web
owner: codex
reviewers:
  - frontend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/crew-group-chat.spec.ts e2e/messages.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/e2e/helpers/messaging-fixtures.ts
  - apps/web/e2e/crew-group-chat.spec.ts
  - apps/web/e2e/messages.spec.ts
  - tasks/archive/I-0009-020-web-messaging-e2e-mock-fixtures.md
---

## Goal

Create reusable Playwright messaging mock fixtures and refactor messaging UX specs to use them.

## Done Criteria

- messaging-focused Playwright fixtures build deterministic DM, crew chat, and activity chat scenarios
- crew and message UX specs reuse shared route/mock setup instead of repeating large inline payloads
- fixture APIs make awkward-name, empty-room, unread, and send-failure states easy to express
- targeted web verify commands pass after the refactor

## Notes

- Keep the scope on Playwright/E2E mock reuse; do not add an app-runtime demo/mock mode in this task.
- Prefer scenario builders over one-off constants so future UX tests can describe state instead of rewriting payloads.

## Self Review

- Scope and intent: limited to Playwright messaging fixtures and spec reuse; no app-runtime mock mode or backend seed changes were added.
- Source of truth: existing messaging UX specs and current route contracts in `apps/web` stayed unchanged; only E2E fixture ownership moved into shared helpers.
- Design divergence: none introduced; this task reorganizes test fixtures without changing product behavior.
- Verification: targeted web lint, build, Playwright suite, and task review metadata checks all pass.
- Review routing: non-UI `web` scope, so `frontend-reviewer` plus `po-reviewer` remain sufficient.

## Review Focus

- Specialist reviewer should check: fixture builders stay deterministic, route setup ordering is safe, and specs are easier to extend without hiding behavior.
- PO reviewer should check: the preserved scenarios still match the awkward UX states we care about guarding.

## Handoff

- Extend the fixture helper only for messaging-adjacent tests in this initiative; if other domains want the same pattern, split a broader E2E fixture task later.

## Design Divergence

- Record any gap between approved design and current implementation.
- If a gap remains after this task, link the follow-up task here.
- Do not rewrite approved design docs downward just to match unfinished code.

## Attempt Log

- 2026-03-21: scaffolded as a focused follow-up to reuse messaging Playwright fixtures across the initiative.
- 2026-03-21: added `apps/web/e2e/helpers/messaging-fixtures.ts` with deterministic builders for DM, crew chat, and activity chat scenarios plus shared route setup.
- 2026-03-21: refactored `apps/web/e2e/messages.spec.ts` and `apps/web/e2e/crew-group-chat.spec.ts` to declare scenarios via shared fixtures instead of duplicating inline payloads.
- 2026-03-21: verified with `pnpm --filter @masters/web lint`, `pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/crew-group-chat.spec.ts e2e/messages.spec.ts --project=chromium`, and `bash scripts/check-task-review-metadata.sh`.
- 2026-03-27: archived after frontend-reviewer and po-reviewer notes were recorded alongside the initiative verification pass.

## Review Notes

- Specialist review:
  - `frontend-reviewer` pass on 2026-03-27: messaging fixture builders stay deterministic, route interception is explicit, and the refactored specs remain easier to extend without hiding the acceptance states they guard.
- PO review:
  - `po-reviewer` pass on 2026-03-27: accepted because the shared fixtures preserve the crew/activity/DM scenarios that matter for I-0009 while reducing maintenance overhead in regression coverage.

---
title: DM leave cut-line semantics
initiative: I-0009
scope:
  - api
  - web
  - docs
reviewers:
  - backend-reviewer
  - frontend-reviewer
  - ui-ux-reviewer
  - po-reviewer
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations.service.spec.ts
  - pnpm --filter @masters/web exec playwright test e2e/messages.spec.ts --project=chromium
---

# Summary

Replace direct-message leave from participant deletion to a per-user `leftAt` cut-line so the room hides locally, resurfaces on later inbound messages, and only shows messages after the leave point.

# Acceptance Criteria

- DM leave does not delete the participant row.
- Left DMs disappear from the caller's inbox until a post-`leftAt` message exists.
- Reopened DMs only show messages created after `leftAt`.
- Unread counts ignore messages at or before `leftAt`.
- Crew/activity leave rules remain unchanged.

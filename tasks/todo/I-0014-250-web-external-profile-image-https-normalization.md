---
id: I-0014-250
title: Normalize external profile image URLs to https on authenticated web surfaces
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/auth/auth.service.spec.ts
  - pnpm --filter @masters/web build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/api/src/auth/strategies/kakao.strategy.ts
  - apps/api/src/auth/
  - apps/web/src/components/common/UserAvatar.tsx
  - apps/web/src/components/feed/
  - docs/domain/user-profile.md
---

## Goal

Normalize third-party profile image URLs to a secure form so authenticated web surfaces stop emitting mixed-content warnings while preserving the current avatar experience.

## Done Criteria

- authenticated web surfaces no longer render third-party `profileImage` values with `http://` URLs
- normalization happens at one durable boundary instead of repeated per-component rewrites
- `/feed` and other avatar-bearing authenticated surfaces stop logging mixed-content warnings for provider profile images
- existing R2-hosted media, null-avatar fallbacks, and non-http application routes remain unchanged

## Notes

- Execution mode: autonomous.
- Live authenticated verification for `I-0014-240` confirmed that persisted post images are healthy; the remaining warning came from Kakao-hosted avatar URLs that the browser upgraded from `http` to `https`.
- Keep post-body media rendering, analytics CSP, and feedback-backoffice work out of scope.
- Prefer a narrow normalization strategy for known external avatar URLs over blanket URL rewriting that could affect non-http or app-local paths.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the chosen normalization boundary is durable and does not break existing provider image URLs, local uploads, or null-avatar fallbacks.
- PO reviewer should check: authenticated user-facing surfaces keep the same visible avatar behavior while the console warning goes away.

## Handoff

- This is a cleanup follow-up from `I-0014-240`, not a reopening of the feed post-media regression.

## Design Divergence

- The current repo still allows some third-party `profileImage` values to reach the web as `http://...` URLs, which Chromium upgrades automatically but still reports as mixed content.

## Attempt Log

- 2026-04-02: created after authenticated live `/feed` verification for `I-0014-240` showed that post images render correctly and the remaining warning is limited to third-party profile-image URLs.

## Review Notes

- Specialist review:
- PO review:

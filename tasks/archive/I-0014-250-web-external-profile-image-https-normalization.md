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
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
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

- Scope and intent: keep the fix on the Kakao avatar normalization boundary so authenticated surfaces stop receiving insecure provider URLs without reopening general avatar rendering or feed media work.
- Source of truth: `apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/strategies/kakao.strategy.ts`, `apps/api/src/auth/auth.service.spec.ts`, and `docs/domain/user-profile.md` now define the supported normalization boundary.
- Design divergence: no repo-wide backfill was added; existing insecure Kakao avatar URLs are corrected when the linked user authenticates again.
- Verification: `pnpm --filter @masters/api test -- --runTestsByPath src/auth/auth.service.spec.ts`, `pnpm --filter @masters/web build`, and `bash scripts/check-task-review-metadata.sh` all passed in the task worktree.
- Review routing: `backend-reviewer`, `frontend-reviewer`, and `po-reviewer` remain required because the durable fix sits in auth while the visible effect lands on authenticated web surfaces.

## Review Focus

- Specialist reviewer should check: the chosen normalization boundary is durable and does not break existing provider image URLs, local uploads, or null-avatar fallbacks.
- PO reviewer should check: authenticated user-facing surfaces keep the same visible avatar behavior while the console warning goes away.

## Handoff

- This is a cleanup follow-up from `I-0014-240`, not a reopening of the feed post-media regression.

## Design Divergence

- The current repo still allows some third-party `profileImage` values to reach the web as `http://...` URLs, which Chromium upgrades automatically but still reports as mixed content.

## Attempt Log

- 2026-04-02: created after authenticated live `/feed` verification for `I-0014-240` showed that post images render correctly and the remaining warning is limited to third-party profile-image URLs.
- 2026-04-02: normalized Kakao CDN avatar URLs in the auth boundary, added re-login refresh coverage for already linked accounts, and verified the narrow auth spec plus web build in the isolated worktree.

## Review Notes

- Specialist review:
  - `backend-reviewer` internal role review pass on 2026-04-02: confirmed the normalization stays in the auth boundary, only upgrades insecure Kakao CDN avatar URLs, and refreshes persisted insecure values on re-login without widening into repo-wide avatar rewriting.
  - `frontend-reviewer` internal role review pass on 2026-04-02: confirmed authenticated web surfaces keep the same avatar contract while receiving normalized provider URLs from the API boundary instead of per-component rewrites.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-02: accepted the narrow Kakao-focused fix because it removes the mixed-content warning without reopening broader profile-media scope.

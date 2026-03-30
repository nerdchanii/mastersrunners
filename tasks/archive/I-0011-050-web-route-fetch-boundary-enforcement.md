---
id: I-0011-050
title: Enforce route-entry fetch boundaries in the web app
parent: I-0011-domain-truth-and-boundary-hardening
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - refactor-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - pnpm lint
  - pnpm --filter @masters/web build
  - bash scripts/check-size-budgets.sh
  - 'bash -lc ''if find apps/web/src/pages -path "*/index.tsx" -print0 | xargs -0 rg -n "@/lib/api-client|api.fetch|useQuery\\(|useMutation\\("; then exit 1; else exit 0; fi'''
artifacts:
  - design/frontend/conventions.md
  - apps/web/src/pages/
  - apps/web/src/hooks/
  - scripts/check-size-budgets.targets.json
---

## Goal

Move direct network ownership out of route entry files so the frontend boundary rule is explicit, reviewable, and mechanically harder to regress.

## Done Criteria

- `pages/**/index.tsx` files no longer own direct `api.fetch`, `useQuery`, or `useMutation` calls
- route entry files mainly compose route-local or shared hooks plus presentational UI
- any temporary exception is documented with a task link instead of being normalized as an accepted pattern

## Notes

- This task is about route-entry ownership, not a full frontend architecture rewrite.
- Keep existing UX stable while moving orchestration into hooks or view-model files.

## Self Review

- Scope and intent: Moved route-entry fetch and auth/session orchestration out of `pages/**/index.tsx` into route-local helper modules across login, auth callback, challenges, crews, events, onboarding, posts, profile, and settings routes.
- Source of truth: `design/frontend/conventions.md` plus the updated route-entry files and route-local helper modules under `apps/web/src/pages/**`.
- Design divergence: None. Route-local helper modules were preferred over a broader shared-hook rewrite to keep this task bounded while still removing direct network ownership from entry routes.
- Verification: `bash scripts/check-task-review-metadata.sh`; `pnpm lint`; `pnpm --filter @masters/web build`; `bash scripts/check-size-budgets.sh`; `bash -lc 'if find apps/web/src/pages -path "*/index.tsx" -print0 | xargs -0 rg -n "@/lib/api-client|api.fetch|useQuery\\(|useMutation\\("; then exit 1; else exit 0; fi'`
- Review routing: `frontend-reviewer`, `refactor-reviewer`, `harness-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: route entry files are thinner and the new boundary is clear enough to apply consistently.
- PO reviewer should check: the refactor reduces maintenance risk without destabilizing user-visible behavior.

## Handoff

- Later frontend cleanup should use this task as the baseline rule instead of reintroducing direct network logic into route entries.

## Design Divergence

- None.

## Attempt Log

- 2026-03-30: created after multiple route entry files were confirmed to still own fetch logic despite the documented frontend boundary rule.
- 2026-03-30: completed route-local helper extraction and cleaned residual import/typing lint issues so the boundary check, lint, build, and readability budget all pass together.

## Review Notes

- Specialist review: 2026-03-30 `frontend-reviewer`, `refactor-reviewer`, and `harness-reviewer` pass. Confirmed `pages/**/index.tsx` no longer import `@/lib/api-client` or own direct `api.fetch`/TanStack Query primitives, and the route-entry rule is now documented in `design/frontend/conventions.md`.
- PO review: 2026-03-30 `po-reviewer` pass. Confirmed the refactor preserves user-visible route behavior while reducing maintenance risk and making data ownership easier to review.

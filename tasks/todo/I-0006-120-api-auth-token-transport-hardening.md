---
id: I-0006-120
title: Remove OAuth token delivery through query strings
parent: I-0006-guardrail-hardening
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - frontend-reviewer
po_review: required
depends_on:
  - I-0006-110
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/auth
  - pnpm --filter @masters/web build
artifacts:
  - apps/api/src/auth/auth.controller.ts
  - apps/web/src/pages/auth/callback/index.tsx
  - apps/web/src/lib/api-client.ts
  - docs/runbooks/deployment.md
---

## Goal

Eliminate OAuth token exposure through redirect query strings and reduce long-lived token exposure in browser storage.

## Done Criteria

- OAuth success no longer redirects with access or refresh tokens in the URL
- refresh token storage is moved away from browser-visible long-lived storage
- the replacement session transport is documented and verified end to end

## Notes

- This is a launch-blocking security follow-up discovered during `I-0006-110`.
- The replacement flow should prefer HttpOnly cookies or a one-time code exchange over URL token handoff.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check:
- PO reviewer should check:

## Handoff

- Coordinate this task with any public launch checklist because it changes authentication behavior.

## Design Divergence

- Current implementation still redirects with query-string tokens and stores tokens in `localStorage`.

## Attempt Log

- 2026-03-31: follow-up created from deployment/env hardening review because current auth token transport is a separate high-risk security concern.

## Review Notes

- Specialist review:
- PO review:

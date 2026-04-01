---
id: I-0014-230
title: Isolate the feedback backoffice behind a dedicated ops host
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/api test -- --runTestsByPath src/feedback/feedback.service.spec.ts
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/router.tsx
  - apps/web/src/pages/feedback/index.tsx
  - apps/api/src/feedback/
  - packages/database/prisma/schema.prisma
  - design/backend/persistence-model.md
  - design/architecture/deployment.md
  - docs/runbooks/deployment.md
  - design/operating-rules/exceptions.md
---

## Goal

Add an operator-facing feedback review surface without exposing it as a public app route or creating a second feedback intake pipeline.

## Done Criteria

- the feedback backoffice is served from a dedicated ops hostname instead of a discoverable public-app `/admin` route
- if the operator UI ships on Cloudflare Pages, it remains a static secret-less frontend and is fronted by Cloudflare Access before any app content is reachable
- Cloudflare Access policies require explicit operator identity and at least one stronger control than obscurity alone, with WARP or managed-device posture preferred and IP allowlists treated only as an additive requirement
- API endpoints for feedback inbox read and status updates enforce server-side staff RBAC so edge access control is not the only authorization boundary
- the operator surface reads the existing `FeedbackSubmission` stream instead of introducing a second inbox or second persistence path
- external Cloudflare host, Access policy, and routing proof is documented alongside repo-controlled deployment and exception records

## Notes

- Execution mode: requires product and security checkpoint before implementation.
- Preferred deployment shape: `ops.dev.mastersrunners.com` or an equivalent dedicated hostname fronted by Cloudflare Access.
- Cloudflare Pages is acceptable for the operator UI only when it serves static assets and carries no secrets, service keys, or direct database credentials.
- Do not rely on a hidden public `/admin` route, a fake `404`, or VPN-only obscurity as the primary security boundary.
- If the threat model later requires stronger concealment, a private hostname over Tunnel and WARP can replace public-host delivery in a follow-up without changing the feedback data contract.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the ops host, Cloudflare Access assumptions, and API RBAC boundary work together so the backoffice is not protected by edge gating alone.
- PO reviewer should check: the operator inbox flow is sufficient for triage without creating a second user-feedback channel.

## Handoff

- The current schema does not yet expose a dedicated platform-staff role on `User`, so this task must choose and document a durable server-side operator authorization model before shipping write actions.

## Design Divergence

- The current repo only supports authenticated feedback submission and durable storage.
- No operator read surface, dedicated ops hostname, or platform-level feedback-review authorization model exists yet.

## Attempt Log

- 2026-04-02: created after product requested a non-public feedback backoffice and accepted the direction of a dedicated ops host plus Cloudflare Access plus API RBAC.

## Review Notes

- Specialist review:
- PO review:

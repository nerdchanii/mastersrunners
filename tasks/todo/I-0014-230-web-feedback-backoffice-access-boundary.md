---
id: I-0014-230
title: Establish the feedback backoffice shell on a single ops host
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0006-230
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

Define the single-host shell, routing, and authorization boundary for the feedback backoffice without exposing it as a public app route or creating a second feedback intake pipeline.

## Done Criteria

- the feedback backoffice lives on `ops.dev.mastersrunners.com` instead of a discoverable public-app `/admin` route
- the operator UI, operator API, and Swagger surface share the same `ops.dev.mastersrunners.com` host pattern rather than splitting into separate `ops` and `ops-api` hosts
- if the operator UI ships on Cloudflare Pages, it remains a static secret-less frontend and Cloudflare routes `/api/*` plus `/api-docs*` on the ops host to the API origin
- Cloudflare Access policies require explicit operator identity and at least one stronger control than obscurity alone, with WARP or managed-device posture preferred and IP allowlists treated only as an additive requirement
- API endpoints for feedback inbox read and status updates enforce server-side staff RBAC so edge access control is not the only authorization boundary
- the operator surface reads the existing `FeedbackSubmission` stream instead of introducing a second inbox or second persistence path
- external Cloudflare host, Access policy, and routing proof is documented alongside repo-controlled deployment and exception records

## Notes

- Execution mode: requires product and security checkpoint before implementation.
- Preferred deployment shape: one `ops.dev.mastersrunners.com` host fronted by Cloudflare Access, with a secret-less Pages UI plus same-host worker routes for operator API traffic and Swagger.
- Cloudflare Pages is acceptable for the operator UI only when it serves static assets and carries no secrets, service keys, or direct database credentials.
- Do not rely on a hidden public `/admin` route, a fake `404`, or VPN-only obscurity as the primary security boundary.
- If the threat model later requires stronger concealment, a private hostname over Tunnel and WARP can replace public-host delivery in a follow-up without changing the feedback data contract.

## Self Review

- Scope and intent: keep this task on the single-host shell, routing, and authorization boundary; do not fold inbox UX or task-link automation into the same changeset.
- Source of truth: `design/backend/persistence-model.md`, `design/architecture/deployment.md`, `docs/runbooks/deployment.md`, and `I-0006-230` for the ops-host edge contract.
- Design divergence: the repo still has no operator host, no staff RBAC model, and no operator read endpoints; this task defines those boundaries before the inbox UX lands.
- Verification: the task should close only after the ops-host Pages shell builds, the feedback service path keeps passing its focused API tests, and the external Cloudflare host/Access proof is linked alongside repo docs.
- Review routing: `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, `harness-reviewer`, and `po-reviewer` remain required because the shell spans user-facing operator UI, API auth boundaries, and deploy-time host posture.

## Review Focus

- Specialist reviewer should check: the single ops host, Cloudflare Access assumptions, and API RBAC boundary work together so the backoffice is not protected by edge gating alone.
- PO reviewer should check: the operator inbox flow is sufficient for triage without creating a second user-feedback channel.

## Handoff

- The current schema does not yet expose a dedicated platform-staff role on `User`, so this task must choose and document a durable server-side operator authorization model before shipping write actions.
- Inbox rendering, triage workflow, and task/issue handoff actions are split into `I-0014-260` and `I-0014-270`.

## Design Divergence

- The current repo only supports authenticated feedback submission and durable storage.
- No operator read surface, single ops hostname, or platform-level feedback-review authorization model exists yet.

## Attempt Log

- 2026-04-02: created after product requested a non-public feedback backoffice and accepted the direction of a dedicated ops host plus Cloudflare Access plus API RBAC.
- 2026-04-02: narrowed to the single-host shell and authorization boundary after product chose one `ops.dev.mastersrunners.com` host for operator UI, operator API, and Swagger instead of split `ops` and `ops-api` hosts.

## Review Notes

- Specialist review:
- PO review:

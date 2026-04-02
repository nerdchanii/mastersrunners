---
id: I-0014-230
title: Establish a separate ops-web feedback backoffice shell on the ops host
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
execution_status: blocked
review_status: approved
verification_status: passed
closeout_blocker: Waiting for the first Git-driven `mastersrunners-ops` Pages deployment on the `dev` branch and the `ops.dev.mastersrunners.com` custom-domain cutover.
verify:
  - pnpm --filter @masters/ops-web build
  - pnpm --filter @masters/api test -- --runTestsByPath src/feedback/guards/feedback-ops.guard.spec.ts
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/ops-web/
  - apps/api/src/feedback/
  - packages/database/prisma/schema.prisma
  - design/backend/persistence-model.md
  - design/architecture/deployment.md
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
---

## Goal

Define the separate `apps/ops-web` shell, routing, and authorization boundary for the feedback backoffice without exposing it as a public-app route or creating a second feedback intake pipeline.

## Done Criteria

- the feedback backoffice lives on `ops.dev.mastersrunners.com` as a separate `apps/ops-web` app instead of a discoverable public-app `/admin` route
- the operator UI, operator API, and Swagger surface share the same `ops.dev.mastersrunners.com` host pattern rather than splitting into separate `ops` and `ops-api` hosts
- the operator UI ships as a static secret-less frontend from a dedicated Cloudflare Pages project while Cloudflare routes `/api/*` plus `/api-docs*` on the ops host to the API origin
- Cloudflare Access policies require explicit operator identity and the API independently validates `Cf-Access-Jwt-Assertion` plus an operator allowlist, so edge access control is not the only authorization boundary
- API endpoints for feedback inbox read and status updates enforce server-side operator authorization without coupling the ops app to the consumer app JWT session
- the operator surface reads the existing `FeedbackSubmission` stream instead of introducing a second inbox or second persistence path
- repo-controlled deployment and environment docs describe the separate ops app, ops host, and Access-backed auth boundary without weakening the existing public app contract

## Notes

- Execution mode: build the dedicated ops shell first, then layer inbox and handoff UX on top of the same API/auth boundary in follow-up tasks.
- Preferred deployment shape: one `ops.dev.mastersrunners.com` host fronted by Cloudflare Access, with a dedicated `apps/ops-web` Pages UI plus same-host worker routes for operator API traffic and Swagger.
- Cloudflare Pages is acceptable for the operator UI only when it serves static assets and carries no secrets, service keys, or direct database credentials.
- Do not rely on a hidden public `/admin` route, a fake `404`, or the consumer-app JWT cookie as the primary security boundary.
- Operator identity should remain separate from the `User` table and be stored in dedicated feedback-ops persistence.

## Self Review

- Scope and intent: keep this task on the separate ops shell, routing, and authorization boundary; do not fold inbox UX or task-link automation into the same changeset.
- Source of truth: `design/backend/persistence-model.md`, `design/architecture/deployment.md`, `docs/runbooks/deployment.md`, `docs/runbooks/environment-and-settings.md`, and `I-0006-230` for the ops-host edge contract.
- Design divergence: the repo still has no dedicated ops-web app, no Access-JWT-backed operator auth path, and no operator read endpoints; this task defines those boundaries before the inbox UX lands.
- Verification: `pnpm --filter @masters/ops-web build`, `pnpm --filter @masters/api test -- --runTestsByPath src/feedback/guards/feedback-ops.guard.spec.ts`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`, and `VITE_API_URL=http://localhost:4000/api/v1 pnpm -r run build` passed. External closeout still depends on the first Git-driven Pages deployment plus custom-domain cutover.
- Review routing: `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, `harness-reviewer`, and `po-reviewer` remain required because the shell spans user-facing operator UI, API auth boundaries, runtime config, and deploy-time host posture.

## Review Focus

- Specialist reviewer should check: the separate ops app, Cloudflare Access assumptions, and API-side operator guard work together so the backoffice is not protected by edge gating alone.
- PO reviewer should check: the operator inbox flow is sufficient for triage without creating a second user-feedback channel.

## Handoff

- The current schema does not yet expose a dedicated feedback-ops identity registry, so this task must choose and document a durable server-side operator authorization model before shipping write actions.
- Inbox rendering, triage workflow, and task/issue handoff actions are split into `I-0014-260` and `I-0014-270`.

## Design Divergence

- The current repo only supports authenticated feedback submission and durable storage.
- No dedicated ops-web app, Access-backed operator API path, or platform-level feedback-review authorization model exists yet.

## Attempt Log

- 2026-04-02: created after product requested a non-public feedback backoffice and accepted the direction of a dedicated ops host plus Cloudflare Access plus API RBAC.
- 2026-04-02: narrowed to the single-host shell and authorization boundary after product chose one `ops.dev.mastersrunners.com` host for operator UI, operator API, and Swagger instead of split `ops` and `ops-api` hosts.
- 2026-04-02: revised to a separate `apps/ops-web` app after product rejected host-branching inside `apps/web` and asked to keep operator identity separate from the `User` model.
- 2026-04-02: implemented the separate `apps/ops-web` shell, Access-JWT-backed ops API boundary, and dedicated `mastersrunners-ops` Pages project without cutting the `ops.dev.mastersrunners.com` custom domain over yet.
- 2026-04-02: corrected the dedicated `mastersrunners-ops` Pages project so its `production_branch` is `dev`, matching the current dev-lane operator host.

## Review Notes

- Specialist review:
  - 2026-04-02 `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, and `harness-reviewer` internal pass. Confirmed the ops shell is now a separate shadcn-based app, the API validates Cloudflare Access JWTs plus a separate operator registry, and repo/runtime docs match the dedicated Pages project contract.
- PO review:
  - 2026-04-02 `po-reviewer` internal pass. Confirmed the backoffice remains non-public, does not create a second intake channel, and keeps the dev-lane operator host separate from the consumer app.

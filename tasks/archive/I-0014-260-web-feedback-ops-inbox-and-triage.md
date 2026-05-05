---
id: I-0014-260
title: Build the feedback ops inbox and triage workflow
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0014-230
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/ops-web build
  - pnpm --filter @masters/api test -- --runTestsByPath src/feedback/feedback.service.spec.ts
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/ops-web/src/pages/feedback/
  - apps/api/src/feedback/
  - design/backend/persistence-model.md
  - design/architecture/deployment.md
---

## Goal

Let operators review submitted feedback in one inbox inside `apps/ops-web`, inspect the underlying report context, and move each item through a lightweight triage workflow on the ops host.

## Done Criteria

- operators can list feedback submissions from the existing `FeedbackSubmission` stream on the ops host
- operators can inspect submission details such as category, title, description, route context, timestamps, and submitter
- operators can move items through a bounded workflow such as `new`, `in_review`, `planned`, `resolved`, or `dismissed`
- inbox filters and empty states are explicit enough for day-to-day review without introducing a second persistence path
- the inbox UI is built in `apps/ops-web` with shadcn primitives instead of being folded into the consumer app shell

## Notes

- Execution mode: requires the separate ops-host boundary from `I-0014-230`.
- Keep the first inbox focused on review and triage, not full ticket automation.
- Any operator notes or audit trail additions should extend the existing feedback model rather than fork it.

## Self Review

- Scope and intent: land a first operator inbox and bounded triage state machine in `apps/ops-web` without coupling it to GitHub mutation or a broader backoffice redesign.
- Source of truth: `design/backend/persistence-model.md`, the future ops-host shell from `I-0014-230`, and the existing `FeedbackSubmission` data model.
- Design divergence: the repo currently stores submissions only for intake, so this task must add operator read/triage surfaces without introducing a second inbox or secondary persistence path.
- Verification: `pnpm --filter @masters/ops-web build`, `pnpm --filter @masters/api test -- --runTestsByPath src/feedback/feedback.service.spec.ts`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`, and `VITE_API_URL=http://localhost:4000/api/v1 pnpm -r run build` passed. The first Git-driven `mastersrunners-ops` Pages deployment on `dev` succeeded, the `ops.dev.mastersrunners.com` custom domain was cut over to the dedicated project, and the ops host plus `/api-docs` now resolve through Cloudflare Access as intended.
- Review routing: `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, and `po-reviewer` remain required because the task spans operator UI, triage semantics, and API-backed state updates.

## Review Focus

- Specialist reviewer should check: the inbox reads one durable submission stream, presents useful triage context, and keeps state changes bounded.
- PO reviewer should check: the workflow is enough for a human operator to decide whether something should be ignored, planned, or turned into follow-up work.

## Handoff

- `I-0014-270` should layer task/issue/initiative handoff actions on top of the triage state from this task instead of bypassing it.

## Design Divergence

- Current feedback persistence is intake-only and does not yet power an operator inbox or triage workflow.
- No dedicated shadcn-based ops app exists yet.

## Attempt Log

- 2026-04-02: created after the ops-host plan was split so inbox review and triage can land independently from host-boundary work and later task/issue automation.
- 2026-04-02: implemented the shadcn-based ops inbox, feedback detail surface, and bounded triage workflow inside `apps/ops-web`.
- 2026-04-02: validated the inbox deployment path by shipping the dedicated `mastersrunners-ops` Pages project on `dev`, cutting `ops.dev.mastersrunners.com` over to it, and re-confirming the ops host is edge-protected after the domain move.

## Review Notes

- Specialist review:
  - 2026-04-02 `frontend-reviewer`, `ui-ux-reviewer`, and `backend-reviewer` internal pass. Confirmed the inbox reads the existing `FeedbackSubmission` stream, triage stays inside the five-state workflow, and detail context is sufficient without opening a second tracker.
- PO review:
  - 2026-04-02 `po-reviewer` internal pass. Confirmed the workflow is enough for solo operator review and preserves the public feedback intake as the single canonical entrypoint.

---
id: I-0014-270
title: Add feedback handoff actions for tasks, issues, and initiative links
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0014-260
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
  - docs/runbooks/deployment.md
---

## Goal

Let operators turn reviewed feedback into concrete follow-up work by recording task, issue, or initiative links and structured handoff notes from the ops inbox in `apps/ops-web`.

## Done Criteria

- operators can attach one or more follow-up references such as task ids, issue links, or initiative ids to a feedback submission
- operators can record a short structured handoff note explaining why the submission was linked or promoted
- the action trail stays attached to the original submission instead of spawning a disconnected second tracker inside the app
- the first version does not require direct GitHub mutation if a durable manual-link workflow is sufficient
- the handoff editor lives inside the same shadcn-based ops detail view rather than in the public app

## Notes

- Execution mode: depends on the inbox and triage surface from `I-0014-260`.
- Prefer explicit reference capture first; fully automated GitHub issue or task creation can remain a later follow-up if needed.
- Any persistence additions should preserve the submission as the canonical root record.

## Self Review

- Scope and intent: add explicit handoff links and notes on top of triaged feedback items without turning the first version into a full issue-sync engine.
- Source of truth: `design/backend/persistence-model.md`, the inbox/triage contract from `I-0014-260`, and the deployment/runbook guidance for operator-only surfaces.
- Design divergence: the repo currently has no structured bridge from feedback submissions to tasks, issues, or initiatives, and browser code must not gain repository credentials to compensate.
- Verification: `pnpm --filter @masters/ops-web build`, `pnpm --filter @masters/api test -- --runTestsByPath src/feedback/feedback.service.spec.ts`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`, and `VITE_API_URL=http://localhost:4000/api/v1 pnpm -r run build` passed. The first Git-driven `mastersrunners-ops` Pages deployment on `dev` succeeded, the `ops.dev.mastersrunners.com` custom domain was cut over to the dedicated project, and live probes confirm the final handoff surface now sits behind the same Access-protected ops host as the inbox.
- Review routing: `frontend-reviewer`, `backend-reviewer`, `harness-reviewer`, and `po-reviewer` remain required because the handoff model touches operator UI, persistence/API boundaries, and repository-workflow integration.

## Review Focus

- Specialist reviewer should check: the handoff actions create a durable bridge from feedback to implementation work without leaking repository credentials into the browser.
- PO reviewer should check: the resulting workflow is enough to review feedback, decide what matters, and connect it to actual work without losing context.

## Handoff

- If direct GitHub mutation is introduced later, it should extend this structured handoff model rather than replacing it with opaque automation.

## Design Divergence

- Current feedback submissions have no structured way to record which task, issue, or initiative picked them up for follow-up work.
- No dedicated ops-web detail surface exists yet for handoff authoring.

## Attempt Log

- 2026-04-02: created after the ops-host plan was split so the first inbox can land before deciding whether direct GitHub issue/task creation is necessary.
- 2026-04-02: implemented manual handoff notes plus structured task, initiative, issue, and generic link references on top of the ops detail flow.
- 2026-04-02: completed external closeout after the dedicated `mastersrunners-ops` Pages deployment went live on `dev`, `ops.dev.mastersrunners.com` was re-homed to that project, and the final ops host once again returned Cloudflare Access `302` responses for both the shell and `/api-docs`.

## Review Notes

- Specialist review:
  - 2026-04-02 `frontend-reviewer`, `backend-reviewer`, and `harness-reviewer` internal pass. Confirmed handoff stays manual and structured, references remain attached to the submission root record, and no repository credential or direct GitHub mutation leaked into browser code.
- PO review:
  - 2026-04-02 `po-reviewer` internal pass. Confirmed the first version is the right level of operator leverage: triage first, then explicit task/initiative/issue linking without premature automation.

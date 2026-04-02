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
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/api test -- --runTestsByPath src/feedback/feedback.service.spec.ts
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/feedback/
  - apps/api/src/feedback/
  - design/backend/persistence-model.md
  - design/architecture/deployment.md
---

## Goal

Let operators review submitted feedback in one inbox, inspect the underlying report context, and move each item through a lightweight triage workflow on the ops host.

## Done Criteria

- operators can list feedback submissions from the existing `FeedbackSubmission` stream on the ops host
- operators can inspect submission details such as category, title, description, route context, timestamps, and submitter
- operators can move items through a bounded workflow such as `new`, `in_review`, `planned`, `resolved`, or `dismissed`
- inbox filters and empty states are explicit enough for day-to-day review without introducing a second persistence path

## Notes

- Execution mode: requires the ops-host boundary from `I-0014-230`.
- Keep the first inbox focused on review and triage, not full ticket automation.
- Any operator notes or audit trail additions should extend the existing feedback model rather than fork it.

## Self Review

- Scope and intent: land a first operator inbox and bounded triage state machine without coupling it to GitHub mutation or a broader backoffice redesign.
- Source of truth: `design/backend/persistence-model.md`, the future ops-host shell from `I-0014-230`, and the existing `FeedbackSubmission` data model.
- Design divergence: the repo currently stores submissions only for intake, so this task must add operator read/triage surfaces without introducing a second inbox or secondary persistence path.
- Verification: closeout should include web build proof, focused feedback-service coverage, and enough UI-path evidence to show operators can list, inspect, and transition triage states on the ops host.
- Review routing: `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, and `po-reviewer` remain required because the task spans operator UI, triage semantics, and API-backed state updates.

## Review Focus

- Specialist reviewer should check: the inbox reads one durable submission stream, presents useful triage context, and keeps state changes bounded.
- PO reviewer should check: the workflow is enough for a human operator to decide whether something should be ignored, planned, or turned into follow-up work.

## Handoff

- `I-0014-270` should layer task/issue/initiative handoff actions on top of the triage state from this task instead of bypassing it.

## Design Divergence

- Current feedback persistence is intake-only and does not yet power an operator inbox or triage workflow.

## Attempt Log

- 2026-04-02: created after the ops-host plan was split so inbox review and triage can land independently from host-boundary work and later task/issue automation.

## Review Notes

- Specialist review:
- PO review:

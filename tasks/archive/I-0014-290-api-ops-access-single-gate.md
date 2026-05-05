---
id: I-0014-290
title: Simplify dev ops auth to Access-only gating
parent: I-0014-ui-bug-board-and-stabilization
scope: api
owner: codex
reviewers:
  - backend-reviewer
  - frontend-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0014-230
  - I-0014-260
  - I-0014-270
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/feedback/guards/feedback-ops.guard.spec.ts
  - pnpm --filter @masters/ops-web build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/api/src/feedback/guards/feedback-ops.guard.ts
  - apps/api/src/feedback/guards/feedback-ops.guard.spec.ts
  - apps/ops-web/src/pages/feedback/index.tsx
  - design/backend/persistence-model.md
---

## Goal

Remove the extra operator-email registry requirement from the dev ops feedback flow so `ops.dev.mastersrunners.com` trusts Cloudflare Access as its sole gate.

## Done Criteria

- ops feedback routes accept a valid Cloudflare Access assertion without requiring a matching `PlatformOperatorIdentity` row
- ops-web no longer tells operators they need a separate registry or one-time SQL registration
- backend persistence docs describe the current truth: the schema still contains `PlatformOperatorIdentity`, but the dev ops runtime no longer depends on it

## Notes

- Keep the change bounded to the current dev ops lane; do not redesign future production staff auth in this task.
- Leave dormant schema objects in place unless removal is clearly required for runtime correctness.

## Self Review

- Scope and intent: narrowed the change to the current dev ops auth path so Access becomes the only required gate, without reopening broader prod staff-auth design.
- Source of truth: matched the runtime behavior to the current solo-operator expectation expressed during review, while keeping persistence docs truthful about the dormant schema object that still exists.
- Design divergence: retained `PlatformOperatorIdentity` in the schema as dormant metadata rather than removing it in the same task, because runtime correctness did not require a destructive database change.
- Verification: `pnpm --filter @masters/api test -- --runTestsByPath src/feedback/guards/feedback-ops.guard.spec.ts`, `pnpm --filter @masters/api build`, `pnpm --filter @masters/ops-web build`, `bash scripts/check-task-review-metadata.sh`
- Review routing: `backend-reviewer` for auth/guard behavior, `frontend-reviewer` for the ops UI copy, `docs-reviewer` for persistence truth, and `po-reviewer` for the solo-operator acceptance criteria.

## Review Focus

- Specialist reviewer should check: dev ops auth now relies on Access only, without silently weakening the edge-boundary assumptions or breaking request context for triage/handoff writes.
- PO reviewer should check: the solo-operator dev experience no longer asks for a second email-registration step after a successful Access login.

## Handoff

- If future multi-operator or prod ops rollout needs an internal allowlist again, open a new task instead of reusing stale copy or silently reactivating the dormant table.

## Design Divergence

- The schema still retains `PlatformOperatorIdentity` for now, but the current dev runtime should not present it as a required operator bootstrap step.

## Attempt Log

- 2026-04-02: opened after live dev ops verification showed the Access flow succeeded but the API still rejected the operator due to the extra `PlatformOperatorIdentity` registry check, which is unnecessary for the current single-operator setup.

## Review Notes

- Specialist review: approved after confirming the API no longer blocks valid Access identities on the extra registry lookup, the request context still carries operator email for triage/handoff writes, and the ops UI no longer points operators toward one-time SQL registration.
- PO review: approved because the dev ops flow now matches the actual solo-operator workflow and no longer asks for an unnecessary second registration step after Google Access login.

---
id: I-0014-220
title: Sync conversation repository specs with context fields
parent: I-0014-ui-bug-board-and-stabilization
scope: api
owner: codex
reviewers:
  - backend-reviewer
po_review: required
depends_on:
  - I-0014-020
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/conversations/repositories/conversations.repository.spec.ts
  - bash scripts/check-task-review-metadata.sh
  - pnpm exec prettier --check --ignore-unknown apps/api/src/conversations/repositories/conversations.repository.spec.ts design/initiatives/I-0014-ui-bug-board-and-stabilization.md tasks/archive/I-0014-220-api-conversation-context-spec-sync.md
artifacts:
  - apps/api/src/conversations/repositories/conversations.repository.spec.ts
  - design/initiatives/I-0014-ui-bug-board-and-stabilization.md
---

## Goal

Align the conversations repository spec with the shipped room-context contract so local CI no longer fails on stale expectations from the messaging identity rollout.

## Done Criteria

- repository specs expect `crew` and `activity` context fields on returned conversation rows
- the focused conversations repository spec passes locally
- the follow-up is recorded under the I-0014 initiative instead of leaving the mismatch as unexplained CI noise

## Notes

- The current repository implementation always attaches `crew` and `activity` fields, returning `null` when no group context exists.
- `I-0014-020` shipped that mixed-room contract, but the repository unit spec still asserted the older DM-only object shape.
- This is a test-contract sync only; it should not change messaging runtime behavior.

## Self Review

- Scope and intent: kept the fix on repository test expectations only; no messaging behavior or API contract changes were mixed in.
- Source of truth: the repository implementation and the messaging identity task `I-0014-020` define the intended returned shape.
- Design divergence: none after this sync; the spec now reflects the current repository contract instead of an outdated pre-context shape.
- Verification: focused repository spec, task metadata check, and targeted Prettier are the completion signal.
- Review routing: `backend-reviewer` is sufficient because the change stays inside API repository test correctness.

## Review Focus

- Specialist reviewer should check: the updated expectations match the actual repository contract and do not weaken assertions on pagination/query behavior.
- PO reviewer should check: the cleanup removes CI noise without changing the shipped messaging experience.

## Handoff

- If the conversations public contract later moves to an explicit DTO boundary, keep repository specs aligned with the repository return shape and move higher-level assertions into service/controller tests.

## Design Divergence

- None.

## Attempt Log

- 2026-04-02: created after pre-push `pnpm ci:local` surfaced stale repository expectations that still assumed conversations lacked explicit `crew` and `activity` fields.
- 2026-04-02: synced the spec to expect `null` context fields for direct-message fixtures so the test matches the current repository contract.

## Review Notes

- Specialist review:
  - `backend-reviewer` internal role review pass on 2026-04-02: confirmed the spec now matches the current repository behavior without weakening the actual query and pagination assertions.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-02: accepted because the change only removes CI noise from stale test expectations and does not affect user-visible messaging behavior.

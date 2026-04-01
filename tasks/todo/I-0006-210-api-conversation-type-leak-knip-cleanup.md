---
id: I-0006-210
title: Eliminate conversation repository type leak from knip baseline
parent: I-0006-guardrail-hardening
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm knip
  - pnpm --filter @masters/api build
  - pnpm exec prettier --check --ignore-unknown apps/api/src/conversations/conversations.controller.ts apps/api/src/conversations/conversations.service.ts apps/api/src/conversations/repositories/conversations.repository.ts knip.json design/initiatives/I-0006-guardrail-hardening.md tasks/todo/I-0006-210-api-conversation-type-leak-knip-cleanup.md
artifacts:
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/conversations/repositories/conversations.repository.ts
  - knip.json
  - design/initiatives/I-0006-guardrail-hardening.md
---

## Goal

Remove the temporary `knip` type ignore for the conversations repository by separating repository-internal context types from the exported API return contract.

## Done Criteria

- `apps/api/src/conversations/repositories/conversations.repository.ts` no longer needs the temporary `knip.json` `types` ignore entry
- the conversations service/controller public return types do not leak repository-internal context types
- `pnpm knip` and `pnpm --filter @masters/api build` both pass without adding new ignore entries

## Notes

- The temporary `knip.json` ignore was added during 2026-04-01 CI recovery after removing the export caused `TS4053` in the conversations service/controller public return types.
- This follow-up should remove the structural cause, not just reshuffle exports until `knip` passes again.
- Prefer explicit response DTOs or service-level return types over exposing repository helper types directly through the Nest public surface.

## Self Review

- Scope and intent: keep the work on the conversations type boundary that leaked into `knip`; do not widen into unrelated messaging behavior changes.
- Source of truth: the conversations controller/service/repository plus `knip.json` define the current regression and the target closeout.
- Design divergence: current CI recovery uses a temporary `knip` ignore; this task exists to remove that divergence instead of normalizing it.
- Verification: `pnpm knip`, `pnpm --filter @masters/api build`, and targeted Prettier are the completion signal.
- Review routing: `backend-reviewer` checks the API type boundary and `harness-reviewer` checks that the dead-code baseline is restored without hiding regressions.

## Review Focus

- Specialist reviewer should check:
  - the final shape removes the `knip` ignore instead of moving the leak to another exported helper
  - the public conversations return contract stays readable and intentional
- PO reviewer should check:
  - the cleanup meaningfully reduces maintenance debt without widening into a messaging feature change

## Handoff

- Treat the current `knip.json` ignore on the conversations repository as temporary debt only; remove it in the same changeset that lands the explicit response-type boundary.

## Design Divergence

- Current `dev` branch CI recovery keeps `apps/api/src/conversations/repositories/conversations.repository.ts` under a temporary `knip` `types` ignore because the service/controller public return types still depend on repository-internal context types.
- Close the gap by introducing an explicit public response boundary and deleting the ignore in the same task.

## Attempt Log

- 2026-04-01: created after CI recovery showed the conversations repository could not simply drop exported context types without breaking `TS4053`, which means the public API contract is still coupled to repository helper types.

## Review Notes

- Specialist review:
- PO review:

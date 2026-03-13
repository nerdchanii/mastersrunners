---
id: I-0003-090
title: Harden AI PR workflows after Copilot review
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-070
  - I-0003-080
blocked_by: []
verify:
  - pnpm format:check
  - pnpm lint
  - pnpm typecheck
artifacts:
  - .github/scripts/pr-autofix-state.cjs
  - .github/workflows/pr-ai-review-gate.yml
  - .github/workflows/codex-pr-fix.yml
  - .github/workflows/codex-pr-fix-status.yml
  - docs/guides/ai-pr-review-workflow.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Address the workflow hardening issues raised by Copilot review without weakening the explicit-trigger safety model.

## Done Criteria

- workflow-dispatch status refresh reads the PR number correctly
- the gate exposes a distinct Copilot identity wait state
- queued dispatch failures can recover instead of remaining stuck forever
- common PR autofix state helpers are shared from one repository script instead of repeated inline

## Notes

- The recovery path should preserve the five-iteration cap and same-head safety guarantees.
- Docs must stay aligned with any new machine state names or recovery behavior.

## Self Review

- Scope and intent: limited to PR auto-fix workflow correctness, shared state helper reuse, and matching operator documentation.
- Source of truth: the shared helper, workflow state machine, and the AI PR workflow guide are being kept aligned around review-based identity gating, explicit enable/stop semantics, and queued-recovery behavior.
- Design divergence: none; the change strengthens the existing explicit-trigger model instead of changing it.
- Verification: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, Ruby YAML parse for `.github/workflows/*.yml`
- Review routing: meta workflow changes plus operator docs, so `harness-reviewer`, `docs-reviewer`, and `po-reviewer`

## Review Focus

- Specialist reviewers should check: workflow safety around dispatch recovery, identity gating, and helper reuse.
- PO reviewer should check: the operator model stays explicit and understandable while reducing failure traps.

## Handoff

- If future AI reviewers introduce new state transitions, update the shared helper and the operator guide together.

## Design Divergence

- None.

## Attempt Log

- 2026-03-13: created after Copilot review surfaced status input, identity-state symmetry, queued recovery, and helper duplication concerns.
- 2026-03-13: centralized shared state helpers into `.github/scripts/pr-autofix-state.cjs`, then tightened state parsing and stale queued-request handling after harness review found two follow-up bugs in the first draft.
- 2026-03-13: redirected internal workflow dispatches from `main` to `dev` so dev-targeted PR automation always runs the matching harness version during rollout.
- 2026-03-13: corrected the operator guide so validation-recovery outcomes match the actual workflow state machine, including terminal `failed` outcomes for guardrail rejections.
- 2026-03-13: narrowed queued-request recovery to exact `request_id` matches, with SHA fallback only for legacy state comments that predate request IDs, so an older rejected dispatch cannot wipe a newer retry on the same head.

## Review Notes

- Specialist review:
  - `harness-reviewer`: no blocking issues after redirecting internal workflow dispatches to `dev`, preserving same-head/request-id validation, owner-only control, and queued-request recovery without letting an older rejected dispatch clobber a newer retry on the same head.
  - `docs-reviewer`: no blocking issues; the operator guide matches the live state names, retry behavior, validation-recovery outcomes, identity gating, and the `dev`-scoped dispatch model.
- PO review:
  - `po-reviewer`: no blocking issues; the operator model remains explicit, owner-controlled, and understandable while avoiding stuck queued states during rollout.

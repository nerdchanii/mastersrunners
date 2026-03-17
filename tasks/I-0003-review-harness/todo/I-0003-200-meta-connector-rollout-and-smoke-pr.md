---
id: I-0003-200
title: Rewire connector docs and stage smoke validation
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-170
  - I-0003-180
  - I-0003-190
blocked_by: []
verify:
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - AGENTS.md
  - docs/guides/ai-pr-review-workflow.md
  - docs/guides/review-harness.md
  - docs/runbooks/README.md
  - docs/runbooks/codex-connector-pr-fix.md
  - docs/runbooks/self-hosted-runner-macos.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Finish the later rollout step that proves the connector-oriented PR lane on a fresh smoke PR and updates docs from staged guidance to proven live authority.

## Done Criteria

- a fresh smoke PR proves the review bundle -> connector execution -> thread reconciliation -> readiness -> merge path on the current branch-level lane
- AGENTS, initiative notes, guides, and runbooks can remove staged-language caveats because the connector lane is now proven in practice
- rollout notes separate proven branch-level behavior from any later branch-protection enforcement
- any remaining operator exceptions discovered during smoke are captured as follow-up tasks or exceptions

## Notes

- Deferred follow-up after `I-0003-170`, `I-0003-180`, and `I-0003-190` are in place.
- A live smoke PR may be opened for observation if needed, but branch protection enforcement stays out of scope until the connector lane is proven.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: docs align with the implemented control surfaces and do not leave self-hosted execution as live guidance.
- PO reviewer should check: the written flow matches the intended “human on escalation, agent as operator” model.

## Handoff

- If smoke validation shows connector-specific operational gaps, capture them in follow-up tasks instead of reintroducing self-hosted execution.
- Until this task closes, live docs should keep staged wording and avoid claiming a fully proven connector-default cutover.

## Design Divergence

- None.

## Attempt Log

- 2026-03-14: created to convert the live PR workflow docs from self-hosted execution to connector-owned execution and smoke validation.
- 2026-03-16: deferred until the branch-level delivery primitives and later executor cutover are ready for a real smoke PR.

## Review Notes

- Specialist review:
- PO review:

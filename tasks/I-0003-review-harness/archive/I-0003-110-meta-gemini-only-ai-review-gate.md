---
id: I-0003-110
title: Simplify AI PR review gate to Gemini-only
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-090
  - I-0003-100
blocked_by: []
verify:
  - node --test .github/scripts/pr-autofix-state.spec.cjs
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ai-review-gate.yml")'
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/codex-pr-fix-status.yml")'
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/codex-pr-fix.yml")'
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/scripts/pr-autofix-state.cjs
  - .github/scripts/pr-autofix-state.spec.cjs
  - .github/workflows/pr-ai-review-gate.yml
  - .github/workflows/codex-pr-fix.yml
  - .github/workflows/codex-pr-fix-status.yml
  - docs/guides/ai-pr-review-workflow.md
  - docs/guides/review-harness.md
  - docs/runbooks/self-hosted-runner-macos.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Reduce AI PR review harness complexity so Gemini review on the current head is the only blocking AI-review input before an explicit `/codex fix` request can queue self-hosted auto-fix.

## Done Criteria

- the gate only requires Gemini review on the current PR head
- `/codex fix` remains the explicit maintainer-controlled trigger for self-hosted auto-fix
- Copilot is removed from blocking state transitions, workflow triggers, and operator guidance
- docs and workflow status output describe the Gemini-only model without stale Copilot wait states

## Notes

- Observed on PR #8 and PR #9:
  - the automation complexity now outweighs the marginal value of requiring both Gemini and Copilot before queueing self-hosted Codex
  - Copilot-specific review gating, workflow fallbacks, and status sync paths created more operator overhead than signal
- This task should keep the explicit `/codex fix` enablement model. The simplification is about reviewer count, not about removing maintainer control.

## Self Review

- Scope and intent: simplify the AI review gate to the narrowest reliable workflow instead of layering more recovery behavior onto a complex dual-review model.
- Source of truth: the current workflow files, PR #8 and PR #9 behavior, and the in-repo AI PR workflow/operator docs.
- Design divergence: none; this intentionally narrows the review harness to match the team's preferred operating model.
- Verification: task metadata checks passed, including the script tests, YAML parsing, formatting, and review-metadata validation listed above.
- Review routing: `harness-reviewer` for workflow correctness, `docs-reviewer` for operator guidance, and `po-reviewer` because this changes delivery automation behavior.

## Review Focus

- Specialist reviewers should check: Gemini-only gating is implemented consistently across the gate, dispatch validation, status output, and docs without weakening current-head or owner-trigger requirements.
- PO reviewer should check: the simplification reduces operating complexity while keeping explicit maintainer control of auto-fix.

## Handoff

- If this lands, treat Gemini as the single AI reviewer of record for opening the auto-fix lane; Copilot can still be read informally but should not block the workflow.

## Design Divergence

- None.

## Attempt Log

- 2026-03-14: task created after PR #8 showed that Copilot-related AI review readiness could drift into a higher-maintenance path than the value it provided.
- 2026-03-14: after validating that review matching itself worked, the task was narrowed to a simpler operating model: Gemini review on the current head plus explicit `/codex fix` as the only blocking AI-review path.
- 2026-03-14: removed Copilot from blocking gate transitions, workflow-run refresh triggers, dispatch validation, and status summaries so the self-hosted lane now waits only for Gemini review plus explicit maintainer enablement.
- 2026-03-14: verify passed for all commands listed in the task metadata.
- 2026-03-14: merged to `dev` through PR #9, and the resulting Gemini-only path was later exercised on fresh smoke PRs tracked in `I-0003-120`.

## Review Notes

- Specialist review:
  - `harness-reviewer` internal role review pass on 2026-03-14: verified the gate, dispatch validation, and status output now require only Gemini review on the current head plus an explicit owner `/codex fix` command.
  - `docs-reviewer` internal role review pass on 2026-03-14: verified the AI PR workflow guide and self-hosted runner runbook both describe the simplified Gemini-only operating model and recovery path.
- PO review:
  - `po-reviewer` pass on 2026-03-14: accepted the Gemini-only model because it removes reviewer-handshake overhead without removing explicit maintainer control of self-hosted auto-fix.

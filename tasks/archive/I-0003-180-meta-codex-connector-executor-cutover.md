---
id: I-0003-180
title: Replace self-hosted PR executor with Codex connector control surface
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-170
blocked_by: []
verify:
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ai-review-gate.yml"); YAML.load_file(".github/workflows/codex-pr-fix-status.yml"); YAML.load_file(".github/workflows/pr-merge-readiness.yml")'
  - node --test .github/scripts/pr-autofix-state.spec.cjs
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .github/workflows/pr-ai-review-gate.yml
  - .github/workflows/codex-pr-fix-status.yml
  - .github/scripts/pr-autofix-state.cjs
  - docs/guides/ai-pr-review-workflow.md
  - docs/runbooks/codex-connector-pr-fix.md
  - docs/runbooks/self-hosted-runner-macos.md
---

## Goal

Complete the later cutover from legacy self-hosted PR fix assumptions to a proven agent-owned ChatGPT Codex connector control surface.

## Done Criteria

- the AI review gate no longer depends on any self-hosted PR fix execution path
- PR execution state is backed by a smoke-proven agent-owned connector lane
- docs can point operators to the connector runbook as active authority without staging caveats
- the self-hosted runner runbook can be reduced to historical or emergency-reference context with no ambiguity about live ownership

## Notes

- Deferred follow-up after the branch-level delivery primitives in `I-0003-170` and `I-0003-190` are stable.
- The supervising agent owns connector task creation and result recording.
- GitHub workflows remain responsible for gate and status publication, not code execution.
- Superseded by `I-0003-210` on 2026-03-24 when the repository retired the PR-specific harness instead of completing connector cutover.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: no live workflow path still depends on `[self-hosted, macos, codex-runner]` for PR fixes.
- PO reviewer should check: the connector lane keeps the intended agent-first delivery model intact.

## Handoff

- If a future workflow-owned connector invocation becomes officially supported, add it behind a narrow follow-up task rather than reintroducing runner assumptions here.
- Until this task closes with live smoke validation, docs should treat connector execution as staged rather than fully proven default authority.

## Design Divergence

- None.

## Attempt Log

- 2026-03-14: created to cut over the dev PR execution lane from self-hosted Codex to an agent-owned connector model.
- 2026-03-16: deferred behind branch-level reconciliation and readiness work so docs do not overclaim a completed cutover.
- 2026-03-24: archived as superseded after the repository removed the PR-specific harness instead of finishing the connector lane.

## Review Notes

- Specialist review:
- PO review:

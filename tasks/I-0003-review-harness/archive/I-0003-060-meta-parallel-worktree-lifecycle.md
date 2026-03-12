---
id: I-0003-060
title: Document parallel worktree split and merge lifecycle
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-010
  - I-0003-040
  - I-0003-050
blocked_by: []
verify:
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
  - rg -n "worktree|cherry-pick|parallel worktree|dirty worktree" AGENTS.md design docs tasks
artifacts:
  - AGENTS.md
  - design/operating-rules/parallel-worktree-lifecycle.md
  - docs/guides/parallel-worktree-workflow.md
  - docs/guides/README.md
  - tasks/README.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Define the repository rule for parallel agent execution in dedicated git worktrees, including how isolated task branches are integrated back through commits and merge or cherry-pick flows.

## Done Criteria

- AGENTS points to a documented parallel worktree workflow
- the repository has one operating-rule document for split, verify, review, and merge integration
- task docs explain that dirty main worktree changes must be preserved and new parallel work should happen in dedicated worktrees

## Notes

- This task documents the workflow. It does not automate worktree creation.
- The integration rule should allow merge or cherry-pick, as long as the task commit history remains explicit.

## Self Review

- Scope and intent: limited to documenting parallel worktree execution and integration rules before launching the 5 quick wins.
- Source of truth: AGENTS, tasks, and operating-rules now point to the same worktree split/merge lifecycle.
- Design divergence: none introduced; this task adds policy only.
- Verification: `pnpm format:check`, `bash scripts/check-task-review-metadata.sh`, and the task-level `rg` check passed in the dedicated worktree after linking shared dependencies.
- Review routing: docs-review was required for wording quality; harness and PO checks focused on safety and throughput.

## Review Focus

- Specialist reviewers should check: the lifecycle is safe for parallel agent work and does not encourage accidental overwrites of unrelated local changes.
- PO reviewer should check: the workflow improves throughput without making final integration opaque.

## Handoff

- Future automation can provision worktrees automatically per task once the lifecycle is stable.

## Design Divergence

- Record any gap between approved design and current implementation.
- If a gap remains after this task, link the follow-up task here.
- Do not rewrite approved design docs downward just to match unfinished code.

## Attempt Log

- 2026-03-12: created after deciding parallel quick wins should run in isolated worktrees because the main worktree still contains unrelated dirty changes.
- 2026-03-12: added an operating rule and a contributor guide that preserve dirty main-worktree changes and route integration through explicit reviewed commits.

## Review Notes

- Specialist review: `docs-reviewer` found no blocking issues. The AGENTS, task, and guide wording consistently explain that unrelated dirty changes stay protected and integration happens by merge or cherry-pick. `harness-reviewer` found no blocking issues. The lifecycle is safe for parallel execution because it isolates task work per worktree and keeps integration commit-based.
- PO review: `po-reviewer` found no blocking issues. The workflow improves throughput for parallel agent work while keeping final integration understandable through explicit task commits.

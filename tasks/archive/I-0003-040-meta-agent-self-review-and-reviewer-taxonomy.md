---
id: I-0003-040
title: Add agent self-review checklist and reviewer taxonomy
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-010
  - I-0003-020
  - I-0003-030
blocked_by: []
verify:
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
  - rg -n "Self Review|Reviewer Taxonomy|architecture-reviewer|performance-reviewer" AGENTS.md docs/guides tasks
artifacts:
  - AGENTS.md
  - docs/guides/agent-self-review.md
  - docs/guides/reviewer-taxonomy.md
  - docs/guides/review-harness.md
  - docs/guides/README.md
  - tasks/README.md
  - tasks/_templates/TASK-TEMPLATE.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Define a sectioned self-review checklist that every agent can run before specialist review, and document a practical reviewer taxonomy with baseline and escalation reviewer roles.

## Done Criteria

- the repository has one explicit self-review guide for agents
- the guide is organized by sections, not a flat list
- review-harness docs explain how self-review fits before specialist review
- reviewer roles include baseline and escalation reviewers with routing guidance
- task template has a place to record self-review outcome

## Notes

- This is a harness-policy task, not a machine-enforced gate yet.
- Reviewer taxonomy should stay usable; it should not require every reviewer for every task.
- Naming review starts as a checklist concern and optional escalation reviewer, not a mandatory reviewer on every task.

## Self Review

- Scope and intent: limited to self-review guidance, reviewer-role taxonomy, and task workflow updates.
- Source of truth: the new guides are linked from AGENTS and task docs so the checklist is durable and not chat-only.
- Design divergence: no approved design was lowered; the checklist reinforces follow-up task creation when divergence remains.
- Verification: `pnpm format:check`, `bash scripts/check-task-review-metadata.sh`, and the task-level `rg` check passed.
- Review routing: this task is process-heavy but documentation-driven, so `harness-reviewer`, `docs-reviewer`, and `po-reviewer` are sufficient.

## Review Focus

- Specialist reviewers should check: the checklist is concrete enough to catch common agent mistakes and the taxonomy does not create unnecessary process weight.
- PO reviewer should check: the extra review structure improves quality without slowing small tasks excessively.

## Handoff

- If this lands, a future follow-up can add machine checks or templates that validate self-review completion evidence.

## Attempt Log

- 2026-03-12: created after agreeing that the harness needs a distinct AI self-review layer before specialist and PO review.
- 2026-03-12: added sectioned self-review guidance, baseline reviewer roles, escalation reviewer roles, and task-template hooks for recording self-review outcomes.

## Review Notes

- Specialist review: `harness-reviewer` found no blocking issues. The self-review step is now placed before specialist review in AGENTS, the task README, and the review harness guide, which makes the lifecycle clearer without adding machine-enforcement debt yet. `docs-reviewer` found no blocking issues. The sectioned checklist is concise, reusable across task types, and the reviewer taxonomy explains when to escalate instead of over-routing every task.
- PO review: `po-reviewer` found no blocking issues. The added self-review layer should catch basic mistakes earlier and make specialist review more focused, while the reviewer taxonomy stays practical by distinguishing baseline reviewers from escalation reviewers.

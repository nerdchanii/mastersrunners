---
id: I-0004-090
title: Make task and doc creation the default intake path
parent: I-0004-truth-model-cleanup
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-080
blocked_by: []
verify:
  - rg -n "Task Workflow|Start Here|Review Routing" AGENTS.md tasks/README.md docs/guides/review-harness.md
artifacts:
  - AGENTS.md
  - tasks/README.md
  - docs/guides/review-harness.md
---

## Goal

Make task and doc creation the default intake path when a new request arrives and no active task already covers it.

## Done Criteria

- entrypoints explain what to do when no active task exists yet
- the default intake path creates or claims a task before implementation starts
- enforcement options are evaluated without forcing unnecessary workflow overhead
- read order and workflow docs align on the new intake default

## Notes

- This is an intake-flow task, not a feature-delivery task.
- Keep product behavior and diagnostics policy unchanged unless the intake rule truly requires it.
- Superseded by `I-0008-010`, which now owns the canonical intake transition and repo-native task supervisor model.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: a first-time agent can tell when to create a task and when to claim an existing one.
- PO reviewer should check: the intake default improves reliability without adding bureaucratic friction to every small change.

## Handoff

- Consider lightweight enforcement only if the guidance-only version still allows too much ad hoc work.
- Do not reopen this task. Continue intake-default work under `I-0008-agent-company-workflow`.

## Design Divergence

- Historical note only after supersession.

## Attempt Log

- 2026-03-14: created as a follow-up during scorecard retirement so intake-harness strengthening stays separate from the truth-model cleanup changeset.
- 2026-03-14: superseded and archived once `I-0008-010` absorbed the canonical intake transition into the repo-native supervisor workflow.

## Review Notes

- Specialist review:
- PO review:

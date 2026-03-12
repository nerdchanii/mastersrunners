# I-0003: Review Harness

## Summary

Add explicit specialist-review and PO-review gates so completed tasks are not committed without the right review context.

## Problem

The repository now has task and verification harnesses, but it does not yet define who should review completed work before commit. That makes commit quality depend too much on ad hoc judgment.

## Goals

- define specialist reviewer roles by work type
- require PO review for every task
- wire review requirements into task and initiative templates
- document the review gate before commit

## Non-Goals

- automated reviewer assignment
- GitHub branch protection policy outside the repository
- skill or subagent implementation for each reviewer persona

## Scope

- `AGENTS.md`
- `docs/guides/review-harness.md`
- `docs/guides/agent-self-review.md`
- `docs/guides/reviewer-taxonomy.md`
- `docs/guides/design-divergence-workflow.md`
- `tasks/README.md`
- `tasks/_templates/TASK-TEMPLATE.md`
- `design/initiatives/INITIATIVE-TEMPLATE.md`
- `design/operating-rules/commit-conventions.md`
- `design/operating-rules/document-states.md`
- `design/frontend/conventions.md`
- `design/backend/conventions.md`

## Design References

- `AGENTS.md`
- `docs/guides/review-harness.md`
- `tasks/_templates/TASK-TEMPLATE.md`

## Review Plan

- Harness and process changes should be reviewed by `harness-reviewer`
- PO review checks whether the workflow remains aligned with the intended product and delivery model

## Task Breakdown

- `tasks/I-0003-review-harness/archive/I-0003-010-meta-review-harness-policy.md`
- `tasks/I-0003-review-harness/archive/I-0003-020-meta-review-metadata-enforcement.md`
- `tasks/I-0003-review-harness/archive/I-0003-030-meta-divergence-and-conventions.md`
- `tasks/I-0003-review-harness/archive/I-0003-040-meta-agent-self-review-and-reviewer-taxonomy.md`
- `tasks/I-0003-review-harness/archive/I-0003-050-meta-commit-message-lint.md`

## Success Criteria

- every new task template includes reviewer and PO review requirements
- the repository has one clear review routing guide
- pre-commit completion rules explicitly mention specialist and PO review
- approved design is not downgraded to excuse incomplete implementation
- commit subjects explain intent while task linkage lives in trailers
- every task has one consistent self-review step before specialist review
- commit subjects are enforced by repository automation

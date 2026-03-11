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
- `tasks/README.md`
- `tasks/_templates/TASK-TEMPLATE.md`
- `design/initiatives/INITIATIVE-TEMPLATE.md`

## Design References

- `AGENTS.md`
- `docs/guides/review-harness.md`
- `tasks/_templates/TASK-TEMPLATE.md`

## Review Plan

- Harness and process changes should be reviewed by `harness-reviewer`
- PO review checks whether the workflow remains aligned with the intended product and delivery model

## Task Breakdown

- `tasks/I-0003-review-harness/archive/I-0003-010-meta-review-harness-policy.md`
- `tasks/I-0003-review-harness/todo/I-0003-020-meta-review-metadata-enforcement.md`

## Success Criteria

- every new task template includes reviewer and PO review requirements
- the repository has one clear review routing guide
- pre-commit completion rules explicitly mention specialist and PO review

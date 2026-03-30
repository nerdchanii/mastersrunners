# I-0003: Review Harness (Retired)

## Summary

This initiative is now historical. The repository no longer operates a PR-specific harness, AI review lane, or merge-readiness state machine. Task review remains the live harness; the PR-specific surfaces that once lived under `I-0003` were retired by `I-0003-210`.

## Problem

The earlier PR lane added a second workflow truth on top of the task-centric harness. It increased operational friction, duplicated readiness concepts, and made pull requests behave like a state machine instead of a lightweight collaboration surface.

## Goals

- retire the PR-specific automation and documentation cleanly
- keep the task-centric review harness intact
- preserve historical context without leaving `I-0003` as a live operating lane

## Non-Goals

- removing the repository's task review rules
- redefining the repo-native task/supervisor/intake semantics already documented in the live runbooks
- treating pull requests as canonical execution truth

## Scope

- `AGENTS.md`
- `docs/guides/review-harness.md`
- `tasks/I-0003-review-harness/`

## Design References

- `AGENTS.md`
- `docs/guides/review-harness.md`

## Review Plan

- Harness and process changes should be reviewed by `harness-reviewer`
- PO review checks whether the workflow remains aligned with the intended product and delivery model

## Task Breakdown

- Historical record: archived tasks under `tasks/I-0003-review-harness/archive/`
- Retirement cleanup: `tasks/I-0003-review-harness/active/I-0003-210-meta-retire-pr-harness.md`

## Success Criteria

- no live documentation, workflow, or script claims that a PR-specific harness is part of the repo operating model
- task review remains the only formal completion gate
- `I-0003` is preserved as historical context rather than a live initiative lane

## Progress Notes

- `I-0003-010` through `I-0003-160` remain as historical evidence of the earlier PR-specific harness work.
- On 2026-03-24, the repository retired the live PR lane and archived the remaining open `I-0003` tasks as superseded by `I-0003-210`.
- Further workflow changes should keep tasks as the only execution truth and avoid rebuilding a PR-specific control surface under `I-0003`.

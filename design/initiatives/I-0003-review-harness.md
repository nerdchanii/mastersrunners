# I-0003: Review Harness (Retired)

## Summary

This initiative is now historical. The repository no longer operates a PR-specific harness, AI review lane, merge-readiness state machine, mandatory task review gate, or Codex session-end review automation. The PR-specific surfaces that once lived under `I-0003` were retired by `I-0003-210`; the mandatory task review gate was retired by `I-0003-220`.

## Problem

The earlier PR lane added a second workflow truth on top of the task-centric harness. It increased operational friction, duplicated readiness concepts, and made pull requests behave like a state machine instead of a lightweight collaboration surface.

## Goals

- retire the PR-specific automation and documentation cleanly
- keep mechanical verification gates intact while making review task-specific and optional
- preserve historical context without leaving `I-0003` as a live operating lane

## Non-Goals

- removing historical review evidence
- removing mechanical verification gates such as lint, format, typecheck, build, and test
- redefining the repo-native task/supervisor/intake semantics already documented in the live runbooks
- treating pull requests as canonical execution truth

## Scope

- `AGENTS.md`
- `tasks/I-0003-review-harness/`

## Design References

- `AGENTS.md`
- `AGENTS.md`

## Review Plan

- Workflow changes may request an additional reader when independent advice would reduce risk.

## Task Breakdown

- Historical record: archived tasks under `tasks/archive/`
- PR harness retirement cleanup: `tasks/archive/I-0003-210-meta-retire-pr-harness.md`
- Mandatory task review gate retirement: `tasks/archive/I-0003-220-meta-review-gate-harness-removal.md`

## Success Criteria

- no live documentation, workflow, or script claims that a PR-specific harness is part of the repo operating model
- mandatory task review no longer appears as a formal completion gate
- mechanical verification remains active in local and GitHub CI
- `I-0003` is preserved as historical context rather than a live initiative lane

## Progress Notes

- `I-0003-010` through `I-0003-160` remain as historical evidence of the earlier PR-specific harness work.
- On 2026-03-24, the repository retired the live PR lane and archived the remaining open `I-0003` tasks as superseded by `I-0003-210`.
- On 2026-05-06, `I-0003-220` disabled Codex session-end review automation and removed review-only checks from CI/local CI while preserving review evidences as optional advisory references.
- Further workflow changes should keep tasks as execution truth and avoid rebuilding mandatory PR or review control surfaces under `I-0003`.

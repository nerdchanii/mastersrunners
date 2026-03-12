# Test Stability Runbook

Use this runbook when deciding whether a failing test blocks a task or becomes tracked stability debt.

## Rule

- Blocking suites must be green before a task is archived or committed.
- Advisory suites may fail only when the failure is recorded in the flaky test ledger and linked to a follow-up task.
- Do not silently normalize flaky behavior as “expected”.

## Blocking vs Advisory

Blocking by default:

- task `verify` commands
- workspace lint
- required build steps
- CI blocking suites already wired into the repository

Advisory only when explicitly documented:

- non-blocking exploratory browser checks
- unstable integration coverage outside the task's scope
- temporarily quarantined tests with an open follow-up task

## When a Test Fails

1. Decide whether the failing check is blocking for the current task.
2. If blocking, fix it before review and commit.
3. If advisory, record it in `docs/reports/flaky-tests.md`.
4. Link a follow-up task if the issue is still open.
5. Mention the limitation in the task `Self Review` or `Review Notes`.

## Required Recording

Record these fields for advisory failures:

- failing test or suite
- symptom
- frequency or trigger
- current owner
- linked follow-up task
- next review date

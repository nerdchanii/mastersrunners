---
name: task-orchestration-tdd-lifecycle-contract
description: Use for the single-task lifecycle contract covering intake, exploration, red test/spec, implementation, validation, critic review, and staging/commit.
---

# Task Orchestration TDD Lifecycle Contract

Use this contract for one coding task lifecycle:

`intake -> explore -> red test/spec -> implement -> validate -> critic review -> stage/commit`

## Authority Boundaries

- `task-orchestrator`
  - coordinates the lifecycle, updates task status docs, runs validation as needed, and is the only role in this harness allowed to stage or commit
- `task-explorer`
  - reads only; maps files, behavior, tests, dependencies, and risks
- `task-test-writer`
  - writes tests, specs, and task acceptance notes only; does not edit production implementation
- `task-coder`
  - writes scoped production code only; does not stage or commit
- `task-critic`
  - reviews only; does not edit, stage, or commit
- `task-arbiter`
  - escalation-only reviewer; resolves blocked decisions and does not edit, stage, or commit

## Lifecycle Contract

1. `intake`
   - confirm one task file or one explicit task scope exists
   - confirm ownership boundaries and required validation
2. `explore`
   - gather relevant docs, code entry points, tests, and risks
   - stop if scope is still ambiguous
3. `red test/spec`
   - add or update targeted tests/specs first when the task materially changes behavior
   - capture expected behavior and run the narrowest useful red validation command when feasible
4. `implement`
   - change only the smallest production surface required by the task
5. `validate`
   - run targeted validation first, then broader validation only if risk justifies it
6. `critic review`
   - review task compliance, diff quality, validation evidence, and unrelated changes
7. `stage/commit`
   - only after validation success and critic approval or explicit documented override

## Stop Conditions

Stop and hand control back to the orchestrator when any of the following happens:

- missing task scope
- failed red phase that cannot be explained or completed
- failed validation
- critic rejection
- unrelated changes detected that create staging ambiguity
- repeated failure that requires arbiter escalation

## Required Evidence By Phase

- `explore`: relevant files, behavior summary, change points, tests, risks
- `red test/spec`: changed tests/specs, expected behavior, red command, observed failure or rationale
- `implement`: files changed, behavior implemented, targeted validation result
- `validate`: command, scope, result, unresolved failure if any
- `critic review`: blocking and non-blocking findings, missing validation, unrelated changes, decision
- `stage/commit`: staged file list, commit hash if committed, remaining risks

Do not merge roles informally. If one role performs work outside its boundary, call that out explicitly as a contract breach.

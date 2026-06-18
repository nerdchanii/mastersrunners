# I-0025: Agent/Review Harness Retirement

## Summary

Retire the live agent/reviewer orchestration harness that was steering repository work toward mandatory review gates and role-specific operation. Preserve historical review evidence, but remove current instructions, protocol files, and CI checks that make the retired harness look active.

## Problem

The repository lowered review to task-specific judgment, but several live docs and agent artifacts still pointed future agents toward mandatory specialist/PO review, critic approval, active-task closeout metadata, and session-end review evidence files. This created a distorted operating model.

## Goals

- Keep task status based on `tasks/todo`, `tasks/active`, and `tasks/archive` folder location.
- Remove live orchestrator/review evidence files and the checks that refer to them.
- Preserve `tasks/reviews/**` and archived task history as evidence of past work.
- Keep the task template lightweight and free of active-only closeout metadata.

## Non-Goals

- Do not change production application behavior.
- Do not rewrite archived task records or historical review artifacts.
- Do not remove repo/runtime configuration such as `.codex/config.toml`, `.codex/hooks.json`, or `.codex/environments/**`.

## Scope

- `AGENTS.md`
- `tasks/README.md`
- `tasks/_templates/TASK-TEMPLATE.md`
- `.codex/agents/`
- `.agents/skills/`
- `.claude/agents/`
- `.claude/skills/`
- `reviewers/`
- `scripts/`
- `.github/workflows/ci.yml`
- `docs/guides/`
- `docs/runbooks/`
- `design/operating-rules/parallel-worktree-lifecycle.md`
- `design/initiatives/I-0017-reviewer-capability-harness.md`

## Task Breakdown

- `tasks/archive/I-0025-010-meta-agent-review-harness-retirement.md`

## Success Criteria

- Live docs no longer instruct agents to use retired orchestration roles, review evidence files, session-end review, or active-task closeout gates.
- CI/local CI no longer run active-task closeout, reviewer metadata, or session-end review checks.
- Repo-scoped orchestrator/reviewer agent and skill files are removed while non-harness skills remain.
- Historical `tasks/reviews/**` evidence remains intact.

---
id: I-0002-070
title: Bootstrap parallel worktrees with isolated ports and env scaffolding
parent: I-0002-harness-verification
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - frontend-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/test-bootstrap-worktree.sh
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - scripts/bootstrap-worktree.sh
  - scripts/test-bootstrap-worktree.sh
  - package.json
  - apps/api/package.json
  - apps/web/vite.config.ts
  - docs/guides/parallel-worktree-workflow.md
  - design/operating-rules/parallel-worktree-lifecycle.md
  - docs/runbooks/environment-and-settings.md
  - tasks/active/I-0002-070-meta-worktree-bootstrap-and-port-allocation.md
---

## Goal

Provide one repeatable worktree bootstrap entrypoint that prepares a dedicated git worktree with isolated local ports, scoped env files, optional dependency install, and task activation support.

## Done Criteria

- a bootstrap command can create or prepare a dedicated worktree from a clean base ref
- the bootstrap flow assigns non-conflicting local ports for web and api work, or accepts explicit overrides
- the flow writes scoped env files without mutating shared repo-root env files
- the flow prepares missing shared workspace build output that local API startup expects
- the flow can optionally move a task from `tasks/todo/` to `tasks/active/` inside the prepared worktree
- repo docs explain how the generated `API_PORT`, `FRONTEND_URL`, `VITE_API_URL`, and web dev port relate
- the bootstrap flow is covered by a repeatable smoke test

## Notes

- This task is harness-critical because parallel task work is hard to trust without deterministic setup.
- Keep the bootstrap command inspectable and overridable; hidden magic is worse than a slightly longer explicit command.
- The env output should stay worktree-local and gitignored.
- The bootstrap should leave the worktree ready for local dev, not just for git bookkeeping.

## Self Review

- Scope and intent: stayed within worktree bootstrap automation, port allocation, and runtime readiness without mixing unrelated repo cleanup.
- Source of truth: updated the harness initiative, worktree lifecycle guide, workflow guide, and environment runbook in the same task.
- Design divergence: no known remaining divergence for the bootstrap entrypoint; follow-up runtime needs should extend this script rather than fork a second workflow.
- Verification: ran `bash scripts/test-bootstrap-worktree.sh`, `bash scripts/check-task-review-metadata.sh`, `pnpm --filter @masters/web build`, `pnpm --filter @masters/api build`, plus live boot verification on ports `3070` and `4070`.
- Review routing: kept `harness-reviewer`, `frontend-reviewer`, `backend-reviewer`, and `po-reviewer` because the task changes automation plus web/api local runtime behavior.

## Review Focus

- Specialist reviewer should check: the bootstrap flow is safe for parallel agent work, avoids shared env collisions, and makes port allocation inspectable.
- PO reviewer should check: the command meaningfully lowers setup friction for parallel implementation work.

## Handoff

- Future multi-agent tasks should prefer this bootstrap entrypoint over manual `git worktree add` plus handwritten env overrides.
- If the repo later needs per-worktree database or Redis overrides, extend this script rather than creating a second bootstrap path.

## Design Divergence

- Current worktree lifecycle docs explain isolation rules but do not provide a repo entrypoint for env, install, or port preparation.
- Close the gap through repo automation rather than relying on contributor folklore.

## Attempt Log

- 2026-04-01: created and activated after product review flagged that parallel worktrees need isolated ports and env scaffolding to be practical.
- 2026-04-01: added `scripts/bootstrap-worktree.sh` and `scripts/test-bootstrap-worktree.sh`, then verified temp worktree creation, task activation, env linking, and isolated port allocation through the smoke test.
- 2026-04-01: verified a real dedicated worktree at `/tmp/mastersrunners-i0002-070` bootstraps with `.env` symlinked from the main repo, installs dependencies, builds required shared workspace artifacts, and starts API/web dev servers on `4070` and `3070`.

## Review Notes

- Specialist review: reviewed the final diff through harness, frontend, and backend lenses. No blocking findings remained after fixing root env propagation, shared workspace artifact preparation, and API watch stability in worktrees.
- PO review: accepted as a worthwhile friction-reduction task because a single bootstrap command now replaces manual worktree setup, port juggling, and env copying.

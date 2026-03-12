# macOS Self-Hosted Runner

Use this runbook for the `codex-runner` machine that executes PR auto-fix jobs.

Workflow trigger and stop rules live in `docs/guides/ai-pr-review-workflow.md`.

## Purpose

This runner executes `dev`-branch PR auto-fix jobs after Gemini and Copilot review has completed and a maintainer explicitly enables the loop.

## Required Labels

The runner must expose all of these labels:

- `self-hosted`
- `macos`
- `codex-runner`

## Required Capabilities

- GitHub Actions runner service installed and running
- `codex` CLI available in `PATH`
- repository push permission for PR head branches

## Machine Rules

- disable sleep while the runner is expected to pick up jobs
- keep the machine on power and hold it awake with macOS settings or `caffeinate` during active use
- do not use this runner for forked PR auto-fix
- treat the machine as automation infrastructure, not a casual interactive workstation

## Registration Checklist

1. Register the runner from repository settings.
2. Confirm the label set includes `codex-runner`.
3. Confirm `codex --help` works in the runner shell.
4. Confirm the runner can push to same-repo PR branches.
5. Confirm the runner does not have direct-push use cases for `main` or `dev`.

## Operational Notes

- The PR gate workflow can queue work while the runner is offline.
- Same-repo PR fixes push back to the existing PR head branch.
- Stop requests from `/codex stop` or removing `ai-fix` should prevent further auto-fix iterations.
- The workflow should stop after 5 auto-fix iterations for the same PR.
- If the runner is unavailable, the PR status comment should remain in a waiting state rather than silently failing open.

## Recovery

If the runner stops processing jobs:

1. Check that the runner still appears online in GitHub.
2. Check that the label list still includes `codex-runner`.
3. Check that `codex` is still available.
4. Re-run a same-repo `dev` PR with `ai-fix` enabled to confirm the queue is picked up.

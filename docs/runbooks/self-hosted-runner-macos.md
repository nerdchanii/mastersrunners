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
- Codex authentication configured for the runner account
- GitHub Actions checkout credentials with `contents: write` available to the workflow for same-repo PR branch pushes

## Machine Rules

- disable sleep while the runner is expected to pick up jobs
- keep the machine on power and hold it awake with macOS settings or `caffeinate` during active use
- do not use this runner for forked PR auto-fix
- treat the machine as automation infrastructure, not a casual interactive workstation

## Registration Checklist

1. Register the runner from repository settings.
2. Confirm the label set includes `codex-runner`.
3. Confirm `codex --help` works in the runner shell.
4. Confirm `codex login status` shows a usable login for the runner account.
5. If the runner uses API-key auth, provision it with `printenv OPENAI_API_KEY | codex login --with-api-key`.
6. Source `OPENAI_API_KEY` from secure runner secret storage or an encrypted secret-injection path instead of plaintext shell startup files.
7. Confirm the workflow token can push to same-repo PR branches when `contents: write` is granted.
8. Confirm the runner does not have direct-push use cases for `main` or `dev`.

## Service Control

From the runner installation directory:

- install the service: `./svc.sh install`
- start the service: `./svc.sh start`
- check status: `./svc.sh status`
- stop the service: `./svc.sh stop`

For macOS service inspection, `./svc.sh status` uses `launchctl` under the hood. The installed launch agent path is stored in the runner directory's `.service` file.

## Diagnostics

- runner application logs live under `_diag/`
- runner startup logs use filenames starting with `Runner_`
- job execution logs use filenames starting with `Worker_`
- use `cat .service` in the runner directory to find the installed launch agent path
- use `./config.sh --check --url <repo-or-org-url> --pat <token>` if you need to confirm the runner can still reach required GitHub services

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
3. Check `./svc.sh status` from the runner installation directory.
4. If the service is not running, restart it with `./svc.sh stop` then `./svc.sh start`.
5. Inspect the latest `_diag/Runner_*` and `_diag/Worker_*` files for startup or job failures.
6. Check `codex login status` and refresh authentication if it has expired.
7. Check that `codex` is still available in `PATH`.
8. If the runner registration is broken, remove and re-register it with `./config.sh remove`, then add it again from the repository runner settings.
9. Re-run a same-repo `dev` PR with `ai-fix` enabled to confirm the queue is picked up.

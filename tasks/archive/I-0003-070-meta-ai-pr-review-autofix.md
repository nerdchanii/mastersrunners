---
id: I-0003-070
title: Add dev PR AI review and Codex auto-fix harness
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-010
  - I-0003-040
  - I-0003-060
blocked_by: []
verify:
  - pnpm format:check
  - pnpm lint
  - pnpm typecheck
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - AGENTS.md
  - .github/workflows/pr-ai-review-gate.yml
  - .github/workflows/codex-pr-fix.yml
  - .github/workflows/codex-pr-fix-status.yml
  - docs/guides/ai-pr-review-workflow.md
  - docs/guides/review-harness.md
  - docs/guides/parallel-worktree-workflow.md
  - docs/runbooks/self-hosted-runner-macos.md
  - docs/runbooks/README.md
  - design/initiatives/I-0003-review-harness.md
  - design/operating-rules/parallel-worktree-lifecycle.md
---

## Goal

Add a dev-targeted PR review automation harness that waits for Gemini and Copilot review, then lets a self-hosted Codex runner apply fixes on explicit request.

## Done Criteria

- the repository has explicit workflows for review gating, Codex fix execution, and PR status reporting
- the automation only targets `dev` PRs and blocks forked PR auto-fix
- documentation explains the trigger contract, iteration limit, and macOS runner setup
- AGENTS and review-harness guidance point to the new workflow and runbook

## Notes

- AI review should not replace specialist review or PO review for task completion.
- Review detection uses login-first matching with marker fallback. Copilot's known fallback marker is `Copilot AI`.
- The first seed PR should capture Gemini reviewer identity and store it in a repo variable.

## Self Review

- Scope and intent: limited to dev-targeted PR automation, runner/runbook guidance, and the review-harness exception for branch-level autofix commits.
- Source of truth: AGENTS, review-harness, and the new AI PR workflow/runbook now describe the same control surface and operator contract.
- Design divergence: none left in the repo docs; branch-level autofix commits are now explicitly documented as separate from task-completion commits.
- Verification: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `bash scripts/check-task-review-metadata.sh`, and Ruby YAML parsing for `.github/workflows/*.yml` all passed.
- Review routing: `docs-reviewer`, `harness-reviewer`, and `po-reviewer` all reviewed because this task changes workflow automation and operator-facing docs.

## Review Focus

- Specialist reviewers should check: the workflows are safe for protected branches, self-hosted execution, and PR comment/label control.
- PO reviewer should check: the automation improves PR iteration without removing human approval gates.

## Handoff

- After the first seed PR, update repo variables with the confirmed Gemini and Copilot reviewer logins.

## Design Divergence

- Record any gap between approved design and current implementation.
- If a gap remains after this task, link the follow-up task here.
- Do not rewrite approved design docs downward just to match unfinished code.

## Attempt Log

- 2026-03-13: task created to wire GitHub AI review signals into the repository's self-hosted Codex fix loop for `dev` PRs.
- 2026-03-13: added current-head review gating, maintainer-only slash commands, protected-branch blocking, and stale-head push refusal after review feedback surfaced those gaps.

## Review Notes

- Specialist review: `docs-reviewer` found no blocking issues after the runbook gained concrete service/log/auth instructions and the guide wording was aligned with actual machine state names and auth surfaces. `harness-reviewer` found no blocking issues after the workflows were tightened to require maintainer-authorized slash commands, revalidate dispatch requests, block protected head branches, and refuse stale-head pushes.
- PO review: `po-reviewer` found no blocking issues. The flow remains dev-only, explicitly triggered, fork-safe, capped at five iterations, and still keeps human review as the merge gate rather than replacing it.

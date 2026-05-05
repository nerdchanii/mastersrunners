---
id: I-0003-210
title: Retire the PR-specific harness and return the repo to a task-centric workflow
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml")'
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - AGENTS.md
  - docs/guides/review-harness.md
  - design/initiatives/I-0003-review-harness.md
  - .github/workflows/ci.yml
  - scripts/ci-local.sh
---

## Goal

Retire the PR-specific harness and return the repo to a task-centric workflow.

## Done Criteria

- PR-specific workflows, scripts, and dedicated docs are retired
- task-centric review guidance remains the live operating model
- `I-0003` no longer appears as a live PR lane in repo guidance

## Notes

- Retire the PR-specific harness rather than softening it.
- Keep pull requests as optional collaboration surfaces only.
- Keep task review rules, metadata enforcement, and task runtime continuity.

## Self Review

- Scope and intent: limited to retiring the PR-specific harness and reaffirming the task-centric workflow.
- Source of truth: AGENTS, review-harness guidance, and the remaining initiative docs now agree that tasks are canonical and PRs are optional.
- Design divergence: none introduced; `I-0003` is now historical and future workflow changes should remain task-first.
- Verification: `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml")'`, `bash scripts/check-task-review-metadata.sh`, and `pnpm format:check` passed.
- Review routing: `harness-reviewer` + `po-reviewer` remains the right route for this repo-level workflow cleanup.

## Review Focus

- Specialist reviewer should check: PR-specific automation is fully retired without weakening task review truth.
- PO reviewer should check: the workflow is materially simpler and still supports normal collaboration.

## Handoff

- If any future PR guidance is reintroduced, keep it manual and non-authoritative.
- Optional PR metadata must not recreate a second readiness model under `I-0003`.

## Design Divergence

- Record any gap between approved design and current implementation.
- If a gap remains after this task, link the follow-up task here.
- Do not rewrite approved design docs downward just to match unfinished code.

## Attempt Log

- 2026-03-24: scaffolded as a task-first cleanup follow-up.
- 2026-03-24: started retiring the PR-specific harness in a dedicated cleanup worktree and archived the remaining open `I-0003` PR-lane tasks as superseded.
- 2026-03-24: removed PR-specific workflows, scripts, and runbooks; updated AGENTS, CI, and initiative docs to keep tasks as the only live harness.

## Review Notes

- Specialist review: `harness-reviewer` internal review pass on 2026-03-24. No blocking findings; PR-specific automation was retired cleanly and task review remains the only live completion gate.
- PO review: `po-reviewer` internal review pass on 2026-03-24. No blocking findings; the workflow is simpler, PRs remain usable as optional collaboration artifacts, and task truth stays primary.

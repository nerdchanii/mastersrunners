---
id: I-0012-130
title: Skip CI and deploy workflows for markdown-only branch changes
parent: I-0012-supabase-postgres-rollout
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml"); YAML.load_file(".github/workflows/deploy.yml")'
  - pnpm exec prettier --check .github/workflows/ci.yml .github/workflows/deploy.yml docs/runbooks/deployment.md design/initiatives/I-0012-supabase-postgres-rollout.md tasks/active/I-0012-130-ci-skip-markdown-only-runs.md
artifacts:
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
  - docs/runbooks/deployment.md
  - design/initiatives/I-0012-supabase-postgres-rollout.md
---

## Goal

Prevent markdown-only pushes and pull requests from spending CI or deploy capacity when no executable source changed.

## Done Criteria

- CI does not trigger for pushes or pull requests whose changed files are all `*.md`
- deploy does not trigger for markdown-only pushes to `dev` or `main`
- deployment runbook explains the markdown-only skip behavior

## Notes

- This task treats markdown-only as `**/*.md` anywhere in the repo, including tasks, design, and docs files.
- Workflow YAML or script changes must still trigger CI or deploy even if markdown files are included in the same commit.

## Self Review

- Scope and intent: keep this change narrowly on GitHub Actions trigger filters plus the matching deploy runbook note.
- Source of truth: `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` define trigger behavior; `docs/runbooks/deployment.md` explains operator-facing deploy behavior.
- Design divergence: none intended; this only reduces unnecessary automation runs for non-executable markdown edits.
- Verification: YAML parse plus prettier on touched workflow/doc/task files is sufficient for this trigger-only change.
- Review routing: `harness-reviewer` covers workflow correctness and `docs-reviewer` covers runbook clarity.

## Review Focus

- Specialist reviewer should check:
  - markdown-only path filters do not suppress runs for executable changes
  - deploy still triggers for non-markdown pushes to `dev` and `main`
- PO reviewer should check:
  - skipping docs-only automation matches the desired tradeoff between feedback speed and infrastructure spend

## Handoff

- If later we want finer-grained skips, add explicit path classes rather than broadening markdown rules into script or config files.

## Design Divergence

- None intended.

## Attempt Log

- 2026-04-01: user requested that markdown-only changes stop triggering both CI and branch deploy automation.

## Review Notes

- Specialist review: harness-reviewer and docs-reviewer lenses passed in-thread on 2026-04-01; the chosen `**/*.md` filter preserves executable-change runs while skipping markdown-only pushes and PRs.
- PO review: approved in-thread on 2026-04-01 when the requester confirmed docs-only changes should skip both CI and deploy.

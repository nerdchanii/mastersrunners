---
id: I-0002-050
title: Remove committed generated artifacts and guard against reintroduction
parent: I-0002-harness-verification
scope: repo
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0002-010
blocked_by: []
verify:
  - git status --short
artifacts:
  - .gitignore
  - apps/web/dist
  - apps/web/.next
  - apps/api/dist
---

## Goal

Reduce repository noise so agents search and reason over source files instead of generated output.

## Done Criteria

- committed generated output is removed or intentionally excluded
- ignore rules and repository contents match
- future CI or hooks can detect reintroduced artifacts

## Notes

- `git ls-files` did not show tracked files under the cleanup target paths on 2026-03-11
- workspace still contained local generated output under `.next`, `dist`, `out`, coverage, Prisma generated client, and Playwright result directories
- `.gitignore` needed explicit guards for `packages/database/generated/` and nested `playwright-report/` directories

## Handoff

- follow-up verification can add a CI or hook check that fails when generated directories reappear after build/test runs
- if Prisma client generation is required locally, regenerate into `packages/database/generated/` instead of restoring deleted files manually

## Attempt Log

- 2026-03-11: removed local generated/build/test artifact directories and tightened ignore rules for package-generated output and Playwright reports

## Review Notes

- Specialist review: harness-reviewer - ignore rules now better match generated output patterns and reduce repository noise during agent work.
- PO review: accepted - this lowers false context and supports more reliable task execution without changing product behavior.

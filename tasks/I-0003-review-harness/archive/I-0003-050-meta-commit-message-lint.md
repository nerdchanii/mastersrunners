---
id: I-0003-050
title: Enforce commit message conventions with commit-msg lint
parent: I-0003-review-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0003-030
  - I-0003-040
blocked_by: []
verify:
  - test -f .husky/commit-msg
  - test -f commitlint.config.mjs
  - printf 'fix(repo): add commit message lint\\n\\nTask: I-0003-050\\nInitiative: I-0003\\n' | pnpm exec commitlint
  - if printf 'fix(I-0003-050): bad scope\\n' | pnpm exec commitlint; then exit 1; else exit 0; fi
artifacts:
  - package.json
  - pnpm-lock.yaml
  - .husky/commit-msg
  - commitlint.config.mjs
  - AGENTS.md
  - design/operating-rules/commit-conventions.md
  - docs/guides/review-harness.md
  - design/initiatives/I-0003-review-harness.md
---

## Goal

Add machine-enforced commit message validation so new commits follow the repository subject convention and stop using task IDs as the commit type or scope.

## Done Criteria

- `commitlint` is installed in the repository
- a `commit-msg` Husky hook runs commit message validation
- allowed commit types match the repository convention doc
- repository docs explain that message enforcement happens in `commit-msg`, not `pre-commit`

## Notes

- This task should enforce the commit subject shape. Trailer guidance can remain documentation-first for now.
- Historical commits are not retroactively rewritten.

## Self Review

- Scope and intent: limited to commit message enforcement, Husky hook wiring, and supporting policy docs.
- Source of truth: AGENTS, review-harness, and commit-conventions now agree that commit message validation belongs in `commit-msg`.
- Design divergence: no design downgrade was needed; trailer enforcement remains intentionally documentation-first and is left for a later follow-up.
- Verification: `pnpm format:check`, `bash scripts/check-task-review-metadata.sh`, stdin commitlint checks, and direct `.husky/commit-msg` positive/negative checks passed.
- Review routing: `harness-reviewer` is required for hook and automation behavior, `docs-reviewer` for policy clarity, and `po-reviewer` for workflow fit.

## Review Focus

- Specialist reviewer should check: the new hook is strict enough to block bad subjects without breaking normal local workflow.
- PO reviewer should check: the enforcement improves task traceability and commit readability without adding unnecessary friction.

## Handoff

- If this lands, a natural follow-up is trailer-specific linting once trailer policy is stable enough to enforce.

## Design Divergence

- Record any gap between approved design and current implementation.
- If a gap remains after this task, link the follow-up task here.
- Do not rewrite approved design docs downward just to match unfinished code.

## Attempt Log

- 2026-03-12: created after deciding commit message checks belong in `commit-msg` via commitlint rather than `pre-commit`.
- 2026-03-12: installed `@commitlint/cli` and `@commitlint/config-conventional`, added `commitlint.config.mjs`, and wired `.husky/commit-msg`.
- 2026-03-12: added a custom `scope-not-task-id` rule so task IDs move to trailers instead of commit scope.

## Review Notes

- Specialist review: `harness-reviewer` found no blocking issues. The new `commit-msg` hook runs in the correct lifecycle phase, and the `scope-not-task-id` rule enforces the repository policy without overreaching into trailer parsing. `docs-reviewer` found no blocking issues. AGENTS, the review guide, and the commit convention doc now agree that message linting belongs in `commit-msg` rather than `pre-commit`.
- PO review: `po-reviewer` found no blocking issues. The enforcement improves traceability and commit readability by separating change intent from task linkage while keeping workflow friction low.

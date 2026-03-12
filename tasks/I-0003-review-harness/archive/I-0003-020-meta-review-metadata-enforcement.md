---
id: I-0003-020
title: Add machine-checkable enforcement for review metadata
parent: I-0003-review-harness
scope: ci
owner: kuhn
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0003-010
blocked_by: []
verify:
  - test -f scripts/check-task-review-metadata.sh
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - scripts/check-task-review-metadata.sh
  - .github/workflows/ci.yml
---

## Goal

Prevent new task files from omitting reviewer requirements and PO review metadata.

## Done Criteria

- a script checks required review metadata for non-archived task files
- CI runs the script
- failures point to the offending task files clearly

## Notes

- This should validate task metadata shape, not human review quality itself.
- Scope is limited to non-archived task files so historical archive entries can remain stable.
- Keep the gate shell-based so CI can enforce it without adding a YAML parser dependency.

## Review Focus

- Specialist reviewer should check: the enforcement is strict enough to protect the harness but not so brittle that it breaks archived history.
- PO reviewer should check: the added gate supports delivery quality without creating avoidable busywork.

## Handoff

- If this lands, the next natural follow-up is commit message structure tied to task and review completion.

## Attempt Log

- 2026-03-11: task created as follow-up after review policy scaffolding
- 2026-03-12: added a bash metadata checker for `tasks/*/(todo|active)/*.md` and wired it into CI.
- 2026-03-12: tightened the checker so failures enumerate offending files and explain the exact metadata contract.

## Review Notes

- Specialist review: `harness-reviewer` found no blocking issues. The checker correctly scopes itself to `todo/` and `active/` tasks, and CI now surfaces missing `reviewers` / `po_review` metadata with offending file paths. Residual risk: this gate enforces metadata presence only; it does not yet prove reviewer identity or completion evidence.
- PO review: `po-reviewer` found no blocking issues. The added gate is proportionate to the harness goal because it protects task quality with low ongoing cost and leaves archived history untouched. Residual risk: teams can still satisfy the metadata contract without machine-enforced review completion until a later follow-up lands.

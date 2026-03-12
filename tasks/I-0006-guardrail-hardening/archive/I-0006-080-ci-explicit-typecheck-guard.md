---
id: I-0006-080
title: Add explicit workspace typecheck guard to CI
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
  - po-reviewer
po_review: required
depends_on:
  - I-0006-030
blocked_by: []
verify:
  - pnpm format:check
  - bash scripts/check-task-review-metadata.sh
  - pnpm typecheck
  - rg -n "Run explicit typecheck|typecheck" .github/workflows/ci.yml package.json tasks/I-0006-guardrail-hardening design/initiatives/I-0006-guardrail-hardening.md
artifacts:
  - package.json
  - .github/workflows/ci.yml
  - scripts/ci-local.sh
  - docs/checklists/harness-scorecard.md
  - design/initiatives/I-0006-guardrail-hardening.md
---

## Goal

Add an explicit CI typecheck step instead of relying on build side effects alone.

## Done Criteria

- the repository has a root `pnpm typecheck` command
- CI runs the explicit typecheck step separately from build
- local CI approximation also runs the explicit typecheck step
- current non-covered typecheck debt is tracked by follow-up task instead of hidden

## Notes

- Scope is guardrail infrastructure, not broad application type-error cleanup.
- The immediate blocking guard covers packages that can be enforced now without pulling unrelated API/database debt into this task.

## Self Review

- Scope and intent: Limited the new guard to explicit CI/local typecheck infrastructure and did not fold unrelated API or Prisma type debt into this task.
- Source of truth: Updated the initiative and scorecard to reflect the new explicit gate and kept the remaining API/database rollout as a separate follow-up task instead of overstating coverage.
- Design divergence: No design docs were weakened. The current gap is recorded in `I-0006-090`.
- Verification: `pnpm format:check`, `bash scripts/check-task-review-metadata.sh`, `pnpm typecheck`, and a targeted `rg` check all pass.
- Review routing: `harness-reviewer` for CI/harness integrity and `po-reviewer` for whether this is a useful incremental guard rather than misleading theater.

## Review Focus

- Specialist reviewer should check: the new explicit typecheck step improves clarity without creating a misleading false-green for packages that still need separate rollout work.
- PO reviewer should check: the guard meaningfully improves the harness now while leaving bigger codebase cleanup as an explicit follow-up.

## Handoff

- The next follow-up is broadening explicit typecheck coverage to API/database once current code debt is split into tractable tasks.

## Design Divergence

- API and database packages still need dedicated explicit typecheck rollout.
- Track that remaining work in `tasks/I-0006-guardrail-hardening/todo/I-0006-090-ci-api-database-typecheck-rollout.md`.

## Attempt Log

- 2026-03-12: created because the audit flagged the lack of an explicit CI typecheck step even though some build paths already compile TypeScript.
- 2026-03-12: confirmed `@masters/web` and `@masters/types` pass explicit `tsc --noEmit`, while `@masters/api` and `@masters/database` still require separate rollout work; captured that debt in `I-0006-090` instead of expanding scope.

## Review Notes

- Specialist review: `harness-reviewer` pass. The change adds a real explicit CI gate and documents the remaining non-covered packages instead of pretending the whole workspace is clean.
- PO review: `po-reviewer` pass. This improves auditability immediately and keeps the broader API/database cleanup visible as a tracked follow-up.

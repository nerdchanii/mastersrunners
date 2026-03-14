---
id: I-0004-080
title: Retire legacy diagnostics surface and switch to on-demand diagnostics
parent: I-0004-truth-model-cleanup
scope: meta
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0004-010
  - I-0004-050
  - I-0004-070
blocked_by: []
verify:
  - bash scripts/check-size-budgets.sh
  - pnpm format:check
  - bash -n scripts/check-size-budgets.sh
  - test ! -d docs/checklists
  - '! rg -n "docs/checklists/(README|harness-scorecard)\\.md" README.md AGENTS.md docs design scripts tasks'
  - rg -n "harness-diagnostics|check-size-budgets.targets.json" README.md AGENTS.md docs design scripts
artifacts:
  - AGENTS.md
  - README.md
  - docs/README.md
  - docs/runbooks/harness-diagnostics.md
  - docs/reports/diagnostics-surface-retirement.md
  - design/operating-rules/exceptions.md
  - scripts/check-size-budgets.sh
  - scripts/check-size-budgets.targets.json
---

## Goal

Retire the legacy diagnostics operating surface and route harness status checks through on-demand diagnostics instead.

## Done Criteria

- `docs/checklists/` is removed
- live entrypoint docs route readers to `harness-diagnostics`
- readability budget checks run without a Markdown score snapshot
- live and historical references no longer point at deleted checklist files

## Notes

- This task changes harness control surfaces only. It does not change product behavior.
- Keep intake-harness strengthening out of scope for this task.

## Self Review

- Scope and intent: limited to retiring the stale diagnostics snapshot surface, rehoming readability metadata, and rewiring docs to the on-demand diagnostics flow.
- Source of truth: live harness status now routes through `docs/runbooks/harness-diagnostics.md`, repo-local readability guardrails through `scripts/check-size-budgets.targets.json`, and external blockers through `design/operating-rules/exceptions.md`.
- Design divergence: intake-harness strengthening is intentionally deferred into `I-0004-090` instead of being folded into this cleanup.
- Verification: `bash scripts/check-size-budgets.sh`, `pnpm format:check`, `bash -n scripts/check-size-budgets.sh`, `test ! -d docs/checklists`, and the deleted-path `rg` check all pass.
- Review routing: `harness-reviewer` covers the truth-model and control-surface changes, and `po-reviewer` checks that the cleanup stays proportionate and discoverable.

## Review Focus

- Specialist reviewer should check: the repository no longer depends on a stale score snapshot and the replacement surfaces are explicit, minimal, and durable.
- PO reviewer should check: the cleanup reduces drift without making harness status harder to inspect in routine work.

## Handoff

- Follow-up intake-harness work should strengthen the default task/doc creation flow now that the scorecard surface is gone.

## Design Divergence

- Intake-harness defaults are still guidance-only and remain tracked separately in `I-0004-090`.

## Attempt Log

- 2026-03-14: started follow-up cleanup under `I-0004` to retire the legacy diagnostics surface and replace it with on-demand diagnostics plus a committed readability registry.
- 2026-03-14: added `docs/runbooks/harness-diagnostics.md`, rewired root/docs entrypoints, and redefined the exceptions register around principle/control semantics instead of checklist-bound score math.
- 2026-03-14: replaced the Markdown-backed readability registry with `scripts/check-size-budgets.targets.json` and updated `scripts/check-size-budgets.sh` to consume the JSON registry.
- 2026-03-14: removed `docs/checklists/`, rewrote historical direct references, added `docs/reports/diagnostics-surface-retirement.md`, and verified that no live or historical docs still point at the deleted checklist files.
- 2026-03-14: prepared the review package for this task around four change groups: entrypoint rewiring, operating-rule cleanup, readability registry migration, and historical reference rewrites. Main residual risk was broken references or a stale registry/script contract; verify commands passed against that risk.

## Review Notes

- Specialist review: `harness-reviewer` internal role review pass on 2026-03-14. Checked task boundaries, deleted-path coverage, script and registry integrity, exceptions semantics, and that the cleanup stayed inside repository control surfaces without drifting into intake-harness redesign.
- PO review: `po-reviewer` internal role review pass on 2026-03-14. Accepted the cleanup as proportionate, low release risk, and easier to operate than the stale score snapshot while preserving `I-0004-090` as the next explicit follow-up.

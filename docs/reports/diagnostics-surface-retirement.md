# Harness Maintenance Report: Scorecard Retirement

- **Date**: 2026-03-14
- **Mode**: Maintenance
- **Scope**: truth-model cleanup, diagnostics flow, readability registry

## Summary

The repository retired the legacy scorecard and checklist surface because it had become a stale duplicate of the `harness-diagnostics` checklist and no longer served as a trustworthy live control plane.

## Drift Findings

1. The in-repo scorecard duplicated the `harness-diagnostics` codebase checklist closely enough that it created maintenance overhead without adding a distinct source of truth.
2. Readability rules had diverged: the skill checklist still treats `300` lines as the generic readability threshold, while this repository operates a committed local guardrail at `350` lines for the first-wave hotspot list.
3. The retired score snapshot still pointed some open readability gaps at archived task ids, which made the snapshot look live while routing readers to closed work.
4. `scripts/check-size-budgets.sh` was parsing the score snapshot as an operational registry, so a historical document had become a machine-consumed control surface.

## Cleanup Result

- `docs/checklists/` was removed.
- On-demand diagnostics now route through `docs/runbooks/harness-diagnostics.md`.
- Readability budget metadata now lives in `scripts/check-size-budgets.targets.json`.
- External blockers remain tracked in `design/operating-rules/exceptions.md`.

## Follow-up

- Intake-harness strengthening remains a separate backlog item so new requests default into task/doc creation more reliably.

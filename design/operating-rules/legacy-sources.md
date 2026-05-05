---
doc_state: current
owner: harness
last_verified: 2026-03-30
sources:
  - docs/reports/README.md
  - docs/reports/history/README.md
---

# Legacy Sources

This repository keeps some historical planning material for reference, but legacy sources are not the source of truth.

## Trusted Output Rule

Only facts copied into tracked `design/`, `docs/domain/`, `docs/runbooks/`, `docs/reports/`, or `tasks/` count as current repository knowledge.

Legacy source files are inputs, not outputs.

## `docs/reports/history/`

- `docs/reports/history/` holds preserved historical plans, legacy design inputs, and completed backlog material that remains worth keeping.
- Files here are historical context, not current source of truth.
- No file under `docs/reports/history/` is the primary source of truth after the equivalent `design/`, `docs/domain/`, or `docs/runbooks/` doc exists.

## `.omc`

`.omc` is local agent residue and is not part of the tracked harness.

### Salvageable Inputs

- `.omc/plans/monorepo-migration.md`
- `.omc/plans/erd-design.md`
- `.omc/dm-implementation-summary.md`

These may be cited as historical inputs, but only copied facts that are re-verified against code should enter tracked docs.

### Non-Salvageable Residue

- `.omc/prd.json`
- `.omc/notepad.md`
- `.omc/progress.txt`
- `.omc/logs/*`
- `.omc/state/*`
- `.omc/ultrawork-state.json`

These must not be migrated into tracked docs.

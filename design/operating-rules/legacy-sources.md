---
doc_state: current
owner: harness
last_verified: 2026-03-12
sources:
  - .gitignore
  - docs/plans/README.md
---

# Legacy Sources

This repository keeps some historical planning material for reference, but legacy sources are not the source of truth.

## Trusted Output Rule

Only facts copied into tracked `design/`, `docs/domain/`, `docs/runbooks/`, `docs/reports/`, or `tasks/` count as current repository knowledge.

Legacy source files are inputs, not outputs.

## `docs/plans/`

- `docs/plans/archive/` holds preserved historical plans and completed backlog material.
- `docs/plans/` root may temporarily contain migration-input documents that still need extraction.
- No file under `docs/plans/` is the primary source of truth after the equivalent `design/` or `docs/domain/` doc exists.

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

# Docs

`docs/` stores human-readable supporting documentation.

## Structure

- `domain/`: product and business rules
- `runbooks/`: operational guidance and recovery procedures
- `reports/`: audits, upgrades, and assessment output
- `guides/`: contributor or workflow guides
- `plans/`: historical or transitional plans that have not yet been migrated
  - preserved history belongs under `docs/plans/archive/`

## Boundary

Use `docs/` for explanation and operations.

Do not use `docs/` as the primary home for:

- technical architecture design
- task execution state
- architecture decisions

## Current Truth Model

- harness diagnostics flow: `docs/runbooks/harness-diagnostics.md`
- release-history and diagnostic evidence: `docs/reports/`
- external blockers and proof: `design/operating-rules/exceptions.md`
- design/doc state rules and exceptions: `design/operating-rules/`

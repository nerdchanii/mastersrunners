# Docs

`docs/` stores human-readable supporting documentation.

## Structure

- `domain/`: product and business rules
- `runbooks/`: operational guidance and recovery procedures
- `reports/`: audits, upgrades, UAT, and other report output
- `reports/history/`: preserved historical plans and legacy design inputs that no longer count as current truth
- `guides/`: contributor or workflow guides

## Boundary

Use `docs/` for explanation and operations.

Do not use `docs/` as the primary home for:

- technical architecture design
- task execution state
- architecture decisions

## Current Truth Model

- harness diagnostics flow: `docs/runbooks/harness-diagnostics.md`
- release-history and diagnostic evidence: `docs/reports/`
- preserved historical planning material: `docs/reports/history/`
- external blockers and proof: `design/operating-rules/exceptions.md`
- design/doc state rules and exceptions: `design/operating-rules/`

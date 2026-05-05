# Reports

Use this folder for release-history evidence, QA reports, migration summaries, and other report artifacts that should remain readable but are not active design documents.

## Release History Home

Treat this file as the repository home for milestone and release-history evidence.

What belongs here:

- milestone summaries that explain what landed in a delivery wave
- QA reports and validation snapshots
- migration or upgrade summaries that help later work understand what changed
- flaky-test or stability ledgers that support operational follow-up
- preserved historical plans and legacy design inputs under `history/`

What does not belong here:

- active feature design
- current execution plans
- transient debugging scratch notes

## Current Report Index

| File                                        | Purpose                                                            | Status     |
| ------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| `phase6-qa-report.md`                       | phase-level QA evidence for the phase 6 release wave               | historical |
| `pre-phase5-fixes.md`                       | pre-phase fix summary captured before later harness work           | historical |
| `masters-upgrade-report.md`                 | upgrade and implementation summary for the Masters product refresh | historical |
| `i-0009-crew-messaging-ux-uat-checklist.md` | browser-based manual UAT checklist for crew messaging UX polish    | live       |
| `i-0014-ui-bug-board.md`                    | live UI issue ledger and fix-pack intake for current web UX pain   | live       |
| `flaky-tests.md`                            | active ledger for advisory or quarantined test instability         | live       |
| `diagnostics-surface-retirement.md`         | drift report that retired the legacy diagnostics surface           | live       |
| `history/`                                  | preserved phase plans and legacy design inputs                     | historical |

## How to Extend This Folder

- Add new milestone summaries or release notes here instead of reviving archived phase plans as current references.
- Keep durable technical design in `design/` and business truth in `docs/domain/`.
- When a task or maintenance report needs release-history evidence, point it at this folder home or a specific report file here.

## Relationship to `history/`

- `docs/reports/history/` is where preserved phase plans and legacy design inputs now live.
- `docs/reports/` is the durable home for shipped milestone evidence and release-history snapshots.

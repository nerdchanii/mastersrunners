---
doc_state: current
owner: harness
last_verified: 2026-03-12
sources:
  - AGENTS.md
  - docs/checklists/README.md
---

# Document States

This repository uses explicit document-state rules so design/docs migration does not blur current facts with future intent.

## Allowed States

- `current`: describes the implementation and behavior that exists now
- `target`: describes approved future intent that is not fully implemented yet

`mixed` is not allowed.

## Required Frontmatter

All new `design/**/*.md` and synced `docs/domain/*.md` must include:

- `doc_state`
- `owner`
- `last_verified`
- `sources`

## Placement Rules

- `design/`: only `current` or `target` technical design docs
- `docs/domain/`: current business rules and terms
- `docs/runbooks/`: current operational procedures
- `docs/reports/`: historical audits, QA, upgrade summaries
- `docs/plans/archive/`: preserved historical plans and legacy backlogs

## Authoring Rules

- A `current` doc must be grounded in code, schema, or running automation.
- A `target` doc must not describe itself as already implemented.
- When a `target` design becomes real, update the doc to `current` in the same task that lands the behavior.
- If a historical plan contains durable facts, copy the facts into a `current` or `target` doc. Do not move the original plan into `design/` unchanged.

## Verification Rules

- `last_verified` must be updated when a task materially rechecks the document against code or automation.
- `sources` must point to the specific code/docs used to verify the content.
- Any scorecard change that depends on a document state must reference a `current` doc, not a historical plan.

# ADR-0001: Repository source-of-truth boundaries

## Status

Accepted

## Date

2026-03-12

## Context

The repository used to mix durable design knowledge, operational notes, temporary plans, and execution state across `README.md`, legacy planning buckets, and ad hoc notes. That made it hard for agents to know which document should win when files disagreed.

The harness now depends on stable navigation and stable ownership boundaries between:

- business rules
- technical design
- execution state
- operational procedures

Without an explicit boundary decision, agents can rewrite design to match weak implementation or treat historical plan files as current truth.

## Decision

Use the repository itself as the source-of-truth system with explicit folder ownership:

- `docs/domain/` for product and business rules
- `design/frontend/`, `design/backend/`, and `design/architecture/` for technical design
- `design/adr/` for durable architectural decisions
- `design/initiatives/` for large change framing
- `tasks/` for execution state and review history
- `docs/runbooks/` for operational procedures
- `docs/reports/` and `docs/reports/history/` for historical evidence, not current truth

Approved design must not be downgraded to match weak implementation. Divergence is tracked with tasks and follow-up work rather than by rewriting the source of truth downward.

## Alternatives Considered

- Keep one large `README.md` as the primary source of truth
  - Rejected because it mixes navigation, product context, and implementation detail into one stale hotspot.
- Treat legacy planning material and `.omc/` as equal peers to `design/`
  - Rejected because historical plan material and current truth need different authority levels.
- Let current implementation define the design documents
  - Rejected because it destroys the harness's ability to represent target design and controlled divergence.

## Consequences

- Agents have one stable map for where to read and where to write.
- Design drift is handled through follow-up tasks instead of silent documentation downgrade.
- Historical plans remain useful as salvage input but stop competing with current docs.
- Future folder-boundary changes should update this ADR and the entrypoint or diagnostics workflow docs together.

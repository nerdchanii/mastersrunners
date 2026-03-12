# ADR-0003: Canonical workout units are meters, seconds, and seconds per kilometer

## Status

Accepted

## Date

2026-03-12

## Context

Workout, challenge, event, shoe, and feed features all exchange distance, duration, and pace values. Those values cross:

- browser forms and displays
- API payloads
- Prisma models
- upload parsers
- challenge aggregation logic

If canonical units are not fixed, agents can silently mix UI display units with stored units and break calculations.

## Decision

Use these canonical internal units:

- distance: `meters`
- duration: `seconds`
- pace: `seconds per kilometer`

UI and export layers may convert for display, but storage and API-side business logic stay in the canonical units above.

## Alternatives Considered

- Store distance in kilometers because the UI commonly shows km
  - Rejected because file imports, GPS parsing, and precise aggregation naturally operate in meters.
- Store pace as formatted strings
  - Rejected because comparisons and aggregation need numeric values.
- Allow each feature to choose its own units
  - Rejected because cross-feature aggregation and agent reasoning become brittle.

## Consequences

- Domain docs and code should continue to use meters/seconds/seconds per kilometer internally.
- UI conversion remains a presentation concern.
- New features that store or compare training data should reuse the canonical units.
- Any future unit-model change would require explicit migration planning and a superseding ADR.

# I-0010: Agent-First Document IA

## Summary

Reorganize the documentation system so agents can gather current context quickly while human readers still get clearer entrypoints and less ambiguous folder structure.

## Problem

The repository already has useful top-level boundaries, but task navigation, legacy-plan placement, and local module documentation still create avoidable search cost and stale-path drift.

## Goals

- keep `design/`, `docs/`, and `tasks/` as the top-level hubs
- move `tasks/` to a status-first layout
- retire the legacy planning bucket as a live category
- centralize module-local documentation into canonical docs
- clarify the roles and creation order of ADRs, initiatives, and tasks

## Non-Goals

- changing product behavior
- rewriting the full historical task corpus
- introducing a new top-level documentation mega-hub

## Scope

- `AGENTS.md`
- `README.md`
- `design/`
- `docs/`
- `tasks/`
- `package.json`

## Design References

- `design/README.md`
- `design/adr/README.md`
- `design/initiatives/README.md`
- `tasks/README.md`
- `docs/README.md`

## Review Plan

- Additional review, if requested, should focus on docs clarity and task-system invariants.

## Task Breakdown

- `tasks/archive/I-0010-010-meta-document-ia-reorg.md`

## Success Criteria

- top-level hubs stay stable while internal roles become clearer
- `tasks/` is status-first and initiative-linked by filename plus initiative breakdown
- the legacy planning bucket no longer exists as a live category
- code-local README content is absorbed into canonical docs
- root and index docs explain ADR, initiative, and task lifecycle more clearly

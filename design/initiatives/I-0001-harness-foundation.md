# I-0001: Harness Foundation

## Summary

Establish the repository-level structure that makes agents work against explicit sources of truth instead of scattered notes.

## Problem

The repository has domain docs and workflows, but no standard agent entry point, no formal task system, and no clean separation between design, docs, and execution state.

## Goals

- Add a standard `AGENTS.md` entry point
- Define the `design/`, `docs/`, and `tasks/` boundaries
- Introduce reusable templates for initiatives, ADRs, and tasks
- Create the first deployment-oriented runbook and architecture split

## Non-Goals

- Full migration of all existing docs
- Lint or CI hardening
- Generated artifact cleanup

## Design References

- `AGENTS.md`
- `design/README.md`
- `docs/runbooks/deployment.md`
- `design/architecture/deployment.md`

## Task Breakdown

- Archived scaffold work in `tasks/archive/`
- Remaining root-doc sync work in `tasks/todo/`

## Success Criteria

- Repository has a standard agent entry point
- Task workflow and naming are documented
- Deployment has separate design, runbook, and executable verification layers

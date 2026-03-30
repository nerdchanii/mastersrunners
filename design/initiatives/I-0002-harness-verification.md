# I-0002: Harness Verification

## Summary

Strengthen the repository so agents receive fast, automated feedback before and during CI.

## Problem

Lint is currently broken, CI does not enforce enough invariants, and generated artifacts still pollute the repository signal.

## Goals

- Repair ESLint and align it with the actual repo architecture
- Add formatter and hook conventions
- Create a local CI mirror entry point
- Expand CI checks
- Prevent generated artifacts from drifting back into the repository

## Non-Goals

- Production monitoring integration
- Branch protection policy changes outside the repo

## Design References

- `AGENTS.md`
- `tasks/I-0002-harness-verification/`
- `.github/workflows/ci.yml`

## Task Breakdown

- Archived foundation tasks live in `tasks/archive/`
- Completed follow-up cleanup:
  - `tasks/archive/I-0002-060-web-react-hook-warning-burndown.md`

## Success Criteria

- `pnpm lint` works
- local verification command mirrors CI closely enough for agent use
- CI blocks obvious repository invariant violations

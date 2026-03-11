---
id: I-0002-030
title: Add local CI mirror command
parent: I-0002-harness-verification
scope: ci
owner: pasteur
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0002-010
blocked_by: []
verify:
  - test -f scripts/ci-local.sh
artifacts:
  - scripts/ci-local.sh
  - package.json
---

## Goal

Provide one local command that approximates the core CI signal for agent use.

## Done Criteria

- a single command exists for local CI-like verification
- command documents env and service assumptions
- command is referenced from `AGENTS.md`

## Notes

- `scripts/ci-local.sh` now approximates the core CI flow with lint, harness structure checks, build, API test, and web build.
- The script documents local service assumptions and supports optional dependency install via `CI_LOCAL_INSTALL=1`.
- `AGENTS.md` now points to `pnpm ci:local` as the local CI mirror entry point.
- The separate Docker build job is intentionally not included in the local fast path.

## Handoff

- If CI changes materially, update `scripts/ci-local.sh` in the same task so local and remote signals stay aligned.

## Attempt Log

- 2026-03-11: added an executable local CI mirror script and wired it into the root command surface

## Review Notes

- Specialist review: harness-reviewer - the script is useful as a local approximation, but it is intentionally narrower than CI because it omits the Docker build job.
- PO review: accepted with caveat - the command is valuable for fast feedback, and its scope is now documented as an approximation rather than a full mirror.

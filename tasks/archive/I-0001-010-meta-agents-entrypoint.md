---
id: I-0001-010
title: Establish AGENTS entry point
parent: I-0001-harness-foundation
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - test -f AGENTS.md
  - test -f CLAUDE.md
artifacts:
  - AGENTS.md
  - CLAUDE.md
---

## Goal

Create a standard root entry point for repository-aware agents.

## Done Criteria

- `AGENTS.md` exists at repo root
- `CLAUDE.md` points readers to `AGENTS.md`
- nonstandard root guidance no longer competes with the canonical entry point

## Notes

- Completed during the initial harness scaffold

## Handoff

- Keep `AGENTS.md` concise and map-oriented

## Attempt Log

- 2026-03-11: created `AGENTS.md`, redirected `CLAUDE.md`, and removed nonstandard `Agent.md`

## Review Notes

- Specialist review: harness-reviewer - root entry point is now canonical and removes the competing nonstandard agent doc.
- PO review: accepted - the repository now has one clear entry point for agent onboarding.

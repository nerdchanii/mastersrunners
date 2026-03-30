---
id: I-0011-020
title: Resync challenge domain docs to current schema and runtime
parent: I-0011-domain-truth-and-boundary-hardening
scope: docs
owner: codex
reviewers:
  - docs-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0011-010
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-doc-frontmatter.sh
  - rg -n "type|targetValue|targetUnit|goalType|creatorType|participationUnit|participationMode|ChallengeParticipant" docs/domain/challenge.md packages/database/prisma/schema.prisma design/backend/events-challenges.md apps/api/src/challenges/challenges.service.ts
artifacts:
  - docs/domain/challenge.md
  - docs/domain/glossary.md
  - docs/domain/README.md
  - design/initiatives/I-0011-domain-truth-and-boundary-hardening.md
---

## Goal

Rewrite the challenge domain doc so it reflects the current Prisma schema, API behavior, and current-state design corpus instead of mixing in unverified future concepts.

## Done Criteria

- `docs/domain/challenge.md` matches current field names, participant state, and lifecycle behavior used by the API and schema
- future-only or unimplemented concepts are either removed from the current doc or explicitly pushed into `target` design work
- challenge vocabulary in `docs/domain/glossary.md` no longer contradicts the runtime model

## Notes

- The current implementation centers on `type`, `targetValue`, `targetUnit`, `isPublic`, `crewId`, and direct participant progress updates.
- Do not preserve `PLATFORM`, approval workflows, or richer team semantics in the current doc unless they are re-verified against code and schema.

## Self Review

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the challenge doc reads as current truth and does not reintroduce speculative participation rules.
- PO reviewer should check: the resulting challenge rules are still meaningful as product vocabulary and do not hide future ideas that need separate planning.

## Handoff

- If restored future challenge features are still desired, create separate `target` design tasks rather than stretching this current-state sync task.

## Design Divergence

- Record any challenge concept that remains desired but unimplemented, then link the follow-up task here instead of keeping it in the current doc.

## Attempt Log

- 2026-03-30: created after reviewers found the challenge domain doc was the largest single mismatch between current docs and runtime behavior.

## Review Notes

- Specialist review:
- PO review:

---
id: I-0005-080
title: Seed the first real ADR pack
parent: I-0005-current-state-design-corpus
scope: docs
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0005-010
blocked_by: []
verify:
  - find design/adr -maxdepth 1 -type f | sort
artifacts:
  - design/adr/
---

## Goal

Replace the ADR template-only state with the first accepted architectural decisions required by the harness scorecard.

## Done Criteria

- the first four ADRs exist and are accepted
- ADRs explain decision, drivers, alternatives, consequences, and follow-ups

## Notes

- ADRs should match current implemented decisions.
- This task is limited to the first accepted ADR seed pack and the scorecard rows that directly depend on ADR existence.

## Self Review

- Scope and intent: limited to accepted ADR creation and the scorecard rows that explicitly depend on ADR existence.
- Source of truth: ADRs were grounded in current code and current design docs, not historical plans alone.
- Design divergence: no design downgrade was required; the ADRs describe current implemented decisions and leave other unresolved concerns out of scope.
- Verification: `find design/adr -maxdepth 1 -type f | sort`, `bash scripts/check-task-review-metadata.sh`, and `pnpm format:check` passed.
- Review routing: `docs-reviewer` for clarity and repository knowledge quality, `harness-reviewer` for scorecard and governance consistency, plus `po-reviewer`.

## Review Focus

- Specialist reviewer should check: the ADRs match implemented decisions and the scorecard only flips rows that are actually satisfied now.
- PO reviewer should check: the first ADR pack improves long-term decision traceability without inventing aspirational choices.

## Handoff

- Future score-math or source-of-truth changes should require ADR updates.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: added four accepted ADRs for source-of-truth boundaries, SPA plus API split, canonical workout units, and SSE as the current realtime transport.
- 2026-03-12: updated scorecard rows for ADR existence and repository knowledge rationale to reflect the new accepted ADR pack.

## Review Notes

- docs-reviewer: pass. The ADRs describe current implemented decisions, keep alternatives explicit, and improve durable repository knowledge without drifting into roadmap prose.
- harness-reviewer: pass. Scorecard updates are limited to rows directly satisfied by accepted ADR existence and rationale coverage.
- po-reviewer: pass. The seed pack captures stable product and platform decisions that agents repeatedly need without inventing future architecture commitments.

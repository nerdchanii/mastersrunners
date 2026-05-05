---
id: I-0011-010
title: Normalize domain doc states and live-TBD policy
parent: I-0011-domain-truth-and-boundary-hardening
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-doc-frontmatter.sh
  - rg -n "^doc_state:|^owner:|^last_verified:|^sources:$" docs/domain
  - rg -n "current|target|docs/domain" docs/domain/README.md design/operating-rules/document-states.md scripts/check-doc-frontmatter.sh
artifacts:
  - docs/domain/README.md
  - docs/domain/comparison-dashboard.md
  - design/operating-rules/document-states.md
  - scripts/check-doc-frontmatter.sh
  - design/initiatives/I-0011-domain-truth-and-boundary-hardening.md
---

## Goal

Make `docs/domain/` obey the repository-wide document-state contract and convert stray `TBD` domain surfaces into explicit `target` docs, live tasks, or exceptions.

## Done Criteria

- every `docs/domain/*.md` file has the required frontmatter
- `docs/domain/README.md` uses the same state model as `design/operating-rules/document-states.md`
- domain files that are not current truth are moved, split, or explicitly tracked instead of remaining implicit in `docs/domain/`
- the frontmatter check script enforces the policy instead of leaving `docs/domain/` unguarded

## Notes

- Keep `docs/domain/` for current business truth only.
- If `comparison-dashboard` remains speculative, move it to `design/` with `doc_state: target` instead of weakening the rule.
- This task should seed follow-up tasks for any remaining `TBD` it cannot close directly.

## Self Review

- Scope and intent: Added required frontmatter across `docs/domain`, moved speculative comparison-dashboard content into `design/frontend/comparison-dashboard.md`, and expanded frontmatter automation so `docs/domain` and `design/operating-rules` are checked together.
- Source of truth: `design/operating-rules/document-states.md`, `packages/database/prisma/schema.prisma`, and the code-backed sources listed in each `docs/domain` file frontmatter.
- Design divergence: None. `comparison-dashboard` is now explicitly tracked as `doc_state: target` outside `docs/domain`.
- Verification: `bash scripts/check-task-review-metadata.sh`; `bash scripts/check-doc-frontmatter.sh`; `rg -n "^doc_state:|^owner:|^last_verified:|^sources:$" docs/domain`; `rg -n "current|target|docs/domain" docs/domain/README.md design/operating-rules/document-states.md scripts/check-doc-frontmatter.sh`
- Review routing: `docs-reviewer`, `harness-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: the document-state model is now consistent across policy, automation, and the domain corpus.
- PO reviewer should check: current business truth is easier to find and future concepts are no longer presented as already implemented.

## Handoff

- Follow-up docs tasks should assume the `docs/domain/` frontmatter and state model are authoritative after this lands.

## Design Divergence

- None.

## Attempt Log

- 2026-03-30: created from a multi-review audit after confirming `docs/domain/` drifted outside the enforced `current` or `target` model and the live task queue was empty.
- 2026-03-30: added frontmatter to the synced domain corpus, moved comparison-dashboard into `design/frontend`, and fixed `design/operating-rules/README.md` after the widened frontmatter check exposed the legacy gap.

## Review Notes

- Specialist review: 2026-03-30 `docs-reviewer` and `harness-reviewer` pass. Confirmed `docs/domain/` is `current`-only, speculative dashboard content moved to `design/frontend/comparison-dashboard.md`, and automation now guards both synced domain docs and operating-rule docs.
- PO review: 2026-03-30 `po-reviewer` pass. Confirmed current business truth remains easy to locate in `docs/domain/` and future comparison-dashboard intent no longer reads as already implemented.

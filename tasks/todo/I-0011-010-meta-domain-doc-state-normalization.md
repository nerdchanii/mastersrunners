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

- Scope and intent:
- Source of truth:
- Design divergence:
- Verification:
- Review routing:

## Review Focus

- Specialist reviewer should check: the document-state model is now consistent across policy, automation, and the domain corpus.
- PO reviewer should check: current business truth is easier to find and future concepts are no longer presented as already implemented.

## Handoff

- Follow-up docs tasks should assume the `docs/domain/` frontmatter and state model are authoritative after this lands.

## Design Divergence

- If any domain file still needs to stay future-facing after this task, record the reason and link the follow-up task or exception here.

## Attempt Log

- 2026-03-30: created from a multi-review audit after confirming `docs/domain/` drifted outside the enforced `current` or `target` model and the live task queue was empty.

## Review Notes

- Specialist review:
- PO review:

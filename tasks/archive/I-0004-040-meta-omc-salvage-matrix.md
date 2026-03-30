---
id: I-0004-040
title: Add .omc salvage-only policy
parent: I-0004-truth-model-cleanup
scope: docs
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0004-010
blocked_by: []
verify:
  - test -f design/operating-rules/legacy-sources.md
artifacts:
  - design/operating-rules/legacy-sources.md
---

## Goal

Define what `.omc` material may be salvaged into tracked docs and what must remain untrusted local residue.

## Done Criteria

- salvageable `.omc` sources are named explicitly
- non-durable local agent state is explicitly excluded
- future tasks can cite the salvage matrix instead of making ad hoc migration choices

## Notes

- `.omc` is not a tracked documentation layer and should never become one.

## Review Focus

- Specialist reviewer should check: the salvage matrix is strict enough to prevent stale local agent state from leaking into tracked docs.
- PO reviewer should check: the policy preserves durable insight without reviving obsolete planning residue.

## Handoff

- I-0005 should cite the salvage matrix when extracting facts from `.omc`.

## Attempt Log

- 2026-03-12: created a tracked salvage-only policy for `.omc` and other legacy sources.

## Review Notes

- Specialist review: harness-reviewer and docs-reviewer agreed the salvage matrix is strict enough to block `.omc` logs, state, and scratch files from being promoted into tracked repository truth.
- PO review: accepted because the policy preserves durable facts while clearly excluding local agent residue.

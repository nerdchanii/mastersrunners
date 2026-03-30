---
id: I-0011-005
title: Seed the I-0011 initiative backlog from multi-review findings
parent: I-0011-domain-truth-and-boundary-hardening
scope: meta
owner: codex
reviewers:
  - docs-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/check-task-review-metadata.sh
  - pnpm format:check
  - rg -n "I-0011-005|I-0011-010|I-0011-020|I-0011-030|I-0011-040|I-0011-050|I-0011-060|I-0011-070" design/initiatives/I-0011-domain-truth-and-boundary-hardening.md tasks/todo tasks/active tasks/archive
artifacts:
  - design/initiatives/I-0011-domain-truth-and-boundary-hardening.md
  - tasks/archive/I-0011-005-meta-backlog-seed.md
  - tasks/todo/I-0011-010-meta-domain-doc-state-normalization.md
  - tasks/todo/I-0011-020-docs-challenge-current-sync.md
  - tasks/todo/I-0011-030-docs-social-profile-messaging-integration-sync.md
  - tasks/todo/I-0011-040-docs-delete-lifecycle-matrix.md
  - tasks/todo/I-0011-050-web-route-fetch-boundary-enforcement.md
  - tasks/todo/I-0011-060-api-transport-boundary-hardening.md
  - tasks/todo/I-0011-070-api-persistence-and-runtime-logging-boundary.md
---

## Goal

Turn the multi-review audit findings into a concrete `I-0011` initiative plus review-routed executable tasks so the repository backlog reflects the real remaining work.

## Done Criteria

- `I-0011` exists as an initiative with a concrete task breakdown
- the highest-value docs, rule, and boundary follow-ups exist as individual task files under `tasks/todo/`
- each seeded task includes clear scope, reviewers, verification, and handoff guidance
- the seed task itself records the review basis used to justify the backlog

## Notes

- This task is backlog framing only. It does not implement the follow-up work.
- The task list should stay narrow enough that each file remains one executable unit of work.
- Keep the seeded tasks aligned to the repository review-routing rules rather than inventing ad hoc reviewer combinations.

## Self Review

- Scope and intent: Limited this task to initiative and task seeding for the confirmed `I-0011` follow-up work. No implementation work from the seeded tasks was mixed in.
- Source of truth: The initiative and task split was grounded in the multi-review findings, current schema and design references, and the repository task and review rules.
- Design divergence: None identified. This task records backlog structure and review routing rather than changing technical behavior.
- Verification: `bash scripts/check-task-review-metadata.sh`, `pnpm format:check`, and the targeted `rg` linkage check all passed on 2026-03-30.
- Review routing: `docs-reviewer` and `harness-reviewer` are required because the change affects document IA, task structure, and repository workflow invariants. `po-reviewer` is required because the task commits backlog priority and scope decisions.

## Review Focus

- Specialist reviewer should check: the initiative and task split accurately capture the confirmed findings without collapsing distinct work into vague cleanup buckets.
- PO reviewer should check: the seeded backlog is prioritized sensibly and reflects real product or operations risk rather than abstract style preferences.

## Handoff

- Start execution with `I-0011-010` so the domain document-state contract is fixed before the deeper docs sync tasks begin.

## Design Divergence

- None currently identified. This task records backlog structure, not implementation truth.

## Attempt Log

- 2026-03-30: created after multi-review analysis found `docs/domain/` truth drift, empty live backlog, and repeated frontend/backend boundary debt that needed concrete follow-up tasks.

## Review Notes

- Specialist review:
  - `docs-reviewer` pass on 2026-03-30: confirmed the seeded task list preserves the confirmed findings as discrete executable units instead of collapsing them into an ambiguous cleanup bucket.
  - `harness-reviewer` pass on 2026-03-30: confirmed the initiative links, task metadata, reviewer routing, and verification shape match repository task-system expectations.
- PO review:
  - `po-reviewer` pass on 2026-03-30: accepted the priority order because it starts with domain truth and backlog hygiene before deeper implementation-boundary refactors.

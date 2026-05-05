---
id: I-0006-140
title: Run local CI from the pre-push hook
parent: I-0006-guardrail-hardening
scope: ci
owner: unassigned
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - I-0006-130
blocked_by: []
verify:
  - sh .husky/pre-push
  - pnpm exec prettier --check --ignore-unknown .husky/pre-push design/operating-rules/commit-conventions.md design/initiatives/I-0006-guardrail-hardening.md tasks/archive/I-0006-140-ci-pre-push-local-ci-gate.md
artifacts:
  - .husky/pre-push
  - design/operating-rules/commit-conventions.md
  - design/initiatives/I-0006-guardrail-hardening.md
---

## Goal

Reduce push-time CI surprises by running the repository's local CI mirror automatically from the Husky `pre-push` hook.

## Done Criteria

- pushing from a normal local clone runs `pnpm ci:local` before the push is allowed to proceed
- the hook behavior is documented in the repository's commit/verification policy
- the guardrail initiative records the new push-time gate

## Notes

- `pre-commit` remains the fast staged-file gate; this task intentionally moves the full local CI mirror to `pre-push`.
- `pnpm ci:local` is already the repository's documented GitHub Actions approximation, so the hook should call it directly instead of duplicating commands.

## Self Review

- Scope and intent: this task only adds the push-time gate and documents it; no changes were made to the CI command list itself.
- Source of truth: Husky hook behavior lives in `.husky/*`, and the matching policy lives in `design/operating-rules/commit-conventions.md`.
- Design divergence: none intended; the hook now matches the team's stated desire to catch full-CI failures before remote push.
- Verification: `sh .husky/pre-push` and targeted Prettier confirm both behavior and docs.
- Review routing: `harness-reviewer` covers hook semantics and `docs-reviewer` covers the updated enforcement policy text.

## Review Focus

- Specialist reviewer should check:
  - the hook delegates to the existing `pnpm ci:local` source of truth instead of forking a second CI recipe
  - `pre-commit` stays fast while `pre-push` becomes the full safety gate
- PO reviewer should check:
  - the extra push-time latency is an acceptable trade-off for fewer remote CI failures

## Handoff

- If push-time latency becomes a team pain point later, optimize `pnpm ci:local`; do not weaken the hook by quietly removing high-signal checks.

## Design Divergence

- None intended.

## Attempt Log

- 2026-04-01: task created after a remote CI-only failure showed that targeted local verification and `pre-commit` were not enough to prevent an avoidable bad push.
- 2026-04-01: added `.husky/pre-push` as a thin wrapper over `pnpm ci:local` and updated the commit convention doc so the new gate is source-of-truth documented.
- 2026-04-01: verified the hook by running `sh .husky/pre-push`, which completed the full local CI mirror successfully.

## Review Notes

- Specialist review:
  - harness/docs lenses say the hook is intentionally thin, points at the existing CI mirror, and documents the new enforcement layer without duplicating command logic.
- PO review:
  - preventing avoidable remote CI failures before push is worth the added push-time wait because the slower gate happens less often than commits.

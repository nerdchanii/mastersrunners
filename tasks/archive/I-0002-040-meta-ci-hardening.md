---
id: I-0002-040
title: Expand CI checks for repository invariants
parent: I-0002-harness-verification
scope: ci
owner: banach
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - I-0002-010
  - I-0002-030
blocked_by: []
verify:
  - test -f .github/workflows/ci.yml
artifacts:
  - .github/workflows/ci.yml
---

## Goal

Make CI enforce more than build and unit test success.

## Done Criteria

- CI runs lint
- CI runs explicit type or build checks as intended
- CI includes at least one document or repository-structure invariant check

## Notes

- CI now runs `pnpm lint` before build and test execution.
- CI now checks for the presence of `AGENTS.md`, `design/`, `docs/`, and `tasks/`.
- CI also fails if known generated artifact directories reappear in the clean checkout.

## Handoff

- Keep the harness structure check intentionally simple until a dedicated invariant script exists.

## Attempt Log

- 2026-03-11: extended `.github/workflows/ci.yml` with lint and repository invariant checks while preserving the existing build, API test, web build, and Docker job structure

## Review Notes

- Specialist review: harness-reviewer - CI now enforces lint and simple repository invariants, but review metadata enforcement remains an explicit follow-up task.
- PO review: accepted with follow-up - the pipeline is substantially stronger, even though the review gate is not machine-enforced yet.

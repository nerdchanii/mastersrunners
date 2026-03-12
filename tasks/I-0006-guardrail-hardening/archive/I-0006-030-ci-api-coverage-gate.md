---
id: I-0006-030
title: Add blocking API coverage gate
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0006-010
blocked_by: []
verify:
  - pnpm --filter @masters/api test:cov
artifacts:
  - apps/api/jest.config.ts
  - .github/workflows/ci.yml
---

## Goal

Add a blocking API coverage threshold and document why web coverage remains follow-up work for now.

## Done Criteria

- API coverage thresholds are enforced in CI
- scorecard reflects the temporary web coverage gap without weakening the API threshold

## Notes

- Threshold target: statements 60 / lines 60 / functions 60 / branches 50.

## Review Focus

- Specialist reviewer should check: the threshold is truly blocking in CI/local and the coverage measurement matches the intended API surface.
- PO reviewer should check: the gate raises confidence without demanding premature web test investment.

## Handoff

- Future web test work should close the remaining web coverage gap rather than weakening the API gate.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: Added blocking coverage thresholds to `apps/api/jest.config.ts` and switched CI plus `ci:local` to `pnpm --filter @masters/api test:cov`.
- 2026-03-12: Updated the hashtag service spec to match the current repository call contract and re-ran coverage. Result: statements 73.07 / branches 61.6 / functions 76.4 / lines 74.89.
- 2026-03-12: Kept web coverage out of this gate. Web test expansion remains a follow-up lane rather than a reason to weaken the API threshold.

## Review Notes

- Specialist review: `harness-reviewer` approved. Coverage is now a blocking CI signal rather than advisory output.
- Specialist review: `backend-reviewer` approved. The threshold and spec update are sound and match the current API contract.
- PO review: approved. The API gate materially improves regression detection while keeping scope bounded to the backend lane.

---
id: I-0006-205
title: Recover dev CI and deploy gates after the security-header rollout
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
  - backend-reviewer
  - frontend-reviewer
po_review: required
depends_on:
  - I-0006-150
  - I-0006-160
  - I-0006-170
blocked_by: []
verify:
  - pnpm knip
  - pnpm --filter @masters/api build
  - VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build
  - bash scripts/check-task-review-metadata.sh
  - pnpm exec prettier --check --ignore-unknown .github/workflows/deploy.yml apps/web/src/components/ui/sheet.tsx apps/web/src/hooks/useFeedback.ts apps/web/src/lib/message-room.ts apps/web/src/lib/share-link.ts design/architecture/deployment.md design/initiatives/I-0006-guardrail-hardening.md design/operating-rules/exceptions.md docs/runbooks/deployment.md knip.json tasks/archive/I-0006-170-ci-deployment-security-header-verification.md tasks/todo/I-0006-210-api-conversation-type-leak-knip-cleanup.md tasks/archive/I-0006-205-ci-header-rollout-regression-recovery.md
artifacts:
  - .github/workflows/deploy.yml
  - apps/web/src/components/ui/sheet.tsx
  - apps/web/src/hooks/useFeedback.ts
  - apps/web/src/lib/message-room.ts
  - apps/web/src/lib/share-link.ts
  - design/architecture/deployment.md
  - design/initiatives/I-0006-guardrail-hardening.md
  - design/operating-rules/exceptions.md
  - docs/runbooks/deployment.md
  - knip.json
  - tasks/archive/I-0006-170-ci-deployment-security-header-verification.md
  - tasks/todo/I-0006-210-api-conversation-type-leak-knip-cleanup.md
---

## Goal

Restore a green local CI/deploy signal after the 2026-04-01 security-header rollout by narrowing the automated deploy gate back to repo-controlled API proof and clearing the new `knip` regressions without hiding the remaining structural debt.

## Done Criteria

- automated deploy verification no longer blocks on the externally managed Pages host returning `403` to GitHub Actions
- `pnpm knip` no longer fails on newly introduced unused exports from the header-rollout follow-up work
- the remaining conversations type-boundary debt is tracked as a follow-up task instead of being silently normalized in `knip.json`

## Notes

- GitHub Actions run `23847833839` showed Cloud Run deploys succeeded, then failed only at the final web-root probe against `https://dev.mastersrunners.com`.
- GitHub Actions CI run `23847833763` failed `Check dead code baseline` on newly unused exports/types introduced during the same follow-up lane.
- Cloudflare Pages custom-domain behavior remains external state under `EX-0004`, so the repo-controlled deploy gate should block on the direct API origin only.

## Self Review

- Scope and intent: kept the recovery on deploy-gate regression handling, dead-export cleanup, and debt tracking; did not widen into a conversations API refactor.
- Source of truth: failing GitHub Actions logs, `scripts/verify-deployment.sh`, deploy runbooks, and the current `knip` baseline drove the changes.
- Design divergence: a temporary `knip` `types` ignore remains for the conversations repository, and the explicit cleanup is now tracked by `I-0006-210`.
- Verification: `pnpm knip`, `pnpm --filter @masters/api build`, `VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build`, `bash scripts/check-task-review-metadata.sh`, and targeted Prettier all passed locally.
- Review routing: `harness-reviewer` covers deploy/CI guardrails, `backend-reviewer` covers the API type boundary implication, and `frontend-reviewer` covers the removed web exports.

## Review Focus

- Specialist reviewer should check:
  - the deploy gate now blocks only on repo-controlled API proof while preserving optional live Pages proof via `WEB_VERIFY_URL`
  - the `knip` recovery removes true dead exports and keeps the remaining conversations-type exception explicitly temporary
- PO reviewer should check:
  - the branch health is restored without weakening the intended header-hardening direction

## Handoff

- `I-0006-210` must remove the temporary conversations repository `knip` `types` ignore by introducing an explicit public return-type boundary; do not let that exception become part of the permanent baseline.

## Design Divergence

- The branch currently keeps `apps/api/src/conversations/repositories/conversations.repository.ts` under a temporary `knip` `types` ignore because the Nest public return contract still depends on repository helper types.
- Close that gap through `I-0006-210` instead of adding more `knip` ignores.

## Attempt Log

- 2026-04-02: investigated failing GitHub Actions runs and confirmed the deploy lane failed after a successful Cloud Run rollout because the new web-root probe against `https://dev.mastersrunners.com` returned `403` from externally managed Cloudflare Pages state.
- 2026-04-02: reproduced the `pnpm knip` failure locally, removed newly unused web exports, restored required API type exports, and tracked the remaining conversations type leak as follow-up `I-0006-210`.
- 2026-04-02: narrowed the automated deploy gate back to direct API proof, updated deployment docs and the exception ledger, and reran local verification for `knip`, API build, web build, task metadata, and formatting.

## Review Notes

- Specialist review:
  - `harness-reviewer` internal role review pass on 2026-04-02: confirmed the deploy workflow no longer blocks on external Pages host behavior and the guardrail docs match the automated boundary again.
  - `backend-reviewer` internal role review pass on 2026-04-02: confirmed the conversations repository keeps only the export surface required for the current Nest public contract and that the remaining structural debt is explicitly tracked in `I-0006-210`.
  - `frontend-reviewer` internal role review pass on 2026-04-02: confirmed the removed web exports were genuinely unused and did not change route/UI behavior.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-02: accepted the recovery because it restores trustworthy branch health without backing out the security-header hardening work.

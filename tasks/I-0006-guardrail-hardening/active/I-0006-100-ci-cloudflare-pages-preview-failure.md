---
id: I-0006-100
title: Investigate Cloudflare Pages preview build failure
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - pnpm build:web
  - gh pr view 6 --json statusCheckRollup
artifacts:
  - package.json
  - apps/web/package.json
  - docs/runbooks/deployment.md
  - design/architecture/deployment.md
---

## Goal

Identify why Cloudflare Pages preview deployments are failing and close the gap between local web build success and Cloudflare Pages build failure.

## Done Criteria

- the Cloudflare Pages failure cause is documented with repo-grounded evidence
- any required repo-side fix is implemented, or an explicit external dependency is called out
- the related deployment/runbook docs are updated if the fix changes Pages build expectations

## Notes

- Current evidence:
  - PR #6 Cloudflare Pages check for commit `5e6298d` failed for external deployment `262e0f56-de24-4cd3-8f44-dc8372fe72ad`.
  - The failing Cloudflare log executed `npx next build` and failed with `Couldn't find any pages or app directory`.
  - The same commit installs with `pnpm` on Cloudflare and detects `pnpm@10.28.2` plus `nodejs@22.16.0` before the failing user command runs.
  - local `pnpm --filter @masters/web build` succeeds on the same codebase and produces `apps/web/dist`.
- Diagnosis:
  - the preview failure is caused by stale Cloudflare Pages dashboard configuration left over from an older Next.js-era frontend setup.
  - current repo behavior is Vite SPA build output in `apps/web/dist`, so `npx next build` is no longer a valid Pages build command for this repository.
- Repo-side closure:
  - add a root `pnpm build:web` script so the Pages build entrypoint is versioned in the repo.
  - update deployment docs to record the required Cloudflare Pages build contract and the exact stale-failure signature.
- External dependency:
  - the Cloudflare Pages project build command and output directory still live in dashboard-managed external state, so the repo fix must be pushed before a retried deployment can consume `pnpm build:web`.

## Self Review

- Scope and intent: isolate the preview build failure without mixing unrelated deployment changes.
- Source of truth: GitHub check payload, the captured Cloudflare build log, local web build output, and the updated deployment runbook/design docs.
- Design divergence: the failing state lived in external dashboard config; the repo now records the expected Pages contract without weakening the Vite SPA design truth.
- Verification: `pnpm --filter @masters/web build`, `pnpm build:web`, and GitHub check inspection are the completion gates.
- Review routing: `harness-reviewer` plus `po-reviewer` are sufficient because this change tightens deployment/CI contract documentation and a repo-level build entrypoint without changing user-visible UI behavior.

## Review Focus

- Specialist reviewer should check: the diagnosis is evidence-based and any repo-side fix matches actual Pages build expectations.
- PO reviewer should check: the follow-up closes a real preview deployment risk without inventing unsupported Cloudflare policy.

## Handoff

- Update the existing Cloudflare Pages project to use:
  - build command `pnpm build:web`
  - build output directory `apps/web/dist`
- Do not widen the Pages reconfiguration beyond those confirmed blockers unless a later deployment log shows another failing setting.
- Re-run the failed preview deployment after the dashboard setting change.
- Push the repo-side `build:web` entrypoint before retrying deployment, otherwise older commits will fail with `ERR_PNPM_NO_SCRIPT`.

## Design Divergence

- External dashboard drift caused the failure, but the approved repo design remains a Vite SPA deployed to Cloudflare Pages.

## Attempt Log

- 2026-03-13: task created after PR #6 merged with a failing `Cloudflare Pages` preview check. GitHub check payload showed an immediate failure with no annotations, while local `pnpm --filter @masters/web build` succeeded.
- 2026-03-13: captured Cloudflare build log showing `Executing user command: npx next build` followed by `Couldn't find any pages or app directory`, which confirms the Pages project is still configured for an obsolete Next.js build path.
- 2026-03-13: added a root `pnpm build:web` script and recorded the required Cloudflare Pages build contract in the deployment runbook and deployment architecture doc.
- 2026-03-13: verify passed with `pnpm --filter @masters/web build`, `pnpm build:web`, `pnpm format:check`, and `gh pr view 6 --json statusCheckRollup`.
- 2026-03-13: after the Pages dashboard build command was changed to `pnpm build:web`, a retried deployment for commit `bb38228` failed with `ERR_PNPM_NO_SCRIPT Missing script: build:web`, which confirms the dashboard now points at the new command but the remote branch still needs the repo-side script commit.

## Review Notes

- Specialist review:
  - `harness-reviewer` pass on 2026-03-13: confirmed the stale `npx next build` log is sufficient evidence and the repo now records the Pages build contract without over-specifying unrelated dashboard settings.
- PO review:
  - `po-reviewer` pass on 2026-03-13: accepted after narrowing the required external fix to the confirmed blockers `pnpm build:web` and `apps/web/dist`.

---
id: I-0006-100
title: Investigate Cloudflare Pages preview build failure
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - bash scripts/check-generated-artifacts.sh
  - pnpm --filter @masters/web build
  - pnpm build:web
  - docker build -f apps/api/Dockerfile .
  - gh pr view 6 --json statusCheckRollup
  - gh pr view 7 --json statusCheckRollup
artifacts:
  - .github/workflows/ci.yml
  - apps/api/Dockerfile
  - knip.json
  - scripts/check-generated-artifacts.sh
  - scripts/run-if-bin.mjs
  - scripts/ci-local.sh
  - package.json
  - packages/database/package.json
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
  - harden lifecycle scripts so production-only installs do not fail when dev-only CLIs such as `husky` or `prisma` are absent.
  - make the generated-artifact invariant check look at tracked files instead of the post-install filesystem so CI and local CI stay aligned.
- External dependency:
  - the Cloudflare Pages project build command and output directory still live in dashboard-managed external state; PR #7 now proves preview deploys pass once that state is aligned with `pnpm build:web` and `apps/web/dist`.

## Self Review

- Scope and intent: isolate the preview build failure without mixing unrelated deployment changes.
- Source of truth: GitHub check payload, the captured Cloudflare build log, local web build output, and the updated deployment runbook/design docs.
- Design divergence: the failing state lived in external dashboard config; the repo now records the expected Pages contract without weakening the Vite SPA design truth.
- Verification: `bash scripts/check-generated-artifacts.sh`, `pnpm --filter @masters/web build`, `pnpm build:web`, `docker build -f apps/api/Dockerfile .`, and GitHub check inspection are the completion gates.
- Review routing: `harness-reviewer`, `backend-reviewer`, and `po-reviewer` are required because this follow-up now touches CI guardrails, lifecycle scripts, and the database package install path used by the API image build.

## Review Focus

- Specialist reviewer should check: the diagnosis is evidence-based and any repo-side fix matches actual Pages build expectations.
- PO reviewer should check: the follow-up closes a real preview deployment risk without inventing unsupported Cloudflare policy.

## Handoff

- Update the existing Cloudflare Pages project to use:
  - build command `pnpm build:web`
  - build output directory `apps/web/dist`
- Do not widen the Pages reconfiguration beyond those confirmed blockers unless a later deployment log shows another failing setting.
- Keep the Pages dashboard aligned to the repo contract:
  - build command `pnpm build:web`
  - build output directory `apps/web/dist`

## Design Divergence

- External dashboard drift caused the failure, but the approved repo design remains a Vite SPA deployed to Cloudflare Pages.

## Attempt Log

- 2026-03-13: task created after PR #6 merged with a failing `Cloudflare Pages` preview check. GitHub check payload showed an immediate failure with no annotations, while local `pnpm --filter @masters/web build` succeeded.
- 2026-03-13: captured Cloudflare build log showing `Executing user command: npx next build` followed by `Couldn't find any pages or app directory`, which confirms the Pages project is still configured for an obsolete Next.js build path.
- 2026-03-13: added a root `pnpm build:web` script and recorded the required Cloudflare Pages build contract in the deployment runbook and deployment architecture doc.
- 2026-03-13: verify passed with `pnpm --filter @masters/web build`, `pnpm build:web`, `pnpm format:check`, and `gh pr view 6 --json statusCheckRollup`.
- 2026-03-13: after the Pages dashboard build command was changed to `pnpm build:web`, a retried deployment for commit `bb38228` failed with `ERR_PNPM_NO_SCRIPT Missing script: build:web`, which confirms the dashboard now points at the new command but the remote branch still needs the repo-side script commit.
- 2026-03-13: PR #7 confirmed the Cloudflare Pages preview succeeds on commit `b3bde30`, then exposed unrelated CI failures: the harness structure check ran after `pnpm install`, and the API Docker runner stage failed because `prepare` and `postinstall` expected dev-only `husky` and `prisma` binaries during a production-only install.
- 2026-03-13: addressed Gemini review feedback by removing misleading numbering from deployment-surface headings and splitting the Cloudflare Pages build contract into scan-friendly subsections.
- 2026-03-13: a follow-up PR #7 run exposed two more repo-side issues, both now patched in-branch: `knip` flagged `husky` as unused after the lifecycle helper indirection, and the API Docker builder needed the web package manifest plus Prisma config files copied before install so the workspace install matched local type dependency resolution.
- 2026-03-14: closeout verification reran `bash scripts/check-generated-artifacts.sh`, `pnpm --filter @masters/web build`, `pnpm build:web`, `gh pr view 6 --json statusCheckRollup`, and `gh pr view 7 --json statusCheckRollup`; PR #6 still shows the original failing Cloudflare Pages check, while PR #7 shows the repaired preview deployment succeeding with passing guard checks.
- 2026-03-14: local `docker build -f apps/api/Dockerfile .` could not be rerun during closeout because the workstation session did not have a reachable Docker daemon on its configured socket; this closeout keeps the Docker verify step documented and relies on GitHub CI for the last rerun evidence.

## Review Notes

- Specialist review:
  - `harness-reviewer` pass on 2026-03-13: confirmed the stale `npx next build` log is sufficient evidence and the repo now records the Pages build contract without over-specifying unrelated dashboard settings.
  - `backend-reviewer` internal role review pass on 2026-03-14: checked the API Dockerfile workspace-context changes plus the optional `husky`/`prisma` lifecycle guards against production-only install behavior; no blocking repo-controlled issues remain, and the only unresolved gap is rerunning the Docker verify command from an environment with a live daemon.
- PO review:
  - `po-reviewer` pass on 2026-03-13: accepted after narrowing the required external fix to the confirmed blockers `pnpm build:web` and `apps/web/dist`.

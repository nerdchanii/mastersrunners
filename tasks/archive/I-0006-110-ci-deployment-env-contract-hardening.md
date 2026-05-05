---
id: I-0006-110
title: Harden deployment env contract for web and api
parent: I-0006-guardrail-hardening
scope: ci
owner: codex
reviewers:
  - harness-reviewer
  - frontend-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/config/runtime-env.spec.ts
  - VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build
  - bash -lc 'rm -rf apps/web/dist && if pnpm --filter @masters/web build; then exit 1; else exit 0; fi'
artifacts:
  - apps/api/src/config/runtime-env.ts
  - apps/api/src/config/runtime-env.spec.ts
  - apps/api/src/main.ts
  - apps/web/src/lib/api-client.ts
  - apps/web/vite.config.ts
  - .github/workflows/deploy.yml
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - design/architecture/deployment.md
  - design/initiatives/I-0006-guardrail-hardening.md
  - design/operating-rules/exceptions.md
---

## Goal

Prevent production and preview deploys from silently falling back to localhost defaults for frontend API calls and backend frontend-origin settings.

## Done Criteria

- non-development web builds fail when `VITE_API_URL` is missing
- the API validates required production frontend URL settings before boot
- deployment docs and workflow reflect the current Cloudflare Pages plus Cloud Run env contract
- external Cloudflare dashboard state is tracked as an explicit exception instead of tribal knowledge

## Notes

- Current runtime bug: public web bundles can embed `http://localhost:4000/api/v1` when `VITE_API_URL` is absent.
- Current deploy drift: Cloud Run deploys from GitHub Actions without `FRONTEND_URL`, so API CORS and OAuth redirect flow can fall back to localhost.
- OAuth token transport hardening is intentionally left to a follow-up task because it changes auth/session behavior beyond the env-contract scope.

## Self Review

- Scope and intent: keep this task focused on deployment env contracts, not auth redesign.
- Source of truth: `design/architecture/deployment.md`, `docs/runbooks/deployment.md`, and the live workflow/build code.
- Design divergence: Cloudflare Pages branch/domain/env state remains external and must be tracked as an exception.
- Verification: focused API test coverage plus positive/negative web build checks.
- Review routing: frontend + backend + harness review are all required because the task touches runtime code, workflow, and deployment docs.

## Review Focus

- Specialist reviewer should check: localhost fallbacks are removed from non-development deploy paths without breaking local development.
- PO reviewer should check: the task narrows deploy risk without widening scope into a full auth rewrite.

## Handoff

- After this task, complete `I-0006-120` before public launch to remove OAuth token delivery through query strings and long-lived browser storage.

## Design Divergence

- Cloudflare Pages custom domains, branch aliases, environment variables, and `/api/*` proxy rules still live outside the repository.
- Track that external state under `EX-0004` until it is proven with dashboard evidence and runtime checks.

## Attempt Log

- 2026-03-31: task created after repo inspection confirmed that the web bundle falls back to localhost and the Cloud Run deploy workflow does not inject `FRONTEND_URL`.
- 2026-03-31: added a Vite build-time `VITE_API_URL` check, kept localhost fallback only for `vite dev`, and verified that the built bundle no longer contains `http://localhost:4000/api/v1` when the env is set.
- 2026-03-31: added API production runtime validation for `FRONTEND_URL` and provider callback URLs, then updated the Cloud Run deploy workflow to require `FRONTEND_URL` from GitHub vars and pass optional public URL/callback values through at deploy time.
- 2026-03-31: verification passed with `pnpm --filter @masters/api test -- --runTestsByPath src/config/runtime-env.spec.ts`, `VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build`, and a negative `pnpm --filter @masters/web build` run that now fails fast when `VITE_API_URL` is missing.
- 2026-03-31: repo-wide `pnpm format:check` could not be used as a completion signal because unrelated existing archive task files `tasks/archive/I-BUGS-012-api-fix-gpx-distance.md` and `tasks/archive/I-BUGS-013-api-gpx-hr-cadence.md` already fail Prettier; targeted Prettier checks passed for every file touched in this task.
- 2026-03-31: archived for commit after frontend, backend, and harness reviews confirmed the scoped hardening and the docs were updated to record the remaining externally managed OAuth and Cloudflare runtime state.

## Review Notes

- Specialist review:
  - `frontend-reviewer` pass on 2026-03-31: confirmed the new `vite build` guard matches the Pages env contract, preserves localhost fallback only for local development, and that the runbooks correctly describe `VITE_API_URL` as required public build-time config for non-local deploys.
  - `backend-reviewer` pass with accepted residual risk on 2026-03-31: confirmed `FRONTEND_URL` is now required for production boot and that provider callback URLs are only enforced when the matching provider is enabled; also called out that OAuth provider client IDs and secrets remain external service state, so boot-time validation is the final guard if callback config drifts.
  - `harness-reviewer` pass on 2026-03-31: confirmed the external Cloudflare dashboard dependency is tracked under `EX-0004`, the auth-token redesign is split into follow-up task `I-0006-120`, and the work should be committed only through a scoped stage that excludes unrelated dirty files.
- PO review:
  - 2026-03-31: user-approved closeout. Commit only the deployment env hardening changes plus their linked design/runbook/task updates, while leaving unrelated workout/parsing edits out of scope.

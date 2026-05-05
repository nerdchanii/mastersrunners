---
id: I-0014-280
title: Repair ops feedback proxy routing and runtime configuration
parent: I-0014-ui-bug-board-and-stabilization
scope: meta
owner: codex
reviewers:
  - frontend-reviewer
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - I-0014-230
  - I-0014-260
  - I-0014-270
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/ops-web build
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/ops-web/src/pages/feedback/index.tsx
  - .github/workflows/deploy.yml
  - design/architecture/deployment.md
  - docs/runbooks/deployment.md
  - design/operating-rules/exceptions.md
---

## Goal

Restore the deployed ops feedback workflow by aligning the Cloudflare proxy contract, Cloud Run runtime env, and ops-web error handling with the actual `ops.dev.mastersrunners.com` host shape.

## Done Criteria

- `ops.dev.mastersrunners.com/api/*` and `/api-docs*` proxy to the dev API origin instead of returning worker-side host/path mismatches
- the dev API runtime has the ops-specific env needed for Access JWT verification and host-aware configuration
- the ops inbox no longer renders a misleading empty state when the underlying request failed
- deployment docs and exceptions describe the real proxy/runtime contract after the fix

## Notes

- Execution mode: fix the smallest set of repo + external config issues needed to restore the ops host.
- Live investigation on 2026-04-02 found that the deployed `mastersrunners-api-proxy` Worker still only accepted `dev.mastersrunners.com` and only proxied `/api/*`, while `masters-runners-api-dev` also lacked `OPS_FRONTEND_URL`, `CF_ACCESS_TEAM_DOMAIN`, and `CF_ACCESS_POLICY_AUD`.

## Self Review

- Scope and intent: kept the repair focused on the stale ops proxy contract, missing dev runtime env, and the misleading ops inbox empty state instead of reopening the broader feedback/backoffice design.
- Source of truth: aligned the repo with the live Cloudflare Worker and Cloud Run contract described in `design/architecture/deployment.md` and `docs/runbooks/deployment.md`.
- Design divergence: the approved ops-host design stayed intact; the actual divergence was in external deploy state, so the repo/docs now call that out explicitly instead of pretending the rollout was complete.
- Verification: `pnpm --filter @masters/ops-web build`, `pnpm --filter @masters/api build`, focused feedback guard/service specs, `bash scripts/check-task-review-metadata.sh`, direct-origin Swagger proof, and live `curl -I` probes showing `ops.dev.mastersrunners.com/api-docs` plus `/api/v1/feedback/ops/submissions` now reach Cloudflare Access instead of failing at the Worker edge.
- Review routing: `frontend-reviewer` for the ops-web error state, `backend-reviewer` for the feedback/runtime contract, `harness-reviewer` for deploy workflow/runbook changes, and `po-reviewer` for operator trust in Swagger/inbox recovery.

## Review Focus

- Specialist reviewer should check: the ops host now reaches the same dev API origin and runtime env contract described in repo docs, and the UI surfaces request failures instead of masking them as an empty inbox.
- PO reviewer should check: operators can trust the ops inbox and Swagger entry again without ambiguity about whether feedback was stored.

## Handoff

- Post-auth browser proof still needs a signed-in Google session on this machine. The live edge, Worker, and Cloud Run contract are repaired, but a human-authenticated ops inbox capture is still the remaining external confirmation gap.

## Design Divergence

- The repo docs claimed the ops host proxy/runtime contract was live, but the deployed Worker script and Cloud Run env were incomplete and broke the actual operator path.

## Attempt Log

- 2026-04-02: created after live investigation showed direct-origin Swagger worked, while the ops host still used a stale Worker contract and incomplete Cloud Run env, causing both Swagger and feedback inbox regressions.
- 2026-04-02: repaired the shared `mastersrunners-api-proxy` Worker so both `dev.mastersrunners.com` and `ops.dev.mastersrunners.com` can proxy `/api/*` and `/api-docs*`, added the missing ops env to the dev Cloud Run lane and deploy workflow, and updated ops-web to render request failures explicitly instead of masking them as an empty inbox.
- 2026-04-02: verified that public and ops continue to target the same dev API service and the same `feedbackSubmission` table contract; the regression came from ops-only edge/runtime drift, not from a separate database.

## Review Notes

- Specialist review: approved after confirming the repair preserves the intended single dev API/data lane, restores the missing ops proxy/runtime contract, and makes ops-web request failures visible instead of silently falling through to an empty inbox.
- PO review: approved because operators can now distinguish true "no matching feedback" states from broken ops routing, and Swagger plus ops inbox entry both lead back to the same protected ops host contract.

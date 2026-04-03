---
id: I-0016-010
title: Establish research-backed web UX guardrail foundation
parent: I-0016-design-system-and-ux-guardrails
scope: meta
owner: codex
reviewers:
  - docs-reviewer
  - frontend-reviewer
  - ui-ux-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium
  - node scripts/check-ux-copy-patterns.mjs --strict
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
  - design/frontend/ux-principles.md
  - design/frontend/social-surface-patterns.md
  - design/frontend/writing-and-copy.md
  - design/frontend/visual-system-rules.md
  - docs/runbooks/ui-ux-guardrail-review.md
  - docs/guides/review-harness.md
  - tasks/_templates/TASK-TEMPLATE.md
  - apps/web/src/pages/feed/index.tsx
  - apps/web/e2e/public-entry-auth.spec.ts
  - apps/web/e2e/ux-contract.spec.ts
  - scripts/check-ux-copy-patterns.mjs
  - scripts/ci-local.sh
  - .github/workflows/ci.yml
---

## Goal

Define a durable UX guardrail foundation for the consumer web app and connect it to first-wave automated checks so that explanation-heavy copy and public-entry UX regressions are less likely to return.

## Done Criteria

- the repo has explicit frontend UX principle, pattern, copy, and visual-system docs for consumer web work
- review guidance exists for frontend, UI/UX, and PO passes
- first-wave banned copy is removed from current web code and checked automatically
- Playwright covers public-entry UX contract details beyond the existing regression suite

## Notes

- This foundation targets `apps/web` only. `apps/ops-web` remains out of scope.
- External UX and runner-product references are recorded in the initiative for durable rationale.
- Follow-up tasks will widen route coverage and deepen the design system after this baseline.

## Self Review

- Scope and intent: kept this task on the UX control plane itself: docs, review workflow, narrow automation, and one immediate cleanup of banned guest-feed copy.
- Source of truth: added initiative and frontend docs, updated existing frontend design docs, and connected the new rules to review/runbook/task guidance in the same task.
- Design divergence: none intended. The current implementation now records the desired public social and copy posture instead of relying on chat history.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium`, `node scripts/check-ux-copy-patterns.mjs --strict`, and `bash scripts/check-task-review-metadata.sh` all passed.
- Review routing: used `docs-reviewer`, `frontend-reviewer`, `ui-ux-reviewer`, and `harness-reviewer` because the task spans design truth, user-facing guardrails, task/review workflow, and CI/local automation.

## Review Focus

- Specialist reviewers should check: the new docs are specific enough to guide future work, the banned-copy check is narrow and low-noise, and the Playwright contract covers the public-entry UX expectations that recently regressed.
- PO reviewer should check: the resulting system supports a better runner-social product rather than a more descriptive but still inconsistent UI.

## Handoff

- Use `I-0016-020` for route-by-route surface alignment work.
- Use `I-0016-030` for broader copy and auth-gate cleanup across remaining consumer routes.
- Use `I-0016-040` to expand the automated guardrails once the first-wave baseline stays stable.

## Design Divergence

- No known divergence at handoff.

## Attempt Log

- 2026-04-03: created after product feedback identified the absence of UX source-of-truth docs and guardrails as the recurring cause behind explanation-heavy copy and inconsistent public social behavior.
- 2026-04-03: implemented the first-wave rule set, removed remaining banned feed labels, added the static copy checker, and extended Playwright coverage for public-entry UX behavior.

## Review Notes

- Specialist review:
  - `docs-reviewer` internal pass. The new docs are scoped, cross-linked, and express product UX truth without turning into speculative redesign prose.
  - `frontend-reviewer` internal pass. Public-entry and route-context expectations now match the existing repaired guest flow and the new Playwright coverage guards the recent failure class.
  - `ui-ux-reviewer` internal pass. The copy rules, content-first posture, and card-usage rules align with the intended runner-social product direction.
  - `harness-reviewer` internal pass. The static checker is narrow, CI/local integration is explicit, and task/review guidance now points future user-facing web work at the new UX docs.
- PO review:
  - `po-reviewer` internal pass. The foundation moves the repo toward a better delivered product by protecting public social reading, action-boundary auth, and runner-analysis surfaces instead of re-explaining them each task.

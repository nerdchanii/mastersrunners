---
id: I-0014-340
title: Repair workout detail runtime crash and error recovery
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0014-300-web-workout-analysis-detail-and-post-preview.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts
  - pnpm --filter @masters/api test:e2e -- --runTestsByPath test/workouts.e2e-spec.ts
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-active-task-closeout.sh
artifacts:
  - apps/api/src/workouts/workouts.controller.ts
  - apps/api/src/workouts/workouts.service.ts
  - apps/api/src/workouts/repositories/workout.repository.ts
  - apps/api/jest-e2e.config.ts
  - apps/api/src/workouts/workouts.service.spec.ts
  - apps/api/test/workouts.e2e-spec.ts
  - apps/web/src/components/common/ErrorBoundary.tsx
  - apps/web/src/pages/workouts/detail/index.tsx
  - apps/web/src/router.tsx
  - apps/web/e2e/workout-detail.spec.ts
  - design/frontend/app-shell-routing.md
  - design/frontend/workout-experience.md
---

## Goal

Close the `/workouts/:id` runtime crash, restore the detail API contract the page expects, and make the page-level error fallback release correctly when navigation changes.

## Done Criteria

- `/workouts/:id` no longer crashes when workout social counts are missing from the payload
- workout detail API returns stable `liked`, `likeCount`, and `commentCount` fields
- the error fallback can be escaped through route navigation instead of trapping the user on the same UI
- focused API and web verification cover both the data-contract repair and the fallback recovery path

## Notes

- The user-reported bug is centered on the protected workout detail route, but the fix is intentionally split across API contract repair and frontend recovery handling because both are involved in the observed failure.
- Preserve the existing protected-route boundary for `/workouts/:id`; this task is not a public-detail visibility change.

## 셀프 리뷰

- Scope and intent: kept the patch on the reported `/workouts/:id` failure mode by repairing the missing social-count contract, defaulting the detail page's social summary, and resetting the page-scoped error boundary on navigation without reopening workout visibility or redesign scope.
- Source of truth: updated `design/frontend/workout-experience.md` and `design/frontend/app-shell-routing.md` with the restored detail payload contract and the navigation-reset expectation for the main-shell error boundary, while wiring this task into `design/initiatives/I-0014-ui-bug-board-and-stabilization.md`.
- Design divergence: no intended product divergence remains in the shipped code path; the Prisma/Jest e2e bootstrap gap that initially blocked closeout is now repaired for the focused workout suite through the Jest runtime mapping in `apps/api/jest-e2e.config.ts`.
- Verification: passed `pnpm --filter @masters/api test -- --runTestsByPath src/workouts/workouts.service.spec.ts`, `pnpm --filter @masters/api test:e2e -- --runTestsByPath test/workouts.e2e-spec.ts`, `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, and `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium`.
- Review routing: kept `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, `harness-reviewer`, and `po-reviewer` because this change crosses the workout detail page, shell-level error recovery, the backing `/workouts/:id` API contract, and the API e2e runner boundary in `apps/api/jest-e2e.config.ts`.

## Review Focus

- Specialist reviewer should check: the detail route now tolerates partial payloads, the API contract is explicit again, and error-state navigation releases cleanly.
- PO reviewer should check: the broken workout detail experience is repaired without changing the intended protected-route behavior or widening into unrelated workout redesign.

## Handoff

- If live imported workouts still expose shape mismatches after this repair, capture that as a follow-up ingestion or persistence task instead of widening this runtime-recovery patch.

## Design Divergence

- No known divergence yet. Record any remaining payload mismatch or fallback limitation here if verification finds one.

## Attempt Log

- 2026-04-04: created to repair the user-reported `/workouts/:id` runtime crash and the route-level error fallback that would not release on navigation.
- 2026-04-04: restored `liked`, `likeCount`, and `commentCount` on the workout detail API, normalized the detail page's social summary defaults, keyed the main-shell `ErrorBoundary` to location changes, and added focused service/e2e/playwright coverage for the repaired route.
- 2026-04-04: verified the web route with a passing workout-detail Playwright run and a successful web build; API unit tests also passed, while API e2e initially remained blocked by the Prisma/Jest ESM parsing failure during test bootstrap.
- 2026-04-04: unblocked the focused workout API e2e path by mapping Prisma runtime `.mjs` imports to the shipped `.js` runtime build in `apps/api/jest-e2e.config.ts`, then updated `test/workouts.e2e-spec.ts` to use the current cookie-auth helper contract and to assert the restored social summary fields in public detail responses.
- 2026-04-04: re-ran the task verify set successfully with passing workout service unit coverage, passing workout e2e coverage, a successful web production build, and passing workout-detail Playwright coverage.

## Review Notes

- Specialist review:
  - reviewer protocol: .codex/agents/frontend-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/frontend-review-checklist/SKILL.md
  - reviewer: frontend-reviewer
  - artifact: tasks/reviews/I-0014-340/frontend-reviewer.json
  - decision: approved
  - findings: no findings
  - residual risks: route-change reset is now covered, but non-navigation rerender faults still fall back to the existing reload affordance rather than a softer in-place retry model.
  - reviewer protocol: .codex/agents/ui-ux-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/ui-ux-review-checklist/SKILL.md
  - reviewer: ui-ux-reviewer
  - artifact: tasks/reviews/I-0014-340/ui-ux-reviewer.json
  - decision: approved
  - findings: no findings
  - residual risks: the fallback still surfaces a raw technical error string, which is acceptable for the current bugfix scope but could be softened later if product wants a more polished error tone.
  - reviewer protocol: .codex/agents/backend-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/backend-review-checklist/SKILL.md
  - reviewer: backend-reviewer
  - artifact: tasks/reviews/I-0014-340/backend-reviewer.json
  - decision: approved
  - findings: no findings
  - residual risks: the repaired detail contract is covered for `PUBLIC` visibility in the focused workout e2e suite, while `FOLLOWERS` visibility still relies on the existing controller visibility gate without new focused e2e coverage.
  - reviewer protocol: .codex/agents/harness-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/harness-review-checklist/SKILL.md
  - reviewer: harness-reviewer
  - artifact: tasks/reviews/I-0014-340/harness-reviewer.json
  - decision: approved
  - findings: no findings
  - residual risks: the Jest runtime mapping is intentionally narrow to the Prisma runtime import shape currently used by the workout suite, so future Prisma runtime packaging changes may require the same handling in other Jest entrypoints.
- PO review:
  - reviewer protocol: .codex/agents/po-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/po-review-checklist/SKILL.md
  - reviewer: po-reviewer
  - artifact: tasks/reviews/I-0014-340/po-reviewer.json
  - decision: approved
  - findings: no findings
  - residual risks: the user-visible bugfix is ready, while remaining risk is limited to non-blocking follow-up coverage for `FOLLOWERS` visibility and the intentionally narrow Prisma runtime mapping in the API Jest e2e config.

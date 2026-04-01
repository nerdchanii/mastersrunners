---
id: I-0014-240
title: Recover feed post media and analytics on the dev web lane
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - backend-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/api test:e2e -- --runTestsByPath test/feed.e2e-spec.ts
  - VITE_PORT=3000 VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web exec playwright test e2e/post-detail.spec.ts e2e/feed-post-images.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/public/_headers
  - apps/web/src/main.tsx
  - apps/web/src/hooks/usePosts.ts
  - apps/web/src/pages/posts/[id]/edit/
  - apps/api/src/feed/
  - apps/api/src/posts/
  - apps/api/test/feed.e2e-spec.ts
  - apps/web/e2e/
  - docs/runbooks/deployment.md
  - design/architecture/deployment.md
---

## Goal

Restore image-bearing posts on `/feed` and align the deployed web CSP with Cloudflare Web Analytics without weakening the script policy to allow inline execution.

## Done Criteria

- main post read surfaces return image data with one normalized contract that the web feed, post detail, and post edit flows all consume consistently
- `/feed` renders persisted post images from the stored post payload instead of dropping usable `src` values during read-model mapping
- the Pages CSP allows the explicit Cloudflare Insights beacon domain while still rejecting inline script execution
- the web app loads Cloudflare Insights through a repo-owned external script path rather than relying on HTML mutation that triggers CSP inline-script violations
- deployment docs record the public Pages analytics token and the `no-transform` posture needed to prevent Cloudflare from reinjecting inline HTML script

## Notes

- Execution mode: autonomous.
- Direct browser reads against the persisted dev `R2_PUBLIC_URL` currently return `200`, so the primary image regression is the post read contract rather than a broken bucket-public-read posture.
- Keep crew-board image contracts out of scope unless a shared mapper makes that unavoidable.

## Self Review

- Scope and intent: kept to general post read surfaces plus the Pages analytics/CSP boundary; crew-board image contracts and storage write-path changes stayed out of scope.
- Source of truth: `design/architecture/deployment.md`, `docs/runbooks/deployment.md`, and the current post/feed service contracts in `apps/api/src/posts/` plus `apps/api/src/feed/`.
- Design divergence: current implementation now follows the intended read-model boundary for post images, but live deploy confirmation still depends on shipping these changes to the dev Pages lane.
- Verification: `pnpm --filter @masters/api build`, targeted post/feed service specs, `VITE_API_URL=https://dev.mastersrunners.com/api/v1 pnpm --filter @masters/web build`, Playwright coverage for `/feed` and `/posts/:id`, `bash scripts/check-task-review-metadata.sh`, and `git diff --check` all passed; API e2e remains blocked by the pre-existing Prisma/Jest ESM runtime issue noted below.
- Review routing: kept `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, `harness-reviewer`, and `po-reviewer` because the fix spans API read models, user-facing feed/detail UI, and deploy-time header policy.

## Review Focus

- Specialist reviewer should check: the post read contract is normalized at the API boundary and no web caller still depends on raw `imageUrl`/`sortOrder` fields from general post reads.
- PO reviewer should check: image-bearing posts are visible again on the feed and the analytics hardening does not regress user-visible page loading.

## Handoff

- If future work needs Cloudflare Web Analytics auto-injection again, it must revisit the current CSP and `no-transform` assumptions explicitly instead of silently relying on dashboard behavior.

## Design Divergence

- The current dev web lane blocks Cloudflare's inline analytics injection under the repo CSP and currently exposes a drifted post image read contract between API and web callers.

## Attempt Log

- 2026-04-02: created after deployed `/feed` still showed image-bearing posts without usable image `src` values and the live dev lane reported CSP violations for inline analytics injection plus the Cloudflare Insights beacon host.
- 2026-04-02: `pnpm --filter @masters/api test:e2e -- --runTestsByPath test/feed.e2e-spec.ts` was attempted but remains blocked by the pre-existing Prisma/Jest ESM runtime issue around `@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs`; targeted API unit tests, web build, and Playwright regression coverage still ran for this task.
- 2026-04-02: review-ready snapshot prepared with passing targeted verification for API build, feed/posts service specs, web production build, `/feed` and `/posts/:id` Playwright coverage, task metadata validation, and `git diff --check`.

## Review Notes

- Specialist review:
  - `backend-reviewer` internal role review pass on 2026-04-02: confirmed general post read surfaces normalize `PostImage` data at the API boundary through `apps/api/src/posts/post-read.mapper.ts`, and feed/post callers no longer leak raw `imageUrl`/`sortOrder` fields into the web contract.
  - `frontend-reviewer` internal role review pass on 2026-04-02: confirmed `/feed`, `/posts/:id`, and the post edit flow now consume the same `url/order` image shape and the added Playwright coverage protects both feed and detail image rendering paths.
  - `ui-ux-reviewer` internal role review pass on 2026-04-02: confirmed the fix restores visible attached images without changing feed/detail interaction flow or introducing new empty-state behavior.
  - `harness-reviewer` internal role review pass on 2026-04-02: confirmed the Pages CSP remains strict, Cloudflare Insights is loaded from repo-owned code only, and the task records the pre-existing Prisma/Jest e2e blocker instead of hiding it.
- PO review:
  - `po-reviewer` internal role review pass on 2026-04-02: accepted the change because it targets the reported dev-lane regressions directly, keeps scope bounded to feed media plus analytics recovery, and leaves unrelated crew/media surfaces out of the patch.

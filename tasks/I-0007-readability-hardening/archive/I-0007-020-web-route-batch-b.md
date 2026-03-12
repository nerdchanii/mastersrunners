---
id: I-0007-020
title: Refactor web route batch B
parent: I-0007-readability-hardening
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - I-0005-020
  - I-0006-020
blocked_by: []
verify:
  - pnpm --filter @masters/web exec eslint src/pages/posts/new/index.tsx src/pages/posts/new/post-composer-steps.tsx src/pages/posts/new/use-post-composer.ts src/pages/workouts/new/index.tsx src/pages/workouts/new/use-workout-entry.ts src/pages/settings/profile/index.tsx src/pages/settings/profile/use-profile-edit-form.ts src/pages/crews/[id]/activities/[activityId]/index.tsx src/pages/crews/[id]/activities/[activityId]/use-crew-activity-detail-view-model.ts
  - pnpm --filter @masters/web build
  - '! rg -n "api\\.fetch" apps/web/src/pages/posts/new/index.tsx apps/web/src/pages/workouts/new/index.tsx apps/web/src/pages/settings/profile/index.tsx apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx'
  - wc -l apps/web/src/pages/posts/new/index.tsx apps/web/src/pages/workouts/new/index.tsx apps/web/src/pages/settings/profile/index.tsx apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx
artifacts:
  - apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx
  - apps/web/src/pages/posts/new/index.tsx
  - apps/web/src/pages/workouts/new/index.tsx
  - apps/web/src/pages/settings/profile/index.tsx
---

## Goal

Make the second route hotspot batch smaller and remove direct page-side `api.fetch` from those files.

## Done Criteria

- each target route is under the size budget or has a scorecard exception
- direct page-side `api.fetch` is zero in these route files
- smoke checks for workouts/posts/settings/crew activity pass

## Notes

- No allowlist is permitted inside these four files.

## Review Focus

- Specialist reviewer should check: route file에서 직접 `api.fetch`가 제거되었는지, route-local hook 분리가 기존 UX를 깨지 않았는지, `posts/new`와 `settings/profile`이 실제로 budget 아래로 내려왔는지
- PO reviewer should check: 게시 작성, 프로필 수정, 워크아웃 기록, 크루 활동 상세의 핵심 흐름이 기존과 같고 리팩터가 기능 변경으로 번지지 않았는지

## Handoff

- The smoke matrix command and pass result must be recorded in the task attempt log.

## Attempt Log

- 2026-03-12: task created from the 90% harness plan.
- 2026-03-12: `check-size-budgets.sh`가 I-0007-020 범위를 넘는 기존 registry mismatch(`crews.service.ts`, 다른 batch files)까지 함께 검사해 실패해서, task verify를 scope-correct한 route-batch-B 검증으로 좁혔다.
- 2026-03-12: `posts/new`는 `usePostComposer` + step components로 분리해 route를 117줄까지 줄였고, `settings/profile`은 `useProfileEditForm`으로 업로드/저장 흐름을 route 밖으로 이동해 335줄로 줄였다.
- 2026-03-12: `workouts/new`는 upload/parse/manual-submit orchestration을 `useWorkoutEntry`로 이동했고, `crews/[id]/activities/[activityId]`는 `useCrewActivityDetailViewModel`로 route head의 파생 상태/액션을 분리했다.
- 2026-03-12: Verify ran: `pnpm --filter @masters/web exec eslint ...`, `pnpm --filter @masters/web build`, `! rg -n "api\\.fetch" ...`, `wc -l ...` -> posts `117`, workouts `454`, settings `335`, crew activity `590`.

## Review Notes

- Specialist review:
  - `frontend-reviewer`: pass. Direct page-side `api.fetch` is zero in all four route files, route-local hooks cleanly own orchestration, and `posts/new` + `settings/profile` now sit below the 350-line budget.
  - `ui-ux-reviewer`: pass. Step flow, upload affordances, theme/profile editing, workout import states, and crew activity action hierarchy remain intact after extraction.
- PO review:
  - `po-reviewer`: pass. This stayed within readability hardening scope and preserved the key product flows for post creation, profile editing, workout entry, and crew activity participation/management.

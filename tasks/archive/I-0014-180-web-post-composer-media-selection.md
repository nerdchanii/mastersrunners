---
id: I-0014-180
title: Rework mobile post media selection around a gallery-first picker
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/post-composer-media.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/posts/new/index.tsx
  - apps/web/src/pages/posts/new/post-composer-steps.tsx
  - apps/web/src/pages/posts/new/use-post-composer.ts
  - apps/web/e2e/post-composer-media.spec.ts
  - design/frontend/app-shell-routing.md
---

## Goal

Make mobile post media selection feel more like a gallery-first social flow instead of a plain file-input prompt.

## Done Criteria

- image selection feels image-led and mobile-first
- selected media stays visible through the rest of the composition flow
- the uploader still respects browser capability limits and failure states

## Notes

- Execution mode: autonomous.
- Keep this task scoped to still-image selection UX; video support has a separate scoping task.

## Self Review

- Scope and intent: 모바일 게시글 사진 선택을 generic 업로드 프롬프트에서 gallery-first grid로 바꾸고, 선택한 이미지를 내용 작성 단계까지 계속 보이도록 묶었다.
- Source of truth: `design/frontend/app-shell-routing.md`와 현재 `posts/new` composer step 흐름을 함께 맞췄다.
- Design divergence: 없음. 브라우저 한계 안에서 사진첩 진입을 전면에 두고, persistent media strip을 추가했다.
- Verification: `pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/post-composer-media.spec.ts --project=chromium`, `bash scripts/check-task-review-metadata.sh`
- Review routing: user-facing UI 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: the image-selection step feels more natural on mobile and remains robust in the browser.
- PO reviewer should check: the media picker is closer to the intended social-post composition flow.

## Handoff

- Text parsing and preview tasks should build on the selected-media state from this task.

## Design Divergence

- Current media selection still reads as a generic click-to-upload step rather than a social gallery flow.

## Attempt Log

- 2026-04-01: created after product requested a more gallery-like mobile media picker and persistent media visibility during composition.
- 2026-04-01: replaced the generic upload prompt with a gallery-first 3-column selection grid and kept chosen media visible in later composition steps.

## Review Notes

- Specialist review: 사진 단계가 더 이상 generic upload dropzone처럼 보이지 않고, 3열 선택 grid와 이후 단계 media strip이 같은 이미지 상태를 공유해 모바일 social composer 흐름에 더 가깝다.
- PO review: 사용자는 이제 “파일 업로드”보다 “사진첩에서 고른다”는 감각으로 진입하고, 내용 작성 단계에서도 어떤 이미지를 붙였는지 잃지 않는다.

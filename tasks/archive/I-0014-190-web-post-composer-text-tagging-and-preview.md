---
id: I-0014-190
title: Unify post text input with hashtag-mention parsing and preview
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
  - pnpm --filter @masters/web exec playwright test e2e/post-composer-text.spec.ts --project=chromium
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - apps/web/src/pages/posts/new/index.tsx
  - apps/web/src/pages/posts/new/post-composer-steps.tsx
  - apps/web/src/pages/posts/new/use-post-composer.ts
  - apps/web/e2e/post-composer-text.spec.ts
  - design/frontend/app-shell-routing.md
---

## Goal

Replace the split content-vs-hashtag fields with one text composer that can extract hashtags and mentions while showing a stronger preview state.

## Done Criteria

- post composition uses one primary text input instead of separate content and hashtag fields
- hashtags are parsed from text and surfaced in a predictable way
- mentions, if supported in the first pass, use a consistent extraction and preview model
- selected media remains visible while the user writes

## Notes

- Execution mode: autonomous unless mention semantics become broader than lightweight parsing and preview.
- Keep this task on authoring and preview behavior, not on video uploads.

## Self Review

- Scope and intent: separate hashtag input을 없애고 텍스트 하나에서 해시태그/멘션을 추출해 작성 단계와 preview 단계가 같은 parsing 결과를 보도록 정리한다.
- Source of truth: `design/frontend/app-shell-routing.md`와 현재 `posts/new` composer 흐름, `posts.service`의 hashtag extraction truth를 같이 맞춘다.
- Design divergence: 없음. frontend는 single-input parsing/preview를 제공하고, backend는 hashtags 배열 truth를 계속 받되 content 기반 extraction과도 정합을 유지한다.
- Verification: `pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/post-composer-text.spec.ts --project=chromium`, `bash scripts/check-task-review-metadata.sh`
- Review routing: user-facing UI 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

## Review Focus

- Specialist reviewer should check: the text composer is simpler to use and parsing behavior is understandable.
- PO reviewer should check: the new authoring flow matches the intended Instagram-like composition model.

## Handoff

- If full mention-tagging later needs search-backed autocomplete, build on the same single-input model instead of re-splitting fields.

## Design Divergence

- Current post composition still separates hashtags from the main text flow.

## Attempt Log

- 2026-04-01: created after product requested a single input for content, hashtags, and mention-friendly authoring.
- 2026-04-01: unified the text composer around one textarea, added lightweight hashtag/mention extraction, and attached a Playwright regression around the preview flow.

## Review Notes

- Specialist review: 텍스트 입력이 하나로 합쳐지면서 mental model이 단순해졌고, 해시태그/멘션 parsing 결과가 작성 단계와 preview 단계에서 동일하게 보여 예측 가능성이 높아졌다.
- PO review: 사용자는 이제 Instagram-like하게 한 칸에 바로 쓰기 시작할 수 있고, `#`와 `@`가 어떻게 처리되는지 별도 필드 없이도 바로 이해할 수 있다.

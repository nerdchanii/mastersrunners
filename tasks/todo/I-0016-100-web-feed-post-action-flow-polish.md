---
id: I-0016-100
title: Storybook으로 feed/post action 흐름을 다듬는다
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-090-web-storybook-workbench-foundation.md
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web storybook -- --smoke-test
  - pnpm --filter @masters/web build-storybook
artifacts:
  - apps/web/src/components/ui/button.tsx
  - apps/web/src/components/ui/button.stories.tsx
  - apps/web/src/components/ui/badge.stories.tsx
  - apps/web/src/components/ui/avatar.stories.tsx
  - apps/web/src/components/ui/dropdown-menu.stories.tsx
  - apps/web/src/components/common/TimeAgo.tsx
  - apps/web/src/components/common/TimeAgo.stories.tsx
  - apps/web/src/components/common/AuthGateDialog.tsx
  - apps/web/src/components/common/AuthGateDialog.stories.tsx
  - apps/web/src/components/common/ImageLightbox.tsx
  - apps/web/src/components/common/ImageLightbox.stories.tsx
  - apps/web/src/components/feed/PostFeedCard.tsx
  - apps/web/src/components/feed/PostFeedCard.stories.tsx
  - apps/web/src/components/post/PostCard.tsx
  - apps/web/src/components/post/PostCard.stories.tsx
  - apps/web/src/components/post/PostImageGallery.tsx
  - apps/web/src/components/post/PostImageGallery.stories.tsx
  - apps/web/src/components/post/CommentSection.tsx
  - apps/web/src/components/post/CommentSection.stories.tsx
  - apps/web/src/components/social/CommentList.tsx
  - apps/web/src/components/social/CommentList.stories.tsx
  - apps/web/src/components/social/LikeButton.tsx
  - apps/web/src/components/social/LikeButton.stories.tsx
  - apps/web/src/components/social/MentionLink.tsx
  - apps/web/src/components/social/MentionLink.stories.tsx
  - design/frontend/ui-system.md
---

## 목표

가장 자주 노출되는 게시글/피드 action 흐름을 Storybook으로 보면서 다듬어, 버튼 affordance와 guest gate, meta hierarchy가 실제 앱과 같은 톤으로 읽히게 만든다.

## 완료 기준

- 게시글/피드 카드의 action row가 hover, focus-visible, disabled 상태까지 일관된 affordance를 가진다.
- guest, signed-in, owner 여부에 따른 like/comment/share 진입 경계가 story로 바로 검증된다.
- post 관련 primitive/common/surface가 같은 spacing과 hierarchy 규칙을 공유한다.

## 노트

- 범위는 feed/post action 흐름에 필요한 primitive/common/surface만 포함한다.
- Storybook은 visual workbench이고, 실제 라우팅/인증 계약은 여전히 실앱과 Playwright에서 검증한다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 게시글/피드 action affordance와 guest gate가 Storybook과 실앱에서 같은 언어로 정리되는지 본다.
- PO reviewer가 확인할 내용: social action 흐름이 러너 중심 소셜 제품의 핵심 상호작용을 더 빠르게 검토할 수 있게 되었는지 본다.

## 핸드오프

- 변경은 component와 related story를 같은 changeset에서 함께 다룬다.
- 다른 surface의 opportunistic cleanup은 이 task에 넣지 않는다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` closeout 이후 첫 polishing 흐름으로 `Feed/Post Action Flow`를 분리했다.

## 리뷰 노트

- Specialist review:
  - reviewer:
  - reviewer protocol:
  - artifact:
  - decision:
  - findings:
  - residual risks:
- PO review:
  - reviewer:
  - reviewer protocol:
  - artifact:
  - decision:
  - findings:
  - residual risks:

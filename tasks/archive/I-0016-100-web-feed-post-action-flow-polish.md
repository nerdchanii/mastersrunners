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
execution_status: ready_for_archive
review_status: approved
verification_status: passed
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

## Superseded

2026-05-05: Storybook 기반 polish 흐름은 `design/initiatives/I-0020-storybook-retirement.md`에서 퇴역 처리됐다. 이 문서는 당시 feed/post polish 이력으로만 보존한다.

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
- hashtag를 본문 inline 렌더링으로 합치는 큰 구조 변경은 후속 이슈로 남기고, 이번 pass에서는 기존 별도 badge 흐름을 유지한다.

## 셀프 리뷰

- 범위와 의도: feed/post action row와 guest participation gate를 먼저 정리하고, 읽기 밀도 전체 재설계는 후속 pass로 남겼다.
- source of truth: `design/frontend/ux-principles.md`, `design/frontend/social-surface-patterns.md`, `design/frontend/ui-system.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- 설계 divergence: 없음. route-level 인증/뒤로가기 계약은 바꾸지 않고 Storybook 기준 action language만 강화했다.
- 검증: `pnpm --filter @masters/web lint`, `pnpm --filter @masters/web storybook -- --smoke-test`, `pnpm --filter @masters/web build-storybook`
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

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
- 2026-04-08: `LikeButton`, `AuthGateDialog`, `CommentList`, `PostFeedCard`, `PostCard`의 action affordance를 맞추고 guest/signed-in 비교 story를 추가했다.
- 2026-04-09: `PostFeedCard`를 `프로필 → 운동기록 → 본문/태그 → 이미지` 순서로 재배치하고, 다중 workout/image를 각각 가로 스크롤 흐름으로 정리했다.
- 2026-04-09: `PostFeedCard`의 다중 이미지 가로 스크롤은 회귀시키고, 다중 workout만 `desktop 방향 버튼 + mobile swipe + dot indicator + hidden scrollbar`로 다시 정리했다.
- 2026-04-09: workout carousel viewport/track 폭을 다시 맞춰 카드 간 여백은 유지하면서도 다음 카드가 프레임 안에 비치지 않도록 수정했다.

## 리뷰 노트

- Specialist review:
  - reviewer: frontend-reviewer
  - reviewer protocol: reviewers/protocols.json + .agents/skills/review-output-contract/SKILL.md + .agents/skills/frontend-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0016-100/frontend-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: route-level 계약은 이번 pass 범위 밖이라 이후 라우트 변경 시 실라우트 기준으로 재확인이 필요하다. feed card 가로 padding이 다시 바뀌면 workout carousel의 viewport/track 폭 계약도 함께 재확인해야 한다.
- Specialist review:
  - reviewer: ui-ux-reviewer
  - reviewer protocol: reviewers/protocols.json + .agents/skills/review-output-contract/SKILL.md + .agents/skills/ui-ux-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0016-100/ui-ux-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: workout carousel은 카드 rhythm을 유지하면서도 다음 카드가 비치지 않게 정리됐지만, 매우 좁은 모바일 뷰포트에서는 여전히 한 번 더 visual sanity check를 해보는 편이 좋다. hashtag를 본문 inline으로 합치는 큰 구조 변경은 후속 task에서 별도로 다뤄야 한다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: reviewers/protocols.json + .agents/skills/review-output-contract/SKILL.md + .agents/skills/po-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0016-100/po-reviewer.json
  - decision: approved
  - findings: 없음.
  - residual risks: 첫 번째 action-language pass까지만 닫혔으므로 이후 읽기 밀도 polish와 hashtag inline 정책은 backlog 의도대로 이어가면 된다.

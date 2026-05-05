---
id: I-0016-126
title: 크루 게시판 통합 피드와 프로필 gutter를 정리한다
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-125-web-crew-announcement-composer.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web storybook -- --smoke-test
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/components/crew/CrewHubPage.stories.tsx
  - apps/web/src/hooks/useCrewBoards.ts
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/profile/[id]/index.tsx
  - apps/web/src/router.tsx
  - design/frontend/crew-experience.md
  - design/frontend/social-profile.md
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
  - tasks/reviews/I-0016-126/frontend-reviewer.json
  - tasks/reviews/I-0016-126/ui-ux-reviewer.json
  - tasks/reviews/I-0016-126/po-reviewer.json
---

## Superseded

2026-05-05: Storybook 기반 확인은 `design/initiatives/I-0020-storybook-retirement.md`에서 퇴역 처리됐다. 이 문서는 당시 crew board/feed/gutter polish 이력으로만 보존한다.

## 목표

크루 상세 게시판을 board 진입점 목록이 아닌 공지+일반 글 통합 피드로 바로 보여주고, 프로필 모바일 표면의 외부 gutter를 제거한다.

## 완료 기준

- 게시판 탭을 열면 공지와 일반 게시글이 한 목록에 바로 보인다.
- 공지 게시글에는 `공지` label이 함께 표시된다.
- 게시글 클릭 시 URL에 `tab=board`, `boardId`, `postId`가 push되고 해당 게시글 상세가 열린다.
- 공지 작성 체크박스의 보조 설명 문구는 제거된다.
- `/profile`과 `/profile/:id`의 모바일 외부 padding이 제거된다.

## 노트

- 공지와 일반 글을 한 목록으로 합쳐 보여주되 backend board permission contract는 그대로 둔다.
- 관련 UX 문서: `design/frontend/crew-experience.md`, `design/frontend/social-profile.md`

## 셀프 리뷰

- 범위와 의도: 크루 게시판 탭의 post browsing model과 프로필 모바일 gutter diff comment만 다뤘다. backend board permission과 profile data contract는 바꾸지 않았다.
- source of truth: `design/frontend/crew-experience.md`, `design/frontend/social-profile.md`, `docs/domain/user-profile.md`, `docs/domain/crew.md`
- 설계 divergence: 없음. 공지는 별도 탭이나 내부 board entry가 아니라 게시판 통합 피드에서 label로 구분한다.
- 검증:
  - `pnpm --filter @masters/web lint`
  - `pnpm --filter @masters/web storybook -- --smoke-test`
  - `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 게시판 URL state와 통합 피드 query가 기존 작성/상세/권한 흐름을 깨지 않는지 본다.
- PO reviewer가 확인할 내용: 공지 탭 제거 후 게시판에서 공지와 일반 글을 구분하면서 바로 읽고 열 수 있는지 본다.

## 핸드오프

- 없음.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-04: 사용자 diff comment를 반영해 게시판을 통합 피드로 바꾸고 프로필 route gutter 제거를 포함하는 범위로 시작했다.
- 2026-05-04: `CrewBoardList`를 board entry 목록 대신 `ANNOUNCEMENT`, `GENERAL`, `FREE` board의 글을 합쳐 보여주는 피드로 바꾸고, 공지 글 label과 URL query push 상세 진입을 추가했다.
- 2026-05-04: 공지 체크박스 보조 설명 문구를 제거하고, `/profile`, `/profile/:id` route shell padding과 프로필 wrapper의 음수 margin을 정리했다.

## 리뷰 노트

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-126/frontend-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 통합 피드는 board별 첫 페이지를 client에서 합치므로, board별 pagination 확장은 별도 task가 필요하다.
- Specialist review:
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-126/ui-ux-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 공지 label은 compact badge로만 구분하므로 pinned/priority ordering 고도화는 후속 UX 범위다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-126/po-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 게시판 통합 피드에서 공지와 일반 글이 함께 보이는 것은 의도된 제품 동작이다.

---
id: I-0016-125
title: 크루 게시판 글쓰기에서 공지 작성을 지원한다
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-120-web-crew-participation-flow-polish.md
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
  - design/frontend/crew-experience.md
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
  - tasks/reviews/I-0016-125/frontend-reviewer.json
  - tasks/reviews/I-0016-125/ui-ux-reviewer.json
  - tasks/reviews/I-0016-125/po-reviewer.json
---

## Superseded

2026-05-05: Storybook 기반 확인은 `design/initiatives/I-0020-storybook-retirement.md`에서 퇴역 처리됐다. 이 문서는 당시 crew announcement composer 이력으로만 보존한다.

## 목표

크루 상세에서 공지 탭을 제거한 뒤에도 운영진과 크루장이 게시판 글쓰기 창에서 공지사항을 작성할 수 있게 한다.

## 완료 기준

- 운영진/크루장에게만 게시판 글쓰기 폼의 `공지` 체크박스가 보인다.
- `공지` 체크 후 작성하면 공지 게시판에 글이 생성된다.
- 일반 멤버의 글쓰기 흐름은 기존 자유 게시판 작성 흐름을 유지한다.

## 노트

- 공지는 별도 1차 탭이 아니라 게시판 표면 안에서 모아보는 현행 UX를 유지한다.
- 관련 UX 문서: `design/frontend/crew-experience.md`

## 셀프 리뷰

- 범위와 의도: 공지 탭 제거 후 끊긴 공지 작성 경로만 복구했다. 게시판 구조나 backend 권한 모델은 바꾸지 않고, owner/admin 전용 체크박스로 기존 공지 게시판에 작성되도록 연결했다.
- source of truth: `design/frontend/crew-experience.md`, `design/initiatives/I-0016-design-system-and-ux-guardrails.md`, `docs/domain/`
- 설계 divergence: 없음. 공지는 별도 1차 탭이 아니라 게시판 안에서 모아보는 방향을 유지했다.
- 검증:
  - `pnpm --filter @masters/web lint`
  - `pnpm --filter @masters/web storybook -- --smoke-test`
  - `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 운영진 전용 공지 작성 affordance가 일반 글쓰기 흐름을 깨지 않는지 본다.
- PO reviewer가 확인할 내용: 공지 탭 제거 후에도 크루장이 공지사항을 작성할 수 있는지 본다.

## 핸드오프

- 없음.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-03: 사용자 피드백을 반영해 공지 탭 없이도 글쓰기 폼에서 공지 글을 등록하는 방향으로 범위를 잡았다.
- 2026-05-03: `CrewBoardList` 글쓰기 폼에 owner/admin 전용 `공지` 체크박스를 추가하고, 공지로 등록하면 공지 게시판 쿼리와 게시판 목록 count가 갱신되도록 연결했다.
- 2026-05-03: Storybook composite story에서 일반 멤버에게는 공지 체크박스가 숨겨지고 owner에게는 표시되는지 검증했다.

## 리뷰 노트

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-125/frontend-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 실제 API mutation은 기존 board permission contract에 의존하므로, role fixture와 운영 데이터의 writePermission 값이 drift하지 않아야 한다.
- Specialist review:
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-125/ui-ux-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 글쓰기 폼은 여전히 compact inline composer라, 더 큰 공지 작성 경험은 별도 UX task에서 다룰 수 있다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-125/po-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 운영진이 공지 게시판 자체를 삭제하거나 권한 설정을 바꾸는 경우는 backend guardrail과 별도 settings UX에 의존한다.

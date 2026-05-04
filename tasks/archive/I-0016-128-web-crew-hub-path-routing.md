---
id: I-0016-128
title: 크루 허브 탭과 작성 화면을 path 라우팅으로 정리한다
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-126-web-crew-board-feed-and-profile-gutter.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web build-storybook
artifacts:
  - apps/web/src/components/crew/CrewActivityList.tsx
  - apps/web/src/components/crew/CrewAttendanceStats.tsx
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/components/crew/CrewHubPage.stories.tsx
  - apps/web/src/components/crew/crew-hub-context.ts
  - apps/web/src/components/crew/crew-hub-routes.ts
  - apps/web/src/pages/crews/[id]/CrewHubPanels.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/router.tsx
  - design/frontend/crew-experience.md
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
  - tasks/reviews/I-0016-128/frontend-reviewer.json
  - tasks/reviews/I-0016-128/ui-ux-reviewer.json
  - tasks/reviews/I-0016-128/po-reviewer.json
---

## 목표

크루 상세의 탭, 새 글쓰기, 새 활동 만들기, 게시글 상세 상태를 query state가 아닌 path 라우팅으로 표현한다.

## 완료 기준

- `/crews/:id/board`가 게시판 통합 피드를 연다.
- `/crews/:id/board/new`가 새 글쓰기 폼을 연다.
- `/crews/:id/board/:boardId/posts/:postId`가 게시글 상세를 연다.
- `/crews/:id/activities/new`가 새 활동 만들기 폼을 연다.
- `/crews/:id/pending`이 운영진 전용 가입대기 탭을 연다.
- 탭 변경과 빠른 작업 버튼이 query가 아닌 path로 이동한다.
- 기존 `?tab=...`, `boardId`, `postId` query 라우팅은 더 이상 사용하지 않는다.

## 노트

- API는 기존 `/crews/:id/boards/:boardId/posts` 계약을 유지한다.
- 게시판 피드는 공지와 일반 글을 합쳐 보여주되, 게시글 상세 path에는 서버 조회에 필요한 `boardId`를 포함한다.
- 가입대기는 관리 패널 내부 섹션이 아니라 운영진 전용 1차 탭으로 노출한다.

## 셀프 리뷰

- 범위와 의도: 크루 허브의 탭, 글쓰기, 활동 만들기, 게시글 상세 URL state를 query에서 path로 옮겼다. 탭 하단 영역은 nested route `Outlet`으로 분리하고, backend board/post API 계약과 게시판 통합 피드 제품 동작은 바꾸지 않았다.
- source of truth: `design/frontend/crew-experience.md`, `apps/web/src/components/crew/crew-hub-routes.ts`, `apps/web/src/pages/crews/[id]/index.tsx`, `apps/web/src/pages/crews/[id]/CrewHubPanels.tsx`
- 설계 divergence: 없음. 기존 query URL 호환 redirect는 사용자 선택에 따라 추가하지 않았다.
- 검증:
  - `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
  - `pnpm --filter @masters/web build-storybook`
  - Specialist/PO review 후 권한 경계 보완 패치를 적용하고 위 두 검증을 재실행했다.
  - 브라우저에서 `/crews/cmopuzcoz0004078de3pwszxh/activities/new`, `/crews/cmopuzcoz0004078de3pwszxh/board/new`, `/crews/cmopuzcoz0004078de3pwszxh/board`, `/crews/cmopuzcoz0004078de3pwszxh/board/:boardId/posts/:postId` 진입을 확인했다. 생성 path는 각각 생성 폼만 노출하고 기존 리스트는 하단에 함께 렌더링하지 않는다. 상세 뒤로가기는 `/board`로 이동했으나 이후 로컬 API가 `ThrottlerException: Too Many Requests`를 반환했다.
  - 브라우저에서 `/crews/cmopuzcoz0004078de3pwszxh/board/new`의 공지 체크박스가 제목 위에 있고, `/manage`는 운영 현황만, `/pending`은 가입대기 탭만 렌더링하는 것을 확인했다.
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: query state 제거가 크루 허브 탭, 글쓰기, 활동 만들기, 게시글 상세 진입의 뒤로가기/직접 링크 동작을 깨지 않는지 본다.
- PO reviewer가 확인할 내용: 사용자가 보는 크루 허브의 탭과 작성 흐름이 URL과 자연스럽게 맞는지 본다.

## 핸드오프

- 없음.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-04: 사용자 요청에 따라 `?tab=board` 기반 크루 허브 상태를 path 기반 라우팅으로 옮기는 작업을 시작했다.
- 2026-05-04: 공통 route helper를 추가하고 router, 크루 허브 페이지, 게시판/활동 작성 폼, Storybook composite story를 path 기반 상태로 전환했다.
- 2026-05-04: 웹 build와 Storybook build를 통과했고, 브라우저에서 게시판 목록 및 게시글 상세 path push를 확인했다.
- 2026-05-04: 사용자 피드백을 반영해 크루 허브 부모는 hero와 탭바만 유지하고, 탭 하단 영역은 nested route `Outlet`으로 갈아끼우도록 재구성했다. `ProtectedRoute`는 부모 Outlet context를 자식 라우트로 전달하게 조정했다.
- 2026-05-04: 활동 생성과 게시글 생성 path를 각각 별도 패널 컴포넌트로 분리해 생성 화면에서는 리스트 대신 폼만 렌더링하도록 조정했다.
- 2026-05-04: 공지 체크박스를 제목 위로 이동하고, 가입대기 섹션을 운영진 전용 `/pending` 탭으로 분리했다.
- 2026-05-04: 관리 탭에서 상단 탭바와 출석부 콘텐츠가 붙어 보이지 않도록 운영 현황 패널 상단 여백을 보강했다.
- 2026-05-04: `frontend-reviewer`와 `ui-ux-reviewer` 초기 리뷰에서 직접 링크 권한 경계, stale 게시글 URL, 뒤로가기 접근성, 활동 생성 route affordance 문제가 발견되어 수정했다.
- 2026-05-04: `po-reviewer`가 `/board/new` direct route의 비멤버 경계를 추가로 지적했고, 비작성자는 `/board`로 replace 이동하도록 수정했다.
- 2026-05-04: 수정 후 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer` 재검토가 모두 approved로 닫혔다.

## 리뷰 노트

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-128/frontend-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 리뷰어는 recorded build와 Storybook build 검증에 의존했고, 브라우저 플로우를 직접 재실행하지 않았다.
- Specialist review:
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-128/ui-ux-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 리뷰어는 recorded build와 Storybook build 검증에 의존했고, 브라우저 플로우를 직접 재실행하지 않았다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-128/po-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 현재 dirty diff의 `.gitignore` `.worktrees` 추가는 이 task scope 밖이므로 별도 처리해야 한다.

---
id: I-0016-129
title: 크루 홈 탭과 상단 탭 구조를 적용한다
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-128-web-crew-hub-path-routing.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - apps/web/src/components/crew/CrewActivityList.tsx
  - apps/web/src/components/crew/CrewAttendanceStats.tsx
  - apps/web/src/components/crew/CrewHubQuickActions.tsx
  - apps/web/src/components/crew/crew-hub-context.ts
  - apps/web/src/components/crew/crew-hub-routes.ts
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/CrewHubPanels.tsx
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/router.tsx
  - apps/web/src/components/crew/CrewHubPage.stories.tsx
  - design/frontend/crew-experience.md
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
---

## 목표

크루 상세에서 탭 UI를 최상단으로 올리고, 크루 히어로는 `/crews/:id` 홈 탭에서만 노출한다.

## 완료 기준

- `/crews/:id`는 `홈` 탭을 기본으로 보여준다.
- `/crews/:id/activities`, `/crews/:id/board`, `/crews/:id/members`, `/crews/:id/manage`, `/crews/:id/pending`에서는 히어로가 보이지 않는다.
- 홈 탭은 기존 크루 히어로와 가까운 예정 활동 2개를 보여준다.
- `design/frontend/crew-experience.md`에 라우트와 화면 도식을 남긴다.

## 노트

- `/crews/:id/activies`는 오타로 보고 실제 구현은 `/crews/:id/activities`를 사용한다.
- 새 API나 DB 변경 없이 기존 `/crews/:id`와 `/crews/:id/profile` 계약을 재사용한다.
- 관련 UX 문서: `design/frontend/crew-experience.md`, `design/frontend/visual-system-rules.md`

## 셀프 리뷰

- 범위와 의도: 크루 상세 허브의 탭/히어로 배치, 작성 quick action, 게시글 상세 헤더 중복 제거, 활동 카드 밀도 조정을 같은 크루 허브 UX 정리 범위 안에서 처리했다. API/DB/권한 정책은 바꾸지 않았고, 기존 가입, 공유, 채팅, 설정 액션은 부모 라우트가 계속 소유한다.
- source of truth: `design/frontend/crew-experience.md`, `design/frontend/visual-system-rules.md`, `docs/domain/crew.md`
- 설계 divergence: 없음.
- 검증:
  - `pnpm --filter @masters/web lint`
  - `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`
  - `git diff --check`
  - `bash scripts/check-active-task-closeout.sh`
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 홈 탭과 비홈 탭의 정보 위계가 명확하고, 상단 탭이 모바일/데스크톱에서 콘텐츠를 가리지 않는지 확인한다.
- PO reviewer가 확인할 내용: 크루 소개와 예정 활동이 홈에서 먼저 읽히고, 활동/게시판/멤버 작업 화면에서는 히어로 반복이 사라져 사용 흐름이 가벼워졌는지 확인한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-04: 사용자 제안에 따라 크루 히어로를 홈 탭 전용으로 옮기고, 최상단 탭 라우트 계약을 문서화하는 작업을 시작했다.
- 2026-05-04: `pnpm --filter @masters/web lint`와 `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`를 통과했다.
- 2026-05-04: 작성 경로(`/activities/new`, `/board/new`)에서 상단 inline action과 모바일 quick action이 반복 노출되지 않도록 사용자 피드백을 반영했고, 동일 검증을 다시 통과했다.
- 2026-05-04: 활동/게시판 리스트 화면에서도 탭 바 안의 inline action이 답답해 보인다는 피드백에 따라, 작성 진입을 전체 viewport 공통 우측 하단 quick action으로 통일했다.
- 2026-05-04: 게시글 상세에서 탭 아래에 보드명과 공지 배지가 중복으로 보이는 상단 보드 헤더를 제거했다.
- 2026-05-04: 활동 탭의 상단 여백을 확보하고, 활동 카드를 더 낮은 밀도의 리스트형 반복 카드로 정리했다.
- 2026-05-04: Playwright 모바일 폭 스크린샷으로 `/crews/:id/activities`의 탭 아래 여백과 활동 카드 렌더링을 확인했다.
- 2026-05-04: 크루 허브 탭 폰트를 살짝 키우고 활성 탭 하단 indicator를 명확하게 조정했으며, 관리 통계 내부 탭의 긴 하단 라인을 segmented 스타일로 바꿨다.
- 2026-05-04: frontend/UI-UX 리뷰가 게시글 상세의 in-app return path를 지적했으나, 사용자 최종 결정에 따라 브라우저 뒤로가기를 반환 경로로 유지하고 routed 상세 내부 `게시판으로` CTA는 edge state까지 모두 제거했다.
- 2026-05-04: 최종 코드 기준으로 lint/build/task metadata 검증을 다시 통과했고, frontend/UI-UX/PO 재리뷰 승인을 받았다.

## 리뷰 노트

- Specialist review:
  - reviewer protocol: .codex/agents/frontend-reviewer.toml
  - reviewer: frontend-reviewer
  - artifact: tasks/reviews/I-0016-129/frontend-reviewer.json
  - decision: approved
  - findings: none after the final product direction clarified that routed board post detail should not render a visible `게시판으로` CTA.
  - residual risks: deep-linked board post detail should still receive manual QA in embedded or reduced-browser-chrome contexts.
  - reviewer protocol: .codex/agents/ui-ux-reviewer.toml
  - reviewer: ui-ux-reviewer
  - artifact: tasks/reviews/I-0016-129/ui-ux-reviewer.json
  - decision: approved
  - findings: none after the visible `게시판으로` affordance was removed and the duplicate board title/badge stayed absent.
  - residual risks: sticky tabs, floating quick actions, and deep-linked post detail should continue to be watched in small-screen QA.
- PO review:
  - reviewer protocol: .codex/agents/po-reviewer.toml
  - reviewer: po-reviewer
  - artifact: tasks/reviews/I-0016-129/po-reviewer.json
  - decision: approved
  - findings: none after routed board detail edge states stopped rendering visible `게시판으로` CTAs.
  - residual risks: remaining risk is release polish for sticky tabs, floating quick actions, and browser-back behavior from deep-linked board detail on real small-screen devices.

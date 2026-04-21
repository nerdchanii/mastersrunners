---
id: I-0016-120
title: Storybook으로 crew participation 흐름을 다듬는다
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
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web storybook -- --smoke-test
  - pnpm --filter @masters/web build-storybook
artifacts:
  - apps/web/src/components/ui/input.tsx
  - apps/web/src/components/ui/input.stories.tsx
  - apps/web/src/components/ui/textarea.tsx
  - apps/web/src/components/ui/textarea.stories.tsx
  - apps/web/src/components/ui/select.tsx
  - apps/web/src/components/ui/select.stories.tsx
  - apps/web/src/components/ui/switch.tsx
  - apps/web/src/components/ui/switch.stories.tsx
  - apps/web/src/components/ui/dialog.tsx
  - apps/web/src/components/ui/dialog.stories.tsx
  - apps/web/src/components/ui/sheet.tsx
  - apps/web/src/components/ui/sheet.stories.tsx
  - apps/web/src/components/common/ConfirmDialog.tsx
  - apps/web/src/components/common/ConfirmDialog.stories.tsx
  - apps/web/src/components/common/BottomNav.tsx
  - apps/web/src/components/common/BottomNav.stories.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/components/layout/Header.stories.tsx
  - apps/web/src/components/crew/CrewIdentityHero.tsx
  - apps/web/src/components/crew/CrewIdentityHero.stories.tsx
  - apps/web/src/components/crew/CrewHubPage.stories.tsx
  - apps/web/src/components/crew/CrewForm.tsx
  - apps/web/src/components/crew/CrewForm.stories.tsx
  - apps/web/src/components/crew/CrewMemberList.tsx
  - apps/web/src/components/crew/CrewMemberList.stories.tsx
  - apps/web/src/components/crew/PendingMemberList.tsx
  - apps/web/src/components/crew/PendingMemberList.stories.tsx
  - apps/web/src/components/crew/CrewActivityForm.tsx
  - apps/web/src/components/crew/CrewActivityForm.stories.tsx
  - apps/web/src/components/crew/CrewActivityList.tsx
  - apps/web/src/components/crew/CrewActivityList.stories.tsx
  - apps/web/src/components/crew/CrewAttendance.tsx
  - apps/web/src/components/crew/CrewAttendance.stories.tsx
  - apps/web/src/components/crew/CrewAttendanceStats.tsx
  - apps/web/src/components/crew/CrewAttendanceStats.stories.tsx
  - apps/web/src/components/crew/CrewBoardList.tsx
  - apps/web/src/components/crew/CrewBoardList.stories.tsx
  - apps/web/src/components/crew/CrewPostList.tsx
  - apps/web/src/components/crew/CrewPostList.stories.tsx
  - apps/web/src/components/crew/GroupChat.tsx
  - apps/web/src/components/crew/GroupChat.stories.tsx
  - apps/web/src/components/crew/QrScanner.tsx
  - apps/web/src/components/crew/QrScanner.stories.tsx
  - apps/web/src/components/crew/CrewTagManager.tsx
  - apps/web/src/components/crew/CrewTagManager.stories.tsx
  - apps/web/src/pages/crews/[id]/index.tsx
  - apps/web/src/pages/crews/[id]/settings/index.tsx
  - apps/web/src/storybook/storybook-environment.ts
  - apps/web/src/storybook/storybook-fixtures.ts
  - design/frontend/crew-experience.md
  - design/frontend/ui-system.md
---

## 목표

크루 상세에서 가입, 멤버 관리, 활동, 게시판, 출석으로 이어지는 participation 흐름을 Storybook에서 비교하면서, form/action/list의 UX language를 하나로 정리한다.

## 완료 기준

- create/edit/manage form의 spacing과 validation feedback이 일관된다.
- 멤버 관리, 출석, 태그 지정, 게시판 action의 CTA tone이 같은 규칙을 따른다.
- 관리자, 멤버, 게스트 상태 차이가 Storybook story 또는 play 검증으로 명확히 드러난다.

## 노트

- 범위는 crew participation 흐름에 필요한 input/dialog/sheet/common/layout/surface만 포함한다.
- mutation-heavy UI는 정적 캔버스만 두지 않고 상태 전환 story 또는 play 검증을 함께 유지한다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`

## 셀프 리뷰

- 범위와 의도: crew participation flow에서 직접 보이는 shared primitive, crew surface, Storybook stories를 함께 다듬고, 새 CTA/copy rhythm이 실제 `/crews/:id`와 `/crews/:id/settings`에도 최소 반영되도록 연결했다. challenge/event/workout surface로 범위를 넓히지 않았다.
- source of truth: `design/initiatives/I-0016-design-system-and-ux-guardrails.md`, `design/frontend/ui-system.md`, `design/frontend/crew-experience.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- 설계 divergence: 없음. Storybook 쪽 deterministic state를 위해 일부 crew surface에 initial data/open state props를 추가했지만, 라우트 계약이나 API shape는 바꾸지 않았다.
- 검증:
  - `pnpm --filter @masters/web lint`
  - `pnpm --filter @masters/web storybook -- --smoke-test`
  - `pnpm --filter @masters/web build-storybook`
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 크루 운영 UI가 상태별로 명확하고, form/action/list/chat이 같은 language를 공유하는지 본다.
- PO reviewer가 확인할 내용: 크루 참여와 운영 흐름이 실제 사용자 역할별로 더 쉽게 이해되는지 본다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` 후속 polishing 흐름으로 `Crew Participation Flow`를 분리했다.
- 2026-04-11: shared primitive stories를 crew form/action 기준으로 확장하고, fetch-heavy crew surface에 Storybook용 deterministic state를 주입할 수 있게 정리했다.
- 2026-04-11: member/pending/attendance/board/post/tag/chat/QR surface의 role state stories를 보강하고, `/crews/:id`와 settings 화면의 helper copy 및 section rhythm을 최소 범위로 동기화했다.
- 2026-04-11: Storybook mock 순서를 정리해 crew attendance/attendance-stats/members fixture가 `ok` 응답에 가려지지 않도록 수정했고, verify 3종을 모두 통과했다.
- 2026-04-11: 사용자 피드백을 반영해 active member도 공유 링크를 보낼 수 있게 맞추고, 일반 멤버의 `크루 탈퇴`를 hero 주 액션에서 secondary menu로 내렸으며, `GuestJoin` story가 실제 인증 유도 다이얼로그를 보여주도록 정리했다.
- 2026-04-11: `/crews/:id`를 surface 조합으로 훑을 수 있도록 `CrewHubPage` composite story를 추가해 게스트, 초대 진입, 멤버, 운영진 허브를 Storybook 한 화면에서 비교할 수 있게 했다.
- 2026-04-11: 거대한 `CrewForm`을 생성(퍼널)과 수정(단일 페이지)으로 분리하고, 재사용 가능한 `Funnel` UI와 공통 폼 필드 컴포넌트를 추출하여 UX와 유지보수성을 개선했다.

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

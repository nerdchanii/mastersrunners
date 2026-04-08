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
verification_status: pending
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

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 크루 운영 UI가 상태별로 명확하고, form/action/list/chat이 같은 language를 공유하는지 본다.
- PO reviewer가 확인할 내용: 크루 참여와 운영 흐름이 실제 사용자 역할별로 더 쉽게 이해되는지 본다.

## 핸드오프

- component, story, 필요한 shared primitive/common dependency만 같은 changeset에서 수정한다.
- challenge/event나 workout 분석 surface 정리는 별도 task로 넘긴다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` 후속 polishing 흐름으로 `Crew Participation Flow`를 분리했다.

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

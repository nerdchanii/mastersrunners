---
id: I-0016-110
title: Storybook으로 profile identity 흐름을 다듬는다
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
  - apps/web/src/components/ui/tabs.tsx
  - apps/web/src/components/ui/tabs.stories.tsx
  - apps/web/src/components/ui/separator.tsx
  - apps/web/src/components/ui/separator.stories.tsx
  - apps/web/src/components/ui/skeleton.tsx
  - apps/web/src/components/ui/skeleton.stories.tsx
  - apps/web/src/components/common/EmptyState.tsx
  - apps/web/src/components/common/EmptyState.stories.tsx
  - apps/web/src/components/common/UserAvatar.tsx
  - apps/web/src/components/common/UserAvatar.stories.tsx
  - apps/web/src/components/common/StatItem.tsx
  - apps/web/src/components/common/StatItem.stories.tsx
  - apps/web/src/components/common/PageHeader.tsx
  - apps/web/src/components/common/PageHeader.stories.tsx
  - apps/web/src/components/profile/ProfileHeader.tsx
  - apps/web/src/components/profile/ProfileHeader.stories.tsx
  - apps/web/src/components/profile/ProfileStats.tsx
  - apps/web/src/components/profile/ProfileStats.stories.tsx
  - apps/web/src/components/profile/ProfileTabs.tsx
  - apps/web/src/components/profile/ProfileTabs.stories.tsx
  - apps/web/src/components/feed/FeedCard.tsx
  - apps/web/src/components/feed/FeedCard.stories.tsx
  - apps/web/src/components/workout/WorkoutCard.tsx
  - apps/web/src/components/workout/WorkoutCard.stories.tsx
  - apps/web/src/components/crew/CrewCard.tsx
  - apps/web/src/components/crew/CrewCard.stories.tsx
  - design/frontend/ui-system.md
---

## 목표

프로필 진입에서 보이는 identity hierarchy를 Storybook으로 정리해, header에서 stats와 tabs, preview card로 이어지는 읽기 리듬을 한 톤으로 맞춘다.

## 완료 기준

- profile header, stats, tabs 사이의 타이포/메타 우선순위가 Storybook에서 명확히 읽힌다.
- 탭 전환 시 empty/loading/skeleton 상태가 같은 rhythm과 spacing을 가진다.
- profile 내부 preview 카드들이 정보 밀도와 emphasis 규칙을 공유한다.

## 노트

- 범위는 profile identity 흐름과 직접 연결되는 primitive/common/surface만 포함한다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: profile identity 흐름의 hierarchy와 tab state rhythm이 사용자 관점에서 일관적인지 본다.
- PO reviewer가 확인할 내용: profile surface가 러너의 identity와 활동 preview를 더 명확하게 전달하는지 본다.

## 핸드오프

- 탭과 카드 preview를 함께 보는 흐름 기준으로 수정한다.
- unrelated social action 또는 challenge/event polish는 이 task에 넣지 않는다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` 후속 polishing 흐름으로 `Profile Identity Flow`를 분리했다.

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

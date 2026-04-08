---
id: I-0016-140
title: Storybook으로 discovery와 participation surface 흐름을 다듬는다
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
  - apps/web/src/components/ui/checkbox.tsx
  - apps/web/src/components/ui/checkbox.stories.tsx
  - apps/web/src/components/ui/date-picker.tsx
  - apps/web/src/components/ui/date-picker.stories.tsx
  - apps/web/src/components/ui/sonner.tsx
  - apps/web/src/components/ui/sonner.stories.tsx
  - apps/web/src/components/common/ErrorBoundary.tsx
  - apps/web/src/components/common/ErrorBoundary.stories.tsx
  - apps/web/src/components/common/LoadingPage.tsx
  - apps/web/src/components/common/LoadingPage.stories.tsx
  - apps/web/src/components/common/InfiniteScroll.tsx
  - apps/web/src/components/common/InfiniteScroll.stories.tsx
  - apps/web/src/components/common/FeatureRoute.tsx
  - apps/web/src/components/common/FeatureRoute.stories.tsx
  - apps/web/src/components/common/BottomNav.tsx
  - apps/web/src/components/common/BottomNav.stories.tsx
  - apps/web/src/components/layout/Header.tsx
  - apps/web/src/components/layout/Header.stories.tsx
  - apps/web/src/components/challenge/ChallengeCard.tsx
  - apps/web/src/components/challenge/ChallengeCard.stories.tsx
  - apps/web/src/components/challenge/ChallengeTeams.tsx
  - apps/web/src/components/challenge/ChallengeTeams.stories.tsx
  - apps/web/src/components/challenge/LeaderboardTable.tsx
  - apps/web/src/components/challenge/LeaderboardTable.stories.tsx
  - apps/web/src/components/challenge/TeamLeaderboard.tsx
  - apps/web/src/components/challenge/TeamLeaderboard.stories.tsx
  - apps/web/src/components/event/EventCard.tsx
  - apps/web/src/components/event/EventCard.stories.tsx
  - apps/web/src/components/event/EventResultsTable.tsx
  - apps/web/src/components/event/EventResultsTable.stories.tsx
  - design/frontend/ui-system.md
---

## 목표

챌린지, 이벤트, 전역 shell feedback을 Storybook으로 함께 보며, discovery와 participation surface가 같은 status language와 밀도 규칙을 쓰도록 정리한다.

## 완료 기준

- challenge/event card와 leaderboard/table surface가 같은 hierarchy와 CTA 규칙을 공유한다.
- loading, error, infinite, toast 같은 shell-level feedback이 domain surface와 충돌하지 않는다.
- feature-gated 또는 off-state가 사용자에게 명확한 기대치를 준다.

## 노트

- 범위는 challenge/event와 전역 shell feedback 흐름에 필요한 primitive/common/layout/surface만 포함한다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: discovery/participation surface와 전역 feedback component가 같은 UX language를 공유하는지 본다.
- PO reviewer가 확인할 내용: 챌린지와 이벤트 참여 surface가 사용자에게 상태와 다음 행동을 더 분명하게 보여 주는지 본다.

## 핸드오프

- shell feedback과 domain surface를 같이 보면서 다룬다.
- post/profile/crew/workout polish는 해당 전용 task에서 처리한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` 후속 polishing 흐름으로 `Discovery & Participation Surface Flow`를 분리했다.

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

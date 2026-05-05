---
id: I-0016-140
title: Storybook discovery와 participation surface polishing task를 폐기한다
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
execution_status: blocked
review_status: pending
verification_status: partial
closeout_blocker: Superseded by I-0020 Storybook retirement; retained as archive-only obsolete task.
verify:
  - superseded by tasks/archive/I-0020-010-repo-storybook-retirement.md
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

이 task는 Storybook 퇴역 결정으로 폐기한다. discovery와 participation surface UX는 이후 Storybook이 아니라 실앱, Playwright, current design docs 기준으로 다룬다.

## 완료 기준

- `I-0020`이 Storybook 기반 verify와 artifact를 제거한다.
- 이 task는 추가 구현 없이 archive에 남아 obsolete 이력을 보존한다.

## 노트

- 아래 범위와 Storybook artifact 목록은 당시 작업 범위를 설명하는 historical record다.
- 현재 검증 truth는 Storybook이 아니라 실앱, Playwright, current design docs다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- 2026-05-05: `I-0020`에서 Storybook을 퇴역시키기로 해 이 task를 superseded archive로 닫는다.

## 셀프 리뷰

- 범위와 의도: Storybook 기반 discovery/participation polishing task를 폐기하고, 과거 task 기록만 보존한다.
- source of truth: `design/initiatives/I-0020-storybook-retirement.md`, `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- 설계 divergence: Storybook workbench 운영 방향은 `I-0020`에서 퇴역 처리됐다.
- 검증: `I-0020` verify로 대체한다.
- 리뷰 라우팅: `I-0020`에서 `frontend-reviewer`, `harness-reviewer`, `docs-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- 아래 review focus는 당시 review 기준을 보존하는 archival note다. 현재 review routing과 verify는 `I-0020` closeout artifact를 따른다.
- Specialist reviewer가 확인할 내용: discovery/participation surface와 전역 feedback component가 같은 UX language를 공유하는지 봤다.
- PO reviewer가 확인할 내용: 챌린지와 이벤트 참여 surface가 사용자에게 상태와 다음 행동을 더 분명하게 보여 주는지 봤다.

## 핸드오프

- archival note: 당시에는 shell feedback과 domain surface를 같이 봤고, post/profile/crew/workout polish는 해당 전용 task에서 분리했다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` 후속 polishing 흐름으로 `Discovery & Participation Surface Flow`를 분리했다.
- 2026-05-05: `I-0020` Storybook 퇴역에 따라 추가 구현 없이 superseded archive로 닫았다.

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

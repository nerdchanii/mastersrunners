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
execution_status: ready_for_archive
review_status: approved
verification_status: passed
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
  - apps/web/src/components/profile/ProfileIdentityFlow.stories.tsx
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

## Superseded

2026-05-05: Storybook 기반 polish 흐름은 `design/initiatives/I-0020-storybook-retirement.md`에서 퇴역 처리됐다. 이 문서는 당시 profile identity polish 이력으로만 보존한다.

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

- 범위와 의도: profile header 안에 섞여 있던 stat surface를 분리하고, tabs 내부를 preview list 중심으로 재정렬해 identity hierarchy를 Storybook에서 한 흐름으로 읽히게 했다.
- 2026-04-09 후속 polish: 사용자 피드백에 맞춰 stats를 다시 header identity block 안으로 통합하고, profile tabs의 posts/workouts를 `/feed` surface 재사용 기준으로 재정렬했으며, crews tab은 crew info card 대신 crew post feed 방향으로 전환했다.
- source of truth: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `design/frontend/social-profile.md`, `docs/domain/user-profile.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- 설계 divergence: 공개 타인 프로필의 crew tab은 접근 권한이 있으면 `/crews/:id/posts` 전체 피드를 우선 사용하지만, 읽기 권한이 없는 경우에는 `/crews/:id/profile`의 `recentPosts` preview로 fallback 한다. 그래서 public profile에서는 여전히 “완전한 crew post feed”보다 제한된 preview에 머무를 수 있다. PB의 race/date metadata는 현재 schema/API에 없어 시간값만 노출하며, 메타데이터 확장은 별도 후속 과업으로 남긴다.
- 2026-04-09 최종 사용자 리뷰: 헤더 정보 구조, follower summary, `/feed` 정렬, 모바일 콘텐츠 스와이프, sticky tab hide/show까지 사용자 기준 “이 정도면 될 것 같다” 수준으로 승인받았다.
- 검증: `pnpm --filter @masters/web lint`, `pnpm --filter @masters/web storybook -- --smoke-test`, `pnpm --filter @masters/web build-storybook`
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

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
- 2026-04-09: `ProfileHeader`에서 stats를 독립 surface로 분리하고, `ProfileStats`와 `ProfileTabs`를 같은 vertical rhythm으로 재정렬했다.
- 2026-04-09: `ProfileTabs`를 square grid 대신 preview list 중심으로 바꾸고, loading/empty/workout/crew 상태를 같은 spacing/divider/card language로 맞췄다.
- 2026-04-09: 비공개 프로필 Storybook 사례를 실제 privacy contract에 맞게 줄이고, `ProfileIdentityFlow` 조합 스토리를 추가했다.
- 2026-04-09: verify 재실행 중 초기 Storybook wrapper가 asset copy ENOENT와 조기 종료를 보였지만, import sort 정리 후 장시간 재실행으로 `lint`, `storybook -- --smoke-test`, `build-storybook` 모두 통과했다.
- 2026-04-09: stop-hook review loop에서 hidden workout tab stale state를 `posts`로 정규화하고, bio 없는 헤더의 placeholder copy를 제거한 뒤 reviewer artifacts를 같은 verified changeset으로 갱신했다.
- 2026-04-09: 사용자 최종 피드백을 반영해 header variant 높이를 own profile 기준으로 다시 맞추고, 이름 크기를 낮추고, PB chip을 줄글형 record block으로 교체했으며, following runner의 3dot action을 제거했다.
- 2026-04-09: 같은 라운드에서 profile tabs의 posts/workouts를 `/feed` card 재사용으로 바꾸고, crews tab은 visible crew memberships를 기준으로 `/crews/:id/profile`의 `recentPosts`를 모아 crew post feed로 재구성했다.
- 2026-04-09: reviewer findings를 반영해 own profile workouts에 실제 러너 identity를 다시 주입하고, crews tab action row를 like/comment/link affordance로 보강했으며, crew posts는 권한이 허용될 때 `/crews/:id/posts` 전체 피드를 우선 읽도록 fallback 순서를 뒤집었다.

## 리뷰 노트

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `reviewers/protocols.json`, `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-110/frontend-reviewer.json`
  - decision: `approved`
  - findings: `no blocking findings`
  - residual risks: public profile crew tab은 권한 fallback 시 `recentPosts` preview에 머무를 수 있다. `FeedCard`/`PostFeedCard` 재사용 자체는 맞지만, `fetchCrewPostsFromCrews()`의 permission fallback에 대한 전용 자동화 커버리지는 아직 없다.
- Specialist review:
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `reviewers/protocols.json`, `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-110/ui-ux-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: Storybook 기준 hierarchy와 rhythm은 정리됐지만, 실제 기기에서 긴 한국어 문구와 sparse profile의 인상, 좁은 폭 wrapping을 한 번 더 보는 편이 안전하다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `reviewers/protocols.json`, `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-110/po-reviewer.json`
  - decision: `approved`
  - findings: `no blocking findings`
  - residual risks: PB metadata 한계는 정직하게 처리됐지만, race/date-rich record 표현과 public crew feed completeness는 후속 제품 결정을 더 필요로 한다.

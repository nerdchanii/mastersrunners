---
id: I-0016-130
title: Storybook workout capture와 analysis polishing task를 폐기한다
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
  - apps/web/src/components/ui/card.tsx
  - apps/web/src/components/ui/card.stories.tsx
  - apps/web/src/components/ui/scroll-area.tsx
  - apps/web/src/components/ui/scroll-area.stories.tsx
  - apps/web/src/components/ui/label.tsx
  - apps/web/src/components/ui/label.stories.tsx
  - apps/web/src/components/common/FeatureRoute.tsx
  - apps/web/src/components/common/FeatureRoute.stories.tsx
  - apps/web/src/components/workout/WorkoutDetail.tsx
  - apps/web/src/components/workout/WorkoutDetail.stories.tsx
  - apps/web/src/components/workout/WorkoutAttachmentPreview.tsx
  - apps/web/src/components/workout/WorkoutAttachmentPreview.stories.tsx
  - apps/web/src/components/workout/MiniRouteMap.tsx
  - apps/web/src/components/workout/MiniRouteMap.stories.tsx
  - apps/web/src/components/workout/WorkoutAnalysisMap.tsx
  - apps/web/src/components/workout/WorkoutAnalysisMap.stories.tsx
  - apps/web/src/components/workout/WorkoutAnalysisCharts.tsx
  - apps/web/src/components/workout/WorkoutAnalysisCharts.stories.tsx
  - apps/web/src/components/workout/WorkoutLapSplitTable.tsx
  - apps/web/src/components/workout/WorkoutLapSplitTable.stories.tsx
  - apps/web/src/components/workout/ShareToggle.tsx
  - apps/web/src/components/workout/ShareToggle.stories.tsx
  - apps/web/src/components/workout/ShareCardGenerator.tsx
  - apps/web/src/components/workout/ShareCardGenerator.stories.tsx
  - design/frontend/ui-system.md
---

## 목표

이 task는 Storybook 퇴역 결정으로 폐기한다. workout capture와 analysis UX는 이후 Storybook이 아니라 실앱, Playwright, current design docs 기준으로 다룬다.

## 완료 기준

- `I-0020`이 Storybook 기반 verify와 artifact를 제거한다.
- 이 task는 추가 구현 없이 archive에 남아 obsolete 이력을 보존한다.

## 노트

- 아래 범위와 Storybook artifact 목록은 당시 작업 범위를 설명하는 historical record다.
- 현재 검증 truth는 Storybook이 아니라 실앱, Playwright, current design docs다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- 2026-05-05: `I-0020`에서 Storybook을 퇴역시키기로 해 이 task를 superseded archive로 닫는다.

## 셀프 리뷰

- 범위와 의도: Storybook 기반 workout polishing task를 폐기하고, 과거 task 기록만 보존한다.
- source of truth: `design/initiatives/I-0020-storybook-retirement.md`, `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- 설계 divergence: Storybook workbench 운영 방향은 `I-0020`에서 퇴역 처리됐다.
- 검증: `I-0020` verify로 대체한다.
- 리뷰 라우팅: `I-0020`에서 `frontend-reviewer`, `harness-reviewer`, `docs-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- 아래 review focus는 당시 review 기준을 보존하는 archival note다. 현재 review routing과 verify는 `I-0020` closeout artifact를 따른다.
- Specialist reviewer가 확인할 내용: workout detail과 analysis 흐름이 데이터 밀도가 높아도 명확한 hierarchy를 유지하는지 봤다.
- PO reviewer가 확인할 내용: 러너가 기록을 이해하고 공유 여부를 결정하는 흐름이 더 직관적인지 봤다.

## 핸드오프

- archival note: 당시에는 map/chart/table/share의 연관 상태를 같이 봤고, unrelated crew management 또는 challenge/event surface 정리는 범위 밖으로 뒀다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` 후속 polishing 흐름으로 `Workout Capture & Analysis Flow`를 분리했다.
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

---
id: I-0016-130
title: Storybook으로 workout capture와 analysis 흐름을 다듬는다
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

운동 기록 입력과 분석 surface를 Storybook에서 함께 보며, summary에서 route, chart, split, share로 이어지는 데이터-밀도 높은 흐름을 읽기 쉽게 정리한다.

## 완료 기준

- workout summary와 analysis section의 hierarchy가 Storybook에서 자연스럽게 읽힌다.
- map, chart, table, share control의 선택 상태와 강조 규칙이 일관된다.
- 공개 범위와 공유 UI가 러너 관점에서 명확한 wording과 CTA grouping을 가진다.

## 노트

- 범위는 workout capture/analysis 흐름에 필요한 primitive/common/surface만 포함한다.
- 지도의 실제 위치 정확도나 공유 API 계약 변경은 이 task 범위에 넣지 않는다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `docs/runbooks/ui-ux-guardrail-review.md`

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: workout detail과 analysis 흐름이 데이터 밀도가 높아도 명확한 hierarchy를 유지하는지 본다.
- PO reviewer가 확인할 내용: 러너가 기록을 이해하고 공유 여부를 결정하는 흐름이 더 직관적인지 본다.

## 핸드오프

- map/chart/table/share의 연관 상태를 같이 보고 수정한다.
- unrelated crew management 또는 challenge/event surface 정리는 이 task에 넣지 않는다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` 후속 polishing 흐름으로 `Workout Capture & Analysis Flow`를 분리했다.

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

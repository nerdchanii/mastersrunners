---
id: I-0014-380
title: workout detail overlay layer 정렬
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0014-370-web-workout-detail-action-and-meta-simplification.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium
artifacts:
  - apps/web/src/components/ui/dialog.tsx
  - apps/web/src/components/ui/dropdown-menu.tsx
  - apps/web/src/components/workout/WorkoutAnalysisMap.tsx
  - design/frontend/workout-experience.md
  - design/initiatives/I-0014-ui-bug-board-and-stabilization.md
  - tasks/reviews/I-0014-380/frontend-reviewer.json
  - tasks/reviews/I-0014-380/ui-ux-reviewer.json
  - tasks/reviews/I-0014-380/po-reviewer.json
---

## 목표

`/workouts/:id`에서 지도보다 modal, share card, dropdown menu가 항상 위에 뜨도록 overlay layer를 정렬한다.

## 완료 기준

- 삭제 confirm dialog가 지도 뒤로 깔리지 않는다.
- 공유 dropdown과 3점 menu가 지도 위로 안정적으로 열린다.
- share card dialog도 지도 뒤로 깔리지 않는다.
- 기존 map-first hero와 상단 액션 구조는 유지된다.

## 노트

- Leaflet pane의 높은 기본 stacking보다 app overlay 레이어가 확실히 위에 와야 한다.

## 셀프 리뷰

- 범위와 의도: workout detail에서 드러난 overlay stacking 문제를 공통 dialog/dropdown 계층에서 닫는다.
- source of truth: `design/frontend/workout-experience.md`, `design/initiatives/I-0014-ui-bug-board-and-stabilization.md`
- 설계 divergence: 없음. 지도는 media surface로 남고, overlay는 항상 interaction surface 우선이어야 한다.
- 검증: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` 통과, `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium` 통과
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 공통 overlay z-index 상향이 다른 surface를 깨뜨리지 않는지, workout detail에서 메뉴와 다이얼로그가 지도 위로 뜨는지 확인한다.
- PO reviewer가 확인할 내용: 사용자 관점에서 삭제/공유/카드 생성 흐름이 더 이상 지도에 가리지 않는지 확인한다.

## 핸드오프

- 다른 leaflet 기반 surface가 생기면 같은 overlay 계층을 재사용한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-05: product feedback에 따라 workout detail 지도가 dropdown과 modal보다 앞에 그려지는 overlay stacking 버그를 후속 태스크로 분리했다.
- 2026-04-05: 공통 `dialog` overlay/content와 `dropdown-menu` content를 Leaflet pane보다 높은 z-index로 올리고, `WorkoutAnalysisMap` wrapper는 `z-0` base layer로 고정했다.
- 2026-04-05: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium`를 다시 실행해 통과를 확인했다.

## 리뷰 노트

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-380/frontend-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 공통 dialog/dropdown z-index를 상향했기 때문에, 추후 더 높은 레이어를 요구하는 toast나 third-party widget이 생기면 전역 overlay scale을 다시 체계화할 필요가 있다.
- Specialist review:
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-380/ui-ux-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: overlay가 지도 위로 안정화됐지만, 향후 workout detail에 bottom sheet나 nested menu가 추가되면 현재 z-index 계층을 다시 점검해야 한다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-380/po-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 이번 fix는 workout detail에서 드러난 overlay bug를 닫지만, 동일한 Leaflet 사용 surface가 추가되면 같은 계층 규칙을 재검증해야 한다.

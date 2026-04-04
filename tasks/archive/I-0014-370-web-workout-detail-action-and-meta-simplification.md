---
id: I-0014-370
title: workout detail 상단 액션과 메타 단순화
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0014-360-web-workout-detail-mobile-density-followup.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium
artifacts:
  - apps/web/src/pages/workouts/detail/index.tsx
  - apps/web/e2e/workout-detail.spec.ts
  - design/frontend/workout-experience.md
  - design/initiatives/I-0014-ui-bug-board-and-stabilization.md
  - tasks/reviews/I-0014-370/frontend-reviewer.json
  - tasks/reviews/I-0014-370/ui-ux-reviewer.json
  - tasks/reviews/I-0014-370/po-reviewer.json
---

## 목표

`/workouts/:id` 상단 섹션의 메타와 액션을 더 조용하고 단순한 구조로 정리한다.

## 완료 기준

- 날짜 정보가 지도보다 위쪽에서 먼저 보인다.
- workout type, visibility 같은 badge성 메타는 상단 hero에서 제거된다.
- 수정/삭제는 3점 메뉴 안으로 숨겨진다.
- 공유 액션은 share trigger 하나에서 드롭다운으로 `카드 생성`, `포스트로 공유`를 고를 수 있다.
- 세부 지표 영역은 별도 헤더 카피 없이 바로 표시된다.

## 노트

- 상단 hero의 cardless, mobile-density 방향은 유지한다.
- 관련 UX truth: `design/frontend/workout-experience.md`

## 셀프 리뷰

- 범위와 의도: workout detail 상단의 정보 우선순위와 action affordance만 단순화한다.
- source of truth: `design/frontend/workout-experience.md`, `design/initiatives/I-0014-ui-bug-board-and-stabilization.md`
- 설계 divergence: 없음. 기존 map-first/detail-first 방향을 유지하면서 메타와 액션만 덜 시끄럽게 만든다.
- 검증: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` 통과, `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium` 통과
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 메뉴형 액션으로 바뀌어도 owner flow와 share flow가 분명하고 접근 가능하게 유지되는지 확인한다.
- PO reviewer가 확인할 내용: 상단 섹션이 더 덜 제품 설명적이고, 기록 자체가 먼저 보이는지 확인한다.

## 핸드오프

- 후속 태스크가 필요하면 charts/laps 영역의 카피 절제도 같은 원칙으로 확장할 수 있다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-04: product feedback에 따라 날짜를 위로 올리고 badge성 메타와 상단 액션 chrome을 줄이는 후속 태스크를 열었다.
- 2026-04-04: 상단 날짜를 지도 위의 독립 메타 행으로 분리하고 workout type/visibility badge를 제거했다. workout type은 subtle text 메타로만 남겼다.
- 2026-04-04: 수정/삭제를 owner용 3점 메뉴 안으로 옮기고, 카드 생성/포스트 공유를 share dropdown 하나로 합쳤다.
- 2026-04-04: 기존 e2e가 직접 노출된 삭제 버튼과 badge형 workout type을 가정하고 있어, 메뉴형 action과 text 메타로 바뀐 현재 계약에 맞게 `apps/web/e2e/workout-detail.spec.ts`를 갱신했다.
- 2026-04-05: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium`를 다시 실행해 통과를 확인했다.

## 리뷰 노트

- Specialist review:
  - reviewer: frontend-reviewer
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-370/frontend-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 상단 액션을 메뉴형으로 줄인 만큼, 향후 workout detail에 owner action이 더 늘어나면 menu grouping을 별도로 정리해야 할 수 있다.
- Specialist review:
  - reviewer: ui-ux-reviewer
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-370/ui-ux-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 세부 기록 제목을 제거한 대신 표면이 더 조용해졌으므로, 이후 지표 종류가 더 많아지면 시각적 그룹핑을 다시 보강할 필요가 있다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-370/po-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 공유 드롭다운 안의 액션 분리는 만족스럽지만, 장기적으로는 카드 생성과 포스트 공유의 사용 빈도 차이를 다시 보고 기본 액션을 조정할 수 있다.

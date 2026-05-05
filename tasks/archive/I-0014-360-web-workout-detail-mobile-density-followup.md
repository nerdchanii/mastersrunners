---
id: I-0014-360
title: 모바일 workout detail 상단 밀도 후속 정렬
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0014-350-web-workout-detail-hero-card-removal.md
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
  - design/frontend/workout-experience.md
  - design/initiatives/I-0014-ui-bug-board-and-stabilization.md
  - tasks/reviews/I-0014-360/frontend-reviewer.json
  - tasks/reviews/I-0014-360/ui-ux-reviewer.json
  - tasks/reviews/I-0014-360/po-reviewer.json
---

## 목표

`/workouts/:id` 상단 분석 섹션을 모바일에서 더 edge-aligned하게 보이도록 조정하고, 지도 높이가 첫 화면을 과도하게 점유하지 않게 한다.

## 완료 기준

- 모바일에서 workout detail 첫 섹션이 불필요한 좌우 거터 없이 화면을 더 꽉 채운다.
- 지도는 모바일에서 과도하게 세로로 길지 않으며, 분석 메타와 한 흐름으로 이어져 보인다.
- 기존 desktop average pace nowrap과 cardless hero 방향은 유지된다.

## 노트

- 후속 작업이다. 이미 archive된 `I-0014-350`의 방향은 유지하되, product가 추가로 요청한 모바일 density 보정만 다룬다.
- 관련 UX truth: `design/frontend/workout-experience.md`

## 셀프 리뷰

- 범위와 의도: workout detail 상단 레이아웃의 모바일 가로 밀도와 지도 높이만 조정한다.
- source of truth: `design/frontend/workout-experience.md`, `design/initiatives/I-0014-ui-bug-board-and-stabilization.md`
- 설계 divergence: 없음. cardless hero 원칙을 유지하면서 mobile-first density를 문서화한다.
- 검증: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` 통과, `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium` 통과
- 리뷰 라우팅: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 모바일에서 edge alignment가 과도한 붙음으로 변하지 않았는지, 데스크톱 레이아웃 회귀가 없는지 확인한다.
- PO reviewer가 확인할 내용: 상단 분석 섹션이 더 덜 카드처럼 보이고, 모바일 첫인상이 더 꽉 차 보이는지 확인한다.

## 핸드오프

- 후속 태스크가 필요하면 charts/laps 섹션까지 같은 mobile density 원칙을 확장할지 별도로 판단한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-04: product feedback에 따라 상단 섹션을 모바일에서 더 edge-aligned하게 바꾸고 지도 높이를 낮추는 후속 태스크를 열었다.
- 2026-04-04: 모바일에서 상단 wrapper의 좌우 거터를 제거하고 액션과 우측 메타만 얇은 내부 패딩을 유지하도록 조정했다.
- 2026-04-04: 지도/empty-map 높이를 `320px` 기준으로 낮추고 small breakpoint 이상에서만 더 큰 높이를 허용해 첫 화면 세로 점유를 줄였다.
- 2026-04-04: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium`를 다시 실행해 통과를 확인했다.

## 리뷰 노트

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-360/frontend-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 첫 섹션 바깥의 charts/laps 구간은 이번 task 범위 밖이라 동일한 mobile density 확장은 별도 판단이 필요하다.
- Specialist review:
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-360/ui-ux-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 이후 분석 섹션이 더 복잡해지면 다시 center-column 감각으로 회귀하지 않도록 밀도 관리가 필요하다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-360/po-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 동일한 edge-aligned 원칙을 다른 detail surfaces에 확장할지는 별도 product 판단이 필요하다.

---
id: I-0014-350
title: workout detail 상단 분석 섹션의 카드형 래퍼를 제거
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0014-300-web-workout-analysis-detail-and-post-preview.md
  - tasks/archive/I-0014-340-web-workout-detail-runtime-and-error-recovery.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium
artifacts:
  - design/frontend/workout-experience.md
  - apps/web/src/pages/workouts/detail/index.tsx
  - apps/web/e2e/workout-detail.spec.ts
---

## Goal

`/workouts/:id` 상단 분석 섹션이 카드 UI처럼 보이지 않도록 정리하고, 데스크톱에서 평균 페이스 값이 줄바꿈 없이 안정적으로 읽히게 만든다.

## Done Criteria

- 첫 번째 workout detail 섹션이 둥근 테두리/그림자 카드처럼 보이지 않는다.
- 지도 섹션과 우측 메타 영역이 끊어진 카드가 아니라 하나의 분석 레이아웃처럼 읽힌다.
- 데스크톱에서 평균 페이스 값과 `/km` 단위가 줄바꿈 없이 표시된다.

## Notes

- 분석 우선 구조 자체는 유지한다.
- 카드 제거가 정보 밀도 저하로 이어지지 않게, divider와 spacing으로 위계를 만든다.

## 셀프 리뷰

- Scope and intent: `/workouts/:id` 상단 hero 섹션의 둥근 카드형 래퍼와 stat 타일을 제거하고, 지도와 우측 메타를 divider 기반 분석 레이아웃으로 다시 정렬했다. 평균 페이스 값과 `/km` 단위는 한 줄로 고정해 desktop 줄바꿈을 막았다.
- Source of truth: `design/frontend/workout-experience.md`, `apps/web/src/pages/workouts/detail/index.tsx`, `apps/web/e2e/workout-detail.spec.ts`
- Design divergence: 없음.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/workout-detail.spec.ts --project=chromium` 통과.
- Review routing: user-facing workout detail web 작업이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`를 적용한다.

## Review Focus

- Specialist reviewer should check: 상단 workout detail 레이아웃이 카드 없는 문서형 분석 표면으로 바뀌었는지, 그리고 평균 페이스 줄바꿈이 해소됐는지 확인한다.
- PO reviewer should check: 지도와 핵심 기록이 끊어진 박스 모음이 아니라 하나의 premium한 분석 읽기 흐름으로 느껴지는지 확인한다.

## Handoff

- 후속 작업이 detail 화면에 더 많은 메타데이터를 추가하더라도, 첫 섹션을 다시 카드 타일 모음으로 되돌리지 않는다.

## Design Divergence

- 없음.

## Attempt Log

- 2026-04-04: desktop workout detail의 상단 카드형 래퍼와 평균 페이스 줄바꿈 회귀를 해결하기 위한 후속 태스크로 시드했다.
- 2026-04-04: 첫 섹션의 outer card, stat tile, metric tile을 divider 기반 문서형 레이아웃으로 교체하고, 평균 페이스를 `whitespace-nowrap` + inline unit 조합으로 고정했다.

## Review Notes

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-350/frontend-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 이번 변경은 workout detail 첫 섹션에만 적용됐으므로, 다른 detail 화면이 같은 cardless hero 패턴을 원하면 별도 정렬이 필요하다.
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-350/ui-ux-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 상단 hero는 카드감이 많이 줄었지만, 향후 세부 기록 항목이 더 늘어나면 다시 타일형 블록으로 회귀하지 않도록 주의가 필요하다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0014-350/po-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 이번 task는 desktop workout detail hero에 집중했으므로, 모바일 detail 레이아웃 밀도는 후속 피드백이 있으면 별도로 판단해야 한다.

---
id: I-0022-232
title: Onboarding flow를 shared funnel로 migration한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0022-230-web-funnel-abstraction-history.md
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/pages/onboarding/__tests__/onboarding-funnel-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - docs/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - apps/web/src/pages/onboarding/index.tsx
  - apps/web/src/components/ui/funnel.tsx
---

## 목표

Onboarding의 local numeric step state를 shared history-aware funnel abstraction으로 migration해 browser Back/Forward와 validation behavior를 일관화한다.

## 완료 기준

- onboarding step state가 shared funnel API를 사용한다.
- browser Back은 route를 떠나기 전에 이전 onboarding step으로 이동한다.
- validation은 onboarding feature flow에 남고 funnel core로 이동하지 않는다.
- reload/back/forward behavior가 safe fallback과 현재 onboarding contract를 지킨다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R10-funnel-abstraction-and-history.md`.
- TDD: next/back, browser Back, validation block, reload fallback을 focused tests로 먼저 고정한다.
- Post composer migration은 CC-231에서 별도로 진행한다.

## 셀프 리뷰

- 범위와 의도: onboarding funnel migration만 다룬다.
- source of truth: I-0022 R8/R10.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 shared funnel API 사용과 route history behavior를 확인한다.
- Optional review: `ui-ux-reviewer`가 onboarding back/forward interaction이 사용자 기대와 맞는지 확인한다.

## 핸드오프

- CC-300에서 onboarding funnel regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- local numeric step state가 남으면 divergence로 기록하고 후속 제거 범위를 명확히 한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

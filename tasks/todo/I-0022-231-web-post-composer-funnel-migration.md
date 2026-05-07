---
id: I-0022-231
title: Post composer를 shared funnel로 migration한다
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
  - pnpm --filter @masters/web test -- --run src/pages/posts/new/__tests__/post-composer-funnel-migration.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - docs/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - apps/web/src/pages/posts/new/use-post-composer.ts
  - apps/web/src/pages/posts/new
  - apps/web/src/components/ui/funnel.tsx
---

## 목표

Post composer의 route-local step state와 manual `window.history.pushState`를 shared history-aware funnel abstraction으로 migration한다.

## 완료 기준

- post composer가 shared funnel API로 workout/photos/text/preview step과 context를 관리한다.
- hand-written `window.history.pushState` step logic이 제거된다.
- next/back/browser Back/Forward가 UI step과 history state를 일치시킨다.
- reload with step query는 recoverable context만 복원하고 그렇지 않으면 safe initial step으로 돌아간다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R10-funnel-abstraction-and-history.md`.
- TDD: next/back, browser Back from step 2+, context preservation, reload fallback을 focused tests로 먼저 고정한다.
- File object와 object URL cleanup은 post composer feature hook 책임으로 남긴다.

## 셀프 리뷰

- 범위와 의도: post composer funnel migration만 다룬다.
- source of truth: I-0022 R8/R10.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 shared funnel API 사용과 history cleanup을 확인한다.
- Optional review: `ui-ux-reviewer`가 composer step/back interaction이 자연스럽게 유지되는지 확인한다.

## 핸드오프

- CC-232는 onboarding에 같은 funnel contract를 적용하되 post composer validation을 재사용하지 않는다.

## 설계 divergence

- manual history logic이 남으면 divergence로 기록하고 제거 follow-up을 연결한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

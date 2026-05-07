---
id: I-0022-230
title: History-aware funnel abstraction을 구축한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: in_progress
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/ui/__tests__/funnel-history.test.tsx
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - docs/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - apps/web/src/components/ui/funnel.tsx
  - apps/web/src/components/ui
---

## 목표

Typed step, step context, `push/replace/back/go`, browser history sync를 제공하는 shared funnel abstraction을 구축한다.

## 완료 기준

- shared funnel core가 typed step/context와 render helper를 제공한다.
- `history.push`, `history.replace`, `history.back`, `history.go`가 browser history sync와 일관되게 동작한다.
- current step은 query 또는 합의된 route-visible 형태로 노출하고 large context는 URL에 직렬화하지 않는다.
- validation과 feature-specific object cleanup은 funnel core가 아니라 각 feature flow에 남긴다.
- archive 이동 시 실제 개선 요약을 파일 상단에 추가한다.

## 노트

- Source of truth: `R10-funnel-abstraction-and-history.md`.
- TDD: typed step transition, context preservation, push/replace/back/go behavior, unmount cleanup을 focused hook/component tests로 먼저 고정한다.
- Post composer와 onboarding migration은 CC-231/CC-232에서 별도로 진행한다.

## 셀프 리뷰

- 범위와 의도: shared funnel abstraction만 다룬다.
- source of truth: I-0022 R8/R10.
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: `frontend-reviewer`가 API shape, browser history integration, React boundary를 확인한다.
- Optional review: `ui-ux-reviewer`가 funnel navigation semantics가 user-facing flows에 적합한지 확인한다.

## 핸드오프

- CC-231과 CC-232는 이 abstraction을 사용하고 feature validation을 core로 옮기지 않는다.

## 설계 divergence

- 기존 shared `Funnel`이 local step state만 제공하면 이 task에서 history-aware API로 확장한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

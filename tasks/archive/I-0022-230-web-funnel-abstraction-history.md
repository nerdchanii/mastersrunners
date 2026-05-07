---
id: I-0022-230
title: History-aware funnel abstraction을 구축한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on: []
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/components/ui/__tests__/funnel-history.test.tsx
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - docs/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - apps/web/src/components/ui/funnel.tsx
  - apps/web/src/components/ui
---

## Archive Summary

I-0022-230 built the shared funnel foundation without migrating post composer or onboarding flows. The archived implementation adds a history-aware typed `useFunnel` overload, typed context/history/render helpers, query-visible current step sync with larger context kept in `history.state`, safe fallback normalization for unrecoverable later query steps, and popstate listener cleanup. The previous numeric local `useFunnel` API remains available for existing callers.

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
- 설계 divergence: 없음. post composer, onboarding, crew create migration은 수행하지 않았고 기존 numeric local `useFunnel` API를 유지했다.
- 검증:
  - Parent final verification: `pnpm --filter @masters/web test -- --run src/components/ui/__tests__/funnel-history.test.tsx` 통과, 15 files / 67 tests.
  - Parent final verification: `pnpm --filter @masters/web exec eslint src/components/ui/funnel.tsx src/components/ui/__tests__/funnel-history.test.tsx` 통과.
  - Parent final verification: `pnpm --filter @masters/web lint` 통과.
  - Parent final verification: raw `pnpm --filter @masters/web build`는 `VITE_API_URL`이 unset이라 의도대로 실패.
  - Parent final verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` 통과. 기존 Vite chunk-size warning은 남아 있다.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 API shape, browser history integration, React boundary를 확인한다.
- Optional review: `ui-ux-reviewer`가 funnel navigation semantics가 user-facing flows에 적합한지 확인한다.

## 핸드오프

- CC-231과 CC-232는 이 abstraction을 사용하고 feature validation을 core로 옮기지 않는다.

## 설계 divergence

- 기존 shared `Funnel`이 local step state만 제공하면 이 task에서 history-aware API로 확장한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: Worker B가 history-aware `useFunnel` overload를 추가했다. typed step/context, `Render`, `history.push/replace/back/go`, query step sync, `history.state` context 저장, invalid query normalization, popstate cleanup을 구현했다.
- 2026-05-07: Worker C가 frontend-reviewer findings를 반영했다. `resolveHistoryEntry`는 query step과 일치하는 stored `history.state`가 있을 때만 later step을 복구하고, unrecoverable `?composer.step=photos` reload는 `workout` query/state로 정규화한다. 테스트는 local facade 재선언을 제거하고 exported `useFunnel<ComposerFunnel>` overload와 public types를 직접 사용하도록 바꿨다.
- 2026-05-07: Worker/reviewer에 GPT-5.5 xhigh/high 사용을 요청했으나, child agent runtime이 독립적인 model enforcement proof를 노출하지 않는 제한을 확인했다.

## 리뷰 노트

- Optional review:
  - reviewer: frontend-reviewer
  - artifact: read-only findings 전달
  - decision: Worker C가 high/medium findings를 반영했고 archive 준비가 완료됐다.
  - findings: high unrecoverable later-step query context issue와 medium public typing test issue를 확인했다.
  - residual risks: post composer, onboarding, crew create migration은 후속 task 범위로 남긴다.
- Optional review:
  - reviewer: ui-ux-reviewer
  - decision: 이 task는 user-facing flow migration 없이 shared foundation만 구축하므로 UI/UX review를 defer했다.
  - residual risks: post composer와 onboarding UX semantics 검토는 후속 migration task에서 다룬다.

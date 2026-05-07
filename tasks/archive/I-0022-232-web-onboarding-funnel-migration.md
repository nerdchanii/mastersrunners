---
id: I-0022-232
title: Onboarding flow를 shared funnel로 migration한다
parent: I-0022-cool-code
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0022-230-web-funnel-abstraction-history.md
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/web test -- --run src/pages/onboarding/__tests__/onboarding-funnel-migration.test.tsx
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - docs/initiatives/I-0022-cool-code/README.md
  - docs/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - docs/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - apps/web/src/pages/onboarding/index.tsx
  - apps/web/src/components/ui/funnel.tsx
---

## Archive Summary

I-0022-232 migrated onboarding to the shared history-aware `useFunnel` flow for `profile`, `runner`, and `privacy` steps. The archived implementation syncs `onboarding.step` query state with `history.state`, recovers browser Back as an onboarding step transition before route exit, safely falls back to profile for unrecoverable later-step query reloads, and preserves the existing validation, skip, and save behavior in the onboarding feature flow.

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
- 설계 divergence: 없음. onboarding local numeric step state를 shared `useFunnel` history mode로 교체했고 validation은 funnel core가 아니라 feature flow에 유지했다.
- 검증:
  - PASS: `pnpm --filter @masters/web test src/pages/onboarding/__tests__/onboarding-funnel-migration.test.tsx` 통과, 1 file / 6 tests.
  - PASS: `pnpm --filter @masters/web test -- --run src/pages/onboarding/__tests__/onboarding-funnel-migration.test.tsx` 통과, 21 files / 107 tests. Task-listed command보다 넓게 실행됐지만 현재 workspace에서는 green이다.
  - PASS: scoped ESLint `pnpm --filter @masters/web exec eslint src/pages/onboarding/index.tsx src/pages/onboarding/__tests__/onboarding-funnel-migration.test.tsx` 통과.
  - PARTIAL/UNRELATED: `pnpm --filter @masters/web lint`는 concurrent/unrelated work의 unowned `src/pages/posts/new/__tests__/post-composer-funnel-migration.test.tsx` import sort에서 실패했다.
  - EXPECTED ENV FAIL: raw `pnpm --filter @masters/web build`는 non-development build에서 `VITE_API_URL`이 unset이라 실패했다.
  - PASS: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` 통과. 기존 chunk-size warning은 남아 있다.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 shared funnel API 사용과 route history behavior를 확인한다.
- Optional review: `ui-ux-reviewer`가 onboarding back/forward interaction이 사용자 기대와 맞는지 확인한다.

## 핸드오프

- CC-300에서 onboarding funnel regression을 최종 묶음으로 재검증한다.

## 설계 divergence

- local numeric step state가 남으면 divergence로 기록하고 후속 제거 범위를 명확히 한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: Worker A가 task를 active로 이동하고 onboarding funnel migration TDD tests를 implementation보다 먼저 추가했다.
- 2026-05-07: Worker B가 onboarding page의 local numeric step state를 `useFunnel` history mode로 migration했다. Step ids는 `profile`, `runner`, `privacy`를 사용하며 `onboarding.step` query와 `window.history.state.__mastersFunnel.onboarding`에 동기화된다.
- 2026-05-07: Direct focused onboarding migration test는 최초 red 확인 후 implementation 적용 재실행에서 6/6 passing. Task-listed Vitest command는 unrelated post composer migration test까지 포함해 실패함을 확인했다.
- 2026-05-07: Final manager verification에서 focused onboarding test, task-listed Vitest run, scoped ESLint, env-set web build가 통과했고 raw build는 expected env failure로 확인했다. Workspace lint는 unrelated post composer import sort로 partial 처리했다.
- 2026-05-07: frontend-reviewer와 ui-ux-reviewer optional review를 완료했고 둘 다 findings 없이 approved로 기록했다.

## 리뷰 노트

- Optional review:
  - reviewer: frontend-reviewer
  - artifact: read-only findings 전달
  - decision: approved
  - findings: 없음.
  - residual risks: task-listed test command는 의도보다 넓게 실행된다. Recoverable reload path는 주로 shared funnel contract로 보장된다.
- Optional review:
  - reviewer: ui-ux-reviewer
  - artifact: read-only findings 전달
  - decision: approved
  - findings: 없음.
  - residual risks: browser Forward with preserved values는 shared funnel behavior에서 추론되지만 onboarding page spec에서 직접 assert하지 않았다.

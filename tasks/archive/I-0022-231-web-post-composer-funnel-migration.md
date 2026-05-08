---
id: I-0022-231
title: Post composer를 shared funnel로 migration한다
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
  - pnpm --filter @masters/web exec vitest run src/pages/posts/new/__tests__/post-composer-funnel-migration.test.tsx
  - pnpm --filter @masters/web lint
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - design/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - apps/web/src/pages/posts/new/use-post-composer.ts
  - apps/web/src/pages/posts/new
  - apps/web/src/components/ui/funnel.tsx
---

## 실제 개선 요약

- post composer의 numeric route-local step과 manual `window.history.pushState`를 제거하고 `workout -> photos -> text -> preview` typed step funnel로 바꿨다.
- browser Back, step query reload, step 간 context 보존을 `useFunnel` history mode로 통일해 수동 popstate 처리 없이 동일한 step/history contract를 사용한다.
- 업로드 cleanup, submit payload shaping, visibility/workout/image state ownership은 feature hook에 유지해 funnel migration이 기능 동작을 약화시키지 않도록 고정했다.

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
- 설계 divergence: 없음. numeric step/manual history ownership을 제거했고 upload/submit invariants는 feature hook에 유지했다.
- 검증:
  - PASS: `pnpm --filter @masters/web exec vitest run src/pages/posts/new/__tests__/post-composer-funnel-migration.test.tsx` 통과, 1 file / 5 tests.
  - PASS: `pnpm lint` 통과.
  - PASS: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` 통과. 기존 large chunk warning만 남는다.
  - PASS: `bash scripts/check-active-task-closeout.sh` 통과.

## 리뷰 계획

- Optional review: `frontend-reviewer`가 shared funnel API 사용과 history cleanup을 확인한다.
- Optional review: `ui-ux-reviewer`가 composer step/back interaction이 자연스럽게 유지되는지 확인한다.

## 핸드오프

- CC-232는 onboarding에 같은 funnel contract를 적용하되 post composer validation을 재사용하지 않는다.

## 설계 divergence

- manual history logic이 남으면 divergence로 기록하고 제거 follow-up을 연결한다.

## 시도 로그

- 2026-05-07: I-0022 roadmap에서 seed task를 생성했다.
- 2026-05-07: Post composer hook을 `useFunnel` history sync로 전환하고 numeric route-local step/manual `pushState` ownership을 제거했다.
- 2026-05-08: post composer focused migration test import ordering을 정리해 workspace lint gate를 복구했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

# I-0023: Mobile Layout & Spacing System (Top-Down Audit → Refactor)

## Summary

모바일 기준(`apps/web`)에서 페이지별 레이아웃/여백이 **어디서(누가) 결정되는지**를 Top-Down으로 사실 기반으로 수집하고, 이를 바탕으로 **레이아웃/여백 계층 설계(리팩토링 계획)** 를 수립한다.

## Problem

- `margin / padding / gap / container` 책임이 혼재되어 “여백의 원인”을 추적하기 어렵다.
- 페이지 간 여백 감(리듬)이 일관되지 않아 UX가 흔들린다(예: `/feed` vs `/profile`, `/posts/:postId` vs `/workouts/:workoutId`).
- 토큰/프리미티브 부재로 Tailwind 유사 클래스가 반복되고, ad-hoc wrapper/div가 늘어난다.

## Goals

- `apps/web` 모바일 UI 전 페이지에 대해 “루트 → 하위 컴포넌트” 경로별 레이아웃/여백 결정 지점을 기록한다.
- 페이지별로 **현재(사실)** 레이아웃 구조와 spacing 계산의 근거를 아스키아트로 남긴다.
- 조사 결과를 기반으로 리팩토링 방향(계층/토큰/프리미티브/규칙)을 명확히 하는 계획을 만든다.

## Non-Goals

- 이번 단계에서 실제 리팩토링/디자인 수정/컴포넌트 재작성은 하지 않는다.
- 데스크톱 기준 최적화는 범위 밖(모바일 기준이 우선).

## Scope

- 대상: `apps/web` (모바일 뷰포트 기준)
- 산출물: `design/initiatives/I-0023-mobile-layout-spacing-system/analysis/*`

## Design References

- `design/frontend/`
- `design/architecture/`

## Review Plan

- `web` 조사/정리 검토 (선택)
- 레이아웃/여백 시스템 설계 검토 (선택)

## Task Breakdown

- `tasks/active/I-0023-010-web-mobile-layout-spacing-audit.md`
- `tasks/todo/I-0023-020-web-mobile-layout-spacing-refactor-plan.md`

## Success Criteria

- CTO가 `analysis/README.md`를 10초 보고 “현재 문제 유형/분포/우선순위”를 이해한다.
- 페이지 단위 문서에서 “spacing이 어디서 결정되는지”가 추적 가능하다.

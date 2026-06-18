---
id: I-0024-030
title: 남은 route-critical query adoption follow-up을 정리한다
parent: I-0024-route-critical-query-boundary-adoption
scope: web
owner: unassigned
depends_on:
  - tasks/todo/I-0024-010-web-route-critical-query-policy-and-audit.md
  - tasks/todo/I-0024-020-web-workouts-route-critical-query-adoption.md
blocked_by: []
verify:
  - rg -n "if \\(isLoading\\)|if \\(error\\)|if \\(isPending\\)|if \\(.*isError.*\\)" apps/web/src/pages -g 'index.tsx'
artifacts:
  - apps/web/src/pages
  - design/frontend/conventions.md
  - design/initiatives/I-0024-route-critical-query-boundary-adoption.md
---

## 목표

`/workouts` 이후 남아 있는 route-critical initial query surfaces를 정리하고, follow-up migration 순서를 고정한다.

## 완료 기준

- audit 결과를 바탕으로 남은 candidate route와 우선순위가 정리된다.
- route-critical initial query와 auxiliary query가 뒤섞인 surface는 별도 task로 분리된다.

## 노트

- 모든 top-level loading/error branch를 blanket하게 제거하는 task가 아니다.
- route-critical initial query만 boundary-owned recovery 대상으로 삼고, auxiliary query는 smaller boundary 또는 inline recovery를 유지할 수 있다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:

## 리뷰 계획

- Optional review: follow-up 분류가 `I-0022`와 `I-0024` 설계에 맞는지 확인한다.

## 핸드오프

- 이후 개별 route task는 이 task에서 분류된 candidate와 우선순위를 따른다.

## 설계 divergence

- 아직 migration되지 않은 legacy route는 이 task에서 숨기지 말고 명시적으로 follow-up으로 남긴다.

## 시도 로그

- 2026-05-09: seed task created so the initiative can track remaining route-critical adoption after the `/workouts` pilot.

---
id: I-0016-170
title: 디자인 시스템 프리미티브를 재사용 단위로 정리한다
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
depends_on: []
blocked_by: []
verify:
  - pnpm --filter @masters/web lint
artifacts:
  - apps/web/src/components/ui
  - apps/web/src/components/crew
  - apps/web/src/components/workout
  - apps/web/src/pages/messages
  - design/frontend/ui-system.md
  - design/frontend/conventions.md
  - design/frontend/visual-system-rules.md
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
---

## 목표

여러 화면에서 제각각 다시 생기는 버튼, 태그, 액션 래퍼를 더 작은 재사용 프리미티브로 정리한다.

## 완료 기준

- 반복되는 `icon button` 계열 affordance가 공용 프리미티브로 정리된다.
- 공통 `pill/tag` 스타일이 surface별 ad hoc wrapper 대신 재사용 가능한 단위로 모인다.
- crew/workout/messages에 흩어진 primitive wrapper 정리가 current design docs와 맞는다.

## 노트

- 이 task는 `design/initiatives/I-0016-design-system-and-ux-guardrails.md`의 2026-04-11 follow-up을 task inventory에 복원하기 위해 재시드했다.
- Storybook은 현재 범위에 포함하지 않는다. 검증 truth는 실앱, Playwright, current design docs다.
- 관련 UX 문서: `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `design/frontend/visual-system-rules.md`

## 셀프 리뷰

- 범위와 의도: task inventory 복원용 seed task라 아직 구현은 시작하지 않았다.
- source of truth: `design/initiatives/I-0016-design-system-and-ux-guardrails.md`, `design/frontend/ui-system.md`, `design/frontend/conventions.md`, `design/frontend/visual-system-rules.md`
- 설계 divergence: 없음.
- 검증: not run; seed task only.
- 리뷰: 필요하면 UI 구조와 사용자 가치 관점에서 추가 검토한다.

## 리뷰 계획

- 추가 검토 초점: 프리미티브 통합 범위가 surface language 재사용 문제에 맞게 잘 잘려 있고, 후속 task가 UX 일관성 문제를 실제 사용자 가치에 맞게 설명하는지 확인한다.

## 핸드오프

- 구현을 시작할 때 현재 중복되는 `icon button`, `pill/tag`, action wrapper 사례를 실제 코드 기준으로 다시 inventory 한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-05: `I-0020-010` docs review에서 initiative note에만 남아 있던 `I-0016-170` follow-up을 task inventory로 복원했다.

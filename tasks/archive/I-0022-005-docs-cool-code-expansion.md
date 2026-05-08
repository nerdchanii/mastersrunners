---
id: I-0022-005
title: Expand Cool Code frontend refactoring initiative
parent: I-0022-cool-code
scope: docs
owner: codex
depends_on: []
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - git diff --check -- AGENTS.md design/initiatives/I-0022-cool-code tasks/archive/I-0022-005-docs-cool-code-expansion.md .agents/skills/initiative-orchestration-contract/SKILL.md .agents/skills/task-orchestration-tdd-lifecycle-contract/SKILL.md .agents/skills/worker-handoff-closeout-contract/SKILL.md .codex/agents
artifacts:
  - AGENTS.md
  - design/initiatives/I-0022-cool-code/README.md
  - design/initiatives/I-0022-cool-code/analysis-report.md
  - design/initiatives/I-0022-cool-code/details/R2-slap-layering-and-route-composition.md
  - design/initiatives/I-0022-cool-code/details/R3-query-key-cache-invalidation-matrix.md
  - design/initiatives/I-0022-cool-code/details/R4-detail-page-query-migration-contract.md
  - design/initiatives/I-0022-cool-code/details/R5-social-interaction-hooks.md
  - design/initiatives/I-0022-cool-code/details/R6-crew-board-and-crew-detail-composition.md
  - design/initiatives/I-0022-cool-code/details/R7-profile-tabs-composition-and-profile-query.md
  - design/initiatives/I-0022-cool-code/details/R8-regression-metrics-and-verification.md
  - design/initiatives/I-0022-cool-code/details/R9-router-loader-query-contract.md
  - design/initiatives/I-0022-cool-code/details/R10-funnel-abstraction-and-history.md
  - .agents/skills/initiative-orchestration-contract/SKILL.md
  - .agents/skills/task-orchestration-tdd-lifecycle-contract/SKILL.md
  - .agents/skills/worker-handoff-closeout-contract/SKILL.md
  - .codex/agents
---

## 실제 개선 요약

- `design/initiatives/I-0022-cool-code/` 아래에 분석 보고서, approved layering, query invalidation, loader/query contract, funnel abstraction, regression strategy를 task 가능한 설계 문서로 확장했다.
- `AGENTS.md`에 project-scoped Codex agent/skill protocol 사용 규칙을 추가하고 `.agents/skills/` 및 `.codex/agents/`에 initiative/task orchestration contract와 reviewer 역할 설정을 저장소 소스 오브 트루스로 정리했다.
- 이후 web implementation task들이 이 문서와 protocol을 근거로 독립적으로 진행될 수 있도록 I-0022의 문서/프로세스 기반을 닫았다.

## 목표

I-0022 Cool Code initiative를 Event/Challenge/Comment 중심 진단에서 broader frontend refactoring roadmap으로 확장한다.

## 완료 기준

- README와 analysis report가 확장된 code smell, architecture health, roadmap을 반영한다.
- R2-R8 detail docs가 layering, invalidation, migration, social interaction, crew/profile split, verification을 분리해 기록한다.
- R9-R10 detail docs가 React Router loader + TanStack Query contract와 history-aware funnel abstraction을 기록한다.
- 실제 `apps/web` source는 수정하지 않는다.

## 노트

- 사용자 요청 범위는 리팩토링 대상 탐색과 개선 방향 문서화다.
- 구현 task는 후속 `tasks/todo/I-0022-###-web-*.md` 단위로 생성한다.

## 셀프 리뷰

- 범위와 의도: docs and repo-scoped orchestration protocol expansion only.
- source of truth: `design/initiatives/I-0022-cool-code/*`.
- 설계 divergence: 코드 divergence는 analysis report와 details에 follow-up 대상 risk로 기록했다.
- 검증:
  - `git diff --check -- AGENTS.md design/initiatives/I-0022-cool-code tasks/archive/I-0022-005-docs-cool-code-expansion.md .agents/skills/initiative-orchestration-contract/SKILL.md .agents/skills/task-orchestration-tdd-lifecycle-contract/SKILL.md .agents/skills/worker-handoff-closeout-contract/SKILL.md .codex/agents`

## 리뷰 계획

- Optional review 없음. 이번 task는 문서 확장이고, critic role feedback을 반영했다.

## 핸드오프

- CC-010, CC-020, CC-210, CC-220은 독립 시작 가능하다.
- `CC-*`는 initiative-local ID이며 canonical task file은 `tasks/todo/I-0022-###-web-*.md` 형식을 사용한다.

## 설계 divergence

- 현재 구현은 approved layering보다 약하다. approved design을 낮추지 않고 후속 task roadmap으로 기록했다.

## 시도 로그

- 2026-05-07: code-researcher, web-researcher, to-be-thinker, critic, analyst 역할 결과를 반영해 I-0022 문서를 확장했다.
- 2026-05-07: loader는 `ensureQueryData(queryOptions)`만 사용하고 funnel은 typed step/context/history abstraction으로 통일하는 follow-up roadmap을 추가했다.
- 2026-05-08: `AGENTS.md`와 repo-scoped Codex protocol artifacts를 추가해 initiative/task orchestration 규칙을 저장소 정책으로 고정했다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

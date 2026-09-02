---
id: I-0026-010
title: AI slop 평가 오케스트레이션을 설계하고 초기 세션을 시작한다
parent: I-0026-ai-slop-evaluation-orchestration
scope: meta
owner: codex
depends_on: []
blocked_by: []
verify:
  - git diff --check
  - bash -lc 'test -f prompts/ai-slop/strategy.md'
  - bash -lc 'test -f prompts/ai-slop/classification-pass1.md'
  - bash -lc 'test -f prompts/ai-slop/classification-pass2.md'
  - bash -lc 'test -f prompts/ai-slop/rubric-and-metrics.md'
  - bash -lc 'test -f prompts/ai-slop/contract-open-questions.md'
  - bash -lc 'test -f prompts/ai-slop/developer-instructions.md'
  - bash -lc 'test -f prompts/ai-slop/final-rubric-contract.md'
  - bash -lc 'test -f prompts/ai-slop/final-classification-inventory.md'
  - bash -lc 'test -f prompts/ai-slop/evaluation-pass-template.md'
  - bash -lc 'grep -q "^## Subagent Pass Structure" prompts/ai-slop/strategy.md'
  - bash -lc 'grep -q "^## Orchestration Rules" prompts/ai-slop/developer-instructions.md'
  - bash -lc 'grep -q "^## Original Request" design/initiatives/I-0026-ai-slop-evaluation-orchestration.md'
  - bash -lc '! grep -rq "user_requst\|AGENTS override" prompts/ai-slop/developer-instructions.md prompts/ai-slop/evaluation-pass-template.md'
artifacts:
  - design/initiatives/I-0026-ai-slop-evaluation-orchestration.md
  - prompts/ai-slop/strategy.md
  - prompts/ai-slop/classification-pass1.md
  - prompts/ai-slop/classification-pass2.md
  - prompts/ai-slop/rubric-and-metrics.md
  - prompts/ai-slop/contract-open-questions.md
  - prompts/ai-slop/developer-instructions.md
  - prompts/ai-slop/final-rubric-contract.md
  - prompts/ai-slop/final-classification-inventory.md
  - prompts/ai-slop/evaluation-pass-template.md
---

## 목표

AI slop 평가 작업을 바로 실행 가능한 형태로 정리한다. 범위 분류, 루브릭 설계, 평가 패스, 보고 형식을 템플릿 문서로 고정하고 백그라운드 세션을 시작한다.

## 완료 기준

- 초기 요청이 `design/initiatives/I-0026-ai-slop-evaluation-orchestration.md`의 `Original Request` 섹션에 tracked 문서로 기록된다.
- 분류 1차/2차, 루브릭 작성, 평가 패스용 프롬프트 템플릿이 저장소에 존재한다.
- 템플릿이 읽어야 할 source-of-truth 경로, 제외 경로, evidence 형식, callback/report 계약이 명시된다.
- 첫 delegated session들이 시작되고, 어떤 세션이 어떤 모델/사고 강도로 어떤 결과를 돌려줘야 하는지 기록된다.

## 노트

- 평가 대상 분류에서 `node_modules`, build output, coverage, generated output은 제외한다.
- raw 파일은 수정 금지다. 모든 분석 산출물은 `path:#LXX` 근거를 남긴다.
- `path:#LXX`는 평가자가 새로 만드는 evidence/claim 출력 형식이다. 기존 원문 문서의 내부 링크나 줄번호 표기가 반드시 이 형식이어야 하는 것은 아니다.
- `gpt-5.3-codex-spark`와 `gpt-5.4-mini`는 실제 평가 패스에 사용한다.
- 현재 turn 시작 전에 존재하던 dirty 상태는 `5d05bea` 커밋으로 정리했다.
- 현재 루브릭, inventory, 평가 결과는 사용자 승인 전까지 초안 또는 provisional 상태다.

## 셀프 리뷰

- 범위와 의도: prompt orchestration, task/initiative framing, delegated evaluation strategy에 한정한다.
- source of truth: `AGENTS.md`, `tasks/README.md`, `design/initiatives/I-0026-ai-slop-evaluation-orchestration.md`.
- 설계 divergence: 없음. 이번 작업은 평가를 위한 운영 문서 추가다.

## 리뷰 계획

- 필요 시 후속 평가 결과를 바탕으로 별도 review task를 만든다.

## 핸드오프

- classification pass 2는 pass 1 결과를 입력으로 받아야 한다.
- rubric thread 결과가 오면 evaluation template의 metric section을 업데이트하거나 보강한다.
- classification pass 1 callback은 수신되었고, 분류 2차는 borderline path와 cluster 경계를 반박 검토해야 한다.
- 평가 패스는 `weighted_scores`, `aggregate_score_0_100`, `severity`, `out_of_inventory_candidates`를 반드시 반환해야 한다.
- classification pass 2 결과는 `prompts/ai-slop/final-classification-inventory.md`로 고정해 later pass 입력으로 사용한다.
- rubric 결과는 `prompts/ai-slop/final-rubric-contract.md`로 고정해 later pass 입력으로 사용한다.
- 다만 위 두 문서는 현재 approved contract가 아니라 proposed draft다.
- `prompts/ai-slop/contract-open-questions.md`가 정리되기 전에는 평가 결과를 최종 보고서로 취급하지 않는다.
- 낮은 thinking 실행을 위해 baseprompt는 얇게 두고 실제 역할/계약은 `prompts/ai-slop/developer-instructions.md`의 developer instruction으로 주입한다.
- 평가 실행 구조는 mechanical check 1회, 동일 candidate set에 대한 judge 3회, aggregation/adjudication 1회로 정렬한다.
- 평가 실행은 Codex subagent로 수행한다. main thread는 mechanical candidate set 고정, judge pass 입력 통일, aggregation 결과 기록을 담당한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-06-18: pre-existing dirty 상태를 `refactor(repo): retire live agent review harness` (`5d05bea`)로 정리했다.
- 2026-06-18: AI slop 평가 전략, prompt template, callback contract 초안을 추가하고 delegated session을 시작한다.
- 2026-06-18: `RUBRIC_DONE` callback을 수신했고, 가중치/하드페일/정규화 규칙을 `prompts/ai-slop/evaluation-pass-template.md`에 반영했다.
- 2026-06-18: `CLASSIFY1_DONE` callback을 수신했고, included/excluded/borderline inventory를 바탕으로 classification pass 2를 시작한다.
- 2026-06-18: `CLASSIFY2_DONE` callback을 수신했고, 최종 inventory를 `prompts/ai-slop/final-classification-inventory.md`로 고정했다.
- 2026-06-18: `RUBRIC_DONE` 결과를 `prompts/ai-slop/final-rubric-contract.md`로 고정하고 evaluation template의 필수 읽기 목록을 callback 의존에서 파일 의존으로 바꿨다.
- 2026-06-18: 사용자 지적에 따라 위 두 문서는 final이 아니라 proposed draft로 재해석했고, unresolved decision register를 추가했다.
- 2026-06-20: baseprompt 대신 developer instruction 중심으로 낮은 thinking subagent 실행 계약을 정리하고, evaluation template을 judge 3회 반복 구조로 조정했다.
- 2026-06-20: 사용자 지적에 따라 evaluation 실행을 subagent 기반으로 명시했다. `MECHANICAL_DONE` subagent 1회, `JUDGE1_DONE`/`JUDGE2_DONE`/`JUDGE3_DONE` 3회, `AGGREGATION_DONE` 1회를 실행했다.
- 2026-06-20: 당시 provisional aggregation에서는 `M-003` route-map citation format, `M-004` cool-code analysis citation format이 confirmed로 집계됐고, `M-001` user request ignore boundary와 `M-002` AGENTS override path boundary는 현재 workspace에서 resolved/rejected로 집계됐다.
- 2026-06-22: 사용자 clarification에 따라 `path:#LXX`는 evaluation output evidence 계약이지 기존 원문 문서 전체의 citation 형식 요구가 아님을 명시했다. 따라서 `M-003`과 `M-004`는 repo 문서 결함으로 확정하지 않고, 이전 aggregation의 false-positive 후보로 재분류한다.
- 2026-06-22: provisional full evaluation을 subagent로 실행했다. `MECHANICAL_DONE`은 health endpoint guidance 후보 2개만 산출했고, judge 3회 및 aggregation 결과 `DEPLOYMENT.md`의 `/health` deployment verification 설명과 `docs/runbooks/rollback.md`의 rollback health 확인 설명이 canonical `/api/v1/health` guidance와 어긋나는 confirmed provisional findings로 집계됐다. 점수 평균은 약 71.7이며 severity는 medium~high 사이에서 편차가 있었다.
- 2026-09-02: I-0027-010에서 2026-06-22 이후 미커밋이던 이 태스크, 이니셔티브, `prompts/ai-slop/`를 커밋했다. Codex 전용 `AGENTS.override.md`의 규칙은 `prompts/ai-slop/developer-instructions.md`의 `Orchestration Rules`로, ignore 대상이던 `prompts/user_requst.md`의 요청 내용은 이니셔티브의 `Original Request`로 옮겨 override 의존을 끊었다. `verify`에 필수 섹션 존재 검사를 추가했다. 하드코딩된 모델명 치환은 I-0027-020에서 다룬다.

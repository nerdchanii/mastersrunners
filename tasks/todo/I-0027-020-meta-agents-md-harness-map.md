---
id: I-0027-020
title: AGENTS.md 하네스 맵과 역할·모델 표 추가
parent: I-0027-agent-harness-alignment
scope: meta
owner: unassigned
depends_on: [I-0027-010]
blocked_by: []
verify:
  - grep -q '^## Agent Harness Map' AGENTS.md
  - test -f design/operating-rules/agent-roles.md
  - "! grep -rniE 'gpt-5\\.[0-9]|claude-(opus|sonnet|haiku)-[0-9]' prompts design/initiatives AGENTS.md"
  - test ! -f AGENTS.override.md
  - "! grep -q AGENTS.override .gitignore"
artifacts:
  - AGENTS.md
  - design/operating-rules/agent-roles.md
  - prompts/ai-slop/strategy.md
  - design/initiatives/I-0026-ai-slop-evaluation-orchestration.md
---

## 목표

`AGENTS.md`에 두 에이전트가 공유하는 하네스 맵을 추가하고, 역할과 모델 매핑을 `design/operating-rules/agent-roles.md` 한 곳으로 모은다. 보고서 F-01, F-03, F-04, F-12를 닫는다.

## 완료 기준

- `AGENTS.md`에 `## Agent Harness Map` 섹션이 있고 보고서 §5.4의 항목(공유 지시, Claude 설정, Codex 설정, 스킬 경로, `prompts/`, override 금지, 감사 절차)을 모두 담는다.
- `agent-roles.md`가 역할 → 요구 능력 등급 → Codex 모델 / Claude 모델 표와 위임 원칙(읽기 전용 역할, 결과 반환 형식, 범위 밖 경로 처리)을 담는다.
- `prompts/ai-slop/strategy.md`, I-0026 이니셔티브에서 모델명이 역할 이름으로 대체되어 있다.
- `.codex/config.toml`의 `[agents]` 값이 왜 그 값인지 `agent-roles.md` 또는 주석에 설명되어 있다.

## 노트

- 근거: `docs/reports/agent-harness-audit-2026-09-02.md` §3 F-01, F-03, F-04, F-12, §5.4
- `AGENTS.md`는 영어, `design/operating-rules/*.md`는 기존 파일 언어 관례를 따른다.
- `agent-roles.md`는 "리포가 기대하는 역할"과 "사용자 전역에서 제공하는 구현(`~/.claude/agents`, `~/.codex/agents`)"을 구분해 적는다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:

## 리뷰 계획

- opt-in. 모델 등급 표는 사용자 확인 후 확정한다.

## 핸드오프

- `agent-roles.md` 경로를 I-0027-040(Codex 설정)에서 주석으로 참조한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-09-02: 감사 보고서에서 파생. I-0027-010 완료 후 시작.

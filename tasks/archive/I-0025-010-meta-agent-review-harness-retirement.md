---
id: I-0025-010
title: Agent/review live harness를 퇴역시킨다
parent: I-0025-agent-review-harness-retirement
scope: meta
owner: codex
depends_on: []
blocked_by: []
verify:
  - bash -lc 'if rg -n "task-orchestrator|initiative-orchestrator|task-critic|reviewers/protocols|Stop-hook review|check-active-task-closeout|check-task-review-metadata" AGENTS.md tasks/README.md tasks/_templates docs/guides docs/runbooks design/operating-rules design/initiatives scripts .github .codex .agents .claude -g "*"; then exit 1; else exit 0; fi'
  - bash -n scripts/ci-local.sh
  - pnpm format:check
artifacts:
  - AGENTS.md
  - tasks/README.md
  - tasks/_templates/TASK-TEMPLATE.md
  - design/initiatives/I-0025-agent-review-harness-retirement.md
---

## 목표

현재 에이전트 행동을 왜곡하던 live agent/review orchestration harness를 제거하고, task 상태를 폴더 위치 기준으로 단순화한다.

## 완료 기준

- live docs와 CI/local CI가 retired reviewer protocol, session-end review, active closeout gate를 더 이상 참조하지 않는다.
- repo-scoped orchestrator/reviewer agent와 skill 파일이 제거된다.
- `tasks/reviews/**`와 기존 archive task는 과거 증빙으로 보존된다.
- production code는 변경하지 않는다.

## 노트

- `I-0017`은 과거 reviewer protocol harness history로 남기되, 현재 결과 note를 추가해 `I-0025`가 supersede했음을 명시한다.
- `.codex/config.toml`, `.codex/hooks.json`, `.codex/environments/**`는 런타임 설정이므로 보존한다.

## 셀프 리뷰

- 범위와 의도: repo/process 문서와 live harness 파일 제거에 한정한다.
- source of truth: `AGENTS.md`, `tasks/README.md`, `design/initiatives/I-0025-agent-review-harness-retirement.md`.
- 설계 divergence: mandatory review/Stop-hook 방향은 `I-0025`에서 superseded로 기록한다.
- 검증: 제거 대상 참조 검색, shell syntax, `pnpm format:check`, `git diff --check`는 통과했다. `pnpm ci:local`은 제거된 gate를 호출하지 않는 상태로 진행됐고, 기존 web unused baseline 때문에 `knip` 단계에서 실패했다.

## 리뷰 계획

- 추가 검토는 요청하지 않는다. 변경 범위는 repository workflow cleanup이며 사용자가 제거 범위를 직접 지정했다.

## 핸드오프

- 후속 task는 `tasks/reviews/**`를 live routing source로 사용하지 말고 historical evidence로만 취급한다.

## 설계 divergence

- 없음. 현재 운영 모델을 folder-state task workflow로 낮추는 정리다.

## 시도 로그

- 2026-05-12: task 생성. live harness retirement 범위는 사용자 선택에 따라 archive evidence 보존, active closeout gate 제거, 운영 agent/skill 파일 삭제로 확정했다.
- 2026-05-12: live docs, CI/local CI, task template, current todo/active task metadata, repo-scoped agent/skill files, reviewer registry/schema, retired review scripts를 정리했다.
- 2026-05-12: `pnpm ci:local`은 `knip` 단계에서 기존 unused file/export baseline으로 실패했다. 제거 대상 gate는 호출되지 않았다.

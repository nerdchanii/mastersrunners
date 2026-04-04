---
id: I-0017-050
title: 공식 reviewer protocol 파일이 실제로 git에 추적되게 보정한다
parent: I-0017-reviewer-capability-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0017-020-meta-official-reviewer-protocol-alignment.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - bash scripts/check-reviewer-protocols.sh
  - bash scripts/check-reviewer-protocol-wiring.sh
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - .gitignore
  - .codex/agents/
  - .codex/config.toml
  - .codex/hooks.json
  - .claude/agents/
  - .claude/skills/
---

## 목표

reviewer protocol 하네스가 문서와 스크립트만 있는 상태가 아니라, 실제 `.codex` 및 `.claude` protocol artifact가 git에 추적되도록 보정한다.

## 완료 기준

- `.codex/agents`, `.codex/config.toml`, `.codex/hooks.json`이 git tracked 상태가 된다.
- `.claude/agents`, `.claude/skills/*/SKILL.md`가 git tracked 상태가 된다.
- `.gitignore`는 protocol artifact만 허용하고, unrelated local-only `.codex/.claude` 파일은 계속 막는다.

## 노트

- 이전 `I-0017` 작업으로 protocol artifact는 생성됐지만, `.gitignore`가 `.codex/`와 `.claude/` 전체를 막아 실제 커밋에는 빠질 수 있는 상태였다.
- 이 태스크는 protocol 설계를 바꾸지 않고, 이미 채택한 공식 protocol artifact가 실제 저장소 truth가 되도록 tracking만 보정한다.

## 셀프 리뷰

- 범위와 의도: reviewer protocol 설계 자체를 바꾸지 않고, git ignore 규칙을 최소 수정해 공식 protocol artifact만 실제 버전 관리에 포함되도록 보정했다.
- source of truth: `design/initiatives/I-0017-reviewer-capability-harness.md`, `reviewers/protocols.json`, `.gitignore`, OpenAI Codex/Claude Code protocol 경로 문서
- 설계 divergence: `.codex/environments/`와 `.claude/commands/` 같은 local helper 파일은 계속 ignore로 남기고, reviewer protocol artifact만 tracking 대상으로 좁혔다.
- 검증: `bash scripts/check-reviewer-protocols.sh`, `bash scripts/check-reviewer-protocol-wiring.sh`, `bash scripts/check-task-review-metadata.sh`를 통과했다.
- 리뷰 라우팅: `harness-reviewer`, `po-reviewer`

## 리뷰 초점

- Specialist reviewer가 확인할 내용: ignore 규칙이 protocol artifact만 정확히 통과시키고, local-only helper 파일까지 무분별하게 추적하지 않는지 확인한다.
- PO reviewer가 확인할 내용: 이 보정이 reviewer protocol 하네스의 실효성을 높이고, 앞으로 “문서엔 있는데 git엔 없는” 상태를 막는지 확인한다.

## 핸드오프

- reviewer protocol 경로를 새로 추가할 때는 `.gitignore` 허용 규칙도 함께 갱신해야 한다.

## 설계 divergence

- protocol artifact 외 `.codex`/`.claude` 보조 파일은 local-only 성격을 유지하기 위해 계속 ignore한다.

## 시도 로그

- 2026-04-04: `.gitignore`가 `.codex/`와 `.claude/` 전체를 막고 있어 reviewer protocol files가 실제 git tracked 상태가 아니라는 점을 확인했다.
- 2026-04-04: reviewer protocol artifact만 허용하고, `.codex/environments/`와 `.claude/commands/`는 계속 ignore하는 최소 보정으로 tracking을 복구했다.

## 리뷰 노트

- Self review: 2026-04-04 checklist 기준으로 scope, source-of-truth, ignore 예외 범위, verification, reviewer routing을 다시 점검했다.
- Specialist review:
  - reviewer: harness-reviewer
  - reviewer protocol: `.codex/agents/harness-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/harness-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-050/harness-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 앞으로 reviewer protocol 경로가 늘어나면 `.gitignore` 허용 목록도 같이 갱신해야 한다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-050/po-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: protocol artifact 자체는 이제 tracked 되지만, reviewer taxonomy 변경 시 ignore 규칙까지 같이 유지하는 운영 습관이 계속 필요하다.

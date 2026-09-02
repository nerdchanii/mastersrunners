---
id: I-0027-010
title: 하네스 워킹트리 미커밋 상태 정리 및 origin 동기화
parent: I-0027-agent-harness-alignment
scope: meta
owner: unassigned
depends_on: []
blocked_by: []
verify:
  - test -z "$(git status --porcelain)"
  - test "$(git rev-list --count origin/dev..dev)" = 0
  - grep -q 'references/patterns/' .agents/skills/ast-grep/SKILL.md
  - "! grep -q codex_hooks .codex/config.toml"
  - grep -q 'prompts/' AGENTS.md
artifacts:
  - .gitignore
  - .codex/config.toml
  - .agents/skills/ast-grep/SKILL.md
  - .agents/skills/ast-grep/references/patterns/
  - design/initiatives/I-0026-ai-slop-evaluation-orchestration.md
  - tasks/active/I-0026-010-meta-ai-slop-evaluation-orchestration.md
  - prompts/ai-slop/
---

## 목표

2026-06-22 이후 로컬에만 있던 하네스 변경을 검토해 커밋하거나 폐기하고, `dev`를 `origin/dev`와 동기화한다. 보고서 F-09, F-11, F-13, F-17을 닫는다.

## 완료 기준

- `.codex/config.toml`에서 `codex_hooks`, `multi_agent` 두 줄이 제거된 정리본이 커밋되어 있다.
- ast-grep 스킬의 `references/patterns.md` 분할이 확정되어 `SKILL.md`가 새 경로를 가리키고, `python.md`는 제외되어 있다.
- I-0026 이니셔티브, 활성 태스크, `prompts/ai-slop/`가 커밋되어 있거나, 폐기 결정이 `I-0026` 태스크 시도 로그에 기록되고 파일이 제거되어 있다.
- 커밋한 경우 `AGENTS.md` Source of Truth Map에 `prompts/ai-slop/`가 등록되어 있다.
- `.gitignore`에서 `AGENTS.override.md` 항목이 제거되고 로컬 파일도 삭제되어 있다.
- `dev`가 push되어 `origin/dev`와 같다.

## 노트

- 근거: `docs/reports/agent-harness-audit-2026-09-02.md` §3 F-09, F-11, F-13, F-17
- `prompts/user_requst.md`는 ignore 대상이다. 그 내용이 필요하면 tracked 문서로 옮긴 뒤 override 의존을 끊는다.
- `I-0026` 태스크의 `verify`는 전부 `test -f`다. 커밋할 때 필수 섹션 존재 검사 하나 이상을 추가한다.
- 이 태스크가 끝나기 전에는 I-0027-020, I-0027-050을 시작하지 않는다. 같은 파일을 건드린다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:

## 리뷰 계획

- 리뷰는 opt-in이다. I-0026 폐기 여부는 사용자 결정이 필요하므로 커밋 전에 한 번 확인한다.

## 핸드오프

- 워킹트리가 닫힌 커밋 해시를 I-0027-020, I-0027-050의 시도 로그에 적는다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-09-02: 감사 보고서에서 파생. 아직 시작하지 않음.

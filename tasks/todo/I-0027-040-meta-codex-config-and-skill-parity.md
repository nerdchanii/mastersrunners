---
id: I-0027-040
title: Codex 설정 정리와 Claude 스킬 포워더 추가
parent: I-0027-agent-harness-alignment
scope: meta
owner: unassigned
depends_on: [I-0027-010, I-0027-020]
blocked_by: []
verify:
  - test -f .claude/skills/ast-grep/SKILL.md
  - grep -q '.agents/skills/ast-grep/SKILL.md' .claude/skills/ast-grep/SKILL.md
  - "! grep -q codex_hooks .codex/config.toml"
  - grep -q 'max_threads' .codex/config.toml
  - 'test ! -f .codex/hooks.json || node -e "const h=JSON.parse(require(''fs'').readFileSync(''.codex/hooks.json'',''utf8'')).hooks; if(!Object.keys(h).length) process.exit(1)"'
artifacts:
  - .codex/config.toml
  - .codex/hooks.json
  - .claude/skills/ast-grep/SKILL.md
---

## 목표

`.codex/config.toml`에 `[agents]` 값의 근거 주석을 붙이고, `.codex/hooks.json`을 실제 훅으로 채우거나 삭제하며, `.agents/skills/ast-grep`을 Claude에서도 쓰도록 포워더를 추가한다. 보고서 F-10, F-11(포워더 부분)을 닫는다.

## 완료 기준

- `.codex/config.toml`이 보고서 §5.3 형태이며 `max_threads`, `max_depth`에 한 줄 주석이 있다.
- `.codex/hooks.json`이 최소 훅(`.env*` 읽기 차단, `tasks/archive/**` 수정 차단) 하나 이상을 담거나, 파일이 삭제되고 I-0025 이니셔티브 Non-Goals에 삭제 사유가 추가되어 있다.
- `.claude/skills/ast-grep/SKILL.md`가 보고서 §5.5 형태의 포워더로 존재한다.
- `.gitignore`의 `!.claude/skills/*/SKILL.md` 허용 규칙으로 포워더가 tracked 된다.

## 노트

- 근거: `docs/reports/agent-harness-audit-2026-09-02.md` §3 F-10, F-11, §5.3, §5.5
- Codex hooks 스키마는 `codex features list`에서 `hooks`가 stable인 0.152 기준으로 확인한다.
- ast-grep 프로젝트 규칙(`sgconfig.yml`)은 이 태스크 범위 밖이다. 필요하면 후속 태스크로 뺀다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:

## 리뷰 계획

- opt-in.

## 핸드오프

- 이후 스킬 추가 시 "원본은 `.agents/skills/`, 포워더는 `.claude/skills/`" 규칙을 `AGENTS.md` 하네스 맵에서 참조한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-09-02: 감사 보고서에서 파생.

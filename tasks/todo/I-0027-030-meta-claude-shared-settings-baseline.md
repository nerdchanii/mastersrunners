---
id: I-0027-030
title: Claude Code 공유 설정 기준선과 로컬 설정 정리
parent: I-0027-agent-harness-alignment
scope: meta
owner: unassigned
depends_on: []
blocked_by: []
verify:
  - test -f .claude/settings.json
  - node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"
  - git check-ignore -q .claude/settings.local.json
  - git check-ignore -q .claude/worktrees/probe
  - "! grep -q eyJ .claude/settings.local.json"
  - test ! -f .claude/commands/project-status.md
artifacts:
  - .claude/settings.json
  - .gitignore
---

## 목표

tracked `.claude/settings.json`을 추가해 리포가 Claude Code 세션에 기대하는 최소 권한과 deny 규칙을 표현하고, 로컬 설정에서 토큰과 죽은 규칙을 제거한다. 보고서 F-05, F-06, F-07, F-08을 닫는다.

## 완료 기준

- `.claude/settings.json`이 보고서 §5.2 초안을 기준으로 존재하며, 광범위 규칙(`pnpm:*`, `npx:*`, `python3:*`, `curl:*`)과 파괴적 명령(`git reset`, `pkill`)은 포함하지 않는다.
- `.env*` 읽기 deny 규칙이 들어 있다.
- 리포 `.gitignore`가 `.claude/settings.local.json`과 `.claude/worktrees/`를 직접 ignore하고 `!.claude/settings.json`을 허용한다. `.omc/` 항목은 제거한다.
- `.claude/settings.local.json`에서 JWT가 포함된 allow 규칙, 옛 경로 규칙, `enabledPlugins.rulebased-harness`가 제거되어 있다.
- 해당 JWT 토큰이 발급처에서 폐기되어 있다.
- `.claude/commands/project-status.md`가 삭제되어 있다.

## 노트

- 근거: `docs/reports/agent-harness-audit-2026-09-02.md` §3 F-05–F-08, §5.1, §5.2
- 토큰 폐기는 리포 밖 작업이다. 시도 로그에 폐기 시각만 남기고 토큰 값은 어디에도 적지 않는다.
- 로컬 파일 정리는 이 머신에서만 유효하다. 다른 머신에서는 `.gitignore` 변경만으로 재발을 막는다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:

## 리뷰 계획

- opt-in. allow 목록은 실제 세션 마찰을 한 주 관찰한 뒤 조정한다.

## 핸드오프

- `.claude/settings.json` 경로를 I-0027-020의 하네스 맵에 넣는다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-09-02: 감사 보고서에서 파생. I-0027-010과 독립이므로 바로 시작 가능.

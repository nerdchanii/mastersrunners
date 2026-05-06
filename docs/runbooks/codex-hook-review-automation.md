# Codex Hook Review Automation

이 저장소의 Codex Stop-hook review automation은 비활성화되어 있다.

## 현재 기준

- `.codex/hooks.json`은 Stop hook command를 등록하지 않는다.
- `.codex/config.toml`은 `codex_hooks = false`로 둔다.
- Codex session 종료 시 reviewer subagent를 자동 실행하지 않는다.
- Git `pre-push`는 `pnpm ci:local`을 실행하는 mechanical verification gate로 유지한다.
- reviewer protocol 파일은 참고 자료와 opt-in review 실행 자료로 남긴다.

## 비활성화한 이유

Stop hook review automation은 모든 task에 specialist review와 PO review를 사실상 필수화했다. 현재 저장소 기준은 review를 task별 판단 사항으로 낮추고, lint, format, typecheck, build, test 같은 기계적 검증만 기본 gate로 유지한다.

## 보존된 자료

아래 자료는 즉시 삭제하지 않는다.

- `.codex/agents/`
- `.agents/skills/`
- `.claude/agents/`
- `.claude/skills/`
- `reviewers/protocols.json`
- `tasks/reviews/`
- `scripts/codex-stop-review-hook.py`
- `scripts/check-codex-stop-review-hook.sh`

이 자료들은 나중에 task별 opt-in review 체계를 다시 설계할 때 참고하거나 수동 review artifact를 남길 때 사용할 수 있다.

## 다시 켜기 전 조건

Stop-hook review automation을 다시 켜려면 먼저 별도 task에서 아래를 명시해야 한다.

- 어떤 task가 자동 review 대상인지
- reviewer가 advisory 역할을 넘지 않는다는 권한 경계
- review artifact가 mechanical verification gate인지 단순 기록인지
- `.codex/hooks.json`, `.codex/config.toml`, CI/local CI, runbook의 동기화 방식

기본값은 disabled다.

# Codex Hook Review Automation

이 저장소는 official OpenAI Codex hook 경로인 `.codex/hooks.json`을 사용해 `Stop` hook 기반 same-session review automation을 수행한다.

## 목적

- verify와 self-review가 끝난 task를 사람이 잊지 않고 specialist review와 PO review로 넘긴다.
- review trigger ownership을 Git `pre-push`가 아니라 Codex session 종료 직전으로 앞당긴다.
- reviewer protocol은 `.codex/agents/`, `.agents/skills/`, `reviewers/protocols.json`을 그대로 재사용한다.

## 공식 출처

- OpenAI Codex hooks: `https://developers.openai.com/codex/hooks`
- OpenAI Codex subagents: `https://developers.openai.com/codex/subagents`
- OpenAI Codex skills: `https://developers.openai.com/codex/skills`

## 저장소 경로

- project config: `.codex/config.toml`
- repo-local hooks: `.codex/hooks.json`
- Stop hook entrypoint: `scripts/codex-stop-review-hook.py`
- smoke check: `scripts/check-codex-stop-review-hook.sh`

`.codex/config.toml`은 최소한 아래 기능을 켜둔다.

- `codex_hooks = true`
- `multi_agent = true`

## authoritative trigger

review automation owner는 Codex `Stop` hook이다.

- trigger event: `Stop`
- trigger mode: same-session continue
- non-goal: nested `codex review` subprocess
- fallback: Git `pre-push` + existing closeout gates
- rollout choice: immediate hard stop. 기존 active backlog가 아직 여러 개인 repo 상태에서도 warning이 아니라 `block(invariant-error)`를 택한다.

## Stop hook decision rules

`scripts/codex-stop-review-hook.py`는 아래 규칙으로 동작한다.

1. dirty worktree가 아니면 `allow`
2. dirty worktree인데 `tasks/active/`가 정확히 1개가 아니면 `block(invariant-error)`
3. active task metadata가 깨졌거나 reviewer routing truth와 맞지 않으면 `block(invariant-error)`
4. active task가 아래 조건을 모두 만족하면 review continuation reason과 함께 `decision: "block"`
   - `execution_status: in_progress`
   - `review_status: pending`
   - `verification_status: passed`
   - `## 셀프 리뷰` 다섯 항목이 placeholder 없이 채워짐
5. 그 외 상태면 `allow`

`stop_hook_active: true`인 재진입 상황에서는 loop를 피하기 위해 no-op 한다.

## same-session review flow

hook이 review continuation reason과 함께 `decision: "block"`을 반환하면 현재 Codex session은 종료하지 않고 아래를 수행해야 한다.

1. active task와 changed files를 다시 읽는다.
2. required specialist reviewer subagent를 실행한다.
3. specialist findings가 `changes_requested`면 필요한 수정만 하고 verify를 다시 수행한다.
4. specialist가 승인하면 `po-reviewer`를 실행한다.
5. `tasks/reviews/<task-id>/<reviewer>.json` artifact와 task `리뷰 노트`를 함께 갱신한다.
6. review/verify가 끝난 뒤 archive/commit 단계로 이동한다.

## 운영 규칙

- dirty Codex worktree는 active task 하나만 유지한다.
- 이 저장소는 single-active-task invariant를 즉시 강제한다. 따라서 rollout 직후에는 기존 multi-active backlog 때문에 Stop hook이 계속 block될 수 있고, 이는 버그가 아니라 의도된 정상 동작이다.
- `Stop` hook은 review owner이고, `pre-push`는 closeout fallback gate다.
- reviewer protocol을 바꾸면 `reviewers/protocols.json`, `.codex/agents/`, `.agents/skills/`, 이 runbook을 같이 갱신한다.
- hook wiring을 바꾸면 `.codex/config.toml`, `.codex/hooks.json`, `scripts/check-reviewer-protocol-wiring.sh`, CI/local CI를 같이 갱신한다.

## 검증

- `bash scripts/check-reviewer-protocols.sh`
- `bash scripts/check-reviewer-protocol-wiring.sh`
- `bash scripts/check-task-review-metadata.sh`
- `bash scripts/check-active-task-closeout.sh`
- `bash scripts/check-codex-stop-review-hook.sh`

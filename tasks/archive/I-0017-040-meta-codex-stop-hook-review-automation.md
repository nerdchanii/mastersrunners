---
id: I-0017-040
title: Codex Stop 훅으로 same-session review 자동화를 연결한다
parent: I-0017-reviewer-capability-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0017-030-meta-review-artifact-contract-refinement.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - bash scripts/check-reviewer-protocols.sh
  - bash scripts/check-reviewer-protocol-wiring.sh
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-active-task-closeout.sh
  - bash scripts/check-codex-stop-review-hook.sh
artifacts:
  - .codex/config.toml
  - .codex/hooks.json
  - scripts/codex-stop-review-hook.py
  - scripts/check-codex-stop-review-hook.sh
  - design/initiatives/I-0017-reviewer-capability-harness.md
  - docs/guides/agent-self-review.md
  - docs/guides/review-harness.md
  - docs/runbooks/reviewer-capabilities.md
  - docs/runbooks/codex-hook-review-automation.md
  - tasks/_templates/TASK-TEMPLATE.md
  - scripts/check-reviewer-protocol-wiring.sh
  - scripts/ci-local.sh
  - .github/workflows/ci.yml
  - AGENTS.md
---

## 목표

Codex 공식 `Stop` 훅을 저장소에 연결해, verify와 self-review가 끝난 단일 active task가 session 종료 직전에 reviewer subagent review를 same-session으로 이어서 수행하게 만든다.

## 완료 기준

- 저장소가 공식 `.codex/hooks.json` 경로에 Stop 훅을 가진다.
- Stop 훅이 dirty worktree에서 active task가 정확히 하나인지 강제한다.
- verify passed + self-review 완료 + review pending 상태의 task만 same-session review continuation prompt를 생성한다.
- hook wiring과 smoke 검증이 CI/local CI에 연결된다.

## 노트

- v1은 nested Codex subprocess를 띄우지 않고, Stop 훅이 같은 세션을 계속 이어서 reviewer subagent를 수행하게 만든다.
- Git `pre-push`는 closeout fallback gate로 유지하고, review trigger owner는 Codex Stop 훅으로 둔다.

## 셀프 리뷰

- 범위와 의도: official Codex `Stop` hook을 repo-local reviewer overlay 계약에 연결하고, same-session review continuation prompt와 smoke 검증까지만 이번 범위에 포함했다.
- source of truth: OpenAI Codex hooks/subagents/skills 문서, `AGENTS.md`, `docs/guides/review-harness.md`, `docs/runbooks/reviewer-capabilities.md`, `reviewers/protocols.json`
- 설계 divergence: 저장소 규칙은 dirty worktree당 active task 하나를 요구하지만, 현재 repo에는 기존 active task가 여러 개 남아 있어 새 Stop hook이 즉시 invariant block을 반환한다. 이는 사용자 결정에 따른 immediate hard stop rollout이며, backlog normalization은 별도 운영 후속이다.
- 검증: `bash scripts/check-reviewer-protocols.sh`, `bash scripts/check-reviewer-protocol-wiring.sh`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`, `bash scripts/check-codex-stop-review-hook.sh`, `python3 -m py_compile scripts/codex-stop-review-hook.py`, current repo payload smoke
- 리뷰 라우팅: `harness-reviewer`, `docs-reviewer`, `po-reviewer`

## 리뷰 초점

- Specialist reviewer가 확인할 내용: official `.codex/hooks.json` wiring, Stop-hook decision contract, single-active invariant enforcement, CI/local smoke coverage가 reviewer overlay와 충돌하지 않는지 확인한다.
- PO reviewer가 확인할 내용: 자동 review trigger가 실제 작업 흐름을 개선하면서도 과도한 nested automation 없이 same-session review 루프를 만들었는지 확인한다.

## 핸드오프

- 현재 repo의 active task가 여러 개인 상태에서는 Stop hook이 의도적으로 invariant block을 반환한다. 이는 immediate hard stop rollout의 일부이며, 실제 운영 효용을 보려면 active task normalization이 뒤따라야 한다.

## 설계 divergence

- 승인된 설계와 현재 구현 사이의 차이를 기록한다.
- 이 태스크 이후에도 차이가 남는다면, 여기서 후속 태스크를 연결한다.
- 미완성 코드를 맞추기 위해 승인된 설계 문서를 낮춰 다시 쓰지 않는다.
- dirty worktree당 active task 하나 규칙은 문서와 hook에 반영됐지만, 현재 작업중인 repo backlog는 아직 그 규칙을 만족하지 않는다. 이 상태에서 block이 발생하는 것은 rollout 버그가 아니라 채택된 운영 정책이다.

## 시도 로그

- 2026-04-04: Codex Stop 훅을 authoritative review trigger로 연결하는 후속 meta task를 열었다.
- 2026-04-04: `.codex/config.toml`, `.codex/hooks.json`, `scripts/codex-stop-review-hook.py`, `scripts/check-codex-stop-review-hook.sh`를 추가하고, docs/CI/local CI wiring을 연결했다.
- 2026-04-04: 새 Stop hook이 current repo 상태에서 active task 다중 보유를 invariant error로 막는 것까지 확인했다.
- 2026-04-04: harness reviewer finding에 따라 `scripts/check-reviewer-protocol-wiring.sh`가 `multi_agent = true`도 함께 강제하도록 보강했다.
- 2026-04-04: docs reviewer finding에 따라 `review-needed`를 machine-readable hook outcome처럼 읽히지 않도록 runbook 문구를 `decision: "block" + reason` 기준으로 정정했다.

## 리뷰 노트

- Specialist review:
  - reviewer: harness-reviewer
  - reviewer protocol: `.codex/agents/harness-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/harness-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-040/harness-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: immediate hard stop rollout 때문에 dirty worktree에 active task가 여러 개 남아 있으면 Stop hook이 계속 block된다. 이는 wiring defect가 아니라 backlog normalization이 필요한 운영 리스크다.
  - reviewer: docs-reviewer
  - reviewer protocol: `.codex/agents/docs-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/docs-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-040/docs-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: Stop-hook block은 현재 multi-active backlog가 정리될 때까지 계속 보이지만, 관련 문서에는 accepted rollout behavior로 정리됐다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-040/po-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: rare malformed-metadata branches는 dedicated fixture보다 runtime invariant와 existing gates에 더 의존한다. 또한 multi-active dirty worktree는 backlog normalization 전까지 session close를 의도적으로 block한다.

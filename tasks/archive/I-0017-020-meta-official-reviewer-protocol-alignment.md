---
id: I-0017-020
title: reviewer를 공식 agents 및 skills 프로토콜로 재정렬한다
parent: I-0017-reviewer-capability-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0017-010-meta-reviewer-capability-foundation.md
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
artifacts:
  - .codex/agents/
  - .agents/skills/
  - .claude/agents/
  - .claude/skills/
  - reviewers/protocols.json
  - reviewers/review-artifact.schema.json
  - docs/guides/review-harness.md
  - docs/guides/reviewer-taxonomy.md
  - docs/runbooks/reviewer-capabilities.md
  - tasks/_templates/TASK-TEMPLATE.md
  - scripts/check-reviewer-protocols.sh
  - scripts/check-reviewer-protocol-wiring.sh
  - scripts/check-task-review-metadata.sh
  - scripts/check-active-task-closeout.sh
  - scripts/ci-local.sh
  - .github/workflows/ci.yml
  - AGENTS.md
  - tasks/reviews/README.md
---

## 목표

reviewer 정의를 저장소 내부 관례인 `harness/capabilities/...`에서 OpenAI Codex 및 Claude Code 문서에 근거한, 현재 저장소 승인 reviewer `agents`/`skills` 경로로 교체하고, review 승인 증빙을 구조화 artifact로 남기게 만든다.

## 완료 기준

- baseline reviewer와 `po-reviewer`가 `.codex/agents`, `.agents/skills`, `.claude/agents`, `.claude/skills`에 공식 형식으로 정의된다.
- task gate가 reviewer 이름뿐 아니라 structured review artifact도 검사한다.
- 기존 `harness/capabilities/...` 경로는 제거된다.

## 노트

- OpenAI Codex 문서에 근거한 현재 저장소 승인 경로는 `.codex/agents`와 `.agents/skills`다.
- Claude Code 문서에 근거한 현재 저장소 승인 경로는 `.claude/agents`와 `.claude/skills`다.
- reviewer routing은 내부 registry 대신 `reviewers/protocols.json`을 canonical source of truth로 둔다.
- reviewer protocol 출처나 승인 경로가 바뀌면 `AGENTS.md`, `docs/guides/reviewer-taxonomy.md`, `docs/runbooks/reviewer-capabilities.md`, `reviewers/protocols.json`을 함께 갱신한다.

## 셀프 리뷰

- 범위와 의도: 1차 `harness/capabilities/...` 관례를 공식 OpenAI Codex 및 Claude Code reviewer protocol로 교체하고, review 승인 증빙을 structured artifact 기준으로 바꾸는 데만 집중했다.
- source of truth: `reviewers/protocols.json`, `reviewers/review-artifact.schema.json`, `AGENTS.md`, `docs/guides/review-harness.md`, `docs/guides/reviewer-taxonomy.md`, `docs/runbooks/reviewer-capabilities.md`, 공식 OpenAI/Claude protocol 문서
- 설계 divergence: Codex runtime은 현재 repo 안의 `.codex/agents`와 `.agents/skills`를 future tooling source of truth로 제공하지만, 이 태스크의 실제 review 실행 자체는 Codex tool runtime의 제약상 protocol 문서를 읽는 방식으로 기록한다.
- 검증: `bash scripts/check-reviewer-protocols.sh`, `bash scripts/check-reviewer-protocol-wiring.sh`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`를 통과했다.
- 리뷰 라우팅: `harness-reviewer`, `docs-reviewer`, `po-reviewer`

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 공식 protocol 경로, 문서, gate, structured review artifact 규약이 서로 같은 truth를 가리키는지 확인한다.
- PO reviewer가 확인할 내용: 이 구조가 실제 review 실행 증빙을 남기고, 다른 코딩 도구도 repo 안에서 재사용할 수 있는 수준인지 확인한다.

## 핸드오프

- 이후 escalation reviewer를 추가할 때도 동일한 공식 protocol과 artifact 규약을 따라야 한다.

## 설계 divergence

- `harness/capabilities/...`는 1차 시도였고, 이 태스크에서 현재 저장소 승인 protocol 구조로 교체한다.

## 시도 로그

- 2026-04-04: 공식 OpenAI Codex `subagents`/`skills` 및 Claude Code `subagents`/`skills` 문서를 기준으로 reviewer protocol 재정렬 태스크를 열었다.
- 2026-04-04: `.codex/agents`, `.agents/skills`, `.claude/agents`, `.claude/skills`, `reviewers/protocols.json`, `reviewers/review-artifact.schema.json`을 추가하고, gate를 새 protocol 기준으로 교체했다.
- 2026-04-04: markdown-only CI bypass를 제거하고 reviewer protocol wiring 검사를 추가해 CI/local CI가 같은 control-plane 규칙을 보도록 정렬했다.
- 2026-04-04: `tasks/reviews/README.md`와 reviewer artifact JSON을 추가하고, `I-0017-020`을 artifact 기반 승인 흐름으로 닫을 수 있게 정리했다.

## 리뷰 노트

- Specialist review:
  - reviewer protocol: `.codex/agents/docs-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/docs-review-checklist/SKILL.md`, `.claude/agents/docs-reviewer.md`, `.claude/skills/review-output-contract/SKILL.md`, `.claude/skills/docs-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-020/docs-reviewer.json`
  - decision: approved
  - findings: no blocking findings
  - residual risks: canonical artifact truth는 `reviewers/protocols.json`, `docs/runbooks/reviewer-capabilities.md`, `tasks/reviews/README.md` 사이 정합성을 유지해야 한다.
  - reviewer protocol: `.codex/agents/harness-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/harness-review-checklist/SKILL.md`, `.claude/agents/harness-reviewer.md`, `.claude/skills/review-output-contract/SKILL.md`, `.claude/skills/harness-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-020/harness-reviewer.json`
  - decision: approved
  - findings: no blocking findings
  - residual risks: artifact 기반 review가 이후 task들에서도 운영적으로 일관되게 사용되는지 모니터링이 필요하다.
- PO review:
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`, `.claude/agents/po-reviewer.md`, `.claude/skills/review-output-contract/SKILL.md`, `.claude/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-020/po-reviewer.json`
  - decision: approved
  - findings: no blocking findings
  - residual risks: structured artifact 생성 순서가 앞으로도 지켜지지 않으면 새 protocol의 가치가 다시 약해질 수 있다.

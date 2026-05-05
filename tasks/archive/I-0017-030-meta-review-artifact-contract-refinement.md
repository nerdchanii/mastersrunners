---
id: I-0017-030
title: review artifact 계약을 실행 흔적 기준으로 정교화한다
parent: I-0017-reviewer-capability-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
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
  - bash scripts/check-active-task-closeout.sh
artifacts:
  - reviewers/review-artifact.schema.json
  - reviewers/protocols.json
  - docs/guides/review-harness.md
  - docs/guides/reviewer-taxonomy.md
  - docs/runbooks/reviewer-capabilities.md
  - tasks/_templates/TASK-TEMPLATE.md
  - tasks/reviews/README.md
  - scripts/check-task-review-metadata.sh
  - scripts/check-active-task-closeout.sh
  - scripts/check-reviewer-protocols.sh
  - AGENTS.md
---

## 목표

review 승인뿐 아니라 changes-requested 결과도 구조화 artifact로 남기게 만들고, reviewer protocol 용어와 artifact schema를 실제 실행 흔적 기준으로 정교화한다.

## 완료 기준

- changes-requested specialist/PO review도 JSON artifact 없이 기록만 남기는 상태를 허용하지 않는다.
- “공식 protocol”과 “현재 저장소가 채택한 reviewer overlay 계약”이 문서와 스크립트에서 구분된다.
- review artifact schema가 실제 실행한 protocol과 호환 protocol을 구분해 기록한다.

## 노트

- OpenAI Codex 공식 경로는 `.codex/agents`와 `.agents/skills`다.
- Claude Code 공식 경로는 `.claude/agents`와 `.claude/skills`다.
- 저장소의 canonical reviewer routing/artifact truth는 `reviewers/protocols.json`이다.

## 셀프 리뷰

- 범위와 의도: review artifact contract를 다듬는 범위에만 집중했고, reviewer 정의 자체나 I-0016 공개 UX 작업은 섞지 않았다.
- source of truth: OpenAI Codex `subagents`/`skills` docs, Claude Code `subagents`/`skills` docs, `reviewers/protocols.json`, `reviewers/review-artifact.schema.json`, `AGENTS.md`, `docs/guides/review-harness.md`, `docs/guides/reviewer-taxonomy.md`, `docs/runbooks/reviewer-capabilities.md`
- 설계 divergence: changes_requested artifact 강제는 closeout gate와 review note parsing으로 보강했지만, 별도 fixture task를 두고 회귀 테스트하는 단계는 이번 범위에 포함하지 않았다.
- 검증: `bash scripts/check-reviewer-protocols.sh`, `bash scripts/check-reviewer-protocol-wiring.sh`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`를 통과했다.
- 리뷰 라우팅: `harness-reviewer`, `docs-reviewer`, `po-reviewer`

## 리뷰 초점

- Specialist reviewer가 확인할 내용: changes-requested artifact 강제와 schema/문서/게이트 정합성이 실제 운영 흐름을 더 정확히 반영하는지 확인한다.
- PO reviewer가 확인할 내용: review 증빙이 더 분명해지면서도 작업 흐름이 과도하게 무거워지지 않는지 확인한다.

## 핸드오프

- 이후 escalation reviewer를 추가할 때도 같은 artifact schema와 protocol naming 규칙을 따라야 한다.

## 설계 divergence

- 별도 fixture task를 두고 `changes_requested` review 사례를 회귀 테스트하는 단계는 이번 범위에 포함하지 않았다.

## 시도 로그

- 2026-04-04: changes-requested review artifact 강제, protocol 용어 정리, schema 정교화를 위한 후속 태스크를 열었다.
- 2026-04-04: review artifact schema를 `review_contract`, `executed_protocol_paths`, `compatible_protocol_paths` 기준으로 재정의하고, closeout gate가 `changes_requested` review note도 artifact 없이 남기지 않도록 강화했다.
- 2026-04-04: AGENTS, runbook, taxonomy, template, reviewer skill/agent 문구를 “공식 경로 + 저장소 overlay 계약” 기준으로 정리했다.
- 2026-04-04: reviewer 이름을 review note에 필수로 남기고, `executed_protocol_paths`/`compatible_protocol_paths`가 실제 파일 경로를 가리키는지까지 closeout gate에서 검증하도록 보강했다.

## 리뷰 노트

- Specialist review:
  - reviewer: docs-reviewer
  - reviewer protocol: `.codex/agents/docs-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/docs-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-030/docs-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: review note와 artifact의 `reviewer`, `artifact`, `decision`을 함께 유지해야 새 gate를 안정적으로 통과할 수 있다.
  - reviewer: harness-reviewer
  - reviewer protocol: `.codex/agents/harness-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/harness-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-030/harness-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: path existence와 reviewer 매핑 검증은 강화됐지만, 향후에는 허용된 protocol 루트 prefix 화이트리스트까지 좁히면 감사 추적이 더 단단해진다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0017-030/po-reviewer.json`
  - decision: approved
  - findings: no blocking findings; 허용된 protocol 루트 화이트리스트와 note parser 의존성은 후속 개선 여지가 있다.
  - residual risks: reviewer note 템플릿을 벗어나면 `changes_requested` 증빙 연결이 느슨해질 수 있으므로, 템플릿 준수를 계속 강제해야 한다.

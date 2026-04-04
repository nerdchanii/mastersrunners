# I-0017: Reviewer Protocol Harness

## 요약

task 시스템은 reviewer 역할 이름을 요구하지만, 현재 저장소에는 그 역할을 실제로 수행할 수 있는 공식 `agents`/`skills` 프로토콜 기반 reviewer 정의가 없다. 이 이니셔티브는 specialist reviewer와 `po-reviewer`를 이름이 아니라 실제 OpenAI Codex 및 Claude Code 공식 protocol artifact로 만들고, task review 하네스를 그 protocol과 실행 증빙에 연결한다.

## 문제

- `frontend-reviewer`, `backend-reviewer`, `ui-ux-reviewer`, `harness-reviewer`, `docs-reviewer`, `po-reviewer` 같은 reviewer 이름은 문서와 task frontmatter에만 존재하거나, 1차 시도에서는 `harness/capabilities/...` 같은 저장소 내부 관례에만 연결돼 있다.
- 이 1차 구조는 공식 OpenAI Codex `subagents`/`skills` 경로나 Claude Code `subagents`/`skills` 경로를 따르지 않아, 다른 도구가 바로 재사용할 수 없다.
- 현재 gate는 reviewer 이름 존재와 review note 비어 있지 않음은 검사하지만, 어떤 protocol artifact를 실제로 실행했는지 구조화된 증빙을 강제하지 않는다.
- 이 상태에서는 “self-review 이후 specialist review와 PO review를 반드시 거친다”는 규칙이 구조적으로 보장되지 않는다.

## 목표

- baseline reviewer와 `po-reviewer`를 OpenAI Codex 공식 `.codex/agents/`, `.agents/skills/` 및 Claude Code 공식 `.claude/agents/`, `.claude/skills/` protocol artifact로 정의한다.
- review harness 문서와 task template이 내부 capability inventory가 아니라 공식 protocol artifact와 structured review artifact를 참조하도록 정렬한다.
- task metadata gate가 reviewer 이름이 실제 protocol artifact로 정의돼 있는지 확인하도록 강화한다.
- closeout gate가 reviewer note뿐 아니라 structured review artifact를 기준으로 specialist/PO review 실행 증빙을 강제하도록 바꾼다.

## 비목표

- reviewer protocol을 곧바로 모든 에스컬레이션 reviewer까지 확장하지 않는다.
- GitHub PR 전용 review lane을 부활시키지 않는다.
- 사람 review를 완전히 제거하는 자동 merge state machine을 만들지 않는다.

## 범위

- `.codex/agents/`
- `.agents/skills/`
- `.claude/agents/`
- `.claude/skills/`
- `reviewers/`
- `docs/guides/review-harness.md`
- `docs/guides/reviewer-taxonomy.md`
- `docs/runbooks/`
- `tasks/_templates/TASK-TEMPLATE.md`
- `scripts/check-task-review-metadata.sh`
- `scripts/check-reviewer-protocols.sh`
- `scripts/check-active-task-closeout.sh`
- `AGENTS.md`

## 설계 참고 문서

- `AGENTS.md`
- `docs/guides/review-harness.md`
- `docs/guides/reviewer-taxonomy.md`
- `docs/guides/agent-self-review.md`
- OpenAI Codex `subagents` / `skills` docs
- Claude Code `subagents` / `skills` docs

## 공식 프로토콜 출처

- OpenAI Codex subagents: `https://developers.openai.com/codex/subagents`
- OpenAI Codex skills: `https://developers.openai.com/codex/skills`
- Claude Code subagents: `https://code.claude.com/docs/en/sub-agents`
- Claude Code skills: `https://code.claude.com/docs/en/skills`

## 리뷰 계획

- process / protocol / guardrail 정합성: `harness-reviewer`
- 문서 clarity 및 사용성: `docs-reviewer`
- PO review는 이 흐름이 실제 작업 품질을 높이고 형식만 늘리지 않는지 확인한다.

## 태스크 분해

- `tasks/archive/I-0017-010-meta-reviewer-capability-foundation.md`
- `tasks/archive/I-0017-020-meta-official-reviewer-protocol-alignment.md`
- `tasks/archive/I-0017-030-meta-review-artifact-contract-refinement.md`
- `tasks/archive/I-0017-040-meta-codex-stop-hook-review-automation.md`
- `tasks/archive/I-0017-050-meta-reviewer-protocol-files-tracked-in-git.md`

## 성공 기준

- 저장소가 baseline reviewer와 `po-reviewer`를 OpenAI Codex 및 Claude Code 공식 protocol artifact로 가진다.
- task review 문서와 template이 reviewer 이름뿐 아니라 structured review artifact까지 기준으로 동작한다.
- metadata/closeout gate가 존재하지 않는 reviewer 이름 또는 실행 증빙 없는 review 승인 상태를 허용하지 않는다.
- 이후 작업에서 specialist/PO review를 수행할 때 참조할 수 있는 명시적 official protocol artifact와 사용 지침이 생긴다.

## 진행 메모

- 2026-04-04: baseline reviewer 6종과 `po-reviewer`를 `harness/capabilities/agents/`에 등록하고, metadata gate가 active reviewer capability inventory를 확인하도록 정리했다.
- 2026-04-04: `I-0017-010`을 archive-ready 상태로 닫고, specialist review와 PO review가 repo-local capability inventory를 기준으로 기록되도록 정리했다.
- 2026-04-04: 공식 OpenAI/Claude protocol이 확인되면서, `harness/capabilities/...`는 1차 시도였던 것으로 남기고 `I-0017-020`에서 공식 protocol 기반 구조로 교체하기로 했다.
- 2026-04-04: `I-0017-020`에서 `.codex/agents`, `.agents/skills`, `.claude/agents`, `.claude/skills`, `reviewers/protocols.json`, `tasks/reviews/<task-id>/<reviewer>.json`을 기준으로 reviewer protocol과 closeout gate를 재정렬했다.
- 2026-04-04: changes-requested review도 구조화 artifact로 남기고, protocol 용어와 artifact schema를 실제 실행 흔적 기준으로 정교화하기 위한 `I-0017-030` 후속 정리를 시작했다.
- 2026-04-04: `I-0017-040`에서 official Codex `Stop` hook을 reviewer overlay 계약과 연결하고, same-session reviewer subagent review automation을 붙인다.
- 2026-04-04: `.gitignore`가 `.codex/`와 `.claude/` 전체를 막고 있어 실제 reviewer protocol files가 git에 올라가지 않던 누락을 `I-0017-050`에서 수정하고, repo가 공식 protocol artifact 자체를 실제 버전 관리 대상으로 갖도록 정리했다.

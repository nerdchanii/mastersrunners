# Reviewer Protocols

repo-local specialist review와 PO review는 OpenAI Codex 및 Claude Code 문서에 근거한 공식 경로 위에, 현재 저장소가 채택한 reviewer overlay 계약을 얹어서 수행한다.

## 공식 출처

- OpenAI Codex subagents: `https://developers.openai.com/codex/subagents`
- OpenAI Codex skills: `https://developers.openai.com/codex/skills`
- Claude Code subagents: `https://code.claude.com/docs/en/sub-agents`
- Claude Code skills: `https://code.claude.com/docs/en/skills`

이 출처를 바탕으로 현재 저장소가 채택한 경로 매핑과 reviewer routing은 `reviewers/protocols.json`이 canonical truth다. 공식 문서가 “어디에 둬야 하는가”를 정의한다면, 이 저장소의 overlay 계약은 “어떤 reviewer를 어떤 routing으로 쓰고 어떤 artifact를 남겨야 하는가”를 정의한다. 출처나 승인 경로가 바뀌면 `AGENTS.md`, `docs/guides/reviewer-taxonomy.md`, `docs/runbooks/reviewer-capabilities.md`, `reviewers/protocols.json`을 함께 갱신한다.

## 활성 baseline reviewer

- `docs-reviewer`
- `frontend-reviewer`
- `ui-ux-reviewer`
- `backend-reviewer`
- `harness-reviewer`
- `po-reviewer`

각 reviewer는 아래 공식 경로에 ownable contract를 가진다.

- `.codex/agents/<reviewer-name>.toml`
- `.claude/agents/<reviewer-name>.md`
- `reviewers/protocols.json`

공통 review 절차는 아래 skill artifact에 둔다.

- `.agents/skills/<skill-name>/SKILL.md`
- `.claude/skills/<skill-name>/SKILL.md`

## 실행 순서

1. 구현 완료
2. verify 실행
3. self-review 기록
4. task frontmatter의 `reviewers:` 목록에 맞는 specialist reviewer protocol 수행
5. `po-reviewer` 수행
6. structured review artifact를 `tasks/reviews/<task-id>/<reviewer>.json`에 기록
7. review notes를 task 파일에 요약 기록
8. review와 verification이 모두 끝난 뒤에만 archive/commit 단계로 이동

## Codex 사용 규칙

- 공식 reviewer 경로와 저장소 overlay 계약이 등록되어 있다면, ad hoc reviewer prompt보다 protocol artifact를 우선한다.
- sub-agent를 사용할 수 있는 상황이면 reviewer별로 분리해서 수행한다.
- sub-agent를 쓸 수 없더라도 공식 경로 문서를 읽고, 이 저장소 overlay 계약에 맞는 review artifact와 review notes를 남긴다.
- specialist review 없이 `po-reviewer`만으로 닫지 않는다.

## Codex Stop-hook 자동 review

- 저장소는 `.codex/hooks.json`의 `Stop` hook을 same-session review automation trigger로 사용한다.
- hook이 review continuation reason과 함께 `decision: "block"`을 반환하면, 현재 Codex session은 종료하지 않고 그대로 reviewer subagent를 수행해야 한다.
- 기본 순서:
  1. task file 재확인
  2. required specialist reviewer subagent 실행
  3. specialist findings 반영 및 verify 재실행
  4. specialist 승인 후 `po-reviewer`
  5. `tasks/reviews/<task-id>/` JSON artifact와 task `리뷰 노트` 동기화
- nested `codex review` subprocess는 v1 기본 경로가 아니다.
- Stop hook은 dirty worktree에서 active task가 정확히 하나일 때만 deterministic하게 review ownership을 가진다.
- 이 저장소는 이 invariant를 immediate hard stop으로 채택한다. 즉, 기존 active backlog가 아직 여러 개인 상태라면 Stop hook이 바로 block하는 것이 설계된 rollout 동작이다.

## Structured Review Artifact

canonical truth는 task markdown이 아니라 structured JSON artifact다.

artifact 위치:

- `tasks/reviews/<task-id>/<reviewer>.json`

artifact directory의 시작점 문서는 `tasks/reviews/README.md`다.

artifact에는 최소한 아래 항목이 포함되어야 한다.

| Field                       | Meaning                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `task_id`                   | task frontmatter의 `id`와 같은 값                                                     |
| `reviewer`                  | reviewer 역할 이름                                                                    |
| `decision`                  | `approved` 또는 `changes_requested`                                                   |
| `tool`                      | 실제 review를 수행한 도구 또는 실행 환경                                              |
| `review_contract`           | 저장소 artifact 계약 버전. 현재는 `repo-reviewer-artifact-v1`                         |
| `executed_protocol_paths`   | 실제 review 실행에 사용한 agent/skill protocol file path 목록                         |
| `compatible_protocol_paths` | 같은 reviewer를 다른 공식 경로에서 재실행할 때 참조할 수 있는 호환 protocol path 목록 |
| `reviewed_at`               | review 기록 시각                                                                      |
| `findings`                  | severity와 요약을 가진 finding 목록                                                   |
| `residual_risks`            | 남는 리스크 또는 후속 메모                                                            |

task markdown의 `리뷰 노트`는 artifact 요약용으로 남긴다.

승인된 review만 아니라 `changes_requested` review도 동일하게 structured artifact를 남겨야 한다. 차이는 decision 값뿐이다.
리뷰 노트에는 최소한 `reviewer`, `artifact`, `decision`이 함께 남아야 artifact와 note를 reviewer 기준으로 바로 대조할 수 있다.

## Protocol Rule

- task frontmatter의 reviewer 이름은 `reviewers/protocols.json`에 등록되어 있어야 한다.
- reviewer protocol을 추가하거나 retired할 때는 `reviewers/protocols.json`과 runbook을 같은 changeset에서 갱신한다.
- `bash scripts/check-reviewer-protocols.sh`는 protocol registry와 실제 `.codex/.agents/.claude` artifact 구조가 일치하는지 검증한다.
- `bash scripts/check-active-task-closeout.sh`는 approved 상태뿐 아니라 review note에 남겨진 `changes_requested` 결과도 artifact 없이 남겨두는 것을 허용하지 않는다.

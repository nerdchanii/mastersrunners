# Reviewer Protocols

repo-local specialist reviewer와 PO reviewer 자료는 OpenAI Codex 및 Claude Code 문서에 근거한 공식 경로 위에, 현재 저장소가 채택한 reviewer overlay 계약을 얹어서 보관한다. 이 자료는 기본 completion gate가 아니라 opt-in review 실행 참고 자료다.

## 공식 출처

- OpenAI Codex subagents: `https://developers.openai.com/codex/subagents`
- OpenAI Codex skills: `https://developers.openai.com/codex/skills`
- Claude Code subagents: `https://code.claude.com/docs/en/sub-agents`
- Claude Code skills: `https://code.claude.com/docs/en/skills`

이 출처를 바탕으로 현재 저장소가 채택한 경로 매핑과 reviewer routing reference는 `reviewers/protocols.json`에 둔다. 출처나 승인 경로가 바뀌면 `AGENTS.md`, `docs/guides/reviewer-taxonomy.md`, `docs/runbooks/reviewer-capabilities.md`, `reviewers/protocols.json`을 함께 갱신한다.

## 보존된 reviewer

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

## Opt-in 실행 순서

Task가 명시적으로 review를 요청했을 때만 아래 순서를 사용한다.

1. 구현 완료
2. verify 실행
3. self-review 기록
4. task `리뷰 계획`에 맞는 reviewer protocol 수행
5. 필요하면 `po-reviewer` 수행
6. structured review artifact를 남길 경우 `tasks/reviews/<task-id>/<reviewer>.json`에 기록
7. review notes를 task 파일에 요약 기록

리뷰를 요청하지 않은 task는 이 절차 없이도 mechanical verification을 통과하면 완료할 수 있다.

## Codex 사용 규칙

- 공식 reviewer 경로와 저장소 overlay 계약이 등록되어 있다면, ad hoc reviewer prompt보다 protocol artifact를 우선한다.
- sub-agent를 사용할 수 있는 상황이면 reviewer별로 분리해서 수행한다.
- sub-agent를 쓸 수 없더라도 공식 경로 문서를 읽고, 필요한 경우 이 저장소 overlay 계약에 맞는 review artifact와 review notes를 남긴다.
- reviewer는 read-only advisor다. 구현 수정은 task owner가 검토 후 수행한다.

## Codex Stop-hook 자동 review

Codex Stop-hook 자동 review는 비활성화되어 있다. 자세한 현재 상태는 `docs/runbooks/codex-hook-review-automation.md`를 본다.

## Structured Review Artifact

Review artifact는 opt-in review의 기록 자료다. 기본 closeout gate가 아니다.

artifact 위치:

- `tasks/reviews/<task-id>/<reviewer>.json`

artifact directory의 시작점 문서는 `tasks/reviews/README.md`다.

artifact에는 보통 아래 항목을 포함한다.

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

## Protocol Rule

- task가 reviewer를 opt-in 하면 reviewer 이름은 `reviewers/protocols.json`에 등록되어 있어야 한다.
- reviewer protocol을 추가하거나 retired할 때는 `reviewers/protocols.json`과 runbook을 같은 changeset에서 갱신한다.
- `bash scripts/check-reviewer-protocols.sh`와 `bash scripts/check-reviewer-protocol-wiring.sh`는 보존된 reviewer 자료를 수동 점검할 때만 사용한다.
- `bash scripts/check-active-task-closeout.sh`는 reviewer artifact를 검증하지 않는다.

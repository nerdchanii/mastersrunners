# 리뷰 하네스

이 문서는 reviewer 체계를 참고 자료로 남기되, 저장소가 모든 task에 review를 강제하지 않는 기준을 설명한다.

## 원칙

- 리뷰는 기본 게이트가 아니라 task별 판단 사항이다.
- task가 review를 필요로 하면 task 본문 `리뷰 계획`에 reviewer 역할과 확인할 내용을 명시한다.
- reviewer는 read-only 조언자다. 리뷰어는 변경을 제안할 수 있지만, 자동으로 구현을 롤백하거나 구조를 갈아엎는 권한을 갖지 않는다.
- PO review도 기본 필수 게이트가 아니다. 사용자 가치, acceptance criteria, rollout risk, prioritization 판단이 필요할 때 opt-in 한다.
- GitHub PR 댓글, 승인, AI 피드백은 협업에 도움이 될 수 있지만 repository completion truth가 아니다.
- lint, format, typecheck, build, test, generated-artifact check 같은 기계적 검증은 계속 필수다.

## 리뷰어 역할

에스컬레이션 리뷰어를 포함한 전체 리뷰어 목록은 `docs/guides/reviewer-taxonomy.md`에서 확인한다.
공식 reviewer protocol 실행 규칙은 `docs/runbooks/reviewer-capabilities.md`에서 확인한다.

- `docs-reviewer`
  - 명확성, 구조, 교차 참조 품질, source-of-truth 정렬을 점검한다
- `frontend-reviewer`
  - 라우팅, 컴포넌트 경계, 상태/데이터 흐름, 로딩/에러 처리, 기본 접근성을 점검한다
- `ui-ux-reviewer`
  - 상호작용 흐름, 카피, 위계, 반응형, 사용자 피드백 상태를 점검한다
- `backend-reviewer`
  - API 계약, 검증, auth/authz, 데이터 무결성, 실패 모드, 운영 리스크를 점검한다
- `harness-reviewer`
  - 태스크 경계, 자동화 영향, CI/hook 동작, 저장소 invariant 안전성을 점검한다
- `po-reviewer`
  - 사용자 가치, acceptance criteria, 범위 적합성, 배포 리스크, 태스크가 의도한 문제를 해결하는지 점검한다

## 선택적 라우팅

아래 매트릭스는 review가 필요한 task에서 역할을 고르는 참고 기준이다.

- `docs` scope
  - consider `docs-reviewer`
- `web` scope with visible UX impact
  - consider `frontend-reviewer` and `ui-ux-reviewer`
- `web` scope without meaningful UX change
  - consider `frontend-reviewer`
- `api` or `db` scope
  - consider `backend-reviewer`
- `ci`, `repo`, `meta`, deploy, or harness scope
  - consider `harness-reviewer`
- cross-cutting tasks
  - consider the union of relevant specialist reviewers
- PO-sensitive work
  - consider `po-reviewer`

## 완료 게이트

커밋 전에 task는 아래 조건을 만족해야 한다.

1. Implementation is complete for the task scope.
2. The agent self-review checklist has been completed when useful for the task.
3. The task `verify` commands have been run or the skipped verification is explained.
4. Any task-specific opt-in review has been completed or explicitly deferred in the task notes.
5. The task is moved from `tasks/active/` to `tasks/archive/` in the same changeset that finalizes the work.

## 결정적 active-state 게이트

Active 태스크는 frontmatter에 machine-readable closeout 필드를 가진다.

- `execution_status`: `in_progress`, `blocked`, or `ready_for_archive`
- `verification_status`: `pending`, `partial`, or `passed`
- `closeout_blocker`: required when `execution_status: blocked`

저장소 체크 `bash scripts/check-active-task-closeout.sh`는 아래 규칙을 강제한다.

- `tasks/active/` 아래의 모든 태스크는 위 필드를 선언해야 한다
- blocked 태스크는 `closeout_blocker`에 차단 이유를 설명해야 한다
- `execution_status: ready_for_archive`는 `tasks/active/`에 남아 있을 수 없다

이 규칙은 “끝난 태스크를 archive로 옮기지 않음”을 문서 위생 제안이 아니라 CI/pre-push 실패 신호로 바꾼다. 리뷰 artifact나 reviewer metadata는 이 체크의 입력이 아니다.

## 수동 PR 사용

- Pull request는 선택적 협업 산출물이지, 두 번째 완료 워크플로우가 아니다.
- PR을 연다면 가볍게 유지한다. 태스크와 initiative를 링크하고, 검증 결과와 리스크 또는 롤백 맥락만 요약한다.
- 리뷰 코멘트 처리는 GitHub에서 수동으로 한다.
- 머지 시점은 저장소 전용 PR 하네스가 아니라, 사람의 판단과 일반적인 브랜치 보호 규칙이 결정한다.

## 리뷰 노트 규칙

리뷰를 opt-in 했다면 task 파일에 결과를 기록한다.

- reviewer 역할과 핵심 점검 항목을 남긴다
- artifact를 남겼다면 `tasks/reviews/<task-id>/` 아래에 둔다
- `changes_requested`가 있으면 필요한 수정과 재검증 결과를 task note에 남긴다
- structured artifact의 필드와 위치 규약은 `docs/runbooks/reviewer-capabilities.md`를 참고한다

## Codex Stop-hook 자동화

Codex Stop-hook review automation은 비활성화되어 있다.

- `.codex/hooks.json`에는 Stop hook command를 두지 않는다.
- `.codex/config.toml`은 `codex_hooks = false`로 둔다.
- Git `pre-push`는 review owner가 아니라 `pnpm ci:local` 기반 mechanical verification gate다.

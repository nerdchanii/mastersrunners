# 리뷰 하네스

완료된 태스크를 커밋하기 전에 이 가이드를 사용한다.

## 규칙

- 모든 태스크는 specialist review 전에 self-review가 필요하다.
- 모든 태스크는 최소 한 명의 specialist review가 필요하다.
- 모든 태스크는 PO review가 필요하다.
- 문서 전용 태스크도 예외가 아니다.
- 여러 scope를 건드리는 태스크는 여러 specialist reviewer가 필요하다.
- GitHub PR 댓글, 승인, AI 피드백은 협업에 도움이 될 수 있지만, 태스크 완료 기준에서 specialist review나 PO review를 대체하지는 못한다.

## 리뷰어 역할

에스컬레이션 리뷰어를 포함한 전체 리뷰어 목록은 `docs/guides/reviewer-taxonomy.md`에서 확인한다.

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

## 라우팅 매트릭스

- `docs` scope
  - `docs-reviewer` + `po-reviewer`
- `web` scope with visible UX impact
  - `frontend-reviewer` + `ui-ux-reviewer` + `po-reviewer`
- `web` scope without meaningful UX change
  - `frontend-reviewer` + `po-reviewer`
- `api` or `db` scope
  - `backend-reviewer` + `po-reviewer`
- `ci`, `repo`, `meta`, deploy, or harness scope
  - `harness-reviewer` + `po-reviewer`
- cross-cutting tasks
  - union of all relevant specialist reviewers + `po-reviewer`

## 커밋 게이트

커밋 전에 태스크는 아래 조건을 모두 만족해야 한다.

1. Implementation is complete for the task scope.
2. The agent self-review checklist has been completed.
3. The task `verify` commands have been run.
4. Required specialist review has been completed.
5. PO review has been completed.
6. The task file has been updated with review notes.
7. The task is moved from `tasks/active/` to `tasks/archive/` in the same changeset that finalizes the work.

## UX 가드레일 안내

- 사용자용 소비자 웹 태스크가 공개 소셜 라우트, 인증 게이트, 제품 카피, 비주얼 시스템 사용에 영향을 준다면 `design/frontend/` 아래 관련 문서를 참조해야 한다
- 우선 아래 문서부터 본다:
  - `design/frontend/ux-principles.md`
  - `design/frontend/social-surface-patterns.md`
  - `design/frontend/writing-and-copy.md`
  - `design/frontend/visual-system-rules.md`

## 결정적 active-state 게이트

이제 active 태스크는 frontmatter에 machine-readable closeout 필드를 가져야 한다.

- `execution_status`: `in_progress`, `blocked`, or `ready_for_archive`
- `review_status`: `pending` or `approved`
- `verification_status`: `pending`, `partial`, or `passed`
- `closeout_blocker`: required when `execution_status: blocked`

저장소 체크 `bash scripts/check-active-task-closeout.sh`는 아래 규칙을 강제한다.

- `tasks/active/` 아래의 모든 태스크는 위 필드를 선언해야 한다
- blocked 태스크는 `closeout_blocker`에 차단 이유를 설명해야 한다
- `execution_status: ready_for_archive`는 `tasks/active/`에 남아 있을 수 없다
- `review_status: approved`와 `verification_status: passed` 조합은 `execution_status: in_progress` 상태로 남아 있을 수 없다

이 규칙은 “끝난 태스크를 archive로 옮기지 않음”을 문서 위생 제안이 아니라, CI/pre-push 실패 신호로 바꾼다.

## 수동 PR 사용

- Pull request는 선택적 협업 산출물이지, 두 번째 완료 워크플로우가 아니다.
- PR을 연다면 가볍게 유지한다. 태스크와 initiative를 링크하고, 검증 결과와 리스크 또는 롤백 맥락만 요약한다.
- 리뷰 코멘트 처리는 GitHub에서 수동으로 한다. 저장소는 더 이상 별도의 AI 리뷰 레인, 스레드 해결 루프, merge-ready 상태 머신을 정의하지 않는다.
- 머지 시점은 저장소 전용 PR 하네스가 아니라, 사람의 판단과 일반적인 브랜치 보호 규칙이 결정한다.

## 커밋 의도 규칙

- 커밋 제목은 `feat`, `fix`, `refactor`, `docs`, `ci`, `test` 같은 일반 타입으로 의도를 설명해야 한다.
- Task ID는 commit type이 아니라 trailer에 둔다.
- 커밋 제목 검증은 `pre-commit`이 아니라 `commit-msg` 훅에서 commitlint로 수행된다.
- 작업 중 구현/설계 divergence가 드러나면, 설계를 낮추지 말고 후속 태스크를 만든 뒤 변경을 완료로 처리한다.
- 이미 push되었거나 merge된 변경이 잘못되었다면, 공유 히스토리를 조용히 덮어쓰지 말고 전용 `fix` 또는 `revert` 태스크와 커밋으로 복구한다.
- 복구가 전진 `fix`여야 하는지 운영 `revert`여야 하는지는 `docs/runbooks/correction-commit-flow.md`를 참고해 결정한다.

## 리뷰 노트 규칙

리뷰 결과는 태스크 파일에 기록한다.

- specialist review는 리뷰어 역할과 핵심 점검 항목을 남겨야 한다
- PO review는 acceptance criteria와 범위가 충족됐는지 남겨야 한다
- 리뷰에서 이슈가 발견되면 archive로 넘기지 말고, 태스크를 다시 열거나 `tasks/active/`에 유지한다

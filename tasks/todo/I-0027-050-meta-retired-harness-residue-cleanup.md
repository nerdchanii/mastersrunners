---
id: I-0027-050
title: 퇴역 하네스 잔재 정리와 가드레일 스크립트 연결
parent: I-0027-agent-harness-alignment
scope: meta
owner: unassigned
depends_on: [I-0027-010]
blocked_by: []
verify:
  - test -f design/operating-rules/harness-principles.md
  - "! grep -q '\\$harness-diagnostics' docs/runbooks/harness-diagnostics.md"
  - "! grep -q 'reviewers/' tasks/reviews/README.md"
  - grep -q 'reviews/' tasks/README.md
  - grep -q check-doc-frontmatter scripts/ci-local.sh
  - grep -q check-size-budgets scripts/ci-local.sh
  - grep -q check-doc-frontmatter .github/workflows/ci.yml
  - grep -q check-size-budgets .github/workflows/ci.yml
  - pnpm ci:local
artifacts:
  - design/operating-rules/harness-principles.md
  - design/operating-rules/exceptions.md
  - docs/runbooks/harness-diagnostics.md
  - tasks/reviews/README.md
  - tasks/README.md
  - scripts/ci-local.sh
  - .github/workflows/ci.yml
---

## 목표

존재하지 않는 `harness-diagnostics` 스킬 의존을 끊고, 퇴역 리뷰 하네스 잔재 문서를 historical로 고치며, 고아 가드레일 스크립트를 CI와 ci-local에 연결한다. 보고서 F-02, F-14, F-15, F-16을 닫는다.

## 완료 기준

- `design/operating-rules/harness-principles.md`가 `P1`–`P12`를 리포 내부 정의로 담고, `exceptions.md` 스키마가 이 파일을 참조한다.
- `docs/runbooks/harness-diagnostics.md`가 외부 스킬 호출 없이 리포 내부 절차(보고서 §8 재현 명령 기반)로 재작성되어 있다. `README.md`, `docs/README.md`, `document-states.md`, `AGENTS.md`의 참조 문구도 맞춘다.
- EX-0001–EX-0004가 재검토되어 `revisit_date`가 갱신되거나 닫혀 있다.
- `tasks/reviews/README.md`가 "historical, read-only, 새 파일 추가 금지"를 명시하고 삭제된 `reviewers/` 참조가 없다. `tasks/README.md` Layout에 `reviews/ (historical)`가 있다.
- `check-doc-frontmatter.sh`, `check-size-budgets.sh`가 `scripts/ci-local.sh`의 "Check harness structure" 단계와 `ci.yml`에 연결되어 있고 `pnpm ci:local`이 통과한다.
- `ci-local`에 `exceptions.md`의 지난 `revisit_date` 경고가 추가되어 있다.

## 노트

- 근거: `docs/reports/agent-harness-audit-2026-09-02.md` §3 F-02, F-14–F-16, §8
- `check-doc-frontmatter.sh` 검사 범위가 `document-states.md`의 요구(`design/**/*.md` 전체 frontmatter)와 다르면 어느 쪽을 맞출지 시도 로그에 결정을 남긴다.
- 스크립트 연결 후 기존 문서가 실패하면 그 문서를 고치는 것이 우선이고, 검사를 낮추는 것은 예외 등록 없이는 하지 않는다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:

## 리뷰 계획

- opt-in.

## 핸드오프

- 새 원칙 파일 경로를 I-0027-020 하네스 맵에서 참조한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-09-02: 감사 보고서에서 파생. I-0027-010 완료 후 시작.

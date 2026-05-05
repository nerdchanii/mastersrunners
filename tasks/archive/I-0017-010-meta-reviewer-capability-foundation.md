---
id: I-0017-010
title: baseline reviewer capability inventory와 review guard를 만든다
parent: I-0017-reviewer-capability-harness
scope: meta
owner: codex
reviewers:
  - harness-reviewer
  - docs-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-active-task-closeout.sh
  - bash scripts/check-reviewer-capability-inventory.sh
artifacts:
  - harness/capabilities/registry.json
  - harness/capabilities/agents/
  - docs/guides/review-harness.md
  - docs/guides/reviewer-taxonomy.md
  - docs/runbooks/reviewer-capabilities.md
  - tasks/_templates/TASK-TEMPLATE.md
  - scripts/check-task-review-metadata.sh
  - scripts/check-active-task-closeout.sh
  - scripts/check-reviewer-capability-inventory.sh
  - scripts/ci-local.sh
  - .github/workflows/ci.yml
  - AGENTS.md
---

## 목표

baseline specialist reviewer들과 `po-reviewer`를 repo-local capability로 정의하고, task review 하네스가 그 inventory를 기준으로 동작하게 만든다.

## 완료 기준

- reviewer 역할이 repo-local capability inventory에 등록된다.
- review harness 문서와 task template이 이 inventory를 참조한다.
- metadata gate가 task의 reviewer 이름이 실제 active capability인지 검증한다.

## 노트

- baseline 대상은 `docs-reviewer`, `frontend-reviewer`, `ui-ux-reviewer`, `backend-reviewer`, `harness-reviewer`, `po-reviewer`다.
- escalation reviewer는 후속 작업에서 필요시 추가한다.

## 셀프 리뷰

- 범위와 의도: reviewer taxonomy를 실제 repo-local capability inventory로 바꾸고, task review 하네스와 metadata gate가 그 inventory를 보도록 정리했다.
- source of truth: `AGENTS.md`, `docs/guides/review-harness.md`, `docs/guides/reviewer-taxonomy.md`, `docs/guides/agent-self-review.md`, `docs/runbooks/reviewer-capabilities.md`
- 설계 divergence: baseline reviewer와 `po-reviewer`만 이번 태스크에서 capability로 등록했고, escalation reviewer capability는 아직 후속 범위로 남겼다.
- 검증: `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`, `bash scripts/check-reviewer-capability-inventory.sh`를 통과했다.
- 리뷰 라우팅: `harness-reviewer`, `docs-reviewer`, `po-reviewer`

## 리뷰 초점

- Specialist reviewer가 확인할 내용: reviewer inventory, 문서, metadata guard가 서로 같은 truth를 가리키는지 확인한다.
- PO reviewer가 확인할 내용: 이 구조가 형식만 늘리는 것이 아니라 실제 specialist/PO review를 반복 가능하게 만드는지 확인한다.

## 핸드오프

- 이후 reviewer capability를 실제 delegated review에 연결할 때는 이 inventory를 source of truth로 사용한다.

## 설계 divergence

- 현재는 baseline reviewer만 정의하고 escalation reviewer는 아직 capability로 등록하지 않는다.

## 시도 로그

- 2026-04-04: specialist review와 PO review를 실제 Codex capability로 만들기 위해 foundation task를 열었다.
- 2026-04-04: baseline reviewer 6종을 `harness/capabilities/agents/`에 scaffold하고 active capability로 등록했다.
- 2026-04-04: review harness, reviewer taxonomy, task template, metadata gate를 capability inventory 기준으로 정렬했다.
- 2026-04-04: reviewer capability inventory check를 local CI와 GitHub Actions 기본 게이트에도 연결했다.

## 리뷰 노트

- Self review: 2026-04-04 checklist 기준으로 scope, source-of-truth, divergence, verification, reviewer routing을 점검했고, escalation reviewer 미등록 외 숨은 divergence는 남기지 않았다.
- Specialist review:
  - `docs-reviewer`
    - decision: approved
    - findings: no findings
    - residual risks: review 노트 placeholder는 archive 직전 반드시 채워야 한다.
  - `harness-reviewer`
    - decision: approved
    - findings: no findings
    - residual risks: none blocking
- PO review:
  - `po-reviewer`
    - decision: approved
    - findings: no findings
    - residual risks: escalation reviewer capability는 후속 범위지만, baseline specialist/PO review workflow를 닫는 데는 blocking이 아니다.

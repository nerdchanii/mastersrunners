---
id: I-0016-150
title: Storybook 빌드 산출물을 dependency-cruiser에서 제외한다
parent: I-0016-design-system-and-ux-guardrails
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-090-web-storybook-workbench-foundation.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm depcruise
artifacts:
  - .dependency-cruiser.cjs
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
---

## Superseded

2026-05-05: Storybook generated output guard는 `design/initiatives/I-0020-storybook-retirement.md`에서 Storybook 자체가 제거되며 superseded됐다. 이 문서는 당시 depcruise 보정 이력으로만 보존한다.

## 목표

Storybook static/smoke 빌드 산출물이 repo-local CI의 dependency-cruiser 입력으로 섞여 들어가 push가 막히지 않도록, 생성 산출물을 스캔 대상에서 명시적으로 제외한다.

## 완료 기준

- `apps/web/storybook-static`와 `apps/web/storybook-smoke`가 dependency-cruiser 입력에서 제외된다.
- Storybook 빌드 산출물이 디스크에 존재해도 `pnpm depcruise`가 generated asset 순환 참조로 실패하지 않는다.
- 변경 의도와 후속 관계가 `I-0016` initiative에 기록된다.

## 노트

- 이번 task는 Storybook 기능 추가가 아니라 repo guardrail 보정이다.
- generated/build output은 source of truth가 아니므로, 검사에서 제외하는 것이 맞다.

## 셀프 리뷰

- 범위와 의도: `I-0016-090` 기능 범위를 넓히지 않고, push를 막던 repo guardrail friction만 제거했다. Storybook generated output을 depcruise 입력에서 제외하는 규칙 보정 외의 cleanup은 넣지 않았다.
- source of truth: `design/initiatives/I-0016-design-system-and-ux-guardrails.md`, `.dependency-cruiser.cjs`, `AGENTS.md`의 generated output 비편집 규칙
- 설계 divergence: 없음. generated/build output은 source가 아니라는 기존 운영 규칙에 맞춰 검사 입력만 줄였다.
- 검증:
  - `pnpm depcruise`
- 리뷰 라우팅: scope가 `meta`이고 repo guardrail/CI 성격의 수정이므로 `harness-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: generated Storybook output을 depcruise/CI 입력에서 제외하는 규칙이 충분히 좁고 다른 source 스캔을 약화시키지 않는지 본다.
- PO reviewer가 확인할 내용: 이번 보정이 Storybook foundation closeout을 막던 repo friction만 제거하고 scope를 넓히지 않았는지 본다.

## 핸드오프

- Storybook 기능 polish는 `I-0016-100`~`I-0016-140`에서 계속 진행하고, 이 task에는 repo guardrail 보정만 넣는다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` push 단계에서 `storybook-static`/`storybook-smoke` generated asset이 depcruise 순환 참조로 잡혀 follow-up guard task를 열었다.

## 리뷰 노트

- Specialist review:
  - reviewer: harness-reviewer
  - reviewer protocol: `.codex/agents/harness-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/harness-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-150/harness-reviewer.json`
  - decision: approved
  - findings: none
  - residual risks: Storybook generated output은 depcruise 입력에서 제외했지만, 계속 source of truth가 아닌 ignore 대상 산출물로만 유지해야 한다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-150/po-reviewer.json`
  - decision: approved
  - findings: none
  - residual risks: 이번 task는 Storybook rollout을 막던 repo friction만 제거했고, 실제 product polish는 `I-0016-100`~`I-0016-140`에서 계속 진행한다.

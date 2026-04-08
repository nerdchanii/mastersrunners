---
id: I-0016-160
title: Storybook baseline을 knip 예외에 반영한다
parent: I-0016-design-system-and-ux-guardrails
scope: meta
owner: unassigned
reviewers:
  - harness-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-090-web-storybook-workbench-foundation.md
  - tasks/archive/I-0016-150-meta-storybook-build-output-depcruise-guard.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - bash scripts/run-knip.sh
artifacts:
  - knip.json
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
---

## 목표

Storybook 도입으로 생긴 preview entry, harness helper, fixture export, Storybook 전용 devDependency를 knip baseline에 반영해 push gate가 실제 dead code가 아닌 Storybook wiring 때문에 막히지 않게 한다.

## 완료 기준

- `.storybook/*`와 `apps/web/src/storybook/*` 중 Storybook runtime entry로만 쓰이는 파일이 knip false positive로 잡히지 않는다.
- Storybook 전용 fixture export와 Storybook devDependencies가 knip baseline에서 정당한 예외로 기록된다.
- 이미 제거한 `next-themes` ignore는 baseline에서 제거된다.

## 노트

- 이번 task는 Storybook 기능 확장이 아니라 dead-code baseline 보정이다.
- 실제 unused code를 넓게 숨기지 않고 Storybook wiring에 필요한 항목만 좁게 예외로 둔다.

## 셀프 리뷰

- 범위와 의도: Storybook rollout의 product scope는 건드리지 않고, knip가 Storybook wiring을 false positive로 잡아 push를 막는 baseline friction만 제거했다. Storybook 외 일반 dead-code cleanup은 넣지 않았다.
- source of truth: `design/initiatives/I-0016-design-system-and-ux-guardrails.md`, `knip.json`, `AGENTS.md`의 generated output/guardrail 운영 규칙
- 설계 divergence: 없음. Storybook preview entry, helper, fixture, devDependency를 baseline 예외로 적절히 기록했고, 이미 제거된 `next-themes` ignore는 함께 정리했다.
- 검증:
  - `bash scripts/run-knip.sh`
- 리뷰 라우팅: scope가 `meta`이고 repo guardrail/quality gate baseline 수정이므로 `harness-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: knip 예외가 Storybook wiring에 필요한 최소 범위로만 추가되었는지 본다.
- PO reviewer가 확인할 내용: 이번 보정이 merge blocker만 제거하고 product scope를 넓히지 않았는지 본다.

## 핸드오프

- Storybook 자체 품질과 polish는 `I-0016-100`~`I-0016-140`에서 계속 다루고, 이 task에는 baseline guard만 넣는다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-08: `I-0016-090` push 단계에서 knip가 Storybook preview entry, harness helper, fixture export, Storybook devDependency를 false positive로 잡아 follow-up guard task를 열었다.

## 리뷰 노트

- Specialist review:
  - reviewer: harness-reviewer
  - reviewer protocol: `.codex/agents/harness-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/harness-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-160/harness-reviewer.json`
  - decision: approved
  - findings: none
  - residual risks: 새 Storybook wiring이나 build output dir를 추가할 때는 knip baseline도 함께 점검해야 한다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-160/po-reviewer.json`
  - decision: approved
  - findings: none
  - residual risks: 이번 task는 Storybook rollout의 repo friction만 줄였고, 실제 Storybook 품질 판단은 후속 polish task에서 계속 진행해야 한다.

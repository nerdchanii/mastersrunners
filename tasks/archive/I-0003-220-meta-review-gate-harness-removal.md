---
id: I-0003-220
title: 리뷰 게이트 하네스를 task별 opt-in 체계로 낮춘다
parent: I-0003-review-harness
scope: meta
owner: codex
depends_on: []
blocked_by: []
execution_status: ready_for_archive
verification_status: passed
closeout_blocker:
verify:
  - bash scripts/check-active-task-closeout.sh
  - bash scripts/check-reviewer-protocol-wiring.sh
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-codex-stop-review-hook.sh
  - pnpm precommit
  - pnpm ci:local
artifacts:
  - .codex/config.toml
  - .codex/hooks.json
  - .github/workflows/ci.yml
  - .github/PULL_REQUEST_TEMPLATE.md
  - AGENTS.md
  - design/initiatives/I-0003-review-harness.md
  - docs/guides/
  - docs/runbooks/
  - apps/web/playwright.config.ts
  - scripts/
  - tasks/_templates/TASK-TEMPLATE.md
  - tasks/todo/
---

## 목표

모든 task에 specialist/PO review를 강제하거나 Codex Stop-hook으로 review를 자동 실행하는 흐름을 제거한다.

## 완료 기준

- Codex Stop-hook review automation이 비활성화된다.
- CI와 local CI에서 review-only check가 제거된다.
- active task closeout check가 review artifact를 요구하지 않는다.
- task template과 non-archived task가 review를 optional plan/note로 표현한다.
- docs/runbooks가 review opt-in과 mechanical verification 유지 기준을 설명한다.

## 노트

- reviewer 정의 파일과 기존 `tasks/reviews/` artifact는 즉시 삭제하지 않는다.
- lint, format, typecheck, build, test 같은 기계적 검증은 계속 gate로 유지한다.

## 셀프 리뷰

- 범위와 의도: mandatory specialist/PO review gate와 Codex Stop-hook automation을 제거하고, reviewer 자료는 opt-in 참고로 남겼다.
- source of truth: `AGENTS.md`, `docs/guides/review-harness.md`, `docs/runbooks/codex-hook-review-automation.md`, `docs/runbooks/reviewer-capabilities.md`, `design/initiatives/I-0003-review-harness.md`
- 설계 divergence: 없음.
- 검증: `pnpm precommit`, targeted harness checks, `PLAYWRIGHT_PORT=3101 pnpm ci:local`

## 리뷰 계획

- 이 task 자체는 mandatory review gate 제거가 목적이므로 별도 opt-in reviewer를 요청하지 않는다.
- 필요하면 이후 별도 task에서 reviewer protocol 자료를 더 정리한다.

## 핸드오프

- Stop-hook automation을 다시 켜려면 별도 task에서 opt-in 대상, 권한 경계, artifact gate 여부를 먼저 정의해야 한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-06: isolated worktree에서 review gate 제거 작업을 시작했다.
- 2026-05-06: fresh worktree에 dependencies가 없어 첫 `pnpm exec prettier`가 `prettier not found`로 실패해 `pnpm install` 후 재실행했다.
- 2026-05-06: 첫 `pnpm ci:local`은 local Playwright browser install 단계가 6분 이상 멈춰 중단했다. 이후 local browser install을 opt-in으로 낮추고, `PLAYWRIGHT_PORT=3101`로 포트 충돌을 피해 전체 local CI를 통과시켰다.

## 리뷰 노트

- Optional review:
  - reviewer:
  - artifact:
  - decision:
  - findings:
  - residual risks:

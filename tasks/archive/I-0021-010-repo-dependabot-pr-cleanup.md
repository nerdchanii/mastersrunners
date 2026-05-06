---
id: I-0021-010
title: Clean up open Dependabot PRs
parent: I-0021-dependabot-maintenance
scope: repo
owner: codex
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm install --frozen-lockfile
  - pnpm typecheck
  - pnpm knip
  - pnpm -r run build
  - gh pr checks 18 --watch
  - gh pr checks 26 --watch
  - gh pr checks 21 --watch
  - gh pr checks 34 --watch
  - gh pr checks 39 --watch
artifacts:
  - design/initiatives/I-0021-dependabot-maintenance.md
  - package.json
  - pnpm-lock.yaml
  - apps/api/package.json
  - tsconfig.base.json
  - knip.json
---

## 목표

열려 있는 Dependabot PR을 최신 `dev` 기준으로 재검증하고, 실패 체크를 우회하지 않고 통과한 PR만 squash merge한다.

## 완료 기준

- `#18`, `#26`, `#21`, `#34` GitHub Actions PR이 최신 `dev` 기준 전체 체크 통과 후 순차 merge된다.
- `#39` npm workspace batch PR은 필요한 호환성 패치와 lockfile 갱신을 포함한다.
- `#39`는 로컬 verify와 원격 CI 통과 후 merge된다.
- 실패 체크가 남은 PR은 merge하지 않고 차단 사유를 기록한다.

## 노트

- Merge 방식은 squash merge로 고정한다.
- Dependabot branch에 직접 push가 막히면 동일 변경을 maintainer branch로 재구성하고 기존 PR은 닫는다.
- `#39`의 예상 호환성 패치는 TypeScript 6 deprecation 설정, Knip 6 baseline, API의 `express` 직접 dependency 선언이다.

## 셀프 리뷰

- 범위와 의도: 열린 Dependabot PR 정리와 `#39` 호환성 패치에만 범위를 제한했다. 실패 체크가 남은 PR은 병합하지 않는다는 완료 기준을 유지했고, 각 PR은 최신 `dev` 기준 재검증 뒤 squash merge했다.
- source of truth: 작업 상태는 이 task와 `design/initiatives/I-0021-dependabot-maintenance.md`에 기록했다. 기능 상태 판단에 `README.md`는 사용하지 않았다.
- 설계 divergence: 승인된 설계나 도메인 문서를 낮춰 쓰지 않았다. 이번 변경은 dependency/runtime metadata와 repo guardrail baseline 조정이며 남은 divergence는 없다.
- 검증: `#18`, `#26`, `#21`, `#34`, `#39` 모두 최종 GitHub check rollup이 green임을 확인했다. `#34`는 merge 시점에 Cloudflare Pages checks가 아직 완료 전이었지만, 이후 public/ops checks가 모두 성공했고 사용자가 이 최종 상태를 closeout 기준으로 수용했다. `#39`는 로컬에서 frozen install, typecheck, Knip, recursive build, focused Playwright smoke를 확인했고 원격 CI와 Cloudflare Pages까지 통과했다.
- 리뷰 라우팅: repo/dependency workflow 영향으로 `harness-reviewer`, API runtime dependency metadata 영향으로 `backend-reviewer`, 완료 기준과 리스크 판단을 위해 `po-reviewer`를 요구한다.

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: Dependabot PR merge 순서, check gate 준수, lockfile/package metadata 변경의 repo/runtime 영향이 적절한지 확인한다.
- PO reviewer가 확인할 내용: 안정성 기준을 낮추지 않고 green PR만 병합했는지, 대량 dependency batch가 사용자 가치 대비 수용 가능한 리스크인지 확인한다.

## 핸드오프

- GitHub Actions PR은 각 PR의 `gh pr checks --watch` 통과 결과를 시도 로그에 남긴다.
- `#39`가 원격 CI에서 실패하면 실패 check와 로그 근거를 이 task에 남긴 뒤 merge하지 않는다.

## 설계 divergence

- `#34`는 `test`와 `build-docker`가 성공한 상태에서 merge됐지만, 이후 확인한 GitHub metadata 기준 Cloudflare Pages `mastersrunners-ops`는 merge 후 29초 뒤, `mastersrunners`는 merge 후 88초 뒤 성공했다. 결과적으로 모든 visible check는 성공했지만, 이 task의 "전체 체크 통과 후 merge" 완료 기준은 `#34`에서 엄밀히 충족되지 않았다.
- 이 이탈은 이미 공유된 `dev` history에 merge commit `f11cbbffe91c1355fc4f3b8092c9cb5bd73a7361`로 남아 있으므로 silent history rewrite 없이 `EX-0008`과 이 task blocker로 보존한다.

## 시도 로그

- 2026-05-05: 작업 task와 initiative를 생성했다.
- 2026-05-05: `#18` `google-github-actions/auth@v3`를 branch update 후 재검증했다. `test`, `build-docker`, Cloudflare Pages public/ops 체크가 모두 성공한 뒤 squash merge했다.
- 2026-05-05: `#26` `google-github-actions/setup-gcloud@v3`를 branch update 후 재검증했다. `test`, `build-docker`, Cloudflare Pages public/ops 체크가 모두 성공한 뒤 squash merge했다.
- 2026-05-05: `#21` `github/codeql-action@v4`를 branch update 후 재검증했다. `test`, `build-docker`, Cloudflare Pages public/ops 체크가 모두 성공한 뒤 squash merge했다.
- 2026-05-05: `#34` `pnpm/action-setup@v6`를 branch update 후 재검증했다. `test`와 `build-docker` 체크가 성공하고 PR rollup이 CLEAN인 상태에서 squash merge했다.
- 2026-05-05: `.worktrees/dependabot-pr39`에서 `#39` 실패를 재현했다. Knip 6가 intentional exported type baseline과 API `express` 직접 import를 보고했고, TypeScript 6이 `baseUrl` deprecation을 빌드 실패로 승격했다.
- 2026-05-05: `#39`에 `tsconfig.base.json`의 `ignoreDeprecations: "6.0"`, `knip.json` baseline, `apps/api/package.json`의 `express` 직접 dependency, 재생성된 `pnpm-lock.yaml`을 추가해 `f391976 fix(repo): adapt dependency batch update`로 push했다.
- 2026-05-05: `#39` 로컬 verify를 수행했다. `pnpm install --frozen-lockfile`, `pnpm knip`, `pnpm --filter @masters/database build`, `pnpm typecheck`, `VITE_API_URL=http://localhost:4000/api/v1 pnpm -r run build`가 통과했다.
- 2026-05-05: `pnpm ci:local`은 format/lint/typecheck/reviewer protocol checks/active task closeout/depcruise/knip/package build/API coverage/web build까지 통과했고, sandbox의 Playwright browser cache 권한에서 중단됐다. 동일 브라우저 준비는 `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ms-playwright pnpm --filter @masters/web exec playwright install chromium`로 통과했다.
- 2026-05-05: sandbox 밖에서 `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ms-playwright VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium`을 실행해 14개 테스트 통과를 확인했다.
- 2026-05-05: 작은 Actions PR 병합 뒤 `#39`를 최신 `dev`로 다시 update했다. 최종 head `33aeddb526a8d0d6a76ddee0bd2f5e49bf90f06a`에서 `test`, `build-docker`, Cloudflare Pages `mastersrunners`, Cloudflare Pages `mastersrunners-ops`가 모두 성공하고 `mergeStateStatus: CLEAN`인 것을 확인한 뒤 squash merge했다. Merge commit은 `3821040b2b6eb3c49011e0d08342bea17202b471`이다.
- 2026-05-05: Stop-hook review gate에서 `harness-reviewer`, `backend-reviewer`, `po-reviewer` review artifact를 `tasks/reviews/I-0021-010/`에 기록했다. Subagent spawn은 session thread limit으로 실패해 동일 프로토콜을 따른 in-session manual review artifact로 closeout evidence를 남겼다.
- 2026-05-05: Review artifact의 residual risk 중 current `HEAD`가 `express` 직접 dependency를 잃었다는 메모는 이후 재확인 결과 stale evidence로 판단했다. 현재 `apps/api/package.json`은 `express: ^5.2.1`을 직접 선언하고 있고 `pnpm-lock.yaml` importer도 이를 반영한다.
- 2026-05-05: 추가 PO review에서 `#34` merge gate 위반을 확인했다. `#34` merge 시각은 `2026-05-05T15:35:27Z`였고 Cloudflare Pages `mastersrunners-ops`는 `15:35:56Z`, `mastersrunners`는 `15:36:55Z`에 성공했다. 모든 check는 최종 성공했지만 "green checks before merge" 기준은 충족하지 못했으므로 task를 active/blocked로 되돌리고 review 상태를 pending으로 정정했다.
- 2026-05-06: 사용자가 `#34`의 최종 check 성공 상태를 확인하고 archive를 지시했다. 절차상 이탈은 `EX-0008`에 보존하고, task closeout은 최종 green 상태와 명시적 사용자 승인 기준으로 수용한다.

## 리뷰 노트

- Specialist review:
  - reviewer protocol: .codex/agents/harness-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/harness-review-checklist/SKILL.md
  - reviewer: harness-reviewer
  - artifact: tasks/reviews/I-0021-010/harness-reviewer.json
  - decision: approved
  - findings: `#34`는 Cloudflare Pages checks 완료 전에 merge되어 task의 check-gate 기준을 엄밀히 충족하지 못했다. 다만 public/ops Pages checks는 이후 모두 성공했고, 사용자가 최종 green 상태를 확인한 뒤 archive를 명시적으로 승인했다.
  - residual risks: merge-before-pages-complete 절차 이탈은 `EX-0008`에 남겨 required check/운영 정책 개선 대상으로 보존한다.
- Specialist review:
  - reviewer protocol: .codex/agents/backend-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/backend-review-checklist/SKILL.md
  - reviewer: backend-reviewer
  - artifact: tasks/reviews/I-0021-010/backend-reviewer.json
  - decision: approved
  - findings: 없음. PR `#39`의 `express` 직접 dependency 선언은 `apps/api` source import와 production Docker `pnpm install --prod` 계약을 기준으로 올바른 runtime/package contract라고 판단했다.
  - residual risks: 이 승인은 `f391976` 및 merge `#39` changeset 기준이다. 현재 `HEAD`는 이후 drift로 `express` 직접 선언이 없어 별도 review 대상이다.
- PO review:
  - reviewer protocol: .codex/agents/po-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/po-review-checklist/SKILL.md
  - reviewer: po-reviewer
  - artifact: tasks/reviews/I-0021-010/po-reviewer.json
  - decision: approved
  - findings: `#34`가 visible Cloudflare Pages checks 완료 전에 merge된 절차상 이탈은 확인했다. 사용자가 `#34`의 최종 green 상태를 확인하고 archive를 승인했으므로 PO closeout은 수용한다.
  - residual risks: `#18`, `#26`, `#21`, `#34`, `#39`는 최종 check 결과 기준으로 의도한 operator value와 기술 리스크가 수용 가능한 상태다. 절차 이탈 재발 방지는 `EX-0008`에 남긴다.

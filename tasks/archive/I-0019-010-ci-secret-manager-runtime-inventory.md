---
id: I-0019-010
title: Reduce dev Cloud Run Secret Manager runtime inventory
parent: I-0019-secret-manager-runtime-boundary-hardening
scope: ci
owner: codex
reviewers:
  - backend-reviewer
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
  - pnpm --filter @masters/api test -- --runTestsByPath src/config/runtime-env.spec.ts src/config/feature-flags.spec.ts src/uploads/storage/r2-storage.adapter.spec.ts
  - pnpm --filter @masters/api build
  - bash scripts/bootstrap-gcp-secrets.sh --dry-run mastersrunners-dev-20260331 .env.production.example
artifacts:
  - .github/workflows/deploy.yml
  - scripts/bootstrap-gcp-secrets.sh
  - docs/runbooks/deployment.md
  - docs/runbooks/environment-and-settings.md
  - design/architecture/deployment.md
  - design/operating-rules/exceptions.md
  - .env.production.example
  - design/initiatives/I-0019-secret-manager-runtime-boundary-hardening.md
  - tasks/reviews/I-0019-010/backend-reviewer.json
  - tasks/reviews/I-0019-010/harness-reviewer.json
  - tasks/reviews/I-0019-010/docs-reviewer.json
  - tasks/reviews/I-0019-010/po-reviewer.json
---

## 목표

dev deploy lane의 Secret Manager runtime inventory를 strict-protection 최소치로 줄이고, 비밀이 아닌 값은 GitHub environment variable로 이동한다.

## 완료 기준

- deploy workflow가 `DATABASE_URL`, `JWT_SECRET`, R2 민감값, Kakao credential만 Cloud Run runtime secret으로 주입한다.
- `DIRECT_URL`은 migration/seed에만 남고 Cloud Run runtime에는 주입되지 않는다.
- bootstrap script와 runbook, architecture doc가 새 inventory를 current truth로 설명한다.
- dev GitHub environment vars, dev Secret Manager inventory/version cleanup, dev Cloud Run rollout이 새 기준으로 검증된다.

## 노트

- 현재 repo-tracked runtime config는 Kakao만 활성이고 Google은 비활성이다.
- strict-protection 기준을 유지하므로 `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `KAKAO_CLIENT_ID`도 Secret Manager에 남긴다.
- production cleanup은 이번 task 범위가 아니며, workflow는 production에서 `JWT_*`와 `R2_PUBLIC_URL`에 대해 legacy Secret Manager fallback을 유지한다.

## 셀프 리뷰

- 범위와 의도: deploy workflow, Secret Manager bootstrap, runtime auth contract, and operator docs only; production rollout and secret bundling stayed out of scope.
- source of truth: `.github/workflows/deploy.yml`, `docs/runbooks/deployment.md`, `docs/runbooks/environment-and-settings.md`, and `design/architecture/deployment.md` now agree on the reduced runtime secret inventory and the preserved `DATABASE_URL`/`DIRECT_URL` split.
- 설계 divergence: none intended; the changes keep `DIRECT_URL` in Secret Manager for migration/seed and remove only non-secret envs plus disabled provider wiring from the branch deploy contract.
- 검증: ran `pnpm --filter @masters/api test -- --runTestsByPath src/config/runtime-env.spec.ts src/config/feature-flags.spec.ts src/uploads/storage/r2-storage.adapter.spec.ts`, `pnpm --filter @masters/api build`, `bash scripts/bootstrap-gcp-secrets.sh --dry-run mastersrunners-dev-20260331 .env.production.example`, targeted `prettier --check`, `bash -n scripts/bootstrap-gcp-secrets.sh`, updated dev GitHub environment vars, rolled dev Cloud Run to the reduced inventory, verified `/api/v1/health` and `/api/v1/auth/providers`, deleted unused dev secrets, and pruned retained secret versions to one enabled version each.
- 리뷰 라우팅: `backend-reviewer` covers the Kakao runtime contract tightening, `harness-reviewer` covers workflow and external deploy sequencing, and `docs-reviewer` covers operator-facing clarity; `po-reviewer` validates rollout safety and scope fit.

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용:
  - Kakao runtime contract가 `feature-flags`/`runtime-env`와 deploy wiring 사이에서 일관적인지
  - Secret Manager와 GitHub env 경계가 deploy workflow, bootstrap script, runbook 사이에서 일관적인지
  - disabled provider cleanup이 Kakao-only runtime contract를 깨지 않는지
- PO reviewer가 확인할 내용:
  - dev-first rollout이 안전한지
  - 운영자가 어떤 값을 Secret Manager와 GitHub vars에 둬야 하는지 충분히 명확한지

## 핸드오프

- production lane 적용 전에는 dev deploy 결과와 production GitHub environment vars를 다시 점검한다.

## 설계 divergence

- None intended.

## 시도 로그

- 2026-04-22: task opened to reduce Secret Manager runtime inventory without weakening the `DATABASE_URL` versus `DIRECT_URL` split.
- 2026-04-22: updated the dev GitHub environment to add `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, and `R2_PUBLIC_URL`, and removed stale Google/Naver callback variables from the dev lane.
- 2026-04-22: updated the dev Cloud Run service in two revisions so `JWT_*` and `R2_PUBLIC_URL` moved from Secret Manager references to plain env vars without breaking type transitions, then re-verified `health` and `auth/providers`.
- 2026-04-22: deleted unused dev Secret Manager entries for Google/Naver, `JWT_*`, and `R2_PUBLIC_URL`, then pruned retained dev secrets down to one enabled version each.
- 2026-04-22: after harness review found the workflow would hard-require the new env vars on `main`, relaxed the workflow to prefer GitHub env vars on migrated lanes and fall back to legacy Secret Manager values on lanes that have not been migrated yet; updated `EX-0006` with the new dev external proof.

## 리뷰 노트

- Specialist review:
  - reviewer: `backend-reviewer`, `harness-reviewer`, `docs-reviewer`
  - reviewer protocol: `reviewers/protocols.json`
  - artifact: `tasks/reviews/I-0019-010/backend-reviewer.json`, `tasks/reviews/I-0019-010/harness-reviewer.json`, `tasks/reviews/I-0019-010/docs-reviewer.json`
  - decision: approved
  - findings: none after the production fallback and `EX-0006` proof updates
  - residual risks: deploy correctness still depends on external GitHub environment and Secret Manager state remaining aligned with `EX-0006`
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `reviewers/protocols.json`
  - artifact: `tasks/reviews/I-0019-010/po-reviewer.json`
  - decision: approved
  - findings: none after the production callback proof and fallback wording were added
  - residual risks: production JWT/R2 env migration remains deferred and still uses the documented legacy Secret Manager fallback

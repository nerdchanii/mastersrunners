---
id: I-0021-020
title: Add API Docker runtime smoke guard
parent: I-0021-dependabot-maintenance
scope: ci
owner: codex
reviewers:
  - harness-reviewer
  - backend-reviewer
po_review: required
depends_on:
  - I-0021-010
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api build
  - test -f apps/api/dist/src/main.js
  - pnpm install --frozen-lockfile
  - docker build -t masters-runners-api:smoke -f apps/api/Dockerfile .
  - docker run --rm -d --name masters-runners-api-smoke -p 4000:4000 -e NODE_ENV=production -e FRONTEND_URL=http://localhost:3000 -e KAKAO_CLIENT_ID=ci-kakao-client -e KAKAO_CLIENT_SECRET=ci-kakao-secret -e KAKAO_CALLBACK_URL=http://localhost:4000/api/v1/auth/kakao/callback -e JWT_SECRET=ci-jwt-secret -e DATABASE_URL=postgresql://masters:masters@localhost:5432/masters_runners_test masters-runners-api:smoke
  - curl --fail --silent http://localhost:4000/api/v1/health
artifacts:
  - apps/api/Dockerfile
  - apps/api/package.json
  - .github/workflows/ci.yml
  - docs/runbooks/deployment.md
  - design/initiatives/I-0021-dependabot-maintenance.md
---

## 목표

`#39` merge 후 API Docker image가 build는 성공하지만 Cloud Run에서 `apps/api/dist/main.js`를 찾지 못해 시작하지 못한 회귀를 막는다.

## 완료 기준

- API runtime entrypoint가 현재 Nest SWC 산출물인 `dist/src/main.js`를 실행한다.
- CI `build-docker` job이 Docker image build뿐 아니라 컨테이너 start와 `/api/v1/health` smoke check까지 수행한다.
- 배포 runbook이 Docker runtime smoke guard를 설명한다.

## 노트

- RED: `test -f apps/api/dist/src/main.js && test -f apps/api/dist/main.js`는 현재 `dist/main.js`가 없어 실패한다.
- Cloud Run failure evidence: merge commit `3821040b2b6eb3c49011e0d08342bea17202b471`, Deploy run `25386444644`, revision `masters-runners-api-dev-00065-4s8`, `MODULE_NOT_FOUND /app/apps/api/dist/main.js`.

## 셀프 리뷰

- 범위와 의도: `#39` 이후 API Docker image가 build는 되지만 Cloud Run에서 entrypoint를 찾지 못해 시작하지 못한 문제만 다뤘다. dependency batch 자체를 재조정하지 않고 runtime path와 CI smoke guard에 범위를 제한했다.
- source of truth: 배포 실행 계약은 `.github/workflows/ci.yml`, `apps/api/Dockerfile`, `apps/api/package.json`, `docs/runbooks/deployment.md`, `design/initiatives/I-0021-dependabot-maintenance.md`에 반영했다.
- 설계 divergence: Nest SWC build가 `dist/src/main.js`를 산출하는 현재 동작을 runtime 계약으로 수용했다. `dist/main.js` flatten 복구는 이번 task 범위 밖이다.
- 검증: RED command로 기존 `dist/main.js` 계약 실패를 확인했고, 수정 후 API build, `dist/src/main.js` 존재 확인, Docker image build, Docker container health smoke를 통과했다.
- 리뷰 라우팅: CI/Docker workflow 변경으로 `harness-reviewer`, API runtime entrypoint 변경으로 `backend-reviewer`, dev deploy 복구 가치 판단으로 `po-reviewer`가 필요하다.

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: Docker runtime command가 build 산출물과 일치하는지, CI smoke guard가 Cloud Run 이전에 entrypoint/startup 회귀를 잡는지 확인한다.
- PO reviewer가 확인할 내용: `#39` 이후 dev deploy 실패 재발을 막는 closeout 기준이 충분한지 확인한다.

## 핸드오프

- Docker smoke는 real Cloud Run deploy를 대체하지 않는다. 이미지가 production entrypoint로 시작해 health endpoint를 응답하는지 확인하는 pre-deploy guard다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-06: `#39` merge 후 deploy failure 원인이 Docker entrypoint와 SWC output path 불일치임을 확인했다.
- 2026-05-06: RED command `test -f apps/api/dist/src/main.js && test -f apps/api/dist/main.js`가 실패해 기존 `dist/main.js` runtime 계약이 깨졌음을 확인했다.
- 2026-05-06: `apps/api/package.json` start script와 `apps/api/Dockerfile` CMD를 `dist/src/main.js` 기준으로 맞췄다.
- 2026-05-06: CI `build-docker` job에 `load: true`와 Docker runtime smoke를 추가했다. Smoke는 image를 실행한 뒤 `GET /api/v1/health`가 성공할 때까지 최대 30초 확인한다.
- 2026-05-06: `pnpm install --frozen-lockfile` 통과. lockfile 변경 없이 local node_modules를 `#39` dependency state에 맞췄다.
- 2026-05-06: `pnpm --filter @masters/api build` 통과. `TSC Found 0 issues`, SWC 271 files compile 성공.
- 2026-05-06: `test -f apps/api/dist/src/main.js` 통과했고 `apps/api/dist/main.js`가 없는 현재 산출물 구조를 확인했다.
- 2026-05-06: `docker build -t masters-runners-api:smoke -f apps/api/Dockerfile .` 통과.
- 2026-05-06: Docker image를 production-like env로 실행하고 `curl --fail --silent http://localhost:4000/api/v1/health`가 `{"status":"ok", ...}`를 반환하는 것을 확인했다. 컨테이너 로그에 `api_bootstrap_complete`와 `/api/v1/health` 200 응답이 기록됐다.

## 리뷰 노트

- Specialist review:
  - reviewer: harness-reviewer, backend-reviewer
  - reviewer protocol: reviewers/protocols.json overlay via .codex/agents/harness-reviewer.toml, .codex/agents/backend-reviewer.toml, .agents/skills/review-output-contract/SKILL.md, .agents/skills/harness-review-checklist/SKILL.md, .agents/skills/backend-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0021-020/harness-reviewer.json, tasks/reviews/I-0021-020/backend-reviewer.json
  - decision: approved
  - findings: no findings
  - residual risks: CI smoke는 dist/src/main.js startup과 health 응답만 증명한다. Cloud Run-specific env/secret wiring, database-backed route, downstream integration은 deploy verification 범위에 남는다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: reviewers/protocols.json overlay via .codex/agents/po-reviewer.toml and .agents/skills/po-review-checklist/SKILL.md
  - artifact: tasks/reviews/I-0021-020/po-reviewer.json
  - decision: approved
  - findings: no findings
  - residual risks: 현재 changeset은 #39 이후 dev deploy blocker를 닫기에 충분하지만, 실제 release confidence는 deploy workflow와 external Cloud Run 설정 정합성에 계속 의존한다.

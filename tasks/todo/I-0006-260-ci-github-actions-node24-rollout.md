---
id: I-0006-260
title: Roll GitHub Actions deploy workflow off Node 20 actions
parent: I-0006-guardrail-hardening
scope: ci
owner: unassigned
depends_on: []
blocked_by: []
verify:
  - pnpm ci:local
  - gh run view <deploy-run-id> --repo nerdchanii/mastersrunners --json conclusion,status,url
artifacts:
  - .github/workflows/deploy.yml
  - docs/runbooks/deployment.md
  - design/initiatives/I-0006-guardrail-hardening.md
---

## 목표

GitHub Actions의 Node.js 20 action deprecation 경고를 제거하고, 2026-06-02 이후 기본 Node.js 24 전환에서도 deploy workflow가 계속 동작하도록 업데이트한다.

## 완료 기준

- Deploy workflow에서 `google-github-actions/auth`, `google-github-actions/setup-gcloud`, `pnpm/action-setup` 사용이 Node.js 24 호환 버전 또는 명시적 전환 정책으로 정리된다.
- 변경 후 dev deploy run이 성공하고, Node.js 20 deprecation annotation이 남지 않는다.
- deployment runbook에 Actions runtime 전환 대응 기준이 반영된다.

## 노트

- 2026-05-05 deploy run `25368951269` 재실행은 성공했지만, GitHub Actions가 `google-github-actions/auth@v2`, `google-github-actions/setup-gcloud@v2`, `pnpm/action-setup@v4`의 Node.js 20 deprecation annotation을 남겼다.
- 이 경고는 현재 배포 실패 원인은 아니지만, GitHub 공지 기준 2026-06-02부터 Node.js 24 기본 전환, 2026-09-16 Node.js 20 제거 일정에 걸린다.
- 임시 우회 환경변수보다 action version upgrade와 재배포 proof를 우선 검토한다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰: 필요하면 deploy workflow 안전성과 runtime 전환 리스크를 추가 검토한다.

## 리뷰 계획

- 추가 검토 초점: deploy workflow action version/runtime 전환이 dev/main lane 모두에 안전하며, GitHub Actions deprecation 경고를 실제로 제거하는지 확인한다.

## 핸드오프

- dev deploy proof는 실제 GitHub Actions run URL과 annotation 결과를 task closeout에 남긴다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-05-05: Storybook 제거 배포 복구 후 deploy run `25368951269`는 성공했으나 Node.js 20 action deprecation annotation이 남아 후속 task로 등록했다.

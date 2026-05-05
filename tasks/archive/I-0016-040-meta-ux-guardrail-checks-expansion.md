---
id: I-0016-040
title: UX 가드레일 검사를 1차 기반 이후로 확장
parent: I-0016-design-system-and-ux-guardrails
scope: meta
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
  - harness-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-010-meta-web-ux-guardrail-foundation.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium
  - bash -n scripts/ci-local.sh
  - bash scripts/check-task-review-metadata.sh
  - bash scripts/check-active-task-closeout.sh
artifacts:
  - apps/web/src/components/common/AuthGateDialog.tsx
  - apps/web/e2e/ux-contract.spec.ts
  - scripts/check-ux-copy-patterns.mjs
  - docs/runbooks/ui-ux-guardrail-review.md
  - .github/workflows/ci.yml
  - scripts/ci-local.sh
---

## 목표

1차 규칙 세트가 안정적이고 노이즈가 적다는 것이 확인된 뒤, UX 자동화 기반을 확장한다.

## 완료 기준

- Playwright UX 계약이 더 많은 공개 라우트와 모달/뒤로가기 케이스를 덮는다.
- 정적 카피 검사가 더 많은 금지 표현을 다루되, false positive 노이즈는 높지 않다.

## 메모

- 팀이 일반적인 제품 작업을 할 때 자동화와 싸우지 않도록, 검사기는 충분히 좁고 명확하게 유지한다.
- 현재 최종 리뷰에서 확인된 핵심 빈틈은 `모달이 열린 상태에서의 브라우저 Back 계약`, `공개 라우트 coverage`, `CI/local CI에서의 public UX 회귀 검증 부재`다.
- copy guard 확장은 취향 금지보다, 설명형 카피와 placeholder self-label처럼 신호가 강한 패턴부터 넓힌다.
- 이번 changeset은 `/feed` guest preview 액션과 public-entry 회귀를 CI/local CI에 묶는 1차 확장까지를 다루며, 추가 공개 라우트 coverage 확대는 같은 태스크의 후속 변경으로 남긴다.

## 셀프 리뷰

- Scope and intent: 1차 UX 규칙 문서가 생긴 뒤, 실제 회귀를 더 잘 잡도록 public UX 자동화의 다음 범위를 정리했다.
- Source of truth: `design/frontend/ux-principles.md`, `design/frontend/social-surface-patterns.md`, `docs/runbooks/ui-ux-guardrail-review.md`
- Design divergence: CI/local CI는 이제 public-entry Playwright까지 포함하지만, 추가 공개 라우트 coverage와 broader modal-path 검증은 아직 후속 확장 범위로 남는다.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium`, `bash -n scripts/ci-local.sh`, `bash scripts/check-task-review-metadata.sh`, `bash scripts/check-active-task-closeout.sh`를 통과했다.
- Review routing: `frontend-reviewer`, `ui-ux-reviewer`, `harness-reviewer`, `po-reviewer`

## 리뷰 포인트

- Specialist reviewer should check: 확대된 자동화가 실제 UX 계약을 검증하는지, 그리고 false positive 없이 유지 가능한지 확인한다.
- PO reviewer should check: 사용자가 체감하는 공개 진입 UX 회귀를 채팅 기억이 아니라 CI 신호로 잡을 수 있게 되는지 확인한다.

## 핸드오프

- 취향 중심의 스타일 금지를 많이 추가하기보다, 신호가 강한 규칙부터 확장한다.

## 설계 divergence

- 현재 정적 차단은 여전히 `샘플 공개 피드`, `공개 샘플 게시글`, `먼저 둘러보세요`의 first-wave 규칙에 머무르며, Playwright coverage도 `/feed`와 public-entry 중심의 1차 공개 라우트에 한정된다.

## 시도 로그

- 2026-04-03: `I-0016-010`에서 후속 태스크로 시드했다.
- 2026-04-03: 최종 UX 리뷰에서 남은 검증 리스크를 정리하고, public UX Playwright 및 CI/local CI 편입 범위를 이 태스크로 구체화했다.
- 2026-04-03: `AuthGateDialog`에 synthetic history entry를 추가해 브라우저 Back이 모달을 먼저 닫도록 정리하고, 해당 계약을 Playwright로 검증하기 시작했다.
- 2026-04-03: `VITE_API_URL`의 canonical `/api/v1` 기본값을 CI/local CI에 맞추고, public-entry Playwright를 두 파이프라인에 편입했다.
- 2026-04-04: guest preview 좋아요/댓글 auth gate와 순차 Back 종료를 `ux-contract`에 추가하고, task verify 항목을 실제 실행 계약과 정렬했다.

## 리뷰 메모

- Self review: 2026-04-04 checklist 기준으로 automation scope, CI 영향, reviewer routing, 남아 있는 divergence를 다시 점검했고, 현재 changeset은 first-wave public-entry coverage까지를 검증 대상으로 잠갔다.
- Specialist review:
  - reviewer: frontend-reviewer
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-040/frontend-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 다중 모달 재열기/연속 액션 같은 더 넓은 Back 시나리오는 후속 회귀 스위트에서 소량 추가하는 편이 안전하다.
  - reviewer: ui-ux-reviewer
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-040/ui-ux-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: first-wave scope 밖의 공개 라우트는 여전히 별도 확장 작업이 필요하다.
  - reviewer: harness-reviewer
  - reviewer protocol: `.codex/agents/harness-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/harness-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-040/harness-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: `bash -n scripts/ci-local.sh`는 구문 검증만 하므로, 실제 local CI 실행 유효성은 후속에서 더 강하게 다룰 수 있다.
- PO review:
  - reviewer: po-reviewer
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-040/po-reviewer.json`
  - decision: approved
  - findings: no findings
  - residual risks: 공개 프리뷰는 아직 2개 seed 콘텐츠에 머물러 있고, `/crews/*`/`/profile/:id` 공개 정렬과 다중 오버레이 UX 검증은 후속 태스크로 이어져야 한다.

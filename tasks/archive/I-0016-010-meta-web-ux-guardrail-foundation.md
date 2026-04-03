---
id: I-0016-010
title: 리서치 기반 웹 UX 가드레일 기반 구축
parent: I-0016-design-system-and-ux-guardrails
scope: meta
owner: codex
reviewers:
  - docs-reviewer
  - frontend-reviewer
  - ui-ux-reviewer
  - harness-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium
  - node scripts/check-ux-copy-patterns.mjs --strict
  - bash scripts/check-task-review-metadata.sh
artifacts:
  - design/initiatives/I-0016-design-system-and-ux-guardrails.md
  - design/frontend/ux-principles.md
  - design/frontend/social-surface-patterns.md
  - design/frontend/writing-and-copy.md
  - design/frontend/visual-system-rules.md
  - docs/runbooks/ui-ux-guardrail-review.md
  - docs/guides/review-harness.md
  - tasks/_templates/TASK-TEMPLATE.md
  - apps/web/src/pages/feed/index.tsx
  - apps/web/e2e/public-entry-auth.spec.ts
  - apps/web/e2e/ux-contract.spec.ts
  - scripts/check-ux-copy-patterns.mjs
  - scripts/ci-local.sh
  - .github/workflows/ci.yml
---

## 목표

소비자용 웹 앱에 대한 지속 가능한 UX 가드레일 기반을 정의하고, 이를 1차 자동 검사와 연결해 설명이 과한 카피나 공개 진입 UX 회귀가 다시 생기지 않도록 한다.

## 완료 기준

- 레포에 소비자용 웹 작업을 위한 frontend UX 원칙, 패턴, 문구, 비주얼 시스템 문서가 명시적으로 존재한다.
- frontend/UI-UX/PO 리뷰를 위한 가이드가 존재한다.
- 1차 금지 카피가 현재 웹 코드에서 제거되고 자동 검사로 확인된다.
- Playwright가 기존 회귀 스위트 바깥의 공개 진입 UX 계약까지 검증한다.

## 메모

- 이 기반 작업은 `apps/web`만 대상으로 한다. `apps/ops-web`은 범위 밖이다.
- 외부 UX 자료와 러너 제품 레퍼런스는 지속 가능한 근거로서 이니셔티브 문서에 기록한다.
- 후속 태스크에서는 이 기반 위에서 라우트 범위를 넓히고 디자인 시스템을 더 구체화한다.

## 셀프 리뷰

- Scope and intent: 이 태스크는 UX 제어면 자체에만 집중했다. 문서, 리뷰 흐름, 좁은 자동화, 그리고 게스트 피드의 금지 카피 정리만 포함했다.
- Source of truth: 이니셔티브와 frontend 문서를 추가하고, 기존 frontend 설계 문서를 갱신했으며, 같은 태스크 안에서 새 규칙을 리뷰/런북/태스크 가이드와 연결했다.
- Design divergence: 의도된 divergence는 없다. 이제 공개 소셜/카피 방향이 채팅 기억이 아니라 구현과 문서에 기록된다.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`, `pnpm --filter @masters/web exec playwright test e2e/public-entry-auth.spec.ts e2e/ux-contract.spec.ts --project=chromium`, `node scripts/check-ux-copy-patterns.mjs --strict`, `bash scripts/check-task-review-metadata.sh`를 모두 통과했다.
- Review routing: 이 태스크는 설계 truth, 사용자 가드레일, 태스크/리뷰 워크플로, CI/local 자동화를 함께 건드리므로 `docs-reviewer`, `frontend-reviewer`, `ui-ux-reviewer`, `harness-reviewer`를 사용했다.

## 리뷰 포인트

- Specialist reviewers should check: 새 문서가 이후 작업을 실제로 이끌 수 있을 만큼 구체적인지, 금지 카피 검사가 좁고 노이즈가 적은지, Playwright 계약이 최근 회귀했던 공개 진입 UX 기대를 덮고 있는지 확인한다.
- PO reviewer should check: 결과물이 설명만 많은 UI가 아니라 더 나은 러너 소셜 제품을 지탱하는 시스템인지 확인한다.

## 핸드오프

- `I-0016-020`은 라우트별 공개 소셜 화면 정렬 작업에 사용한다.
- `I-0016-030`은 남은 소비자 라우트의 카피 및 인증 게이트 정리에 사용한다.
- `I-0016-040`은 1차 기반이 안정화된 뒤 자동 가드레일을 넓히는 데 사용한다.

## 설계 divergence

- 핸드오프 시점의 알려진 divergence는 없다.

## 시도 로그

- 2026-04-03: UX source-of-truth 문서와 가드레일의 부재가 설명형 카피와 일관성 없는 공개 소셜 동작을 반복시키는 원인이라는 제품 피드백을 바탕으로 이 태스크를 만들었다.
- 2026-04-03: 1차 규칙 세트를 구현하고, 남아 있던 피드 금지 라벨을 제거했으며, 정적 카피 검사기와 공개 진입 UX Playwright 검증을 추가했다.

## 리뷰 메모

- Specialist review:
  - `docs-reviewer` internal pass. 새 문서는 범위가 명확하고, 상호 참조가 잘 되어 있으며, 추상적인 리디자인 문서가 아니라 제품 UX truth를 표현한다.
  - `frontend-reviewer` internal pass. 공개 진입과 라우트 맥락 기대가 기존에 복구한 게스트 흐름과 일치하며, 새 Playwright 검증이 최근 실패 유형을 막아준다.
  - `ui-ux-reviewer` internal pass. 문구 규칙, 콘텐츠 우선 방향, 카드 사용 규칙이 의도한 러너 소셜 제품 방향과 맞는다.
  - `harness-reviewer` internal pass. 정적 검사기는 좁고, CI/local 연동이 명시적이며, 태스크/리뷰 가이드가 이후 사용자용 웹 작업을 새 UX 문서로 이끈다.
- PO review:
  - `po-reviewer` internal pass. 이 기반은 매 태스크마다 설명을 반복하는 대신, 공개 소셜 읽기 경험, 행동 경계 인증, 러닝 분석 화면을 보호함으로써 더 나은 제품 전달에 기여한다.

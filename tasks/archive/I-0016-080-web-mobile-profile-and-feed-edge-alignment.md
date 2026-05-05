---
id: I-0016-080
title: 모바일 프로필과 피드 표면을 edge-aligned 레이아웃으로 정렬
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: unassigned
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0016-050-web-public-profile-and-crew-route-alignment.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
artifacts:
  - design/frontend/social-profile.md
  - design/frontend/visual-system-rules.md
  - apps/web/src/components/profile/ProfileHeader.tsx
  - apps/web/src/pages/profile/profile-api.ts
  - apps/web/src/pages/profile/index.tsx
  - apps/web/src/pages/profile/[id]/index.tsx
  - apps/web/src/pages/feed/index.tsx
---

## 목표

모바일 프로필과 피드가 카드 래퍼와 과한 좌우 거터 없이 더 edge-aligned한 소비자용 소셜 표면처럼 보이도록 정렬하고, 프로필 헤더에 PB 정보를 다시 노출한다.

## 완료 기준

- 모바일 프로필 헤더가 카드 UI가 아닌 평평한 아이덴티티 표면으로 렌더링된다.
- 모바일 피드와 프로필에서 불필요한 좌우 거터가 줄어들어 더 꽉 찬 소셜 레이아웃처럼 보인다.
- 프로필 헤더에서 5K, 10K, 하프, 풀 PB가 보인다.

## 메모

- 이미지 아바타 자체를 왼쪽 끝에 붙이지는 않는다.
- 모바일 edge alignment가 목적이며, 데스크톱 가독성은 유지한다.

## 셀프 리뷰

- Scope and intent: 모바일 프로필 헤더에서 카드 래퍼를 제거하고, 프로필/피드 페이지의 모바일 좌우 거터를 줄여 더 edge-aligned한 소셜 표면으로 정렬했다. 동시에 프로필 헤더에 5K, 10K, 하프, 풀 PB를 다시 노출했다.
- Source of truth: `design/frontend/social-profile.md`, `design/frontend/visual-system-rules.md`, `apps/web/src/components/profile/ProfileHeader.tsx`, `apps/web/src/pages/profile/index.tsx`, `apps/web/src/pages/profile/[id]/index.tsx`, `apps/web/src/pages/feed/index.tsx`
- Design divergence: 없음.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` 통과.
- Review routing: user-facing web 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`를 적용했다.

## 리뷰 포인트

- Specialist reviewer should check: 모바일 프로필/피드의 거터와 헤더 레이아웃이 카드 없는 기본 규칙과 일치하는지 확인한다.
- PO reviewer should check: 결과가 인스타그램처럼 콘텐츠 중심의 꽉 찬 모바일 소셜 표면에 가까워졌는지 확인한다.

## 핸드오프

- 모바일 edge alignment를 위해 특정 페이지에서만 거터를 줄였는지, 앱 전체 셸 규칙을 바꾼 것은 아닌지 기록한다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-04: 모바일 프로필 헤더 카드 UI, 좌우 거터, PB 노출 회귀를 해결하기 위한 후속 태스크로 시드했다.
- 2026-04-04: 프로필 헤더를 카드 없는 평면 아이덴티티 표면으로 바꾸고, 모바일 프로필/피드에서 페이지 거터를 줄여 더 edge-aligned한 레이아웃으로 정렬했다. 헤더에는 5K, 10K, 하프, 풀 PB를 다시 노출했다.

## 리뷰 메모

- Specialist review:
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-080/frontend-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 앱 셸 기본 거터는 유지한 채 페이지 단위로만 edge alignment를 적용했으므로, 다른 소셜 라우트가 같은 패턴을 원하면 별도 정렬이 필요하다.
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-080/ui-ux-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: PB 노출은 다시 복구됐지만, 추후 프로필 헤더에 지역/소개/기록을 더 얹을 때는 다시 카드형 대시보드처럼 돌아가지 않도록 주의가 필요하다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0016-080/po-reviewer.json`
  - decision: `approved`
  - findings: `no findings`
  - residual risks: 모바일 소셜 표면은 개선됐지만, 같은 edge-aligned 원칙을 다른 읽기 화면까지 확장할지 여부는 후속 제품 판단으로 남아 있다.

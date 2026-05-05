---
id: I-0016-030
title: 소비자용 웹 카피와 인증 유도를 새 UX 규칙에 맞게 정렬
parent: I-0016-design-system-and-ux-guardrails
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
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
artifacts:
  - design/frontend/writing-and-copy.md
  - design/frontend/ux-principles.md
---

## 목표

소비자용 웹 화면에 남아 있는 설명 과다, 데모형, 과잉 안내형 카피를 제거하고, 인증 유도 문구를 행동 경계 중심 UX에 맞게 정렬한다.

## 완료 기준

- 대상 라우트의 남은 카피가 문구 규칙을 따른다.
- 인증 유도 문구가 일반적인 서비스 설득이 아니라 행동 맥락 중심의 유틸리티 문구로 읽힌다.

## 메모

- 예상 범위에는 empty state, 인증 모달, 공개/소셜 라우트의 표면적 helper copy가 포함된다.

## 셀프 리뷰

- Scope and intent: 공개/소셜 표면에서 리스트와 섹션이 이미 설명하는 helper copy를 걷어내고, 인증 유도 문구는 기존 action-title 중심 흐름을 유지하는 범위로 제한했다.
- Source of truth: `design/frontend/writing-and-copy.md`, `design/frontend/ux-principles.md`를 같은 changeset에서 보강해 이번 정리 기준을 문서 truth로 남겼다.
- Design divergence: 없음. 다만 메시지 room identity 자체의 정보구조 문제는 이번 task에서 다루지 않고 기존 메시징 후속 범위에 남겼다.
- Verification: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build` passed on 2026-04-04.
- Review routing: `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

## 리뷰 포인트

- Specialist reviewer should check: 공개 크루 상세와 메시지 허브에서 helper copy를 제거한 뒤에도 위계와 affordance가 여전히 명확한지 확인한다.
- PO reviewer should check: 카피가 설득형/데모형 톤에서 벗어나 제품 UI 문구처럼 읽히는지, 그리고 인증 유도 자체가 불필요하게 전면화되지 않았는지 확인한다.

## 핸드오프

- 어떤 라우트가 여전히 설명 문구 없이는 이해되기 어렵다면, 레이아웃만으로 충분하지 않은 이유를 기록한다.

## 설계 divergence

- 메시지 room naming과 room-type IA 자체의 문제는 이번 카피 정리만으로 닫히지 않으며, 별도 메시징 태스크에서 이어진다.

## 시도 로그

- 2026-04-03: `I-0016-010`에서 후속 태스크로 시드했다.
- 2026-04-05: 공개 크루 상세, 메시지 허브, 공개 프로필 empty state에서 리스트/탭이 이미 설명하는 helper copy를 줄이고 문서 규칙을 그 기준으로 보강했다.

## 리뷰 메모

- Specialist review: `frontend-reviewer`와 `ui-ux-reviewer` manual protocol review approved with no findings.
- PO review: `po-reviewer` manual protocol review approved; scope and done criteria are satisfied for closeout.

---
id: I-0014-390
title: 메시지와 검색 허브 표면을 가이드라인에 맞게 정렬
parent: I-0014-ui-bug-board-and-stabilization
scope: web
owner: codex
reviewers:
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on:
  - tasks/archive/I-0014-020-web-messaging-room-identity-and-hub.md
  - tasks/archive/I-0014-060-web-search-discovery-and-shell-entry.md
blocked_by: []
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build
  - pnpm --filter @masters/web exec playwright test e2e/messages.spec.ts e2e/search.spec.ts --project=chromium
artifacts:
  - design/frontend/app-shell-routing.md
  - design/frontend/writing-and-copy.md
  - apps/web/src/pages/messages/index.tsx
  - apps/web/src/pages/messages/[id]/index.tsx
  - apps/web/src/pages/search/index.tsx
  - apps/web/playwright.config.ts
  - apps/web/e2e/messages.spec.ts
  - apps/web/e2e/search.spec.ts
  - tasks/reviews/I-0014-390/frontend-reviewer.json
  - tasks/reviews/I-0014-390/ui-ux-reviewer.json
  - tasks/reviews/I-0014-390/po-reviewer.json
---

## 목표

메시지 허브와 검색 화면의 남은 카드형 셸, 설명형 카피, helper block을 줄이고 현재 consumer UI 가이드라인에 맞는 탐색·커뮤니케이션 표면으로 정렬한다.

## 완료 기준

- `/messages`가 과한 박스 래퍼 없이 검색, 필터, 방 목록 중심으로 읽힌다.
- `/messages/:id`가 같은 톤의 조용한 shell 안에서 room meta, 메시지 흐름, 입력 레일을 보여준다.
- `/search`가 설명용 패널보다 입력과 결과 리스트를 먼저 보여주는 구조로 정리된다.
- 관련 Playwright와 빌드 검증이 통과한다.

## 노트

- 크루 허브, 크루 채팅, 활동 채팅은 이번 태스크 범위에서 제외한다.
- 기능 계약은 유지하고 시각 구조와 카피만 정리한다.
- 관련 UX 문서: `design/frontend/app-shell-routing.md`, `design/frontend/writing-and-copy.md`
- Playwright는 기존 로컬 개발 서버를 재사용하지 않도록 `127.0.0.1:3100` 전용 webServer 설정으로 고정했다.

## 셀프 리뷰

- 범위와 의도: 메시지 허브, 메시지 상세, 검색 화면의 shell/copy 정렬에만 집중했고 크루 허브·크루 채팅·활동 채팅 정리는 섞지 않았다.
- source of truth: app shell과 copy 가드레일을 `design/frontend/app-shell-routing.md`와 `design/frontend/writing-and-copy.md`에 같은 changeset으로 반영했다.
- 설계 divergence: 현재 확인된 divergence는 없다. 검색/메시지 기능 계약은 유지하고 시각 구조만 정리했다.
- 검증: `VITE_API_URL=http://localhost:4000/api/v1 pnpm --filter @masters/web build`와 `pnpm --filter @masters/web exec playwright test e2e/messages.spec.ts e2e/search.spec.ts --project=chromium`를 모두 통과했다.
- 리뷰 라우팅: user-facing UI 변경이므로 `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer` 조합을 유지한다.

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: 메시지와 검색 화면이 카드less, list-first 방향으로 정리되었는지와 기존 탐색/대화 기능이 유지되는지 확인한다.
- PO reviewer가 확인할 내용: 화면이 설명용 도구보다 실제 커뮤니케이션·탐색 허브처럼 느껴지는지 확인한다.

## 핸드오프

- 크루 관련 허브/채팅 정리는 별도 후속 태스크로 다룬다.
- 이번 배치에서 정한 메시지/검색 shell 언어를 이후 크루 배치가 재사용하도록 한다.
- 이 task는 review와 verification이 모두 끝났으므로 archive 상태를 source of truth로 사용한다.

## 설계 divergence

- 현재 없음.

## 시도 로그

- 2026-04-05: 최근 public social follow-up closeout 이후 남은 consumer hub shell 정리 대상으로 메시지와 검색을 분리해 시드했다.
- 2026-04-05: `/messages`, `/messages/:id`, `/search`를 list-first/cardless 톤으로 정리하고 검색 Playwright를 추가했다.
- 2026-04-05: Playwright가 기존 로컬 3000 서버를 재사용하던 drift를 막기 위해 전용 3100 webServer 설정으로 고정했다.

## 리뷰 노트

- Specialist review:
  - frontend-reviewer: approved, no findings. 메시지와 검색 변경이 선언된 scope 안에 머물고 보호 라우팅 및 loading/error/empty state 회귀가 없다고 확인했다. Artifact: `tasks/reviews/I-0014-390/frontend-reviewer.json`
  - ui-ux-reviewer: approved, no findings. 화면이 helper chrome보다 실제 탐색·대화 콘텐츠를 먼저 보여주고 카피 톤도 현재 utility-first 가이드라인에 맞는다고 확인했다. Artifact: `tasks/reviews/I-0014-390/ui-ux-reviewer.json`
- PO review:
  - po-reviewer: approved, no findings. 목표와 완료 기준을 충족했고 크루 범위 제외도 숨기지 않고 문서화했다고 확인했다. Artifact: `tasks/reviews/I-0014-390/po-reviewer.json`

---
id: I-0009-040
title: 채팅 realtime transport를 WebSocket으로 전환한다
parent: I-0009-crew-messaging-ux
scope: api
owner: unassigned
reviewers:
  - backend-reviewer
  - frontend-reviewer
  - ui-ux-reviewer
po_review: required
depends_on: []
blocked_by: []
execution_status: in_progress
review_status: pending
verification_status: pending
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations.gateway.spec.ts src/conversations/conversations.service.spec.ts
  - pnpm --filter @masters/api build
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web exec tsc -b
artifacts:
  - apps/api/src/conversations/conversations.gateway.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/web/src/lib/chat-realtime-context.tsx
  - apps/web/src/pages/messages/[id]/useMessageDetailPage.ts
  - apps/web/src/hooks/useGroupChat.ts
  - apps/web/src/components/layout/Header.tsx
  - design/backend/messaging-realtime.md
  - design/architecture/storage-realtime-data-flow.md
  - docs/domain/dm.md
---

## 목표

모든 chat 경로의 실시간 전달을 WebSocket 기반으로 통일하고, notification만 SSE로 남긴다.

## 완료 기준

- direct, crew, activity chat이 모두 shared WebSocket transport를 사용한다.
- unread/list 갱신과 열린 chat 화면이 같은 socket 연결을 공유한다.
- self-echo로 인한 중복 메시지 반영이 닫힌다.

## 노트

- notification SSE는 유지한다.
- presence, typing, reconnect replay는 이번 범위에 포함하지 않는다.

## 셀프 리뷰

- 범위와 의도:
- source of truth:
- 설계 divergence:
- 검증:
- 리뷰 라우팅:

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: gateway auth, room fan-out, shared socket ownership, 채팅 경로별 업데이트 동작
- PO reviewer가 확인할 내용: 메시지 중복 반영 없이 실시간 대화 경험이 자연스러운지

## 핸드오프

- current active task closeout과 병행되더라도 closeout truth는 이 task가 아니라 기존 active task에 남긴다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-20: follow-up task로 생성. direct/crew/activity chat WebSocket 통합과 notification SSE 분리를 한 배치로 다룬다.

## 리뷰 노트

- Specialist review:
  - reviewer:
  - reviewer protocol:
  - artifact:
  - decision:
  - findings:
  - residual risks:
- PO review:
  - reviewer:
  - reviewer protocol:
  - artifact:
  - decision:
  - findings:
  - residual risks:

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
execution_status: ready_for_archive
review_status: approved
verification_status: passed
closeout_blocker:
verify:
  - pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations.gateway.spec.ts src/conversations/conversations.service.spec.ts
  - pnpm --filter @masters/api build
  - pnpm --filter @masters/web lint
  - pnpm --filter @masters/web exec tsc -b
  - bash scripts/check-active-task-closeout.sh
artifacts:
  - apps/api/src/conversations/conversations.gateway.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/conversations/repositories/conversations.repository.ts
  - apps/web/src/lib/chat-realtime-context.tsx
  - apps/web/src/pages/messages/[id]/useMessageDetailPage.ts
  - apps/web/src/components/layout/Header.tsx
  - design/backend/messaging-realtime.md
  - design/frontend/client-data-state.md
  - design/frontend/crew-experience.md
  - design/architecture/auth-session.md
  - design/architecture/repo-structure.md
  - design/architecture/storage-realtime-data-flow.md
  - design/initiatives/I-0009-crew-messaging-ux.md
  - design/adr/ADR-0004-sse-for-current-realtime-delivery.md
  - design/adr/ADR-0005-websocket-chat-and-sse-notifications.md
  - design/adr/README.md
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

- 범위와 의도: direct, crew, activity chat의 realtime 경로를 shared WebSocket transport로 통일하고, DM leave cut-line까지 같은 배치에서 정리된 현재 repo truth를 task/initiative/ADR 문서에 맞췄다. notification SSE는 유지했고 presence/typing/replay는 넓히지 않았다.
- source of truth: `apps/api/src/conversations/conversations.gateway.ts`, `apps/api/src/conversations/conversations.service.ts`, `apps/api/src/conversations/repositories/conversations.repository.ts`, `apps/web/src/lib/chat-realtime-context.tsx`, `design/backend/messaging-realtime.md`, `design/architecture/storage-realtime-data-flow.md`, `docs/domain/dm.md`, `design/adr/ADR-0005-websocket-chat-and-sse-notifications.md`
- 설계 divergence: `GET /conversations/sse`와 SSE service 코드는 notification-style infrastructure 호환 때문에 repo에 남아 있지만, chat current path로는 더 이상 source of truth가 아니다. multi-instance fan-out도 아직 process-local이다.
- 검증: `pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations.gateway.spec.ts src/conversations/conversations.service.spec.ts`; `pnpm --filter @masters/api build`; `pnpm --filter @masters/web lint`; `pnpm --filter @masters/web exec tsc -b`; `bash scripts/check-active-task-closeout.sh`
- 리뷰 라우팅: `backend-reviewer`, `frontend-reviewer`, `ui-ux-reviewer`, `po-reviewer`

Codex Stop-hook review automation을 쓰려면 위 다섯 항목을 placeholder 없이 채운다.

## 리뷰 초점

- Specialist reviewer가 확인할 내용: gateway auth, room fan-out, shared socket ownership, 채팅 경로별 업데이트 동작
- PO reviewer가 확인할 내용: 메시지 중복 반영 없이 실시간 대화 경험이 자연스러운지

## 핸드오프

- `I-0009-050`에 따로 남아 있던 DM leave cut-line 범위는 이 task와 `20260421093000_add_conversation_participant_left_at` migration에 흡수됐다.
- notification transport를 WebSocket으로까지 넓히려면 별도 follow-up task와 superseding ADR이 필요하다.

## 설계 divergence

- 없음.

## 시도 로그

- 2026-04-20: follow-up task로 생성. direct/crew/activity chat WebSocket 통합과 notification SSE 분리를 한 배치로 다룬다.
- 2026-04-21: `ConversationParticipant.leftAt` migration(`20260421093000_add_conversation_participant_left_at`)을 추가해 DM leave cut-line persistence를 schema에 반영했다.
- 2026-04-22: repo cleanup에서 websocket transport와 DM leave cut-line이 이미 구현/문서화된 상태를 확인하고, outdated active task/initiative/ADR truth를 현재 구현에 맞게 정리했다.
- 2026-04-22: `pnpm --filter @masters/api test -- --runTestsByPath src/conversations/conversations.gateway.spec.ts src/conversations/conversations.service.spec.ts`, `pnpm --filter @masters/api build`, `pnpm --filter @masters/web lint`, `pnpm --filter @masters/web exec tsc -b`, `bash scripts/check-active-task-closeout.sh`를 통과시켜 active closeout 상태를 현재 truth에 맞췄다.
- 2026-04-22: specialist review에서 드러난 unread/read-state drift와 DM route-transition state leak를 `apps/web/src/hooks/useChatWindow.ts`, `apps/web/src/pages/messages/[id]/index.tsx`에서 보완한 뒤 verify 5종을 다시 통과시켰다.

## 리뷰 노트

- Specialist review:
  - reviewer: `backend-reviewer`
  - reviewer protocol: `reviewers/protocols.json`, `.codex/agents/backend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/backend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0009-040/backend-reviewer.json`
  - decision: `approved`
  - findings: 없음
  - residual risks: chat WebSocket fan-out과 notification SSE가 여전히 process-local이라 multi-instance runtime은 follow-up infra가 필요하다.
  - reviewer: `frontend-reviewer`
  - reviewer protocol: `reviewers/protocols.json`, `.codex/agents/frontend-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/frontend-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0009-040/frontend-reviewer.json`
  - decision: `approved`
  - findings: 초기 review에서 hidden pending message를 즉시 read 처리하던 drift와 DM detail route 전환 시 draft/scroll state 누수가 발견됐고, `useChatWindow`/`messages/[id]/index.tsx` 보완 후 재검토에서 close했다.
  - residual risks: reconnect replay는 비범위이므로 일시 disconnect 뒤 state resync는 후속 task가 필요하다.
  - reviewer: `ui-ux-reviewer`
  - reviewer protocol: `reviewers/protocols.json`, `.codex/agents/ui-ux-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/ui-ux-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0009-040/ui-ux-reviewer.json`
  - decision: `approved`
  - findings: 없음
  - residual risks: websocket unread affordance는 code-level로 정렬됐지만 browser E2E가 이번 verify 세트에 포함되지 않아 interaction polish는 follow-up browser check가 있으면 더 안전하다.
- PO review:
  - reviewer: `po-reviewer`
  - reviewer protocol: `reviewers/protocols.json`, `.codex/agents/po-reviewer.toml`, `.agents/skills/review-output-contract/SKILL.md`, `.agents/skills/po-review-checklist/SKILL.md`
  - artifact: `tasks/reviews/I-0009-040/po-reviewer.json`
  - decision: `approved`
  - findings: 없음
  - residual risks: notification은 SSE로 남고 chat은 WebSocket으로 분리된 current contract를 유지하므로, transport 단일화는 별도 product/technical task가 필요하다.

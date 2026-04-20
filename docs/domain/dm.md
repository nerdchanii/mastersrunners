---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - packages/database/prisma/schema.prisma
  - apps/api/src/conversations/conversations.controller.ts
  - apps/api/src/conversations/conversations.service.ts
  - apps/api/src/conversations/conversations.gateway.ts
  - apps/api/src/conversations/repositories/conversations.repository.ts
  - apps/web/src/lib/chat-realtime-context.tsx
---

# 메시지와 대화 (Messaging)

## 정의

현재 메시징 모델은 direct message만 따로 분리하지 않고 `Conversation`, `ConversationParticipant`, `Message`로 통합 관리한다.

## Conversation 타입

| 값         | 의미            |
| ---------- | --------------- |
| `DIRECT`   | 사용자 1:1 대화 |
| `CREW`     | 크루 대화       |
| `ACTIVITY` | 크루 활동 대화  |

## 현재 핵심 모델

### Conversation

- `type`
- `name`
- `crewId`
- `activityId`
- `createdAt`
- `updatedAt`

### ConversationParticipant

- `conversationId`
- `userId`
- `lastReadAt`
- `joinedAt`

### Message

- `conversationId`
- `senderId`
- `content`
- `deletedAt`
- `createdAt`

현재 메시지 삭제 표시는 `isDeleted`가 아니라 `deletedAt` 기반이다.

## 현재 동작

- 프로필에서 direct conversation을 시작할 수 있다.
- 이미 있는 direct conversation이 있으면 재사용하고, 없으면 새로 만든다.
- direct, crew, activity conversation이 같은 목록 모델에 섞여 나온다.
- conversation 참여자가 아니면 조회/전송/읽음 처리할 수 없다.
- 차단 관계면 direct conversation 시작, 조회, 전송이 막힌다.

## unread 처리

- unread 계산은 `lastReadAt` 기준이다.
- conversation 목록에서 각 대화별 unread count를 계산한다.
- 읽음 처리 시 participant의 `lastReadAt`를 갱신한다.

## 메시지 삭제

- 본인이 보낸 메시지만 삭제할 수 있다.
- 삭제는 메시지 hard delete가 아니라 `deletedAt` 기록으로 처리된다.
- 이미 삭제된 메시지는 다시 조작할 수 없다.

## 전달 방식

- direct, crew, activity conversation은 모두 WebSocket 기반 실시간 전달을 사용한다.
- 브라우저는 전역 chat socket 하나를 열고, unread/list 갱신과 열린 대화 화면을 같은 연결에서 처리한다.
- notification은 별도 SSE 채널을 유지한다.

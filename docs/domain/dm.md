# 메시지와 대화 (Messaging)

## 정의

메시징은 `Conversation`, `ConversationParticipant`, `Message`를 중심으로 동작한다. 현재 canonical 모델은 DM 전용이 아니라 direct, crew, activity 대화를 모두 포함한다.

## 핵심 모델

### Conversation

- `type`
  - `DIRECT`
  - `CREW`
  - `ACTIVITY`
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
- `isDeleted`
- `createdAt`
- `updatedAt`

## 현재 동작

- 프로필에서 direct conversation을 시작할 수 있다.
- 크루 전체 채팅과 활동 채팅도 같은 conversation 모델을 쓴다.
- direct message detail은 SSE 기반 실시간 수신을 사용한다.
- 일부 그룹 채팅 흐름은 polling 기반이다.

## 읽음 상태

- 안읽음 계산은 `lastReadAt` 기반이다.
- 헤더와 메시지 화면에서 unread 상태를 별도로 소비한다.

## 현재 제약

- 과거 문서의 “DM은 DIRECT만 가진다” 설명은 더 이상 충분하지 않다.
- direct와 group 대화의 실시간 전달 방식이 아직 완전히 통일되지 않았다.

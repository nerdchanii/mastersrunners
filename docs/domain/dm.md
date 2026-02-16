# DM (Direct Message)

## 정의

1:1 개인 메시지. 유저 프로필에서 대화를 시작하거나, 멘션 클릭으로 진입한다.

## 엔티티 구조

### Conversation (대화방)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| type | enum | DIRECT (1:1). 향후 GROUP 확장 가능 |
| createdAt | datetime | 생성 시각 |
| updatedAt | datetime | 마지막 메시지 시각 |

### ConversationParticipant (대화 참여자)

| 필드 | 타입 | 설명 |
|------|------|------|
| conversationId | UUID | FK → Conversation |
| userId | UUID | FK → User |
| lastReadAt | datetime? | 마지막 읽은 시각 (안읽음 카운트용) |
| joinedAt | datetime | 참여 시각 |

### Message (메시지)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| conversationId | UUID | FK → Conversation |
| senderId | UUID | FK → User |
| content | string | 메시지 내용 (최대 2000자) |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | 전송 시각 |

## 비즈니스 규칙

- **차단 관계**: DM 전송 불가. 기존 대화방은 유지되나 새 메시지 전송 차단
- **비공개 계정**: 팔로워만 DM 가능 (또는 유저 설정으로 제어)
- **대화방 유일성**: 두 유저 간 1:1 대화방은 하나만 존재
- **정렬**: 대화 목록은 마지막 메시지 시각(updatedAt) 기준 내림차순
- **안읽음**: lastReadAt 이후 도착한 메시지 수를 안읽음 카운트로 표시

## 접근 경로

| 경로 | 동작 |
|------|------|
| 프로필 → "메시지" 버튼 | 기존 대화방 있으면 열기, 없으면 생성 |
| 댓글의 @멘션 클릭 (데스크탑) | 해당 유저 DM으로 이동 |
| 댓글의 @멘션 탭 (모바일) | 해당 유저 프로필로 이동 |
| Header 메시지 아이콘 | 대화 목록 페이지 |

## 실시간 알림 (Phase 5)

- Phase 4: 폴링 기반 (주기적 조회)
- Phase 5: WebSocket 도입 시 실시간 메시지 수신 + 타이핑 인디케이터

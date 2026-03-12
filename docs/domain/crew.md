# 크루 (Crew)

## 정의

크루는 러닝 커뮤니티 안의 그룹 단위다. 멤버십, 활동, 출석, 게시판, 게시물, 채팅을 함께 가진다.

## 핵심 모델

### Crew

- `name`
- `description`
- `imageUrl`
- `coverImageUrl`
- `location`
- `region`, `subRegion`
- `creatorId`
- `isPublic`
- `maxMembers`
- `chatConversationId`
- `deletedAt`

### CrewMember

- `crewId`
- `userId`
- `role`
  - `OWNER`
  - `ADMIN`
  - `MEMBER`
- `status`
  - `PENDING`
  - `ACTIVE`
  - `LEFT`

### CrewTag / CrewMemberTag

- 크루 단위 태그를 만들고
- 멤버에 여러 태그를 연결할 수 있다.

### CrewBan

- 추방 상태를 별도 레코드로 유지한다.
- 같은 유저는 같은 크루에서 중복 추방 레코드를 가질 수 없다.

## 활동과 출석

### CrewActivity

- 활동 타입
  - `OFFICIAL`
  - `POP_UP`
- 상태
  - `SCHEDULED`
  - `ACTIVE`
  - `COMPLETED`
  - `CANCELLED`
- 활동은 위치, 일정, 생성자, QR 코드, 활동 채팅방을 가진다.

### CrewAttendance

- 상태
  - `RSVP`
  - `CHECKED_IN`
  - `NO_SHOW`
  - `CANCELLED`
- 체크인 방식
  - `QR`
  - `MANUAL`
  - `ADMIN_MANUAL`

## 크루 콘텐츠

- `CrewBoard`
  - 게시판 단위
- `CrewBoardPost`
  - 게시글 단위
- `Post`
  - `crewId`가 있는 일반 포스트도 크루와 연결될 수 있다.
- `Conversation`
  - `type = CREW` 또는 `type = ACTIVITY`로 그룹 채팅을 표현한다.

## 권한 개요

- OWNER/ADMIN
  - 설정, 멤버 관리, 활동 운영, 태그 관리
- MEMBER
  - 가입 후 활동 참여, 채팅, 일부 활동 생성
- 정확한 화면 권한은 현재 프론트엔드 route와 백엔드 서비스 규칙이 함께 결정한다.

## 현재 제약

- 크루 상세 화면은 멤버·활동·태그·통계·게시판·채팅을 한 route에 모은다.
- 도메인 모델은 풍부하지만 UX와 코드 경계는 여전히 무겁다.

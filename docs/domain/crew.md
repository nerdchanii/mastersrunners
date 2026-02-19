# 크루 (Crew)

## 정의

러닝 동호회/클럽 단위. 멤버 관리, 활동, 출석, 채널(게시판), 그룹 채팅을 지원한다.

## 엔티티 구조

### Crew (크루)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| name | string | 크루 이름 |
| description | string? | 크루 소개 |
| imageUrl | string? | 크루 프로필 이미지 |
| coverImageUrl | string? | 커버 이미지 (Phase 7-06) |
| location | string? | 활동 지역 (Phase 7-06) |
| region | string? | 시/도 — 크루 탐색용 (Phase 7-08) |
| subRegion | string? | 구/군 — 크루 탐색용 (Phase 7-08) |
| isPublic | boolean | 검색/노출 여부 |
| chatConversationId | string? | 크루 전체 채팅방 (Phase 7-04) |
| createdAt | datetime | 생성 시각 |

> `category` 필드는 사용하지 않는다. 카테고리/태그 없이 지역 기반으로만 탐색한다.

### CrewMember (크루 멤버)

| 필드 | 타입 | 설명 |
|------|------|------|
| crewId | UUID | FK → Crew |
| userId | UUID | FK → User |
| role | enum | OWNER / ADMIN / MEMBER |
| status | enum | PENDING / ACTIVE / LEFT |
| joinedAt | datetime | 가입 시각 |

### CrewTag (크루 태그)

멤버에게 태그/호칭을 부여한다. 사실상 소그룹 역할도 겸한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| crewId | UUID | FK → Crew |
| name | string | 태그 이름 (예: "A조", "페이스메이커", "6분대", "화목조") |
| color | string? | 표시 색상 |

### CrewMemberTag (멤버-태그 연결)

| 필드 | 설명 |
|------|------|
| crewMemberId | FK → CrewMember |
| crewTagId | FK → CrewTag |

한 멤버에 여러 태그 부여 가능. 태그 기반으로 활동/채널/출석 필터링 가능.

## 가입 규칙

- **승인제**: 가입 신청 → OWNER/ADMIN 승인
- 승인 전까지 크루 내부 콘텐츠 열람 불가
- 탈퇴는 본인이 언제든 가능

## 역할 & 권한

| 권한 | OWNER | ADMIN | MEMBER |
|------|-------|-------|--------|
| 크루 설정 변경 | O | O | X |
| 멤버 승인/거절 | O | O | X |
| 멤버 추방(Ban) | O | O | X |
| 태그 관리 | O | O | X |
| **공식 모임(OFFICIAL)** 생성 | O | O | X |
| **번개(POP_UP)** 생성 | O | O | O |
| QR 출석 생성 | O | O | X |
| 채널 관리 | O | O | X |
| **크루 프로필 게시물** 작성 | O | X | X |
| 활동 참여 (RSVP) | O | O | O |
| QR 출석 체크 | O | O | O |
| ADMIN 임명/해제 | O | X | X |
| 크루 삭제 | O | X | X |

## 추방 (Ban)

### CrewBan

| 필드 | 타입 | 설명 |
|------|------|------|
| crewId | UUID | FK → Crew |
| userId | UUID | FK → User |
| bannedBy | UUID | FK → User (추방 실행자) |
| reason | string? | 사유 |
| bannedAt | datetime | 추방 시각 |

### 규칙

- 추방된 유저는 **해당 크루 운영진이 해제하기 전까지** 재가입 불가
- 추방 시 크루 멤버십 즉시 삭제
- 추방 해제 = CrewBan 레코드 삭제 (이후 재가입 신청 가능)

## 활동 (CrewActivity)

### 활동 타입

| 타입 | 설명 | 생성 권한 | 관리 권한 |
|------|------|----------|----------|
| **OFFICIAL** (공식 모임) | 공식 크루 모임 | OWNER/ADMIN | OWNER/ADMIN |
| **POP_UP** (번개) | 자발적 모임/모집 | 모든 멤버 | 생성자(호스트) |

### CrewActivity

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| crewId | UUID | FK → Crew |
| title | string | 활동명 (예: "토요 정기런", "한강 번개런") |
| description | string? | 설명 |
| activityType | enum | OFFICIAL / POP_UP |
| status | enum | SCHEDULED / ACTIVE / COMPLETED / CANCELLED |
| activityDate | datetime | 활동 일시 |
| completedAt | datetime? | 종료 시각 |
| workoutTypeId | UUID? | FK → WorkoutType (러닝 타입, optional) |
| location | string? | 장소 |
| latitude | float? | 위도 |
| longitude | float? | 경도 |
| createdBy | UUID | FK → User |
| qrCode | string? | QR 코드 UUID |
| chatConversationId | string? | 활동 채팅방 (Phase 7-04) |

### 활동 상태 전이

```
SCHEDULED (예정)
    ├── 활동 시간 도래 → ACTIVE (진행 중)
    │     └── 운영진/호스트 종료 → COMPLETED (RSVP 잔여자 → NO_SHOW)
    └── 운영진/호스트 취소 → CANCELLED (RSVP 전원 알림)
```

### 활동 관리 권한

| 액션 | OFFICIAL: 운영진 | OFFICIAL: 멤버 | POP_UP: 호스트 | POP_UP: 기타 |
|------|--------------|------------|------------|----------|
| 수정/삭제/취소 | O | X | O | X |
| 활동 종료 | O | X | O | X |
| 대리 체크인 | O | X | O | X |

## 출석 (CrewAttendance)

### 출석 상태

```
(없음) → RSVP (참석 신청)
           ├── 본인 체크인 → CHECKED_IN (method: QR/MANUAL)
           ├── 대리 체크인 → CHECKED_IN (method: ADMIN_MANUAL, checkedBy 기록)
           ├── 본인 취소 → CANCELLED
           └── 활동 종료 시 → NO_SHOW (자동)
```

### CrewAttendance

| 필드 | 타입 | 설명 |
|------|------|------|
| activityId | UUID | FK → CrewActivity |
| userId | UUID | FK → User |
| status | enum | RSVP / CHECKED_IN / NO_SHOW / CANCELLED |
| method | enum? | QR / MANUAL / ADMIN_MANUAL (체크인 시만) |
| rsvpAt | datetime | 참석 신청 시각 |
| checkedAt | datetime? | 체크인 시각 |
| checkedBy | UUID? | 대리 체크인 시 운영진/호스트 ID |

### QR 출석 시스템

1. 운영진/호스트가 활동 생성 시 QR 코드 자동 생성 (UUID)
2. QR 이미지를 화면에 표시 또는 다운로드
3. 멤버가 카메라로 QR 스캔 → 서버에서 qrCode 검증 → 자동 체크인
4. QR 스캔 불가 시 수동 체크인 fallback
5. 운영진/호스트가 대리 체크인도 가능 (만약의 사태 대비)

### 출석 통계 (OFFICIAL/POP_UP 분리)

- **OFFICIAL 출석률**: OFFICIAL 활동 RSVP 대비 CHECKED_IN 비율
- **POP_UP 출석률**: POP_UP 활동 RSVP 대비 CHECKED_IN 비율
- **NO_SHOW 트래킹**: OFFICIAL NO_SHOW / POP_UP NO_SHOW 별도 집계
- **월별 추이**: 멤버별 월간 출석률 변화

## 채널(게시판) 시스템 — Phase 7-05

> CrewAnnouncement 단일 모델 대신, 다중 게시판을 지원하는 채널 시스템.
> 크루 생성 시 기본 공지 채널이 자동 생성된다.

### CrewBoard (게시판)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| crewId | UUID | FK → Crew |
| name | string | 채널 이름 (예: "공지", "자유게시판") |
| type | enum | ANNOUNCEMENT / GENERAL / FREE |
| writePermission | enum | ALL_MEMBERS / ADMIN_ONLY |
| sortOrder | int | 표시 순서 |
| createdAt | datetime | 생성 시각 |

### CrewBoardPost (게시글)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| boardId | UUID | FK → CrewBoard |
| authorId | UUID | FK → User |
| title | string | 제목 |
| content | string | 내용 |
| isPinned | boolean | 고정 여부 |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | 작성 시각 |
| updatedAt | datetime | 수정 시각 |

### CrewBoardPostImage (게시글 이미지)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| postId | UUID | FK → CrewBoardPost |
| url | string | 이미지 URL |
| order | int | 표시 순서 |

### CrewBoardComment (댓글)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| postId | UUID | FK → CrewBoardPost |
| authorId | UUID | FK → User |
| content | string | 내용 |
| parentId | UUID? | FK → CrewBoardComment (대댓글, 2단계) |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | 작성 시각 |

### CrewBoardPostLike (좋아요)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| postId | UUID | FK → CrewBoardPost |
| userId | UUID | FK → User |
| createdAt | datetime | 시각 |

> unique: [postId, userId]

### 채널 규칙

- 크루 생성 시 기본 **공지 채널** 자동 생성 (type: ANNOUNCEMENT, writePermission: ADMIN_ONLY)
- 기본 채널은 삭제 불가
- 새 글 작성 시 → 모든 크루원에게 알림

## 크루 프로필 게시물 — Phase 7-06

- 기존 Post 모델에 `crewId` 추가
- **가시성**: 포스팅 단위로 제어 (기존 Post.visibility 필드 활용)
  - PUBLIC: 누구나
  - FOLLOWERS_ONLY: 크루 멤버만
  - PRIVATE: 비공개
- **OWNER만** 크루 이름으로 게시 가능 (ADMIN 불가)

### 알림 규칙

- **크루 게시물 작성** → 모든 크루원에게 알림
- **크루 게시물 댓글** → 운영진(ADMIN) + 크루장(OWNER)에게 알림

## 그룹 채팅 — Phase 7-04

- **크루 전체 채팅**: 크루 생성 시 자동 생성, 모든 멤버 참여
- **활동별 채팅**: 활동 생성 시 자동 생성, RSVP 멤버 참여
- 기존 Conversation + Message + SSE 패턴 확장

## 크루 탐색 — Phase 7-08

### 지역 기반 탐색

- Crew 모델에 `region`(시/도) / `subRegion`(구/군) 추가
- User 모델에도 동일 필드 추가 (추천 매칭용)
- **카테고리/태그 없음** — 지역만으로 탐색

### UI

- **SVG 한국 지도**: 17개 시/도 인터랙티브 (클릭 → 해당 지역 크루 목록)
- **크루 탭 재구성**: 내 크루 / 크루 찾기 세그먼트
- **추천**: 사용자 지역 + 활동량 기반 정렬

### API

- `GET /crews/explore` — 지역/정렬 필터 크루 목록
- `GET /crews/recommend` — 사용자 기반 추천
- `GET /crews/regions` — 시/도 목록 + 크루 수
- `GET /crews/regions/:region` — 구/군 목록 + 크루 수

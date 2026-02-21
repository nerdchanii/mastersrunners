# 크루 시스템 V2 - 전체 설계 문서

> 작성일: 2026-02-19
> 최종 수정: 2026-02-19 (채널 시스템 + 크루 탐색 + 알림 규칙 반영)
> 상태: 설계 단계 (구현 전)
> 선행 조건: Phase 6 완료 후 진행

---

## 1. 개요

크루 시스템을 러닝 커뮤니티 운영에 필요한 수준으로 고도화한다.

### 현재 상태 (Phase 6 기준)
- Crew CRUD + 멤버 관리 (OWNER/ADMIN/MEMBER) + 승인제 가입
- 활동(Activity) 생성 + 단순 체크인 (QR/MANUAL 메서드만 기록)
- 태그 시스템 (멤버 그룹핑)
- 1:1 DM (Conversation, type: DIRECT)
- 활동 상세 페이지: 기본 정보 + 체크인 버튼 + 참석자 목록
- `isPublic` 필드 존재 (검색/노출 여부)

### 목표 상태
- **활동 2가지 타입**: 공식 모임(OFFICIAL) + 번개(POP_UP), 러닝 타입 선택 가능(optional)
- **출석 3단계**: 참석 신청(RSVP) → 체크인 → 불참(NO_SHOW) 트래킹
- **활동 종료 워크플로우**: 운영진/호스트가 수동으로 활동 종료 → RSVP 잔여자 NO_SHOW 처리
- **운영진/호스트 수동 체크인**: 만약의 사태 대비 대리 체크인
- **QR 카메라 스캔**: 실제 QR 스캔으로 자동 체크인
- **그룹 채팅**: 크루 전체 채팅 + 활동별 채팅
- **채널(게시판) 시스템**: 크루별 다중 게시판 + 글 + 댓글 + 좋아요
- **크루 프로필**: 크루가 게시물을 올리고, 크루 프로필 페이지 제공
- **출석 대시보드**: OFFICIAL/POP_UP 분리된 출석 통계, 멤버별 월별 추이
- **크루 탐색 & 추천**: 지역 기반 크루 탐색, SVG 한국 지도, 추천 알고리즘

---

## 2. 핵심 도메인 개념

### 2-0. 활동 타입 (OFFICIAL vs POP_UP)

> **OFFICIAL**: 크루가 공식적으로 주최하는 모임. 꼭 러닝이 아닐 수 있음 (회식, 총회, 워크숍 등 포함).
> **POP_UP**: 크루원이 자발적/즉흥적으로 만드는 모임. 국제적으로 "pop-up event"로 통용.

| 구분 | 공식 모임 (OFFICIAL) | 번개 (POP_UP) |
|------|---------------------|---------------|
| 생성 권한 | OWNER/ADMIN만 | 크루원 누구나 |
| 관리 권한 | OWNER/ADMIN (운영진) | 생성자 (호스트) |
| RSVP/체크인 관리 | 운영진 | 호스트 |
| 수동 체크인 | 운영진이 대리 가능 | 호스트가 대리 가능 |
| 활동 종료 | 운영진이 종료 | 호스트가 종료 |
| 출석 통계 | OFFICIAL 출석률로 집계 | POP_UP 출석률로 **별도** 집계 |
| NO_SHOW 트래킹 | OFFICIAL NO_SHOW로 집계 | POP_UP NO_SHOW로 **별도** 집계 |
| 러닝 타입 | 선택 가능 (optional) | 선택 가능 (optional) |

### 2-0-1. 러닝 타입 (optional)

활동이 러닝인 경우, 기존 `WorkoutType`을 선택할 수 있다 (선택 사항, 필수 아님).
러닝이 아닌 모임(회식, 총회 등)은 러닝 타입을 지정하지 않는다.

**기존 WorkoutType categories** (13 types, 7 categories):
- LONG_RUN (장거리)
- SPEED (스피드)
- THRESHOLD (역치)
- EASY (이지)
- RACE (대회)
- TRAIL (트레일)
- CROSS_TRAINING (크로스트레이닝)

`CrewActivity.workoutTypeId`로 optional FK 연결.

### 2-1. 활동 상태 머신

```
SCHEDULED (예정)
    │
    ├── 활동 시간 도래 ──→ ACTIVE (진행 중)
    │                         │
    │                         ├── 운영진/호스트가 종료 ──→ COMPLETED (종료)
    │                         │     └── RSVP 잔여자 → NO_SHOW 일괄 전환
    │                         │
    │                         └── (체크인 가능 구간)
    │
    └── 운영진/호스트가 취소 ──→ CANCELLED (취소됨)
```

**상태 전이 규칙**:
- `SCHEDULED → ACTIVE`: 활동 시작 시간 이후 (UI에서 자동 표시 or 운영진 수동)
- `ACTIVE → COMPLETED`: 운영진/호스트가 "활동 종료" 버튼 클릭
  - **이 시점에 RSVP 상태로 남아있는 참석자 → NO_SHOW로 일괄 전환**
- `SCHEDULED → CANCELLED`: 활동 취소 (RSVP 전원 알림)
- 체크인은 `SCHEDULED` 또는 `ACTIVE` 상태에서만 가능
- `COMPLETED` 이후 체크인 불가

### 2-2. 참석(Attendance) 상태 머신

```
(없음) ──→ RSVP (참석 신청)
              │
              ├── 본인 체크인 (QR/MANUAL) ──→ CHECKED_IN
              ├── 운영진/호스트 대리 체크인 ──→ CHECKED_IN (method: ADMIN_MANUAL)
              ├── 본인 취소 ──→ CANCELLED
              └── 활동 종료 시 자동 ──→ NO_SHOW
```

### 2-3. 권한 모델 (활동 관리)

| 액션 | OFFICIAL: OWNER/ADMIN | OFFICIAL: MEMBER | POP_UP: 호스트 | POP_UP: 기타 멤버 |
|------|-------------------|---------------|-------------|---------------|
| 활동 생성 | O | X | O (누구나) | O (누구나) |
| 활동 수정 | O | X | O | X |
| 활동 삭제/취소 | O | X | O | X |
| 활동 종료 | O | X | O | X |
| RSVP 신청 | O | O | O | O |
| 본인 체크인 | O | O | O | O |
| **대리 체크인** | **O** | X | **O** | X |
| 불참 일괄 처리 | O (종료 시 자동) | X | O (종료 시 자동) | X |

---

## 3. 스키마 변경 설계

### 3-A. CrewActivity 확장 (활동 타입 + 상태)

**현재**:
```prisma
model CrewActivity {
  id           String   @id @default(cuid())
  crewId       String
  title        String
  description  String?
  activityDate DateTime
  location     String?
  latitude     Float?
  longitude    Float?
  createdBy    String
  createdAt    DateTime @default(now())
  qrCode       String?  @unique
  attendances  CrewAttendance[]
  @@index([crewId, activityDate])
}
```

**변경 후**:
```prisma
model CrewActivity {
  id           String   @id @default(cuid())
  crewId       String
  crew         Crew     @relation(fields: [crewId], references: [id], onDelete: Cascade)
  title        String
  description  String?
  activityDate DateTime
  location     String?
  latitude     Float?
  longitude    Float?
  createdBy    String

  // NEW: 활동 타입 & 상태
  activityType  String   @default("OFFICIAL")    // OFFICIAL (공식 모임), POP_UP (번개)
  status        String   @default("SCHEDULED")   // SCHEDULED, ACTIVE, COMPLETED, CANCELLED
  completedAt   DateTime?                         // 종료 시각 (status=COMPLETED일 때)

  // NEW: 러닝 타입 (optional — 러닝이 아닌 모임이면 null)
  workoutTypeId String?
  workoutType   WorkoutType? @relation(fields: [workoutTypeId], references: [id], onDelete: SetNull)

  createdAt     DateTime @default(now())
  qrCode        String?  @unique

  attendances  CrewAttendance[]

  @@index([crewId, activityDate])
  @@index([crewId, activityType, status])       // NEW: 타입+상태별 조회
}
```

**마이그레이션**:
- 기존 데이터: `activityType = "OFFICIAL"`, `status = "COMPLETED"` (과거 활동은 종료 처리)
- `activityDate < now()` 인 활동 → `status = "COMPLETED"`, `completedAt = activityDate`
- `activityDate >= now()` 인 활동 → `status = "SCHEDULED"`

---

### 3-B. CrewAttendance 확장 (출석 3단계)

**변경 후**:
```prisma
model CrewAttendance {
  id         String       @id @default(cuid())
  activityId String
  userId     String
  activity   CrewActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user       User         @relation(fields: [userId], references: [id])

  // 3단계 상태
  status     String       @default("RSVP")     // RSVP, CHECKED_IN, NO_SHOW, CANCELLED
  method     String?                            // QR, MANUAL, ADMIN_MANUAL — CHECKED_IN일 때만
  rsvpAt     DateTime     @default(now())       // 참석 신청 시각
  checkedAt  DateTime?                          // 체크인 시각 (null이면 미체크인)
  checkedBy  String?                            // 대리 체크인 시 운영진/호스트 userId

  @@unique([activityId, userId])
  @@index([activityId, status])
}
```

**`method` 값**:
- `QR`: 본인 QR 스캔 체크인
- `MANUAL`: 본인 수동 체크인 (버튼 클릭)
- `ADMIN_MANUAL`: 운영진/호스트 대리 체크인 (checkedBy에 대리인 기록)

**마이그레이션**:
- 기존 데이터: `status = "CHECKED_IN"`, `rsvpAt = checkedAt` (RSVP 없이 바로 체크인했으므로)
- `checkedAt` nullable로 변경
- `method` nullable로 변경
- 새 필드 `rsvpAt`, `checkedBy` 추가 (default/nullable)

---

### 3-C. Conversation 확장 (그룹 채팅)

**변경 후**:
```prisma
model Conversation {
  id         String   @id @default(cuid())
  type       String   @default("DIRECT")  // DIRECT, CREW, ACTIVITY
  name       String?                       // 그룹 채팅방 이름 (DIRECT에선 null)
  crewId     String?                       // CREW/ACTIVITY 타입
  activityId String?                       // ACTIVITY 타입
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  participants ConversationParticipant[]
  messages     Message[]

  @@index([crewId])
  @@index([activityId])
}

// Crew 모델에 추가:
model Crew {
  // ... 기존 필드
  chatConversationId String? @unique     // 크루 전체 채팅방
}

// CrewActivity 모델에 추가:
model CrewActivity {
  // ... 기존 필드
  chatConversationId String? @unique     // 활동별 채팅방
}
```

> Prisma 7에서 조건부 unique 미지원이므로, Crew/CrewActivity에 chatConversationId FK를 두어 1:1 보장.
> 서비스 레이어에서 생성 시 자동 연결.

**그룹 채팅 동작**:
- 크루 생성 시 → 크루 전체 채팅방 자동 생성 (type: "CREW")
- 활동 생성 시 → 활동 채팅방 자동 생성 (type: "ACTIVITY")
- 크루 가입 승인 시 → 크루 채팅방에 participant 추가
- 활동 RSVP 시 → 활동 채팅방에 participant 추가
- RSVP 취소 시 → 활동 채팅방에서 participant 제거
- 크루 탈퇴/추방 시 → 크루 채팅방 + 관련 활동 채팅방에서 participant 제거

---

### 3-D. 채널(게시판) 시스템

> CrewAnnouncement 단일 모델 대신, 다중 게시판을 지원하는 채널 시스템으로 설계.
> 크루 생성 시 기본 공지 채널(ANNOUNCEMENT, ADMIN_ONLY)이 자동 생성된다.

```prisma
model CrewBoard {
  id              String   @id @default(cuid())
  crewId          String
  crew            Crew     @relation(fields: [crewId], references: [id], onDelete: Cascade)
  name            String                               // 채널 이름 (예: "공지", "자유게시판")
  type            String   @default("GENERAL")         // ANNOUNCEMENT, GENERAL, FREE
  writePermission String   @default("ALL_MEMBERS")     // ALL_MEMBERS, ADMIN_ONLY
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())

  posts           CrewBoardPost[]

  @@index([crewId, sortOrder])
}

model CrewBoardPost {
  id        String    @id @default(cuid())
  boardId   String
  board     CrewBoard @relation(fields: [boardId], references: [id], onDelete: Cascade)
  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
  title     String
  content   String
  isPinned  Boolean   @default(false)
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  images    CrewBoardPostImage[]
  comments  CrewBoardComment[]
  likes     CrewBoardPostLike[]

  @@index([boardId, isPinned, createdAt])
}

model CrewBoardPostImage {
  id     String        @id @default(cuid())
  postId String
  post   CrewBoardPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  url    String
  order  Int           @default(0)

  @@index([postId, order])
}

model CrewBoardComment {
  id        String             @id @default(cuid())
  postId    String
  post      CrewBoardPost      @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  author    User               @relation(fields: [authorId], references: [id])
  content   String
  parentId  String?                                    // 대댓글 (2단계까지)
  parent    CrewBoardComment?  @relation("BoardCommentReplies", fields: [parentId], references: [id])
  replies   CrewBoardComment[] @relation("BoardCommentReplies")
  deletedAt DateTime?
  createdAt DateTime           @default(now())

  @@index([postId, createdAt])
}

model CrewBoardPostLike {
  id        String        @id @default(cuid())
  postId    String
  post      CrewBoardPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  createdAt DateTime      @default(now())

  @@unique([postId, userId])
}
```

**서비스 로직**:
- 크루 생성 시 기본 공지 채널 자동 생성 (`type: "ANNOUNCEMENT"`, `writePermission: "ADMIN_ONLY"`)
- 기본 채널은 삭제 불가
- 채널별 글쓰기 권한 검증 (`ADMIN_ONLY` → OWNER/ADMIN만, `ALL_MEMBERS` → 모든 멤버)
- 새 글 작성 시 → 모든 크루원에게 알림 (Notification)

---

### 3-E. Post 확장 (크루 게시물)

```prisma
model Post {
  // ... 기존 필드 (userId, content, visibility, images, etc.)

  crewId    String?                      // NEW: 크루 게시물이면 설정
  crew      Crew?    @relation(fields: [crewId], references: [id], onDelete: SetNull)

  @@index([crewId, createdAt])           // NEW
}
```

**크루 게시물 가시성**:
- 기존 Post의 `visibility` 필드를 그대로 활용 (포스팅 단위 제어)
  - `PUBLIC`: 누구나 볼 수 있음
  - `FOLLOWERS_ONLY`: 크루 멤버만 (크루 맥락에서 followers = 멤버)
  - `PRIVATE`: 비공개
- **작성 시 OWNER만 크루 이름으로 게시 가능**
- 피드에서 "OO 크루" 이름 + 크루 이미지로 표시

---

### 3-F. Crew 모델 확장

```prisma
model Crew {
  // ... 기존 필드 (name, description, imageUrl, isPublic, etc.)

  // 프로필 강화
  coverImageUrl String?                  // 커버 이미지
  location      String?                  // 활동 지역 (예: "서울 한강")

  // 지역 정보 (크루 탐색용)
  region        String?                  // 시/도 (예: "서울특별시")
  subRegion     String?                  // 구/군 (예: "마포구")

  // 채팅
  chatConversationId String? @unique     // 크루 전체 채팅방 ID

  // 관계 추가
  boards        CrewBoard[]
  posts         Post[]

  @@index([region, subRegion])           // NEW: 지역별 탐색
}
```

> `category` 필드는 사용하지 않는다. 카테고리/태그 없이 지역 기반으로만 탐색한다.

---

### 3-G. User 모델 확장 (지역 정보)

```prisma
model User {
  // ... 기존 필드

  // 지역 정보 (크루 추천용)
  region    String?                      // 시/도
  subRegion String?                      // 구/군
}
```

> 온보딩/프로필 설정에서 사용자의 활동 지역을 선택하게 한다.
> 크루 추천 시 사용자의 지역과 크루의 지역을 매칭한다.

---

## 4. API 설계

### 4-A. 활동 API 변경

```
# 활동 생성 (OFFICIAL: admin, POP_UP: 누구나)
POST   /crews/:id/activities
  Body: {
    title, description, activityDate, location, lat, lng,
    activityType: "OFFICIAL" | "POP_UP",
    workoutTypeId?: string          // optional — 러닝 활동이면 워크아웃 타입 선택
  }
  → OFFICIAL: OWNER/ADMIN만 허용
  → POP_UP: 모든 ACTIVE 멤버 허용

# 활동 목록 (타입 필터)
GET    /crews/:id/activities?type=OFFICIAL&status=SCHEDULED
  → 타입/상태 필터링

# 활동 종료 (운영진/호스트)
POST   /crews/:id/activities/:activityId/complete
  → status: COMPLETED, completedAt: now()
  → RSVP 잔여자 일괄 NO_SHOW 전환
  → 권한: OFFICIAL=OWNER/ADMIN, POP_UP=호스트

# 활동 취소
POST   /crews/:id/activities/:activityId/cancel
  → status: CANCELLED
  → RSVP 전원 알림 발송
```

### 4-B. 출석 API

```
# RSVP (참석 신청)
POST   /crews/:id/activities/:activityId/rsvp
  → CrewAttendance { status: "RSVP" }

# RSVP 취소
DELETE /crews/:id/activities/:activityId/rsvp
  → status: "CANCELLED"

# 본인 체크인 (수동)
POST   /crews/:id/activities/:activityId/check-in
  Body: { method: "MANUAL" }
  → 전제: status=RSVP, 활동 status=SCHEDULED|ACTIVE

# QR 체크인 (카메라 스캔)
POST   /crews/:id/activities/:activityId/qr-check-in
  Body: { qrCode: string }
  → qrCode 매칭 검증 후 체크인

# 대리 체크인 (운영진/호스트)
POST   /crews/:id/activities/:activityId/admin-check-in
  Body: { userId: string }
  → 권한: OFFICIAL=OWNER/ADMIN, POP_UP=호스트
  → method: "ADMIN_MANUAL", checkedBy: 요청자

# 참석자 목록 (상태별 필터)
GET    /crews/:id/activities/:activityId/attendees?status=RSVP,CHECKED_IN
```

### 4-C. 출석 통계 API

```
# 멤버 출석 통계
GET    /crews/:id/members/:userId/attendance-stats
  → {
      official: { total, rsvp, checkedIn, noShow, rate },
      popUp: { total, rsvp, checkedIn, noShow, rate },
      monthly: { month, officialRate, popUpRate }[]
    }

# 크루 전체 출석 통계
GET    /crews/:id/attendance-stats?month=2026-02&type=OFFICIAL
  → { activities: [...], memberStats: [...], overallRate }
```

### 4-D. 그룹 채팅 API

```
# 크루 채팅방 조회
GET    /crews/:id/chat
  → Conversation + messages (cursor pagination)

# 활동 채팅방 조회
GET    /crews/:id/activities/:activityId/chat
  → Conversation + messages (cursor pagination)

# 메시지 전송 (기존 패턴 재사용)
POST   /conversations/:conversationId/messages
  Body: { content: string }

# SSE 연결 (기존 패턴)
GET    /conversations/:conversationId/sse
```

### 4-E. 채널(게시판) API

```
# 게시판 CRUD (admin)
POST   /crews/:id/boards                     # 채널 생성 (admin)
GET    /crews/:id/boards                      # 채널 목록
PATCH  /crews/:id/boards/:boardId             # 채널 수정 (admin)
DELETE /crews/:id/boards/:boardId             # 채널 삭제 (admin, 기본 채널 불가)

# 게시글 CRUD
POST   /crews/:id/boards/:boardId/posts       # 글 작성 (writePermission에 따라)
GET    /crews/:id/boards/:boardId/posts        # 글 목록 (cursor pagination)
GET    /crews/:id/boards/:boardId/posts/:postId # 글 상세
PATCH  /crews/:id/boards/:boardId/posts/:postId # 글 수정 (작성자/admin)
DELETE /crews/:id/boards/:boardId/posts/:postId # 글 삭제 (작성자/admin)

# 고정
PATCH  /crews/:id/boards/:boardId/posts/:postId/pin  # 글 고정/해제 (admin)

# 댓글
POST   /crews/:id/boards/:boardId/posts/:postId/comments   # 댓글 작성
DELETE /crews/:id/boards/:boardId/posts/:postId/comments/:commentId  # 댓글 삭제

# 좋아요
POST   /crews/:id/boards/:boardId/posts/:postId/like    # 좋아요
DELETE /crews/:id/boards/:boardId/posts/:postId/like    # 좋아요 취소
```

### 4-F. 크루 게시물 + 프로필 API

```
# 크루 이름으로 게시물 작성 (OWNER만)
POST   /crews/:id/posts
  Body: { content, visibility, images, workoutIds }
  → 권한: OWNER만 (ADMIN 불가)

# 크루 게시물 목록
GET    /crews/:id/posts?cursor=...

# 크루 프로필 (통합 정보)
GET    /crews/:id/profile
  → { crew, stats, recentPosts, upcomingActivities, pinnedBoardPosts }
```

**알림 규칙 (크루 프로필 게시물)**:
- **크루 게시물 작성** → 모든 크루원에게 알림
- **크루 게시물 댓글** → 운영진(ADMIN) + 크루장(OWNER)에게 알림

### 4-G. 크루 탐색 API

```
# 크루 탐색 (지역/정렬)
GET    /crews/explore?region=서울특별시&subRegion=마포구&sort=activity
  → 공개(isPublic=true) 크루 목록
  → sort: activity (최근 활동순), members (멤버 수), created (생성순)
  → cursor pagination

# 크루 추천 (사용자 지역 + 활동량 기반)
GET    /crews/recommend
  → 사용자의 region/subRegion 매칭 + 최근 활동이 활발한 크루 우선

# 시/도 목록 + 크루 수
GET    /crews/regions
  → [{ region: "서울특별시", crewCount: 15 }, ...]

# 구/군 목록 + 크루 수
GET    /crews/regions/:region
  → [{ subRegion: "마포구", crewCount: 3 }, ...]
```

---

## 5. 프론트엔드 설계

### 5-A. 활동 상세 페이지

**경로**: `/crews/:id/activities/:activityId`

**섹션 구성**:
1. 헤더 (제목 + 타입 뱃지[OFFICIAL/POP_UP] + 날짜 + 장소 + 상태 + Admin/호스트 메뉴)
2. 지도 (Leaflet 마커, lat/lng 있을 때)
3. QR 코드 (Admin/호스트: QR 이미지 / Member: QR 스캐너 버튼)
4. 참석 섹션:
   - RSVP 안 했으면: "참석 신청" 버튼
   - RSVP 했으면: "체크인" 버튼 (수동/QR)
   - 체크인 완료: 완료 표시
   - 활동 종료(COMPLETED): 체크인 불가, 결과만 표시
5. 참석자 명단 (RSVP/체크인/불참 상태별 뱃지 + 통계 바)
6. Admin/호스트 전용: 대리 체크인 버튼 (참석자 옆), 활동 종료 버튼
7. 활동 채팅방 링크
8. 메타 정보

### 5-B. 크루 상세 페이지 (탭 재구성)

**경로**: `/crews/:id`

**탭**:
1. **홈** — 고정 글(채널) + 최근 크루 게시물 + 다가오는 활동
2. **게시물** — 크루 게시물 피드
3. **활동** — OFFICIAL/POP_UP 탭 필터, RSVP 현황 표시
4. **채널** — 크루 게시판 목록 (공지, 자유게시판 등)
5. **멤버** — (기존)
6. **통계** — 출석 대시보드 (OFFICIAL/POP_UP 분리)
7. **채팅** — 크루 전체 채팅방
8. **설정** — (기존, admin)

### 5-C. 출석 대시보드

**위치**: 크루 상세 > 통계 탭

**표시 항목**:
- 토글: OFFICIAL / POP_UP / 전체
- 크루 전체 출석률 (이번 달)
- 멤버별 출석 카드:
  - 가입 이후 총 활동 수 / 참석 수 / 출석률
  - 이번 달 참석 / 불참 / 신청 후 불참(NO_SHOW) 수
  - 연속 출석 기록
- 월별 추이 차트

### 5-D. 크루 탐색

**위치**: 크루 탭 재구성 (내 크루 / 크루 찾기 세그먼트)

**크루 찾기 UI**:
1. **SVG 한국 지도 컴포넌트** — 17개 시/도 인터랙티브
   - 각 시/도 영역 클릭 가능
   - 크루 수에 따라 색상 농도 표시 (히트맵)
   - 선택 시 해당 지역 크루 목록 표시
2. **구/군 드롭다운** — 시/도 선택 후 세부 지역 필터
3. **크루 카드 리스트** — 이름, 멤버 수, 최근 활동, 지역 표시
4. **추천 섹션** — 사용자 지역 기반 추천 크루

**추가 UI 변경**:
- 크루 생성 폼에 지역(region/subRegion) 선택 추가
- 온보딩/프로필 설정에 사용자 지역 선택 추가

---

## 6. Phase 할당

### Phase 7-01: 활동 상세 페이지 완성 ⚡독립

**범위**: 현재 활동 상세 페이지를 프로덕션 수준으로 완성 (현재 스키마 기준)

**작업**:
- [ ] Admin 편집/삭제 UI (DropdownMenu + Dialog + ConfirmDialog)
- [ ] QR 코드 이미지 표시 (`qrcode.react`, admin 전용)
- [ ] Leaflet 지도 표시 (OpenStreetMap, Marker + icon fix)
- [ ] 생성자 정보 표시 (crew members에서 매칭)
- [ ] TanStack Query 마이그레이션 (useState → hooks)
- [ ] 참석자 통계 바 (총원, 체크인 방법별 카운트)
- [ ] 과거 활동 체크인 비활성화
- [ ] 모바일 반응형 정리

**의존성**: 없음
**규모**: S (프론트엔드 전용)

**핵심 파일**:
- `apps/web/src/pages/crews/[id]/activities/[activityId]/index.tsx`
- `apps/web/src/hooks/useCrews.ts`

---

### Phase 7-02: 활동 타입 + 출석 3단계 시스템 ⏳7-01 이후

**범위**: OFFICIAL/POP_UP 분리 + RSVP → 체크인 → 불참 플로우

**스키마 변경**:
```prisma
// CrewActivity 추가 필드
activityType  String   @default("OFFICIAL")  // OFFICIAL, POP_UP
status        String   @default("SCHEDULED") // SCHEDULED, ACTIVE, COMPLETED, CANCELLED
completedAt   DateTime?
workoutTypeId String?  // optional FK → WorkoutType

// CrewAttendance 추가 필드
status    String    @default("RSVP")  // RSVP, CHECKED_IN, NO_SHOW, CANCELLED
method    String?                      // QR, MANUAL, ADMIN_MANUAL
rsvpAt    DateTime  @default(now())
checkedAt DateTime?
checkedBy String?                      // 대리 체크인 시
```

**API**:
- POST /crews/:id/activities (타입별 권한 분기)
- POST /crews/:id/activities/:activityId/complete (종료 → NO_SHOW 일괄)
- POST /crews/:id/activities/:activityId/cancel
- POST /crews/:id/activities/:activityId/rsvp
- DELETE /crews/:id/activities/:activityId/rsvp
- POST /crews/:id/activities/:activityId/check-in
- POST /crews/:id/activities/:activityId/admin-check-in
- GET /crews/:id/activities/:activityId/attendees?status=

**프론트엔드**:
- 활동 생성 폼에 타입 선택 (POP_UP는 모든 멤버 가능)
- 활동 목록 타입/상태 필터
- 활동 상세 RSVP/체크인 UI 리팩터링
- 활동 종료 버튼 (admin/host)

**TDD**: 상태 전이 + 권한 로직

**의존성**: Phase 7-01
**규모**: L (스키마 + API + 프론트 전면 수정)

**핵심 파일**:
- `packages/database/prisma/schema.prisma`
- `apps/api/src/crews/` (service, repository, controller, DTOs)
- `apps/web/src/pages/crews/[id]/activities/`
- `apps/web/src/components/crew/CrewActivityForm.tsx`

---

### Phase 7-03: QR 카메라 스캔 + 자동 체크인 ⏳7-02 이후

**범위**: QR 스캔으로 자동 체크인

**작업**:
- [ ] **프론트엔드**: `html5-qrcode` 추가
- [ ] **QR 스캐너 컴포넌트**: 카메라 → QR 인식 → API 호출
- [ ] **API**: `qr-check-in` 엔드포인트 (qrCode 매칭 검증)
- [ ] **UX**: 카메라 권한, 성공/실패 피드백, fallback 수동 체크인
- [ ] **Admin/호스트**: QR 이미지 다운로드/공유

**의존성**: Phase 7-02
**규모**: S

**핵심 파일**:
- `apps/web/src/components/crew/QrScanner.tsx` (신규)
- `apps/api/src/crews/crews.controller.ts`
- `apps/api/src/crews/crews.service.ts`

---

### Phase 7-04: 그룹 채팅 시스템 ⚡독립

**범위**: 크루 전체 채팅 + 활동별 채팅

**스키마 변경**:
```prisma
// Conversation 확장
type       String  @default("DIRECT")  // DIRECT, CREW, ACTIVITY
name       String?
crewId     String?
activityId String?

// Crew + CrewActivity에 chatConversationId 추가
```

**API**:
- GET /crews/:id/chat (크루 채팅방)
- GET /crews/:id/activities/:activityId/chat (활동 채팅방)
- 메시지 전송/SSE는 기존 패턴 재사용

**서비스 로직**:
- 크루 생성 시 채팅방 자동 생성
- 활동 생성 시 채팅방 자동 생성
- 가입 승인/탈퇴/RSVP 시 participant 동기화

**의존성**: 없음 (독립)
**규모**: L

**핵심 파일**:
- `packages/database/prisma/schema.prisma`
- `apps/api/src/conversations/`
- `apps/api/src/crews/crews.service.ts`
- `apps/web/src/pages/crews/[id]/chat/` (신규)

---

### Phase 7-05: 채널(게시판) 시스템 ⚡독립

**범위**: 다중 게시판 + 글 + 댓글 + 좋아요

**신규 모델 5개**:
- `CrewBoard` (게시판 정의 — type, writePermission, sortOrder)
- `CrewBoardPost` (글 — title, content, isPinned, deletedAt)
- `CrewBoardPostImage` (이미지 — url, order)
- `CrewBoardComment` (댓글/대댓글 — parentId, 2단계)
- `CrewBoardPostLike` (좋아요 — unique[postId, userId])

**API 14개**:
```
Board:   POST/GET/PATCH/DELETE /crews/:id/boards (4)
Post:    POST/GET/GET:id/PATCH/DELETE /crews/:id/boards/:boardId/posts (5)
Pin:     PATCH /crews/:id/boards/:boardId/posts/:postId/pin (1)
Comment: POST/DELETE (2)
Like:    POST/DELETE (2)
```

**서비스 로직**:
- 크루 생성 시 기본 공지 채널 자동 생성 (type: ANNOUNCEMENT, ADMIN_ONLY)
- 채널별 글쓰기 권한 검증
- 기본 채널 삭제 불가
- 새 글 → 모든 크루원 알림

**프론트엔드**:
- 크루 상세 내 채널 목록/탭
- 글 목록 (cursor pagination)
- 글 상세 + 댓글
- 채널 관리 UI (admin)

**의존성**: 없음 (독립)
**규모**: L

**핵심 파일**:
- `packages/database/prisma/schema.prisma`
- `apps/api/src/crew-boards/` (신규 모듈)
- `apps/web/src/pages/crews/[id]/boards/` (신규)

---

### Phase 7-06: 크루 프로필 + 게시물 ⏳7-05 이후

**범위**: 크루 이름으로 게시물 + 프로필 페이지

**스키마 변경**:
```prisma
// Post.crewId 추가
crewId String?

// Crew 프로필 강화
coverImageUrl String?
location      String?
```

**API**:
- POST /crews/:id/posts (OWNER만)
- GET /crews/:id/posts
- GET /crews/:id/profile (통합 정보)

**알림 규칙**:
- 크루 게시물 작성 → 모든 크루원 알림
- 크루 게시물 댓글 → 운영진(ADMIN) + 크루장(OWNER) 알림

**프론트엔드**:
- 크루 상세 탭 재구성 (홈/게시물/활동/채널/멤버/통계/채팅/설정)
- 크루 프로필 페이지
- 피드에서 크루 게시물 표시 (크루 아이콘 + 이름)

**의존성**: Phase 7-05 (채널이 홈 탭에 표시됨)
**규모**: L

**핵심 파일**:
- `packages/database/prisma/schema.prisma`
- `apps/api/src/crews/` 또는 `apps/api/src/posts/`
- `apps/web/src/pages/crews/[id]/`

---

### Phase 7-07: 출석 대시보드 ⏳7-02 이후

**범위**: OFFICIAL/POP_UP 분리된 출석 통계

**API**:
- GET /crews/:id/members/:userId/attendance-stats
- GET /crews/:id/attendance-stats?month=&type=

**표시 항목**:
- OFFICIAL/POP_UP 토글
- 크루 전체 출석률
- 멤버별: 총 활동/참석/출석률/NO_SHOW/연속출석
- 월별 추이 차트

**프론트엔드**:
- 크루 상세 > 통계 탭
- 차트 라이브러리 (recharts 또는 chart.js)

**의존성**: Phase 7-02 (출석 3단계 데이터 필요)
**규모**: M

**핵심 파일**:
- `apps/api/src/crews/` (통계 API)
- `apps/web/src/pages/crews/[id]/stats/` (신규)

---

### Phase 7-08: 크루 탐색 & 추천 ⚡독립

**범위**: 지역 기반 크루 탐색

**스키마 변경**:
```prisma
// Crew
region    String?   // 시/도
subRegion String?   // 구/군

// User
region    String?
subRegion String?
```

**API**:
- GET /crews/explore?region=&subRegion=&sort=activity
- GET /crews/recommend (사용자 지역 + 활동량)
- GET /crews/regions (시/도 목록 + 크루 수)
- GET /crews/regions/:region (구/군 목록 + 크루 수)

**프론트엔드**:
- SVG 한국 지도 컴포넌트 (17개 시/도 인터랙티브)
- 시/도 클릭 → 구/군 드롭다운
- 크루 탭 재구성 (내 크루 / 크루 찾기 세그먼트)
- 크루 생성 폼에 지역 선택 추가
- 온보딩/프로필에 사용자 지역 설정

**데이터**:
- 한국 17개 시/도 + 구/군 데이터 (JSON or DB seed)
- 카테고리/태그 없음

**의존성**: 없음 (독립)
**규모**: M

**핵심 파일**:
- `packages/database/prisma/schema.prisma`
- `apps/api/src/crews/` (탐색 API)
- `apps/web/src/components/crew/KoreaMap.tsx` (신규 SVG)
- `apps/web/src/pages/crews/index.tsx` (탭 재구성)

---

## 7. Phase 의존성 그래프

```
[즉시 시작 가능 — 독립]
  Phase 7-04 (그룹 채팅)
  Phase 7-05 (채널 시스템)
  Phase 7-08 (크루 탐색 & 추천)
  Phase 7-01 (활동 상세 페이지)

[의존성 체인]
  Phase 7-01 (활동 상세)
      │
      └──→ Phase 7-02 (활동 타입 + 출석 3단계)
                │
                ├──→ Phase 7-03 (QR 카메라 스캔)
                │
                └──→ Phase 7-07 (출석 대시보드)

  Phase 7-05 (채널 시스템)
      │
      └──→ Phase 7-06 (크루 프로필 + 게시물)
```

**병렬 실행 그룹**:
1. **즉시 시작** (4세션 병렬): 7-01, 7-04, 7-05, 7-08
2. **7-01 완료 후**: 7-02
3. **7-02 완료 후**: 7-03, 7-07 (병렬)
4. **7-05 완료 후**: 7-06

---

## 8. 기술 결정 사항

### QR 코드
- **표시**: `qrcode.react` (~8KB gzipped)
- **스캔**: `html5-qrcode` (~40KB gzipped) — Phase 7-03
- **검증**: 서버에서 `activity.qrCode` 필드 매칭
- **QR 데이터**: `{origin}/crews/{crewId}/activities/{activityId}/qr-check-in?code={qrCode}`

### 지도
- **Leaflet + OpenStreetMap** (무료, react-leaflet 이미 설치됨)
- `RouteMap.tsx`는 Polyline 전용 — Marker는 별도 구현 + Vite icon fix 필요

### 채팅
- 기존 `Conversation` + `Message` + SSE 패턴 확장
- `chatConversationId` FK로 1:1 보장 (Prisma 조건부 unique 미지원 우회)

### 채널 시스템
- 별도 모듈 `crew-boards/`로 분리 (크루 모듈 비대화 방지)
- CrewBoard type: `ANNOUNCEMENT` (공지), `GENERAL` (일반), `FREE` (자유)
- 기본 공지 채널 자동 생성, 삭제 불가

### 크루 탐색
- SVG 한국 지도: 17개 시/도 Path 데이터 (정적 파일)
- 카테고리/태그 없이 지역만으로 탐색
- 추천 알고리즘: 같은 지역 + 최근 활동량(30일 내 활동 수) 기반 정렬

### 차트
- Phase 7-07에서 결정
- 후보: `recharts` (React 친화, 선언적), `chart.js` + `react-chartjs-2`

---

## 9. 리스크 및 고려사항

| 리스크 | 영향 | 대응 |
|--------|------|------|
| CrewAttendance 마이그레이션 데이터 변환 | 높음 | 기존 → CHECKED_IN, rsvpAt=checkedAt |
| Conversation 확장이 DM에 영향 | 높음 | nullable 필드만 추가, DIRECT 타입 동작 불변 |
| 번개(POP_UP) 호스트 권한 vs 운영진 권한 겹침 | 중간 | 서비스 레이어에서 activityType 기반 분기 |
| html5-qrcode 모바일 카메라 권한 | 중간 | HTTPS 필수, 수동 체크인 fallback |
| Leaflet Marker + Vite 번들링 | 중간 | 명시적 icon import |
| 활동 종료 시 NO_SHOW 일괄 처리 성능 | 낮음 | 활동당 참석자 수 제한적, 단순 UPDATE |
| 크루 게시물 + 개인 게시물 피드 혼합 | 중간 | 피드 쿼리 인덱스 추가, UI 구분 표시 |
| 채널 시스템 5개 모델 복잡도 | 중간 | 별도 모듈 분리, 기존 패턴(PostComment/PostLike) 재활용 |
| SVG 지도 컴포넌트 크기 | 낮음 | 정적 SVG + lazy loading |

---

## 10. 결정 완료 사항 (이전 보류 → 확정)

| 항목 | 결정 |
|------|------|
| 크루 게시물 가시성 | **포스팅 단위 제어** (기존 Post.visibility 필드 활용) |
| 활동 NO_SHOW 처리 | **운영진/호스트가 수동으로 활동 종료 → RSVP 잔여자 일괄 NO_SHOW** (cron 아님) |
| 운영진 수동 체크인 | **대리 체크인 가능** (method: ADMIN_MANUAL, checkedBy 기록) |
| 활동 타입 | **공식 모임(OFFICIAL) / 번개(POP_UP)** 2가지, 통계 분리 |
| 번개(POP_UP) 권한 | **호스트(생성자)가 운영진과 동일한 활동 관리 권한** |
| 비공개 크루 | **isPublic 필드 이미 존재** (검색/노출 여부 제어) |
| 공지 → 채널 | **다중 게시판(채널) 시스템** 채택, 기본 공지 채널 자동 생성 |
| 크루 프로필 게시물 권한 | **OWNER만** 크루 이름으로 게시 가능 (ADMIN 불가) |
| 크루 프로필 알림 | 게시물 → 전원 알림, 댓글 → 운영진+크루장 알림 |
| 크루 탐색 | **지역(region/subRegion) 기반**, 카테고리/태그 없음 |
| SVG 지도 | **17개 시/도 인터랙티브 SVG** 컴포넌트 |

---

## 11. 요약

| Phase | 작업 | 의존성 | 규모 |
|-------|------|--------|------|
| 7-01 | 활동 상세 페이지 완성 | 없음 | S |
| 7-02 | 활동 타입 + 출석 3단계 | 7-01 | L |
| 7-03 | QR 카메라 스캔 | 7-02 | S |
| 7-04 | 그룹 채팅 | 없음 | L |
| 7-05 | 채널(게시판) 시스템 | 없음 | L |
| 7-06 | 크루 프로필 + 게시물 | 7-05 | L |
| 7-07 | 출석 대시보드 | 7-02 | M |
| 7-08 | 크루 탐색 & 추천 | 없음 | M |

Phase 7은 크루 시스템을 **실제 러닝 크루 운영 도구** 수준으로 끌어올리는 것을 목표로 한다.
OFFICIAL과 POP_UP를 명확히 분리하고, 참석 신청 → 체크인 → 불참의 완전한 생애주기를 관리하며,
채널 시스템/그룹 채팅/게시물로 커뮤니티 기능을 강화하고, 지역 기반 크루 탐색으로 발견성을 높인다.

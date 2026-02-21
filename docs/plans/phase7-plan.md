# Phase 7: 크루 시스템 고도화

> Phase 6 기준: OAuth 완료, 다크 모드/계정삭제/해시태그 완료
> 설계 문서: [crew-system-v2-design.md](./crew-system-v2-design.md)
> 상태: ✅ 전체 완료 (2026-02-21)

---

## Context

크루 시스템을 **실제 러닝 크루 운영 도구** 수준으로 고도화한다.
OFFICIAL과 POP_UP을 명확히 분리하고, 참석 신청 → 체크인 → 불참의 완전한 생애주기를 관리하며,
채널 시스템/그룹 채팅/게시물로 커뮤니티 기능을 강화하고, 지역 기반 크루 탐색으로 발견성을 높인다.

---

## Phase 의존성 그래프

```
[즉시 시작 — 독립]
  7-01 (활동 상세 페이지)
  7-04 (그룹 채팅)
  7-05 (채널 시스템)
  7-08 (크루 탐색 & 추천)

[의존성 체인]
  7-01 → 7-02 (활동 타입 + 출석 3단계)
              → 7-03 (QR 카메라 스캔)
              → 7-07 (출석 대시보드)

  7-05 → 7-06 (크루 프로필 + 게시물)
```

---

## 7-01: 활동 상세 페이지 완성 ✅

> 커밋: `38ed171` feat(web): Phase 7-01 활동 상세 페이지 완성

- [x] Admin 편집/삭제 UI (DropdownMenu + Dialog + ConfirmDialog)
- [x] QR 코드 이미지 표시 (`qrcode.react`, admin 전용)
- [x] Leaflet 지도 표시 (OpenStreetMap, Marker + icon fix)
- [x] 생성자 정보 표시 (crew members에서 매칭)
- [x] TanStack Query 마이그레이션 (useState → hooks)
- [x] 참석자 통계 바 (총원, 체크인 방법별 카운트)
- [x] 과거 활동 체크인 비활성화
- [x] 모바일 반응형 정리

규모: S | 의존성: 없음

---

## 7-02: 활동 타입 + 출석 3단계 시스템 ✅

> 커밋: `476cdea` feat: Phase 7-02 활동 타입 + 출석 3단계 시스템

**스키마 변경**:
- [x] CrewActivity: activityType (OFFICIAL/POP_UP), status (SCHEDULED/ACTIVE/COMPLETED/CANCELLED), completedAt, workoutTypeId
- [x] CrewAttendance: status (RSVP/CHECKED_IN/NO_SHOW/CANCELLED), method, rsvpAt, checkedAt, checkedBy

**API**:
- [x] POST /crews/:id/activities (타입별 권한 분기)
- [x] POST /crews/:id/activities/:activityId/complete (종료 → NO_SHOW 일괄)
- [x] POST /crews/:id/activities/:activityId/cancel
- [x] POST /crews/:id/activities/:activityId/rsvp + DELETE
- [x] POST /crews/:id/activities/:activityId/check-in
- [x] POST /crews/:id/activities/:activityId/admin-check-in
- [x] GET /crews/:id/activities/:activityId/attendees?status=

**프론트엔드**:
- [x] 활동 생성 폼에 타입 선택 (POP_UP는 모든 멤버 가능)
- [x] 활동 목록 타입/상태 필터
- [x] 활동 상세 RSVP/체크인 UI 리팩터링
- [x] 활동 종료 버튼 (admin/host)

규모: L | 의존성: 7-01

---

## 7-03: QR 카메라 스캔 + 자동 체크인 ✅

> 커밋: `7a1b966` feat: Phase 7-03 QR 카메라 스캔 + 자동 체크인

- [x] `html5-qrcode` 추가
- [x] QR 스캐너 컴포넌트 (카메라 → QR 인식 → API 호출)
- [x] API: `qr-check-in` 엔드포인트 (qrCode 매칭 검증)
- [x] UX: 카메라 권한, 성공/실패 피드백, fallback 수동 체크인
- [x] Admin/호스트: QR 이미지 다운로드/공유

규모: S | 의존성: 7-02

---

## 7-04: 그룹 채팅 시스템 ✅

> 커밋: `a016a36` feat: Phase 7-04 그룹 채팅 시스템 (크루 + 활동)

**스키마 변경**:
- [x] Conversation: type (DIRECT/CREW/ACTIVITY), name, crewId, activityId
- [x] Crew/CrewActivity: chatConversationId FK 추가

**서비스 로직**:
- [x] 크루 생성 시 채팅방 자동 생성
- [x] 활동 생성 시 채팅방 자동 생성
- [x] 가입 승인/탈퇴/RSVP 시 participant 동기화

**API**:
- [x] GET /crews/:id/chat (크루 채팅방)
- [x] GET /crews/:id/activities/:activityId/chat (활동 채팅방)
- [x] 메시지 전송/SSE 기존 패턴 재사용

규모: L | 의존성: 없음

---

## 7-05: 채널(게시판) 시스템 ✅

> 커밋: `46bed50` feat: Phase 7-05 채널(게시판) 시스템

**신규 모델 5개**:
- [x] CrewBoard, CrewBoardPost, CrewBoardPostImage, CrewBoardComment, CrewBoardPostLike

**API 14개**:
- [x] Board CRUD (4): POST/GET/PATCH/DELETE /crews/:id/boards
- [x] Post CRUD (5): POST/GET/GET:id/PATCH/DELETE /crews/:id/boards/:boardId/posts
- [x] Pin (1): PATCH .../pin
- [x] Comment (2): POST/DELETE
- [x] Like (2): POST/DELETE

**서비스 로직**:
- [x] 크루 생성 시 기본 공지 채널 자동 생성 (ANNOUNCEMENT, ADMIN_ONLY)
- [x] 채널별 글쓰기 권한 검증
- [x] 기본 채널 삭제 불가

규모: L | 의존성: 없음

---

## 7-06: 크루 프로필 + 게시물 ✅

> 커밋: `01c4f13` feat: Phase 7-06/08 크루 프로필+게시물 + 크루 탐색&추천

**스키마 변경**:
- [x] Post.crewId 추가
- [x] Crew: coverImageUrl, location 추가

**API**:
- [x] POST /crews/:id/posts (OWNER만)
- [x] GET /crews/:id/posts
- [x] GET /crews/:id/profile (통합 정보)

**프론트엔드**:
- [x] 크루 상세 탭 재구성 (홈/게시물/활동/채널/멤버/통계/채팅/설정)
- [x] 크루 프로필 페이지
- [x] 피드에서 크루 게시물 표시 (크루 아이콘 + 이름)

규모: L | 의존성: 7-05

---

## 7-07: 출석 대시보드 ✅

> 커밋: `99f711c` feat: Phase 7-07 출석 대시보드 + recharts 차트

**API**:
- [x] GET /crews/:id/members/:userId/attendance-stats
- [x] GET /crews/:id/attendance-stats?month=&type=

**프론트엔드**:
- [x] OFFICIAL/POP_UP 토글
- [x] 크루 전체 출석률
- [x] 멤버별 출석 카드 (총 활동/참석/출석률/NO_SHOW/연속출석)
- [x] 월별 추이 차트 (recharts)

규모: M | 의존성: 7-02

---

## 7-08: 크루 탐색 & 추천 ✅

> 커밋: `01c4f13` feat: Phase 7-06/08 크루 프로필+게시물 + 크루 탐색&추천

**스키마 변경**:
- [x] Crew: region, subRegion 추가
- [x] User: region, subRegion 추가

**API**:
- [x] GET /crews/explore?region=&subRegion=&sort=activity
- [x] GET /crews/recommend
- [x] GET /crews/regions (시/도 목록 + 크루 수)
- [x] GET /crews/regions/:region (구/군 목록 + 크루 수)

**프론트엔드**:
- [x] SVG 한국 지도 컴포넌트 (17개 시/도 인터랙티브)
- [x] 시/도 클릭 → 구/군 드롭다운
- [x] 크루 탭 재구성 (내 크루 / 크루 찾기 세그먼트)
- [x] 크루 생성 폼에 지역 선택 추가

규모: M | 의존성: 없음

---

## 요약

| Phase | 작업 | 상태 | 규모 |
|-------|------|------|------|
| 7-01 | 활동 상세 페이지 완성 | ✅ 완료 | S |
| 7-02 | 활동 타입 + 출석 3단계 | ✅ 완료 | L |
| 7-03 | QR 카메라 스캔 | ✅ 완료 | S |
| 7-04 | 그룹 채팅 | ✅ 완료 | L |
| 7-05 | 채널(게시판) 시스템 | ✅ 완료 | L |
| 7-06 | 크루 프로필 + 게시물 | ✅ 완료 | L |
| 7-07 | 출석 대시보드 | ✅ 완료 | M |
| 7-08 | 크루 탐색 & 추천 | ✅ 완료 | M |

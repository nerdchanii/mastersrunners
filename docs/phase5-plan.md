# Phase 5: 품질 보강 + UX Funnel + GPS 강화

> 선결 조건: [pre-phase5-fixes.md](./pre-phase5-fixes.md) 8건 완료 후 착수

---

## Context

Phase 4까지 기능 구현 완료. Phase 5는 **품질 보강 + UX 개선 + 신규 기능**을 목표로 한다.
- 백엔드: 보안/정합성 보강, GPS 개선, 검색/알림 API 신규 구축
- 프론트엔드: TanStack Query 도입, shadcn/UI 완전 전환, Funnel UI 도입
- UX: 포스트 작성/워크아웃 등록/온보딩을 Step 기반 Funnel로 전환

---

## 팀 구성

**백엔드 팀:**
- API 보안/정합성 보강
- GPS 파이프라인 개선
- 신규 API (검색, 알림, 페이지네이션)

**프론트엔드 팀:**
- **UX 엔지니어**: Funnel UI 설계/구현, IA 개선, 모바일 UX, shadcn/UI 마이그레이션
- **API 통합 전문가**: TanStack Query 도입, API 스키마 정합, 에러/로딩/인증 통일

---

## A. 백엔드 보강

### A-1. 보안/정합성 수정 (H) ✅
- [x] Challenge `findById()`에 `deletedAt: null` 필터 추가
- [x] Challenge `remove()` hard delete → soft delete 전환
- [x] `CrewsController.changeRole`에서 `Error()` → `BadRequestException`
- [x] Workout 소셜(좋아요/댓글) 시 deleted 워크아웃 검증 추가 (ensureWorkoutExists)
- [x] dev-login 환경 체크 강화 (development/test만 허용)
- [x] Prisma 예외 처리 통일 (AllExceptionsFilter에 P2002/P2025/P2003/P2014 처리)

### A-2. GPS 파이프라인 개선 (H) ✅
- [x] GPX 파서 gpsTrack 출력에 elevation/heartRate/cadence 포함
- [x] 워크아웃 상세에 firstPoint/lastPoint 마커 데이터 포함
- [x] Douglas-Peucker 다운샘플링 (1000+ 포인트 → 500 다운샘플)

### A-3. 워크아웃 API 보강 (M) ✅
- [x] 워크아웃 목록 cursor 페이지네이션 추가 (findByUserWithCursor)
- [x] 워크아웃 수정 API (소유권 검증 포함)
- [x] 신발 누적 거리 자동 갱신 (addDistance/removeDistance)

### A-4. 유저 검색 API (M) ✅
- [x] GET /profile/search?q=닉네임 (Prisma contains + insensitive)
- [x] 검색 결과에 팔로우 상태 포함 (isFollowing, isPending)
- [x] 차단 유저 필터링 적용 (getBlockedUserIds → notIn)

### A-5. 알림 시스템 (M) ✅
- [x] NotificationsModule 생성 (Controller + Service + Repository + SSE)
- [x] 알림 발행 시점 구현:
  - 좋아요 (PostSocial, WorkoutSocial)
  - 댓글/답글 (PostSocial, WorkoutSocial)
  - 팔로우 요청/수락 (Follow)
  - 크루 가입/초대 (Crews)
  - DM 수신 (Conversations, 오프라인 유저 전용)
- [x] GET /notifications (cursor pagination)
- [x] PATCH /notifications/:id/read
- [x] PATCH /notifications/read-all
- [x] SSE 실시간 알림 전송 (Conversations SSE 패턴 재사용)

### A-6. 프로필 보강 (L) ✅
- [x] UpdateProfileDto에 `isPrivate`, `workoutSharingDefault` 필드 추가
- [x] 프로필 API에 postCount 포함
- [x] 프로필 API에 isPending, isPrivate 상태 포함

---

## B. 프론트엔드 UX 개선

### B-1. TanStack Query 도입 (H) ✅
- [x] 설치 + QueryClientProvider 설정 (staleTime 1분, retry 1)
- [x] 주요 API를 custom hooks로 전환:
  - `useWorkouts()`, `useWorkout(id)`
  - `useFeed()`, `usePost(id)` (useInfiniteQuery)
  - `useProfile()`, `useUser(id)`
  - `useCrews()`, `useChallenges()`, `useEvents()`
  - `useNotifications()`
- [x] Optimistic Update 패턴 통일 (useLikePost, useFollowUser)
- [x] 무한 스크롤을 `useInfiniteQuery`로 전환

### B-2. shadcn/UI 마이그레이션 완료 (H) ✅
- [x] 포스트 작성 페이지 (`posts/new`) — C-1 Funnel로 대체
- [x] 포스트 상세 페이지 (`posts/[id]`) — shadcn Card/Button
- [x] 포스트 수정 페이지 (`posts/[id]/edit`) — shadcn/UI + useUpdatePost
- [x] 메시지 목록/상세 페이지 (`messages/*`) — CSS 변수 전환
- [x] 하드코딩 색상 → CSS 변수 기반 전환 (PostCard 완전 교체)

### B-3. 네비게이션/IA 개선 (H) ✅
- [x] 모바일 BottomNav에 메시지 접근점 추가
- [x] 모바일 포스트 작성 FAB 버튼 추가
- [x] Header 알림 아이콘 → /notifications 페이지 연결 + SSE 뱃지
- [x] 워크아웃 상세 라우트 `/workouts/detail?id=` → `/workouts/:id`
- [x] `window.confirm()` → ConfirmDialog 통일
- [x] 에러 처리 통일: `alert()` 제거, sonner toast 전역

### B-4. 인증 가드 중앙화 (M) ✅
- [x] `ProtectedRoute` 래퍼 컴포넌트 구현
- [x] 각 페이지 개별 인증 체크 → ProtectedRoute로 이동
- [x] 401 시 React Router navigate 전환

### B-5. 유저 검색 UI (M) ✅
- [x] 검색 페이지 (`/search`) — 400ms debounce + TanStack Query
- [x] 유저 검색 결과 + 팔로우 버튼
- [x] DM 시작 시 유저 검색 연동

### B-6. 알림 UI (M) ✅
- [x] 알림 페이지 (`/notifications`) — IntersectionObserver 무한 스크롤
- [x] 읽음/안읽음 구분 목록 + 모두 읽음 버튼
- [x] Header/BottomNav에 안읽은 알림 뱃지 (SSE + 60초 폴링)
- [x] SSE 실시간 알림 수신

---

## C. Funnel UI

### C-1. 포스트 작성 Funnel (H) ✅

4-Step 풀 Funnel:

```
Step 1: 워크아웃 선택 (선택 사항)
├─ 최근 워크아웃 목록 (cursor pagination)
├─ 선택 시 카드에 in-place 체크 피드백 (위로 올리지 않음)
├─ GPS 있으면 경로 미리보기 아이콘
└─ "워크아웃 없이 진행" 스킵 버튼

Step 2: 사진 선택
├─ 모바일: 권한 획득 → 하단 카메라롤 그리드 (Instagram 스타일)
├─ 웹: 드래그앤드롭 영역 + 파일 선택
├─ 다중 선택 (최대 5개) + 순서 드래그 변경
├─ 클라이언트 리사이즈 (Canvas API, max 1920px, EXIF 방향 보정)
└─ "사진 없이 진행" 스킵 버튼

Step 3: 텍스트 + 설정
├─ 텍스트 작성 (content: optional — API와 통일)
├─ 해시태그 입력
├─ 공개범위 선택 (PUBLIC / FOLLOWERS / PRIVATE)
└─ 첨부 요약 (사진 N개, 워크아웃 N개)

Step 4: 미리보기 + 게시
├─ 최종 결과 카드 미리보기
├─ 수정하려면 이전 Step으로 이동
└─ 게시 버튼
```

**구현 결정사항:**
- 라우트: `/posts/new` 단일 라우트, 내부 Step 상태 관리
- 뒤로가기: 브라우저 back 시 이전 Step으로 (history.pushState)
- 상태 보존: Step 간 이동 시 이전 입력 보존 (React state)
- 최소 게시 조건: 사진 / 텍스트 / 워크아웃 중 1개 이상
- 업로드 타이밍: Step 2에서 선택 즉시 presigned URL 업로드 시작

### C-2. 워크아웃 수동 등록 Funnel (M) ✅

```
Step 1: 운동 유형 선택 (카테고리 → 유형)
Step 2: 기본 데이터 입력 (거리, 시간, 날짜)
Step 3: 상세 데이터 (심박, 고도, 메모, 신발 선택)
Step 4: 확인 + 저장
```

Tabs UI (파일 업로드 / 직접 입력) 구현 완료.

### C-3. 첫 로그인 온보딩 Funnel (L) ✅

OAuth 최초 로그인 후 프로필 미설정 시:

```
Step 1: 닉네임 + 프로필 사진
Step 2: 관심 운동 유형 선택
Step 3: 공개/비공개 계정 선택
Step 4: 완료 → 피드 이동
```

`/onboarding` 라우트 등록 완료.

---

## D. 소규모 개선

- [ ] 워크아웃 수정 페이지 UI (PUT API 연동)
- [ ] 챌린지/이벤트 수정 페이지 UI
- [ ] 포스트 수정 시 이미지 추가/삭제 지원
- [ ] 이미지 갤러리/라이트박스 (풀스크린 이미지 뷰)
- [ ] 워크아웃 완료 후 "포스트로 공유" CTA
- [ ] 워크아웃 상세에서 "이 워크아웃으로 포스트 작성" 버튼
- [ ] 피드 PostFeedCard Share/More 버튼 핸들러
- [ ] 메시지 상세 높이 모바일 BottomNav 고려

---

## AMBIGUOUS / 미결정

### Phase 5 진행 중 결정됨
- [x] 모바일 BottomNav 구조: 홈/검색/작성(FAB)/알림/메시지 구조로 구현
- [x] 알림 이벤트 목록: 좋아요, 댓글, 팔로우, 크루 가입, DM 수신
- [ ] 온보딩 Funnel: OAuth 최초 로그인 후 강제 vs 스킵 가능 (스킵 가능으로 구현됨, 정책 확정 필요)

### 리뷰에서 발견된 추가 개선 사항
- [ ] WorkoutCard, CrewForm, challenges/new, events/new 페이지 shadcn/UI 완전 전환
- [ ] messages 페이지 TanStack Query 적용 (현재 useState+useEffect)
- [ ] 온보딩 관심 운동 타입 `/workout-types` API 연동 (현재 하드코딩)
- [ ] SSE 인메모리 연결 → Redis pub/sub 전환 (수평 확장 시)
- [ ] 신발 누적 거리 업데이트 트랜잭션 내 원자성 보장 검토

---

## Phase 6 후보

| 항목 | 비고 |
|------|------|
| **Activity Share Card** (워크아웃+사진 합성) | Canvas API, Funnel에서 경로 오버레이 에디터 |
| **피드 미니맵** | encodedPolyline 생성 + 피드 카드 경로 썸네일 |
| 해시태그 검색 | 해시태그 기반 포스트 필터링 |
| 계정 삭제(탈퇴) | GDPR/개인정보보호 |
| 푸시 알림 (FCM/APNs) | 알림 모듈 완성 후 |
| 다크 모드 | shadcn/UI 전환 완료 후 자동 지원 가능 |
| 이미지 서버사이드 최적화 (Sharp) | 클라이언트 리사이즈 후 필요 시 |
| 경로 분석 (구간 페이스, 히트맵) | GPS 안정화 후 |
| PostGIS | 근처 워크아웃/크루 찾기 |
| 스토리 (24h 포스트) | |
| 동영상 지원 | |

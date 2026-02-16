# Phase 4: 기능 완성 + 배포 파이프라인 + UX 개선

## Context

Phase 3까지 완료 후 추가 마이그레이션 작업 수행:
- Next.js → Vite + React Router v7 전환 완료
- Turborepo 제거 → pnpm 네이티브 워크스페이스 전환 완료
- API 안정화 (22개 누락 엔드포인트 + DTO 검증) 완료

Phase 4는 실사용 가능한 프로덕트를 목표로 한다.

---

## Phase 3.5: 선결 조건 (Phase 4 진입 전 필수)

Phase 3 → 4 사이에 발견된 API 스키마 계약 위반 문제. Phase 4 진입 전 반드시 해결.

### 상태: ✅ 완료

### API 스키마 계약 수정 (7건)

| # | 심각도 | 도메인 | 문제 | 상태 |
|---|--------|--------|------|------|
| 1 | CRITICAL | Challenge | `findAll` raw 배열 반환 → `{ items, nextCursor, hasMore }` 필요 | 🔧 |
| 2 | CRITICAL | Challenge | `findAll`에 `_count.participants` include 누락 | 🔧 |
| 3 | CRITICAL | Challenge | 필드명 불일치: FE `name`/`goalType`/`goalValue` vs DB `title`/`type`/`targetValue` | 🔧 |
| 4 | CRITICAL | Feed | workout `_count` 필드명: `workoutLikes`→`likes`, `workoutComments`→`comments` 매핑 필요 | 🔧 |
| 5 | MODERATE | Crew | `findById`에 `creator` + `_count` include 누락 → 상세 페이지 크래시 | 🔧 |
| 6 | MODERATE | Crew | `findByCrewId` (ban)에 `user` include 누락 → 설정 페이지 크래시 | 🔧 |
| 7 | MODERATE | Challenge | 리더보드에 `rank`/`progress` 필드 누락 (raw `currentValue` 반환) | 🔧 |

**근본 원인**: 서비스 레이어에 응답 변환(serialization) 없이 Prisma raw 객체를 그대로 전달.
**수정 원칙**: 리포지토리는 최소 수정(include 추가), 매핑은 서비스 레이어에서 수행.

### Swagger (OpenAPI) 설정

- `@nestjs/swagger` 설치 + main.ts 설정
- 모든 컨트롤러에 `@ApiTags` 추가
- 주요 DTO에 `@ApiProperty` 추가
- 핵심 엔드포인트에 `@ApiOperation` + `@ApiResponse` 추가
- Swagger UI: `http://localhost:3000/api-docs`

### 완료 기준
- [x] 7건 API 계약 위반 모두 수정
- [x] Swagger UI에서 전체 API 확인 가능
- [x] `pnpm --filter api test` 전체 통과 (42 suites, 565 tests)
- [x] 프론트엔드에서 challenge/crew/feed/workout 페이지 에러 없음

---

## 작업 영역 (6개)

### A. 프론트엔드 기능 구현 (worktree)
### B. DM (Direct Message) 시스템 (worktree)
### C. 멘션 자동완성 시스템 (worktree)
### D. OAuth 실제 연동 (main branch — 유저 직접 작업)
### E. 배포 파이프라인 (worktree)
### F. 성능/UX 분석 + 개선 (현재 브랜치에서 분석 → worktree에서 구현)

---

## A. 프론트엔드 기능 구현

**브랜치**: `feature/frontend-v2` (worktree)
**범위**: `apps/web/`
**예상 규모**: 대규모 — 2~3회 전체 갈아엎기 파이프라인 예정

### 배경

현재 프론트엔드는 기본 CRUD 페이지만 존재. Phase 3에서 추가된 API 엔드포인트(Crew Tags/Activities, Challenge Teams)에 대응하는 UI가 없고, Vite 마이그레이션 직후라 전체적인 UX/UI 재설계가 필요.

### 작업 목록

#### A-1. Crew 페이지 강화 (H)
- 대기 멤버 관리 UI (승인/거절)
- 태그 관리 CRUD UI
- 멤버별 태그 할당/해제
- 활동(CrewActivity) 생성/목록/상세
- 출석(QR 체크인) 화면
- 출석자 목록

#### A-2. Challenge 페이지 강화 (H)
- 팀 생성/참여/탈퇴 UI
- 팀 리더보드
- 팀 상세 (멤버 목록)

#### A-3. Events 페이지 강화 (M)
- 이벤트 목록/상세 완성
- 참가 등록 플로우
- 결과 제출/리더보드 표시
- 워크아웃 연동 표시

#### A-4. 전체 UI/UX 갈아엎기 (1차) (H)
- 디자인 시스템 정립 (컬러, 타이포, 스페이싱)
- 공통 컴포넌트 라이브러리 (Button, Card, Modal, Input, Badge 등)
- 반응형 레이아웃 재설계
- 로딩/에러 상태 표준화

#### A-5. 전체 UI/UX 갈아엎기 (2차) (M)
- 인터랙션/애니메이션 개선
- 접근성(a11y) 보강
- 다크모드 지원 (선택)

### 팀 구성
- **designer** (Sonnet) × 1: UI/UX 설계
- **executor** (Sonnet) × 2~3: 페이지별 구현 (파일 소유권 분리)
- 총 2~3회 이터레이션 예상

### ⚠️ AMBIGUOUS — 결정 필요

| 항목 | 설명 | 필요 시점 |
|------|------|-----------|
| **디자인 시스템 기반** | Tailwind CSS? shadcn/ui? 자체 컴포넌트? CSS 프레임워크 선택 미정 | A-4 시작 전 |
| **QR 체크인 메커니즘** | QR 코드 생성 방식 (시간 기반? 일회성 토큰?), 스캔 라이브러리 선택, 오프라인 대응 | A-1 출석 구현 시 |
| **UI/UX 갈아엎기 범위** | "전체 갈아엎기"의 구체적 범위 — 기존 페이지 완전 재작성? 점진적 개선? 디자인 목업 필요 여부 | A-4 시작 전 |
| **반응형 브레이크포인트** | 모바일 우선? 데스크탑 우선? 태블릿 지원 범위 | A-4 시작 전 |
| **다크모드** | A-5에서 "선택"으로 표기됨 — 구현할 것인지 최종 결정 필요 | A-5 시작 전 |

---

## B. DM (Direct Message) 시스템

**브랜치**: `feature/dm` (worktree)
**범위**: `apps/api/` + `apps/web/` + `packages/database/`

### 도메인 설계

#### Conversation (대화방)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| type | enum | DIRECT (1:1) |
| createdAt | datetime | 생성 시각 |
| updatedAt | datetime | 마지막 메시지 시각 |

> 향후 GROUP 타입 확장 가능. 현재는 1:1만 지원.

#### ConversationParticipant (대화 참여자)

| 필드 | 타입 | 설명 |
|------|------|------|
| conversationId | UUID | FK → Conversation |
| userId | UUID | FK → User |
| lastReadAt | datetime? | 마지막 읽은 시각 (안읽음 카운트용) |
| joinedAt | datetime | 참여 시각 |

#### Message (메시지)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| conversationId | UUID | FK → Conversation |
| senderId | UUID | FK → User |
| content | string | 메시지 내용 (최대 2000자) |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | 전송 시각 |

### 비즈니스 규칙

- 차단 관계에서는 DM 전송 불가
- 비공개 계정: 팔로워만 DM 가능 (또는 설정으로 제어)
- 1:1 대화방은 두 유저 간 유일 (중복 생성 방지)
- 대화 목록은 최신 메시지 순 정렬
- 안읽음 메시지 수 표시 (lastReadAt 기반)

### API 엔드포인트

```
POST   /conversations          → 대화 시작 (상대방 userId)
GET    /conversations          → 대화 목록 (cursor pagination)
GET    /conversations/:id      → 대화 상세 (메시지 목록)
POST   /conversations/:id/messages  → 메시지 전송
PATCH  /conversations/:id/read → 읽음 처리
DELETE /messages/:id           → 메시지 삭제 (soft delete)
```

### 프론트엔드

- `/messages` — 대화 목록 페이지
- `/messages/:id` — 대화 상세 (채팅 뷰)
- 프로필 페이지에서 "메시지 보내기" 버튼 (데스크탑: 탭으로 접근)
- 멘션(`@유저`) 클릭 시 → 해당 유저 DM으로 이동 (데스크탑)
- Header에 안읽음 메시지 뱃지

### 팀 구성
- **executor** (Sonnet) × 1: DB 스키마 + API 모듈
- **executor** (Sonnet) × 1: 프론트엔드 DM 페이지

### 참고사항
- WebSocket/SSE는 Phase 4에서 미구현 — 폴링 기반으로 시작
- 실시간 알림은 Phase 5에서 WebSocket 도입 시 함께 추가

### ⚠️ AMBIGUOUS — 결정 필요

| 항목 | 설명 | 필요 시점 |
|------|------|-----------|
| **폴링 주기** | 대화 목록/메시지 목록 폴링 간격 미정 (5초? 10초? 페이지 포커스 시만?) | B 프론트 구현 시 |
| **비공개 계정 DM 정책 상세** | "팔로워만 DM 가능 (또는 설정으로 제어)" — "설정으로 제어"의 구체적 옵션 미정 (유저 프로필에 DM 허용 토글?) | B API 구현 시 |
| **대화방 삭제/나가기** | 대화방 자체를 삭제하거나 나가는 기능 필요 여부 미정 | B 후반 |
| **메시지 최대 로드 수** | 대화 상세에서 한 번에 로드하는 메시지 수, 무한스크롤 방향 (위로 스크롤 = 이전 메시지) | B 프론트 구현 시 |
| **이미지/파일 첨부** | Phase 4에서 텍스트만? 이미지 첨부 지원 여부 | B 기획 시 |

---

## C. 멘션 자동완성 시스템

**브랜치**: `feature/mention-autocomplete` (worktree)
**범위**: `apps/api/` + `apps/web/`

### 기능 설명

1. **댓글/포스트 작성 시** `@` 입력 → 자동완성 드롭다운 표시
2. 유저 선택 시 `@유저이름` 삽입 + `mentionedUserId` 기록
3. **데스크탑**: 멘션된 유저 이름 클릭 또는 탭 → DM 대화 페이지로 이동
4. **모바일**: 멘션된 유저 이름 탭 → 프로필 페이지로 이동

### 자동완성 우선순위

대댓글 작성 시 `@` 드롭다운의 정렬 우선순위:

1. **현재 댓글 스레드 참여자** — 해당 1단계 댓글의 대댓글 작성자들 (가장 최근 활동 순)
2. **포스트/워크아웃 작성자** — 원글 작성자
3. **팔로잉 목록** — 내가 팔로우한 유저 (이름 검색 필터링)

포스트에 직접 댓글 작성 시:
1. **기존 댓글 참여자** — 해당 포스트에 댓글 작성한 유저들
2. **포스트 작성자**
3. **팔로잉 목록**

### API

```
GET /users/mention-suggestions?q=검색어&postId=xxx&commentId=xxx
  → 컨텍스트 기반 멘션 자동완성 (스레드 참여자 우선)
```

### 프론트엔드 컴포넌트

- `MentionInput` — textarea + 자동완성 드롭다운 통합 컴포넌트
  - `@` 감지 → debounced 검색 API 호출
  - 컨텍스트(postId, commentId) 전달하여 스레드 참여자 우선 표시
  - 선택 시 텍스트 삽입 + mentionedUserIds 배열 관리
- `MentionLink` — 렌더링 시 `@유저이름`을 클릭 가능한 링크로 변환

### 팀 구성
- **executor** (Sonnet) × 1: API + 프론트엔드 컴포넌트

### 의존성
- DM 기능(B) 완성 후 "탭으로 DM 이동" 연동

### ⚠️ AMBIGUOUS — 결정 필요

| 항목 | 설명 | 필요 시점 |
|------|------|-----------|
| **멘션 저장 방식** | 현재 `PostComment.mentionedUserId` 단일 필드 → 다중 멘션 시 별도 테이블 필요? 아니면 JSON 배열? | C 스키마 설계 시 |
| **멘션 알림** | 멘션된 유저에게 알림을 보내야 하는지, 알림 시스템이 아직 없으므로 Phase 5로 미룰지 | C 구현 시 |
| **멘션 대상 범위** | 팔로잉 목록 외에 같은 크루 멤버도 멘션 가능해야 하는지 | C 기획 시 |
| **MentionInput 라이브러리** | 자체 구현? 기존 라이브러리(`@draft-js-plugins/mention`, `tribute.js` 등) 사용? | C 프론트 구현 시 |

---

## D. OAuth 실제 연동

**브랜치**: `main` (유저 직접 작업)
**범위**: `apps/api/src/auth/`

### 작업

유저가 직접 수행:
1. 카카오 개발자 콘솔에서 앱 등록 + Redirect URI 설정
2. 구글 Cloud Console에서 OAuth 클라이언트 생성
3. 네이버 개발자 센터에서 앱 등록
4. `.env`에 Client ID/Secret 설정
5. 실제 로그인 플로우 테스트

### 참고
- NestJS Passport strategy는 이미 구현됨 (mock/dev 상태)
- `.env` 값만 설정하면 동작해야 함
- 문제 발생 시 strategy 코드 디버깅 필요

### ⚠️ AMBIGUOUS — 결정 필요

| 항목 | 설명 | 필요 시점 |
|------|------|-----------|
| **OAuth 우선순위** | 카카오/구글/네이버 중 어떤 것부터 연동할지 | D 시작 시 |
| **회원가입 플로우** | 최초 OAuth 로그인 시 프로필 설정 화면(이름, 프로필 사진 등) 필요 여부 | D 연동 시 |
| **계정 연동** | 이미 카카오로 가입한 유저가 구글로도 로그인하면? 동일 이메일 기반 자동 연동? | D 후반 |

---

## E. 배포 파이프라인

**브랜치**: `feature/deployment` (worktree)
**범위**: 루트 + `apps/api/` + CI/CD 설정

### 작업 목록

#### E-1. Docker 프로덕션 설정 (H)
- `apps/api/Dockerfile` 작성 (multi-stage build)
- `docker-compose.prod.yml` 작성 (API + PostgreSQL)
- `.env.production` 템플릿
- Health check endpoint

#### E-2. Cloudflare Pages 설정 (M)
- `apps/web/` 빌드 → `dist/` 배포
- SPA fallback 설정 (`_redirects` 또는 Cloudflare 설정)
- 환경변수 설정 (VITE_API_URL)
- 커스텀 도메인 연결

#### E-3. CI/CD (GitHub Actions) (M)
- PR 시: lint + typecheck + test
- main push 시: Docker 이미지 빌드 + 배포
- Cloudflare Pages는 GitHub 연동 자동 배포

#### E-4. 모니터링 기초 (L)
- API 로깅 표준화
- 에러 추적 (Sentry 또는 대안)

### 팀 구성
- **executor** (Sonnet) × 1

### ⚠️ AMBIGUOUS — 결정 필요

| 항목 | 설명 | 필요 시점 |
|------|------|-----------|
| **API 서버 호스팅** | Docker 배포 대상 — VPS(Hetzner? DigitalOcean?)? 자체 서버? 클라우드(AWS/GCP)? | E-1 시작 전 |
| **도메인** | 커스텀 도메인 보유 여부, API 도메인(api.example.com) 설정 | E-2 시작 전 |
| **HTTPS/인증서** | Let's Encrypt? Cloudflare Proxy? Caddy reverse proxy? | E-1 구현 시 |
| **DB 백업 전략** | PostgreSQL 백업 주기, 복원 테스트 방법 | E-1 이후 |
| **CI 러너 환경** | GitHub Actions free tier 충분한지, self-hosted runner 필요 여부 | E-3 시작 시 |
| **R2 CORS 설정** | Cloudflare R2 presigned URL의 CORS 정책, 프로덕션 도메인 허용 | E-2 시 |

---

## F. 성능/UX 분석 + 개선

**브랜치**: 분석은 현재 브랜치, 구현은 worktree
**범위**: `apps/web/` + `apps/api/`

### 분석 단계 (현재 브랜치)

1. **번들 분석**: Vite bundle visualizer로 큰 모듈 식별
2. **API 응답 시간**: 느린 쿼리 식별 (N+1 등)
3. **UX 감사**: 로딩 상태 누락, 에러 핸들링 미비, 접근성 문제
4. **코드 품질**: 중복 코드, 미사용 코드, 타입 안전성 갭

### 구현 단계 (worktree)

분석 결과에 따라 worktree에서 구현:
- 코드 스플리팅 (React.lazy)
- API 요청 캐싱/deduplication
- 스켈레톤 로딩
- 에러 바운더리
- 무한 스크롤 최적화

### 팀 구성
- **analyst** (Opus) × 1: 분석
- **executor** (Sonnet) × 1~2: 구현 (분석 완료 후)

### ⚠️ AMBIGUOUS — 결정 필요

| 항목 | 설명 | 필요 시점 |
|------|------|-----------|
| **성능 목표** | LCP, FCP, TTI 등 구체적 수치 목표 미정 | F 분석 시 |
| **UX 감사 기준** | 어떤 UX 프레임워크/체크리스트로 감사할지 (WCAG 2.1 AA? 자체 기준?) | F 분석 시 |
| **스켈레톤 로딩 범위** | 모든 페이지? 핵심 페이지만? | F 구현 시 |

---

## 우선순위 & 의존 관계

```
Phase 4 실행 순서:

1단계 (병렬):
  ├── [A-1~A-3] 프론트엔드 기능 구현 (worktree)
  ├── [B] DM 시스템 — API + 스키마 (worktree)
  ├── [D] OAuth 실제 연동 (유저 직접)
  └── [E-1~E-2] 배포 파이프라인 기초 (worktree)

2단계 (1단계 부분 완료 후):
  ├── [C] 멘션 자동완성 (B의 API 완성 후)
  ├── [E-3] CI/CD
  └── [F-분석] 성능/UX 분석

3단계:
  ├── [A-4] UI/UX 1차 갈아엎기
  └── [F-구현] 성능/UX 개선 구현

4단계:
  └── [A-5] UI/UX 2차 갈아엎기
```

## DB 스키마 변경 필요

### 신규 테이블 (DM)
- `Conversation` — 대화방
- `ConversationParticipant` — 대화 참여자
- `Message` — 메시지

### 변경 없음
- 기존 `PostComment.mentionedUserId`는 이미 존재

---

## Worktree 브랜치 계획

| 브랜치명 | 작업 영역 | 파일 범위 |
|---------|----------|----------|
| `feature/frontend-v2` | A. 프론트엔드 | `apps/web/` |
| `feature/dm` | B. DM 시스템 | `apps/api/` + `apps/web/` + `packages/database/` |
| `feature/mention-autocomplete` | C. 멘션 | `apps/api/` + `apps/web/` |
| `feature/deployment` | E. 배포 | 루트 + CI/CD |
| `feature/perf-ux` | F. 성능/UX 구현 | `apps/web/` + `apps/api/` |

> B(DM)와 A(프론트)는 `apps/web/` 범위가 겹치므로, B의 프론트 작업은 별도 페이지(`/messages`)로 분리하여 충돌 최소화.

---

## 스토리 기능 (보류)

24시간 제한 가벼운 게시글. Phase 5 이후 검토.

### 예상 설계 (메모)
- `Story` 테이블: userId, content, imageUrl, expiresAt, createdAt
- 24시간 후 자동 비노출 (cron 또는 조회 시 필터)
- 프로필 상단 원형 아이콘으로 표시
- 팔로워만 열람 가능

---

## 완료 기준

### Phase 3.5 (선결 조건)
- [ ] API 스키마 계약 7건 수정 완료
- [ ] Swagger UI 동작 확인
- [ ] 프론트엔드 주요 페이지 런타임 에러 0건

### Phase 4
- [ ] Crew 태그/활동/출석 UI 동작
- [ ] Challenge 팀 기능 UI 동작
- [ ] DM 1:1 대화 가능
- [ ] `@멘션` 자동완성 + 클릭 시 DM/프로필 이동
- [ ] OAuth 실제 로그인 동작 (카카오/구글/네이버 중 최소 1개)
- [ ] Docker 배포 가능
- [ ] Cloudflare Pages 배포 가능
- [ ] CI에서 lint + test 자동 실행
- [ ] UI/UX 1차 개선 완료

---

## AMBIGUOUS 항목 총정리

Phase 4 전체에서 결정이 필요한 항목 모음. 각 영역 시작 전 유저와 논의 필요.

| 영역 | 항목 | 우선순위 |
|------|------|----------|
| A | 디자인 시스템/CSS 프레임워크 선택 | HIGH — A-4 시작 전 필수 |
| A | QR 체크인 메커니즘 상세 | MEDIUM — A-1 출석 구현 시 |
| A | 반응형 전략 (모바일/데스크탑 우선) | HIGH — A-4 시작 전 필수 |
| A | 다크모드 구현 여부 | LOW — A-5 시작 전 |
| B | 폴링 주기 | LOW — B 프론트 구현 시 |
| B | 비공개 계정 DM 정책 상세 | MEDIUM — B API 구현 시 |
| B | 대화방 삭제/나가기 기능 | LOW — B 후반 |
| B | 이미지/파일 첨부 여부 | MEDIUM — B 기획 시 |
| C | 멘션 다중 저장 방식 (별도 테이블 vs JSON) | HIGH — C 스키마 설계 시 |
| C | 멘션 알림 (Phase 4 vs 5) | MEDIUM — C 구현 시 |
| C | MentionInput 라이브러리 선택 | MEDIUM — C 프론트 구현 시 |
| D | OAuth 우선순위 (카카오/구글/네이버) | LOW — D 시작 시 |
| D | 최초 가입 시 프로필 설정 플로우 | MEDIUM — D 연동 시 |
| D | 동일 이메일 다중 OAuth 계정 연동 | MEDIUM — D 후반 |
| E | API 서버 호스팅 환경 | HIGH — E-1 시작 전 필수 |
| E | 도메인 보유/설정 | HIGH — E-2 시작 전 필수 |
| E | HTTPS/인증서 방식 | MEDIUM — E-1 구현 시 |
| F | 성능 목표 수치 | LOW — F 분석 시 |

# Masters Upgrade 작업 보고서

**작업일**: 2026-02-17
**팀 구성**: team-lead + backend-engineer + frontend-profile + frontend-workout

---

## 1. 작업 요약

사용자 요청 3가지를 팀모드로 동시 수행:

| 영역 | 내용 | 상태 |
|------|------|------|
| A. Instagram-style Profile | 커버 이미지 + 프로필 사진 겹침 레이아웃 + 수정 페이지 | ✅ 완료 |
| B. FIT/GPX 데이터 뷰어 | GPS 지도 + 차트 + 랩 테이블 + 메트릭 카드 | ✅ 완료 |
| C. UI/UX 품질 | frontend-ui-ux 스킬 활용 | ✅ 완료 |

---

## 2. 태스크별 완료 내역

### Backend (backend-engineer)

| # | 태스크 | 세부 내용 |
|---|--------|----------|
| 1 | DB 스키마 변경 | User 모델에 `backgroundImage String?` 추가 + Prisma migration |
| 2 | FIT 파서 보강 | 랩 데이터 추출 + per-point elevation/HR/cadence + ParsedWorkoutData 확장 |
| 4 | Profile PATCH API | `PATCH /profile` 엔드포인트 + UpdateProfileDto (name 2-50자, bio 0-300자) |
| 5 | Workout API 확장 | `GET /workouts/:id`에 workoutRoutes, workoutFiles, workoutLaps include |

### Frontend - Profile (frontend-profile)

| # | 태스크 | 세부 내용 |
|---|--------|----------|
| 6 | ProfileHeader 리디자인 | 커버 이미지(3:1) + 프로필 사진 겹침(ring-4) + 팔로워/팔로잉 통합 |
| 7 | 프로필 수정 페이지 | `/settings/profile` + R2 사진 업로드 + 이름/bio 폼 + validation |

### Frontend - Workout (frontend-workout)

| # | 태스크 | 세부 내용 |
|---|--------|----------|
| 3 | 의존성 설치 | react-leaflet, leaflet, recharts, @types/leaflet |
| 8 | 워크아웃 상세 리디자인 | RouteMap + ElevationChart + HeartRateChart + LapsTable + WorkoutMetrics + SourceInfo |
| 9 | 업로드 미리보기 강화 | 심박수/칼로리/고도/케이던스/GPS 유무 카드 그리드 |

---

## 3. 변경 파일 목록 (27 수정 + 15 신규 = 42 파일)

### 수정된 파일 (27개)
```
packages/database/prisma/schema.prisma          -- backgroundImage 필드 추가
apps/api/src/auth/repositories/user.repository.ts -- update() 메서드 추가, findByIdBasicSelect 확장
apps/api/src/auth/repositories/user.repository.spec.ts -- 테스트 업데이트
apps/api/src/profile/profile.controller.ts       -- PATCH /profile 추가
apps/api/src/profile/profile.service.ts          -- updateProfile() 추가
apps/api/src/profile/profile.service.spec.ts     -- updateProfile 테스트 추가
apps/api/src/uploads/parsers/fit-parser.service.ts    -- 랩 데이터 + per-point 메트릭
apps/api/src/uploads/parsers/fit-parser.service.spec.ts -- 파서 테스트 추가 (286줄)
apps/api/src/uploads/uploads.service.ts          -- WorkoutLap 생성 로직
apps/api/src/workouts/repositories/workout.repository.ts -- include 확장
apps/api/src/workouts/repositories/workout.repository.spec.ts -- 테스트 추가
apps/api/src/workouts/workouts.service.spec.ts   -- 테스트 추가
apps/web/package.json                            -- leaflet, recharts 의존성
apps/web/playwright.config.ts                    -- timeout 설정
apps/web/src/components/profile/ProfileHeader.tsx -- Instagram/Twitter 하이브리드 전면 리디자인
apps/web/src/components/ui/sonner.tsx            -- next-themes 의존 제거
apps/web/src/globals.css                         -- Leaflet CSS import
apps/web/src/lib/auth-context.tsx                -- User에 backgroundImage 추가
apps/web/src/main.tsx                            -- Toaster 마운트
apps/web/src/pages/profile/index.tsx             -- ProfileHeader 통합 리팩터링
apps/web/src/pages/profile/[id]/index.tsx        -- 동일 리팩터링
apps/web/src/pages/workouts/detail/index.tsx     -- 지도+차트+랩+메트릭 통합
apps/web/src/pages/workouts/new/index.tsx        -- 업로드 미리보기 강화
apps/web/src/router.tsx                          -- /settings/profile 라우트 등록
apps/web/e2e/smoke.spec.ts                       -- 타이틀 한국어 대응
pnpm-lock.yaml                                   -- 의존성 업데이트
.env.production.example                          -- 환경변수 예시
```

### 신규 파일 (15개)
```
packages/database/prisma/migrations/20260217000000_add_background_image/migration.sql
apps/api/src/profile/dto/update-profile.dto.ts
apps/web/src/components/workout/RouteMap.tsx
apps/web/src/components/workout/ElevationChart.tsx
apps/web/src/components/workout/HeartRateChart.tsx
apps/web/src/components/workout/LapsTable.tsx
apps/web/src/components/workout/WorkoutMetrics.tsx
apps/web/src/components/workout/SourceInfo.tsx
apps/web/src/components/ui/table.tsx             (shadcn Table 컴포넌트)
apps/web/src/pages/settings/profile/index.tsx
apps/web/e2e/helpers/mock-auth.ts
apps/web/e2e/profile.spec.ts
apps/web/e2e/profile-edit.spec.ts
apps/web/e2e/workout-detail.spec.ts
apps/web/e2e/upload-preview.spec.ts
```

---

## 4. 테스트 결과

### API 단위 테스트
```
Test Suites: 45 passed, 45 total
Tests:       619 passed, 619 total
Time:        4.065s
```

### Frontend 타입 체크
```
tsc --noEmit: 통과 (에러 0개)
```

### Frontend 빌드
```
vite build: 성공 (4.74s)
```

### Playwright E2E 테스트
```
Test Suites: 5 files
Tests:       26 passed, 26 total
Time:        12.5s

테스트 항목:
- 프로필 페이지 (5): 커버 이미지, 프로필 사진 겹침, 이름/bio, 팔로워 카운트, 수정 버튼
- 프로필 수정 (7): 페이지 로드, 배경/프로필 영역, 폼 초기값, 글자수 카운터, validation, 버튼
- 워크아웃 상세 (11): 기본 정보, 타입/신발, GPS 지도, 고도 차트, 심박수 차트, 메트릭 카드, 랩 테이블, 소스 파일, 메모, 삭제 버튼, ID 누락 안내
- 업로드 미리보기 (2): 페이지 로드, 파일 업로드 영역
- 스모크 (1): 홈페이지 로드
```

---

## 4-1. 후속 수정 — 프로필 API 엔드포인트 불일치 버그

### 문제
프론트엔드 프로필 페이지에서 **존재하지 않는 API 엔드포인트**를 호출하고 있었음:
- `GET /profile/${userId}/stats` → **404 Not Found** (이 엔드포인트는 API에 없음)

E2E 테스트는 `page.route()`로 모든 API를 모킹하기 때문에 이 불일치를 감지하지 못함.

### 수정 내용
| 파일 | 변경 |
|------|------|
| `apps/web/src/pages/profile/index.tsx` | `GET /profile/${user.id}/stats` → `GET /profile` |
| `apps/web/src/pages/profile/[id]/index.tsx` | `GET /profile/${userId}/stats` → `GET /profile/${userId}` |
| `apps/web/e2e/profile.spec.ts` | Mock 데이터 구조를 실제 API 응답과 일치하도록 수정 |

### 핵심 변경
```typescript
// Before (버그):
const statsData = await api.fetch<ProfileStats>(`/profile/${user.id}/stats`);

// After (수정):
const data = await api.fetch<ProfileApiResponse>("/profile");
setProfileStats({
  postCount: 0,
  followerCount: data.followersCount,
  followingCount: data.followingCount,
  workoutCount: data.stats.totalWorkouts,
});
```

API 응답 `{ user, stats, followersCount, followingCount }` 구조를 프론트엔드 `ProfileStats` 인터페이스로 매핑.

### 교훈
- E2E 모킹 테스트만으로는 프론트엔드-API 간 **계약 불일치**를 잡을 수 없음
- 실제 API 서버와의 통합 테스트 또는 API contract testing (예: OpenAPI 스키마 기반) 필요

---

## 5. 주의사항 / 알려진 이슈

1. **Vite 빌드 경고**: `index-C_AZiP1S.js` (522KB) — recharts 번들 크기. 향후 dynamic import로 code-split 권장
2. **Leaflet CSS**: `globals.css`에 `@import 'leaflet/dist/leaflet.css'`로 추가. 별도 처리 불필요
3. **DB 마이그레이션**: `20260217000000_add_background_image` — 프로덕션 배포 시 `prisma migrate deploy` 필요
4. **E2E 테스트**: API 모킹 방식 사용 (Playwright route interception). 실제 API 통합 테스트는 별도 필요
5. **이미지 업로드**: R2 presigned URL 플로우 재사용. 실제 테스트는 R2 버킷 설정 후 가능

---

## 6. 다음 단계 제안

- [ ] 프로덕션 DB에 마이그레이션 적용
- [ ] recharts dynamic import로 번들 크기 최적화
- [ ] GPX 파서에도 랩 데이터 추출 추가 (현재 FIT만)
- [ ] 워크아웃 상세 페이지 — 케이던스 차트 추가 (선택)
- [ ] 프로필 페이지 — 팔로워/팔로잉 리스트 페이지 구현 (/profile/:id/followers)
- [ ] 실제 OAuth 연동 후 전체 E2E 플로우 테스트
- [ ] E2E 테스트에 실제 API 연동 테스트 추가 (mock 외 contract testing)
- [ ] `postCount` API 추가 (현재 프로필 통계에서 0으로 하드코딩)
- [ ] `isPending`/`isPrivate` 필드를 프로필 API 응답에 포함

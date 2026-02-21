# Phase 5 선결 조건: Critical 버그 수정

> Phase 5 본작업 착수 전 반드시 해결해야 할 항목들.
> Phase 4 코드 리뷰에서 발견된 보안/정합성/UX 결함.

---

## API 보안 (5건)

### 1. Rate Limiting 무효화
- **문제**: 18개 컨트롤러 전체에 `@SkipThrottle()` 적용 → ThrottlerGuard가 사실상 작동하지 않음
- **위험**: 토큰 브루트포스, 무제한 파일 업로드, 메시지 폭주 가능
- **파일**: 전체 컨트롤러
- **수정**: SSE/health 등 필요한 곳만 `@SkipThrottle()` 유지, 나머지 전부 제거

### 2. 삭제된 게시글 접근 가능
- **문제**: `Post.findById()`에 `deletedAt: null` 필터 누락
- **위험**: soft delete된 게시글이 상세 조회, 좋아요, 댓글에서 여전히 접근됨
- **파일**: `apps/api/src/posts/repositories/post.repository.ts:37-39`
- **수정**: `findUnique` → `findFirst` + `where: { id, deletedAt: null }`

### 3. 인증 없이 파일 업로드 가능
- **문제**: `DiskUploadController`에 `@Public()` 데코레이터 → JWT 없이 파일 쓰기 가능
- **위험**: 서버에 무인증 파일 저장, 키 검증 없어 임의 경로 저장 가능
- **파일**: `apps/api/src/uploads/disk-upload.controller.ts:17`
- **수정**: `@Public()` 제거. 개발 환경에서도 JWT 인증 유지 (dev-login으로 토큰 발급 가능하므로 문제 없음)

### 4. DM 대화 매칭 버그
- **문제**: `findOrCreateDirect`에서 Prisma `every` 필터 사용 → 잘못된 대화 매칭
- **위험**: 1명 참여 대화, 3명+ 대화에서도 매칭. 빈 레코드도 매칭 (vacuous truth)
- **파일**: `apps/api/src/conversations/repositories/conversations.repository.ts:10-22`
- **수정**: 참여자 수 검증 (`_count.participants === 2`) + `some` 조합으로 정확한 1:1 매칭

### 5. Workout FOLLOWERS 가시성 미검증
- **문제**: 워크아웃 상세 조회에서 `PRIVATE`만 차단, `FOLLOWERS` 가시성은 검증 없이 노출
- **위험**: 비팔로워가 FOLLOWERS 전용 워크아웃에 접근 가능
- **파일**: `apps/api/src/workouts/workouts.controller.ts:36-44`
- **수정**: `FOLLOWERS` 가시성일 때 팔로우 관계 확인 로직 추가

---

## 프론트엔드 UX 결함 (3건)

### 6. 포스트 이미지 미표시
- **문제**: 이미지 업로드 인프라는 완비되었으나, 피드/상세에서 이미지 렌더링 코드가 없음
- **위험**: 사용자가 사진을 올려도 어디에서도 보이지 않음
- **파일**: `apps/web/src/components/post/PostFeedCard.tsx`, `PostCard.tsx`
- **수정**: images 배열 렌더링 코드 추가 (이미지 그리드/캐러셀)

### 7. 팔로워/팔로잉 목록 404
- **문제**: 프로필에서 팔로워/팔로잉 수를 클릭하면 라우트 미등록으로 404
- **위험**: 사용자 혼란
- **파일**: `apps/web/src/router.tsx` (라우트 누락), `pages/profile/[id]/index.tsx:141-147` (navigate 호출)
- **수정**: `/profile/:id/followers`, `/profile/:id/following` 라우트 등록 + 페이지 생성

### 8. 워크아웃 목록에서 상세 진입 불가
- **문제**: `WorkoutCard` 컴포넌트에 Link/클릭 핸들러 없음
- **위험**: 워크아웃 목록에서 개별 워크아웃 상세를 볼 방법이 없음
- **파일**: `apps/web/src/components/workout/WorkoutCard.tsx`
- **수정**: 카드를 `<Link to={`/workouts/${workout.id}`}>` 로 래핑

---

## 체크리스트

- [x] 1. `@SkipThrottle()` 정리 — 18개 컨트롤러에서 제거, SSE 엔드포인트만 유지
- [x] 2. `Post.findById()` deletedAt 필터 — `findUnique` → `findFirst` + `deletedAt: null`
- [x] 3. `DiskUploadController` @Public 제거 — JWT 인증 필수로 변경
- [x] 4. Conversation `every` 필터 수정 — `some` 조합 + 애플리케이션 레벨 참여자 수 검증
- [x] 5. Workout FOLLOWERS 가시성 검증 — ACCEPTED 팔로우 상태 확인 로직 추가
- [x] 6. 포스트 이미지 렌더링 — 그리드 레이아웃 + lazy loading + +N 오버레이
- [x] 7. 팔로워/팔로잉 라우트 + 페이지 — 라우트 등록 + 목록 페이지 생성 + 팔로우/언팔 버튼
- [x] 8. WorkoutCard 상세 링크 — Link 컴포넌트로 상세 페이지 연결

### 완료 기준
- [x] 전체 테스트 통과 (47 suites, 638 tests)
- [x] 수정된 항목에 대한 단위 테스트 추가 (DM 매칭 + Post soft delete)
- [x] 삭제된 게시글 상세 조회 시 404 반환 확인
- [x] DM 대화 생성/조회가 정확히 1:1로 매칭되는지 확인
- [x] 피드에서 포스트 이미지가 정상 표시되는지 확인

### 리뷰에서 추가 발견/수정된 사항
- SSE 엔드포인트에 `@SkipThrottle()` 재추가 (long-lived connection 보호)
- Prisma `_count`는 where절에서 필터 불가 → 애플리케이션 레벨 필터로 재구현
- 이미지 그리드 삼항 조건 버그 수정 (`grid-cols-2` → `grid-cols-2 grid-rows-2`)
- 이미지 `loading="lazy"` 추가, alt 텍스트 개선
- **미수정 추적 이슈**: `PostSocial.likePost`가 soft-deleted 게시글 deletedAt 미검증 (별도 이슈)

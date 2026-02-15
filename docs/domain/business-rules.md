# 비즈니스 규칙 (Business Rules)

## 삭제 규칙

### Soft Delete 원칙

모든 주요 엔티티는 `deletedAt` 타임스탬프로 soft delete 한다.

### Workout 삭제 시 연쇄 효과

| 대상 | 동작 |
|------|------|
| UserShoe.totalDistance | 해당 거리만큼 차감 |
| Challenge progress | 해당 기록만큼 차감 |
| PostWorkout 연결 | 연결 해제 (Post는 유지) |
| WorkoutLike | 숨김 처리 (삭제된 워크아웃과 연결) |
| WorkoutComment | 숨김 처리 (삭제된 워크아웃과 연결) |
| EventParticipant 연결 | 연결 해제 (OfficialResult는 유지) |

### Workout 복원 시

- 유저가 **무엇을 다시 연결할지 선택** (신발, 챌린지, 포스트, 대회)
- 자동 복원하지 않음

### Post 삭제 시 연쇄 효과

| 대상 | 동작 |
|------|------|
| PostWorkout 연결 | 연결 해제 (Workout은 유지) |
| PostLike | 숨김 처리 (삭제된 포스트와 연결) |
| PostComment | 숨김 처리 (삭제된 포스트와 연결) |
| PostImage | 숨김 처리 |

### 기타 삭제 규칙

- Comment 삭제: Soft delete, 대댓글은 유지 ("삭제된 댓글입니다" 표시)
- User 탈퇴: Soft delete, 일정 기간 후 hard delete (기간 TBD)
- Crew 삭제: OWNER만 가능, 모든 멤버십/활동/출석 데이터 soft delete

## 차단 규칙 (Block Filtering)

### 필터링 우선순위

모든 조회 작업은 다음 순서로 필터링된다:

1. **Soft Delete 체크**: `deletedAt IS NULL`
2. **Block 필터링**: 양방향 차단 관계 확인 (`getBlockedUserIds`)
3. **Visibility 체크**: PRIVATE/FOLLOWERS/PUBLIC
4. **권한 매트릭스**: 본인/팔로워/비팔로워

### Block과 다른 규칙의 상호작용

| 상황 | 동작 |
|------|------|
| 차단 후 기존 댓글/좋아요 | 조회 시 숨김 처리 (DB에서 삭제하지 않음) |
| 차단 해제 후 | 팔로우 복구 안 됨, 댓글/좋아요는 다시 보임 |
| 차단된 유저의 팔로우 요청 | ForbiddenException |
| 차단된 유저의 프로필/포스트 조회 | ForbiddenException |

## 검증 규칙 (Validation)

### Workout

| 필드 | 규칙 |
|------|------|
| distance | 0 < distance <= 500,000 m (500km) |
| duration | 0 < duration <= 86,400 s (24시간) |
| pace | 자동 계산 (duration / distance * 1000) |
| heartRateAvg | 30 ~ 250 bpm |
| heartRateMax | 30 ~ 250 bpm, >= heartRateAvg |
| cadence | 50 ~ 300 spm |
| memo | 최대 2,000자 |
| title | 최대 100자 |

### Post

| 필드 | 규칙 |
|------|------|
| content | 최대 2,000자 |
| images | 개수 제한 없음 |
| hashtags | 최대 30개, 각 50자 이내 |
| linkedWorkouts | 누구의 워크아웃이든 첨부 가능 (visibility가 PRIVATE가 아닌 경우) |

### Comment

| 필드 | 규칙 |
|------|------|
| content | 최대 500자 |

### ShoeReview

| 필드 | 규칙 |
|------|------|
| rating | 1 ~ 5 (정수) |
| content | 최대 2,000자 |

## 공개 범위 (Visibility)

### Workout Visibility

- **PRIVATE**: 본인만 볼 수 있음
- **FOLLOWERS**: 팔로워만 볼 수 있음
- **PUBLIC**: 모두 볼 수 있음

워크아웃 생성 시 `User.workoutSharingDefault` 값이 기본 visibility로 사용됨.

### Post Visibility

- **PRIVATE**: 본인만 볼 수 있음
- **FOLLOWERS**: 팔로워만 볼 수 있음
- **PUBLIC**: 모두 볼 수 있음

포스트 생성 시 명시적으로 선택 (기본값 없음).

## 권한 매트릭스

### 워크아웃 권한

| 작업 | 본인 | 팔로워 | 비팔로워 |
|------|------|--------|---------|
| 열람 (PUBLIC) | O | O | O |
| 열람 (FOLLOWERS) | O | O | X |
| 열람 (PRIVATE) | O | X | X |
| 수정 | O | X | X |
| 삭제 | O | X | X |
| 좋아요 | O | O | 공개 범위에 따름 |
| 댓글 | O | O | 공개 범위에 따름 |
| 포스트에 첨부 | X | X | PRIVATE가 아닌 경우 O |

### 포스트 권한

| 작업 | 본인 | 팔로워 | 비팔로워 |
|------|------|--------|---------|
| 열람 (PUBLIC) | O | O | O |
| 열람 (FOLLOWERS) | O | O | X |
| 열람 (PRIVATE) | O | X | X |
| 수정 | O | X | X |
| 삭제 | O | X | X |
| 좋아요 | O | O | 공개 범위에 따름 |
| 댓글 | O | O | 공개 범위에 따름 |

### 크루 권한

[crew.md](crew.md) 참조

### 챌린지 권한

[challenge.md](challenge.md) 참조

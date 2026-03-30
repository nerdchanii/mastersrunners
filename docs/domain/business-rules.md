---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - packages/database/prisma/schema.prisma
  - apps/api/src
---

# 비즈니스 규칙 (Business Rules)

## 삭제 규칙

### 현재 삭제/복원 매트릭스

| 엔티티 | 현재 삭제 방식 | 복원 | 현재 연쇄/가시성 효과 |
| --- | --- | --- | --- |
| `User` | soft delete (`deletedAt`) + 개인정보 익명화 | 로그인 복귀 시 `restoreDeletedUser()` 경로 존재 | follow/crew membership은 계정 삭제 전에 hard delete |
| `Workout` | soft delete (`deletedAt`) | 현재 전용 restore API 없음 | shoe 거리 차감은 시도되지만 실패해도 삭제는 유지, feed/public 조회에서 제외 |
| `Post` | soft delete (`deletedAt`) | 현재 restore API 없음 | `PostWorkout`, `PostImage`, `PostLike`, `PostComment` 레코드는 남지만 deleted post 기준으로 숨겨짐 |
| `PostComment` | soft delete (`deletedAt`) | 현재 restore API 없음 | 대댓글은 남고, UI에서 deleted comment 취급 가능 |
| `WorkoutComment` | soft delete (`deletedAt`) | 현재 restore API 없음 | 답글 구조는 남고, deleted comment는 필터링된다 |
| `Conversation.Message` | soft delete (`deletedAt`) | 현재 restore API 없음 | unread 계산과 목록 조회에서 제외 |
| `Crew` | soft delete (`deletedAt`) | 현재 restore API 없음 | crew 자체는 숨겨지지만 membership/activity/tag/ban 레코드 전체를 soft delete 하지는 않는다 |
| `Challenge` | soft delete (`deletedAt`) | 현재 restore API 없음 | challenge 조회에서 제외 |
| `Event` | hard delete | 복원 없음 | `EventParticipant`는 cascade delete, 연결된 `Workout`은 `SetNull` 규칙만 가짐 |
| `CrewActivity` | hard delete | 복원 없음 | attendance/chat 연계는 현재 문서에선 hard delete 기준으로 읽는다 |
| `Follow` | hard delete | 복원 없음 | 재팔로우 시 새 레코드 생성 |
| `Block` | hard delete on unblock | 복원 없음 | 차단 시 양방향 follow 삭제 |
| `CrewMember` | hard delete 또는 status 전환 혼용 | 일부 status 복원만 존재 | 탈퇴/추방/승인 흐름에 따라 delete와 status update가 섞여 있다 |

### Workout 삭제 시 현재 연쇄 효과

| 대상 | 현재 동작 |
| --- | --- |
| `Shoe.totalDistance` | 삭제 시 차감을 시도하지만 실패해도 workout soft delete는 유지 |
| `Challenge progress` | 현재 delete 시 자동 롤백 규칙이 보장되지 않는다 |
| `PostWorkout` | 연결 레코드는 남을 수 있다. deleted workout 기준으로 노출이 줄어든다 |
| `WorkoutLike` / `WorkoutComment` | 레코드는 남고 `deletedAt` 필터로 숨겨진다 |
| `EventParticipant.workoutId` | workout relation은 스키마상 `SetNull`이지만, 현재 workout은 soft delete라 자동 null 복원 흐름은 없다 |

### Post 삭제 시 현재 연쇄 효과

| 대상 | 현재 동작 |
| --- | --- |
| `PostWorkout` | 자동 detach 하지 않는다 |
| `PostLike` | 레코드는 남고 deleted post 기준으로 숨겨진다 |
| `PostComment` | 레코드는 남고 deleted post 기준으로 숨겨진다 |
| `PostImage` | 레코드는 남고 deleted post 기준으로 숨겨진다 |

### 현재 구현이 드러내는 중요한 불일치

- “모든 주요 엔티티가 soft delete”라는 규칙은 현재 truth가 아니다.
- `Crew`는 soft delete지만 관련 membership/activity/tag/ban이 모두 같이 soft delete 되는 것은 아니다.
- `Event`와 일부 crew 하위 엔티티는 hard delete다.
- `Workout` 삭제 시 challenge progress나 linked relation이 자동으로 복원되는 현재 보장은 없다.

## 차단 규칙 (Block Filtering)

### 필터링 우선순위

모든 조회 작업은 다음 순서로 필터링된다:

1. **Soft Delete 체크**: `deletedAt IS NULL`
2. **Block 필터링**: 양방향 차단 관계 확인 (`getBlockedUserIds`)
3. **Visibility 체크**: PRIVATE/FOLLOWERS/PUBLIC
4. **권한 매트릭스**: 본인/팔로워/비팔로워

### Block과 다른 규칙의 상호작용

| 상황                             | 동작                                       |
| -------------------------------- | ------------------------------------------ |
| 차단 후 기존 댓글/좋아요         | 조회 시 숨김 처리 (DB에서 삭제하지 않음)   |
| 차단 해제 후                     | 팔로우 복구 안 됨, 댓글/좋아요는 다시 보임 |
| 차단된 유저의 팔로우 요청        | ForbiddenException                         |
| 차단된 유저의 프로필/포스트 조회 | ForbiddenException                         |

## 검증 규칙 (Validation)

### Workout

| 필드         | 규칙                                    |
| ------------ | --------------------------------------- |
| distance     | 0 < distance <= 500,000 m (500km)       |
| duration     | 0 < duration <= 86,400 s (24시간)       |
| pace         | 자동 계산 (duration / distance \* 1000) |
| heartRateAvg | 30 ~ 250 bpm                            |
| heartRateMax | 30 ~ 250 bpm, >= heartRateAvg           |
| cadence      | 50 ~ 300 spm                            |
| memo         | 최대 2,000자                            |
| title        | 최대 100자                              |

### Post

| 필드           | 규칙                                                             |
| -------------- | ---------------------------------------------------------------- |
| content        | 최대 2,000자                                                     |
| images         | 개수 제한 없음                                                   |
| hashtags       | 최대 30개, 각 50자 이내                                          |
| linkedWorkouts | 누구의 워크아웃이든 첨부 가능 (visibility가 PRIVATE가 아닌 경우) |

### Comment

| 필드    | 규칙       |
| ------- | ---------- |
| content | 최대 500자 |

### Shoe

| 필드          | 규칙                            |
| ------------- | ------------------------------- |
| totalDistance | 누적 거리, meters 기준으로 관리 |
| maxDistance   | 선택 입력, 교체 기준 거리       |

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

| 작업             | 본인 | 팔로워 | 비팔로워              |
| ---------------- | ---- | ------ | --------------------- |
| 열람 (PUBLIC)    | O    | O      | O                     |
| 열람 (FOLLOWERS) | O    | O      | X                     |
| 열람 (PRIVATE)   | O    | X      | X                     |
| 수정             | O    | X      | X                     |
| 삭제             | O    | X      | X                     |
| 좋아요           | O    | O      | 공개 범위에 따름      |
| 댓글             | O    | O      | 공개 범위에 따름      |
| 포스트에 첨부    | X    | X      | PRIVATE가 아닌 경우 O |

### 포스트 권한

| 작업             | 본인 | 팔로워 | 비팔로워         |
| ---------------- | ---- | ------ | ---------------- |
| 열람 (PUBLIC)    | O    | O      | O                |
| 열람 (FOLLOWERS) | O    | O      | X                |
| 열람 (PRIVATE)   | O    | X      | X                |
| 수정             | O    | X      | X                |
| 삭제             | O    | X      | X                |
| 좋아요           | O    | O      | 공개 범위에 따름 |
| 댓글             | O    | O      | 공개 범위에 따름 |

### 크루 권한

[crew.md](crew.md) 참조

### 챌린지 권한

[challenge.md](challenge.md) 참조

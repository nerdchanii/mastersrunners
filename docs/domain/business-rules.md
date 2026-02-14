# 비즈니스 규칙 (Business Rules)

## 삭제 규칙

### Soft Delete 원칙

모든 주요 엔티티는 `deletedAt` 타임스탬프로 soft delete 한다.

### Workout 삭제 시 연쇄 효과

| 대상 | 동작 |
|------|------|
| UserShoe.totalDistance | 해당 거리만큼 차감 |
| Challenge progress | 해당 기록만큼 차감 |
| Post-Workout 연결 | 연결 해제 (Post는 유지) |
| EventParticipant 연결 | 연결 해제 (OfficialResult는 유지) |

### Workout 복원 시

- 유저가 **무엇을 다시 연결할지 선택** (신발, 챌린지, 포스트, 대회)
- 자동 복원하지 않음

### 기타 삭제 규칙

- Post 삭제: Soft delete, 댓글/좋아요도 비노출
- Comment 삭제: Soft delete, 대댓글은 유지 ("삭제된 댓글입니다" 표시)
- User 탈퇴: Soft delete, 일정 기간 후 hard delete (기간 TBD)
- Crew 삭제: OWNER만 가능, 모든 멤버십/활동/출석 데이터 soft delete

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
| linkedWorkouts | 본인 워크아웃만 첨부 가능 |

### Comment

| 필드 | 규칙 |
|------|------|
| content | 최대 500자 |

### ShoeReview

| 필드 | 규칙 |
|------|------|
| rating | 1 ~ 5 (정수) |
| content | 최대 2,000자 |

## 권한 매트릭스

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

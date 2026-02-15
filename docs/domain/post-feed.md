# 포스트 & 피드 (Post & Feed)

## 핵심 원칙

**워크아웃과 포스트는 분리된 엔티티다.**

- Workout = 순수 운동 데이터 (거리, 페이스, 심박, 랩, 루트)
- Post = 소셜 콘텐츠 (텍스트, 이미지, 해시태그, 워크아웃 첨부)
- Feed는 두 가지 뷰를 제공:
  - **Post Feed**: Post visibility + 팔로우 기반
  - **Workout Feed**: Workout.visibility + 팔로우 기반

## Post (포스트)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| userId | UUID | FK → User |
| content | string | 본문 (최대 2000자) |
| visibility | enum | PRIVATE / FOLLOWERS / PUBLIC (기본: FOLLOWERS) |
| hashtags | string[] | 해시태그 목록 |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | 생성 시각 |

### PostImage (포스트 이미지)

| 필드 | 설명 |
|------|------|
| postId | FK → Post |
| imageUrl | R2 저장 URL |
| sortOrder | 정렬 순서 |

이미지 개수 제한 없음.

### PostWorkout (포스트-워크아웃 연결)

| 필드 | 설명 |
|------|------|
| postId | FK → Post |
| workoutId | FK → Workout |

- 하나의 포스트에 0~N개 워크아웃 첨부 가능
- **누구의 워크아웃이든 첨부 가능** (본인 워크아웃 제한 없음)
- 다른 유저의 공개 워크아웃도 내 포스트에 첨부 가능

## 포스트 생성 규칙

- 포스트 작성은 **수동으로만** 가능 (워크아웃 등록 시 자동 생성하지 않음)
- 워크아웃 없이 텍스트/이미지만으로도 포스트 작성 가능
- 워크아웃을 여러 개 첨부할 수 있음

## Feed (피드)

### 1. Post Feed (포스트 피드)

- Post만 표시
- 팔로우한 유저의 포스트 + 본인 포스트
- 공개 범위(Post.visibility) 규칙에 따라 필터링:
  - PRIVATE: 본인만 조회 가능
  - FOLLOWERS: 팔로워만 조회 가능
  - PUBLIC: 모든 유저 조회 가능

### 2. Workout Feed (워크아웃 피드)

- Workout만 표시 (Post 없이 독립적)
- 팔로우한 유저의 워크아웃 + 본인 워크아웃
- 공개 범위(Workout.visibility) 규칙에 따라 필터링:
  - PRIVATE: 본인만 조회 가능
  - FOLLOWERS: 팔로워만 조회 가능
  - PUBLIC: 모든 유저 조회 가능

## Block 필터링

Feed와 Post 조회 시, 차단 관계에 있는 유저의 콘텐츠는 완전히 제외된다.
상세 규칙은 [social.md](social.md)의 "Block 필터링 적용 범위" 및 [business-rules.md](business-rules.md)의 "필터링 우선순위" 참조.

## PostComment (포스트 댓글)

### 2단계 구조 with @멘션

```
Post
├── PostComment (1단계 — 댓글)
│   ├── Reply (2단계 — 대댓글)
│   ├── Reply (2단계 — 대댓글)
│   └── Reply (2단계 — 대댓글에 대한 답글, @멘션으로 표시)
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| postId | UUID | FK → Post |
| userId | UUID | FK → User (작성자) |
| parentId | UUID? | FK → PostComment (self-reference, 1단계 댓글 ID) |
| mentionedUserId | UUID? | FK → User (대댓글의 답글 대상) |
| content | string | 댓글 내용 (최대 500자) |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | 생성 시각 |

### 규칙

- 1단계: 포스트에 직접 댓글 (`parentId = null`)
- 2단계: 댓글에 대댓글 (`parentId = 1단계 댓글 ID`)
- 대댓글에 대한 답글: 추가 중첩 없이, 같은 2단계에 `@유저이름` 멘션으로 등록
  - `parentId` = 원래 1단계 댓글 ID (대댓글의 parentId와 동일)
  - `mentionedUserId` = 답글 대상 유저

## WorkoutComment (워크아웃 댓글)

### Flat 구조 (1단계만)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| workoutId | UUID | FK → Workout |
| userId | UUID | FK → User (작성자) |
| content | string | 댓글 내용 (최대 500자) |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | 생성 시각 |

### 규칙

- 워크아웃에 직접 댓글만 가능 (중첩/대댓글 없음)
- 삭제된 댓글도 soft delete로 처리

## PostLike (포스트 좋아요)

| 필드 | 설명 |
|------|------|
| userId | FK → User |
| postId | FK → Post |
| createdAt | datetime |

유저당 포스트 하나에 한 번만 가능.

## WorkoutLike (워크아웃 좋아요)

| 필드 | 설명 |
|------|------|
| userId | FK → User |
| workoutId | FK → Workout |
| createdAt | datetime |

유저당 워크아웃 하나에 한 번만 가능.

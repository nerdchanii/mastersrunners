# 포스트와 피드 (Post and Feed)

## 핵심 원칙

- `Post`와 `Workout`은 별도 엔티티다.
- 피드는 두 축으로 나뉜다.
  - 포스트 피드
  - 워크아웃 피드
- visibility와 follow/block 관계가 모두 노출 범위에 영향을 준다.

## Post

현재 스키마의 포스트 모델은 다음을 가진다.

- `userId`
- `content`
- `visibility`
- `hashtags`
- `crewId` (선택)
- `deletedAt`
- `createdAt`, `updatedAt`

### 연관 모델

- `PostImage`
  - 이미지 URL과 정렬 순서
- `PostWorkout`
  - 포스트에 연결된 워크아웃
- `PostLike`
  - 유저-포스트 좋아요 관계
- `PostComment`
  - 댓글, 대댓글, 멘션 대상 유저

## Workout Feed와 Social Feed

- 포스트 피드
  - 포스트를 중심으로 보여준다.
- 워크아웃 피드
  - 워크아웃을 중심으로 보여준다.
- 두 피드 모두 follow/block/visibility 필터의 영향을 받는다.
- 현재 프론트엔드 `/feed`는 이 둘을 탭으로 나눠 보여준다.

## 댓글 모델

### PostComment

- `parentId`를 사용한 계층형 댓글
- `mentionedUserId` 지원
- soft delete 지원

### WorkoutComment

- 현재 스키마는 워크아웃 댓글에도
  - `parentId`
  - `replies`
  - `mentionedUserIds`
    를 가진다.
- 즉, 워크아웃 댓글은 더 이상 단순 flat 1단계 구조로만 보지 않는다.

## 현재 제약

- 피드 집계와 interaction write는 서로 다른 모듈에 분리돼 있다.
- 프론트엔드에서는 포스트/워크아웃 피드가 같은 화면에 있지만 데이터 패턴은 아직 완전히 통일되지 않았다.

---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - packages/database/prisma/schema.prisma
  - apps/api/src/follow/follow.service.ts
  - apps/api/src/block/block.service.ts
  - apps/api/src/profile/profile.service.ts
  - apps/api/src/post-social/post-social.service.ts
---

# 소셜 규칙 (Social)

## 공개 범위의 현재 기준

현재 소셜 공개 규칙은 계정 공개 여부와 콘텐츠 공개 범위가 함께 작동한다.

- `User.isPrivate`: 프로필과 팔로우 승인 흐름에 영향을 준다.
- `User.workoutSharingDefault`: 워크아웃 기본 공개 범위다.
- `Post.visibility`: 포스트마다 `PRIVATE`, `FOLLOWERS`, `PUBLIC` 중 하나를 가진다.

## 팔로우

### 상태

| 상태 | 의미 |
| --- | --- |
| `PENDING` | 비공개 계정에 대한 팔로우 요청 |
| `ACCEPTED` | 팔로우 성립 |
| 레코드 삭제 | 거절 또는 언팔로우 |

### 현재 규칙

- 자기 자신은 팔로우할 수 없다.
- 공개 계정은 팔로우 요청이 즉시 `ACCEPTED` 된다.
- 비공개 계정은 팔로우 요청이 `PENDING`으로 생성되고 승인 후 성립한다.
- 언팔로우는 언제든 가능하다.

## 차단

### 현재 규칙

- 차단 시 양방향 팔로우 관계가 즉시 제거된다.
- 차단 관계가 있으면 프로필 조회, direct conversation 시작, direct message 전송이 막힌다.
- 차단 해제 후에도 팔로우 관계는 자동 복구되지 않는다.

### 차단 필터링 영향

| 영역 | 현재 동작 |
| --- | --- |
| 프로필 조회 | 차단 관계면 접근 불가 |
| direct conversation 시작 | 차단 관계면 생성 불가 |
| direct message 조회/전송 | 차단 관계면 접근 불가 |
| 피드/소셜 목록 | 차단 사용자 데이터는 필터링 대상 |

## 포스트와 워크아웃 공개

### 포스트

- 포스트는 개별 `visibility` 값을 가진다.
- `PRIVATE`: 작성자만 본다.
- `FOLLOWERS`: 팔로워만 본다.
- `PUBLIC`: 누구나 볼 수 있다.

### 워크아웃

- 사용자 기본값은 `workoutSharingDefault`에 저장된다.
- 현재 문서 기준으로 워크아웃은 별도 “프로필 전체 공개 규칙”보다 workout-level 기본 공개 값이 더 직접적인 canonical 신호다.
- 프로필이 비공개여도, 구현은 여전히 profile/follow/block 규칙과 함께 워크아웃 노출을 판단한다.

## 프로필 공개와 소셜 상호작용

- 비공개 계정은 팔로워가 아니면 프로필 세부 조회가 제한될 수 있다.
- 공개 계정은 팔로우 즉시 성립하고 프로필 접근 제약이 낮다.
- 현재 제품 문서에서는 “모든 소셜 surface가 profile 공개 여부 하나로만 통제된다”라고 단순화하지 않는다. 실제 구현은 follow/block/post visibility/workout default가 함께 작동한다.

## 현재 truth에서 제외한 오래된 설명

- “비공개 계정이면 DM은 팔로워만 가능” 같은 단일 규칙
- workout 노출이 profile 공개 여부만으로 결정된다는 설명
- 차단 후 기존 댓글/좋아요 처리까지 완전히 일관된 soft-hide 계약이 보장된다는 강한 표현

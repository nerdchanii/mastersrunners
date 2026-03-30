---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - packages/database/prisma/schema.prisma
  - design/backend/events-challenges.md
  - apps/api/src/challenges/challenges.controller.ts
  - apps/api/src/challenges/challenges.service.ts
  - apps/api/src/challenges/repositories/challenge.repository.ts
  - apps/api/src/challenges/repositories/challenge-participant.repository.ts
  - apps/api/src/challenges/repositories/challenge-team.repository.ts
---

# 챌린지 (Challenge)

## 정의

현재 챌린지는 `Challenge`, `ChallengeParticipant`, `ChallengeTeam`을 중심으로 동작하는 목표 달성형 기능이다.

- 생성은 현재 로그인 유저 기준으로 이뤄진다.
- 크루 전용 챌린지는 `crewId`를 연결해서 표현한다.
- 개인 진행률은 참가 레코드의 `currentValue`와 `isCompleted`에 직접 저장한다.
- 팀 기능은 존재하지만, 생성 단계에서 복잡한 승인/공개 정책을 세밀하게 구성하는 제품 표면은 아직 아니다.

## 현재 생성 입력

현재 API가 생성 시 받는 핵심 필드는 아래와 같다.

| 필드 | 설명 |
| --- | --- |
| `title` | 챌린지 이름 |
| `description` | 설명 |
| `type` | `DISTANCE`, `FREQUENCY`, `STREAK`, `PACE` |
| `targetValue` | 목표 수치 |
| `targetUnit` | `KM`, `COUNT`, `DAYS`, `SEC_PER_KM` |
| `startDate` | 시작 시각 |
| `endDate` | 종료 시각 |
| `crewId` | 크루 전용 챌린지 연결용 선택 필드 |
| `isPublic` | 공개 여부 |
| `imageUrl` | 대표 이미지 |

`endDate`는 `startDate` 이후여야 한다.

## 스키마에 존재하는 기본값 메타데이터

`Challenge` 스키마에는 아래 필드가 존재하지만, 현재 생성 UI/API는 이 값을 풍부하게 조합해 받기보다 기본값에 의존한다.

| 필드 | 현재 기본값 또는 현재 사용 방식 |
| --- | --- |
| `creatorType` | 기본값 `USER` |
| `goalType` | 기본값 `CUMULATIVE` |
| `participationUnit` | 기본값 `INDIVIDUAL` |
| `participationMode` | 기본값 `SOLO` |
| `joinType` | 기본값 `OPEN` |
| `visibility` | 기본값 `PUBLIC` |

즉, 과거 문서에 있던 `PLATFORM` 생성자, 팔로워 공개 범위, 다단계 승인 워크플로우는 현재 canonical 동작이 아니다.

## 핵심 모델

### Challenge

- 목표 정의
  - `type`
  - `targetValue`
  - `targetUnit`
- 일정
  - `startDate`
  - `endDate`
- 소유/범위
  - `creatorId`
  - `crewId`
  - `isPublic`
- 메타데이터
  - `creatorType`
  - `goalType`
  - `participationUnit`
  - `participationMode`
  - `joinType`
  - `visibility`
- 삭제
  - `deletedAt`

### ChallengeParticipant

참가자는 현재 유저 단위로 기록된다.

- `challengeId`
- `userId`
- `currentValue`
- `isCompleted`
- `completedAt`
- `status`
  - 기본값 `ACTIVE`
  - 현재 서비스 흐름에서 leave는 상태 변경이 아니라 레코드 삭제로 처리된다
- `challengeTeamId`
- `joinedAt`

현재 API는 `challengeId + userId` 조합을 유니크 참가 키로 사용한다.

### ChallengeTeam

팀 모드에서 사용할 임시 팀 엔티티다.

- `challengeId`
- `name`
- 별도 팀 리더 엔티티는 없다
- 팀 리더보드는 참가자 `currentValue` 합산으로 계산한다

## 현재 참여 흐름

챌린지 진행률은 두 경로로 움직인다.

- 명시적 갱신
  - `PATCH /challenges/:id/progress`
- 워크아웃 생성 시 집계
  - `ChallengeAggregationService`
  - 현재는 `DISTANCE`, `FREQUENCY` 타입만 자동 집계 대상이다
  - `STREAK`, `PACE`는 자동 집계에서 제외된다
  - 이 집계는 워크아웃 저장 성공 이후의 non-blocking 후속 처리다

### 개인 참여

1. 유저가 `POST /challenges/:id/join`
2. 이미 참가 중이면 실패
3. 종료된 챌린지면 실패
4. 참가 레코드 생성

### 참여 철회

- `DELETE /challenges/:id/leave`
- 현재 구현은 `WITHDRAWN` 상태 전환이 아니라 참가 레코드 hard delete다

### 진행률 갱신

- `PATCH /challenges/:id/progress`
- `currentValue`를 직접 갱신한다
- `currentValue >= targetValue` 이면 `isCompleted = true`, `completedAt`이 기록된다
- 워크아웃 생성 경로에서는 별도 `PATCH` 호출 없이 집계 서비스가 같은 참가 레코드 값을 누적 갱신할 수 있다

## 현재 팀 기능

현재 API는 다음 팀 기능을 제공한다.

- 팀 생성
  - `POST /challenges/:id/teams`
- 팀 조회
  - `GET /challenges/:id/teams`
- 팀 참가
  - `POST /challenges/:id/teams/:teamId/join`
- 팀 이탈
  - `DELETE /challenges/:id/teams/leave`
- 팀 삭제
  - `DELETE /challenges/:id/teams/:teamId`
- 팀 리더보드
  - `GET /challenges/:id/teams/leaderboard`

팀 기능은 current runtime에 존재하지만, 과거 문서의 풍부한 승인 정책이나 플랫폼 운영 기능까지 구현된 것은 아니다.

## 조회와 리더보드

- 목록 조회
  - 공개 여부(`isPublic`)
  - 크루 ID(`crewId`)
  - cursor/limit
- 내 챌린지 조회
  - 참가 레코드를 기준으로 조회
  - 응답에 `myProgress`가 포함될 수 있다
- 개인 리더보드
  - 참가자의 `currentValue` 내림차순
- 팀 리더보드
  - 팀별 참가자 `currentValue` 합산

## 삭제 규칙

- 챌린지는 hard delete가 아니라 `deletedAt`을 채우는 soft delete다.
- 참가자와 팀은 챌린지 삭제 시 relation cascade로 함께 제거된다.
- 참가 철회와 팀 삭제는 별도 soft delete 필드 없이 hard delete다.

## 현재 문서에서 제거한 오래된 설명

다음은 현재 코드/스키마 기준으로 재확인되지 않아 current doc에서 제거했다.

- `PLATFORM` 생성자가 현재 제품 기능처럼 동작한다는 설명
- `FOLLOWERS` 공개 범위를 현재 챌린지 visibility 규칙으로 쓰는 설명
- `PENDING`, `REMOVED` 같은 참가 상태를 현재 API가 운영한다는 설명
- 크루 대표 승인/신청 워크플로우가 현재 구현되어 있다는 설명

이 개념들이 다시 필요하면 `target` 설계로 복구해야 한다.

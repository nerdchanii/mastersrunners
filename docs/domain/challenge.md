---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - packages/database/prisma/schema.prisma
  - apps/api/src/challenges/challenges.controller.ts
  - apps/api/src/challenges/challenges.service.ts
  - apps/api/src/challenges/repositories/challenge-participant.repository.ts
  - apps/api/src/challenges/repositories/challenge-team.repository.ts
---

# 챌린지 (Challenge)

## 정의

현재 챌린지는 기간과 목표 수치를 가진 참여형 목표 기능이다. 생성자는 항상 사용자이고, 챌린지는 공개 또는 크루 범위로 만들 수 있다. 참여자는 개인 단위로 들어오며 진행률은 `currentValue`로 관리된다.

## 현재 생성 입력

현재 API가 생성/수정에서 직접 다루는 필드는 다음과 같다.

| 필드 | 설명 |
| --- | --- |
| `title` | 챌린지 제목 |
| `description` | 설명 |
| `type` | `DISTANCE`, `FREQUENCY`, `STREAK`, `PACE` |
| `targetValue` | 목표 수치 |
| `targetUnit` | `KM`, `COUNT`, `DAYS`, `SEC_PER_KM` |
| `startDate` / `endDate` | 시작일과 종료일 |
| `crewId` | 선택적 크루 범위 |
| `isPublic` | 공개 여부 |
| `imageUrl` | 대표 이미지 |

현재 서비스는 `creatorId`를 로그인 사용자로 고정하고, 생성 직후 생성자를 자동 참여자로 추가한다.

## Challenge 모델

스키마 기준 현재 필드는 다음과 같다.

- 기본 식별과 설명
  - `id`
  - `title`
  - `description`
  - `imageUrl`
- 목표와 기간
  - `type`
  - `targetValue`
  - `targetUnit`
  - `startDate`
  - `endDate`
- 생성자와 범위
  - `creatorId`
  - `crewId`
  - `isPublic`
- 스키마 확장 필드
  - `creatorType`
  - `goalType`
  - `participationUnit`
  - `participationMode`
  - `joinType`
  - `visibility`
  - `deletedAt`

### 스키마 확장 필드의 현재 의미

위 확장 필드는 스키마에 기본값과 함께 존재하지만, 현재 controller/service 계약은 이 필드들에 대한 별도 분기나 권한 흐름을 노출하지 않는다. 현재 비즈니스 truth는 `creatorType = USER` 전제의 개인 참여 챌린지에 가깝고, 승인형 참여나 플랫폼 생성 챌린지는 현재 문서 기준의 runtime truth가 아니다.

## 참여 모델

### ChallengeParticipant

현재 participant 레코드는 다음 정보를 가진다.

| 필드 | 설명 |
| --- | --- |
| `challengeId` | 대상 챌린지 |
| `userId` | 참여 사용자 |
| `currentValue` | 현재 진행 수치 |
| `isCompleted` | 목표 달성 여부 |
| `completedAt` | 달성 시각 |
| `status` | 스키마 기본값은 `ACTIVE` |
| `challengeTeamId` | 선택적 팀 연결 |
| `joinedAt` | 참여 시각 |

### 현재 참여 흐름

- 참여(`join`)
  - 종료된 챌린지에는 참여할 수 없다.
  - 이미 참여 중이면 중복 참여할 수 없다.
  - 새 participant row를 생성한다.
- 탈퇴(`leave`)
  - 현재 구현은 `WITHDRAWN` 상태 전환이 아니라 participant row를 삭제한다.
- 진행률 갱신(`updateProgress`)
  - `currentValue`를 직접 갱신한다.
  - `targetValue` 이상이면 `isCompleted = true`, `completedAt`을 기록한다.

즉, 스키마에는 `status`가 있지만 현재 leave 흐름은 soft state transition보다 hard removal에 가깝다.

## 팀 기능

현재 서비스는 챌린지 내부 팀을 지원한다.

- `ChallengeTeam`
  - `challengeId`
  - `name`
  - `participants`
- 현재 API 동작
  - 참여자 또는 생성자가 팀을 생성할 수 있다.
  - 참여자는 팀에 합류하거나 팀 연결을 해제할 수 있다.
  - 팀 리더보드는 participant의 `currentValue` 합계로 계산한다.

현재 팀 기능은 챌린지 내부 편성 기능이며, 문서화된 별도 승인 워크플로우나 복잡한 팀 권한 모델은 없다.

## 조회와 리더보드

- 목록 조회는 `isPublic`, `crewId`, cursor/limit 기반이다.
- `my` 목록은 참여 중인 챌린지와 자신의 `currentValue`를 함께 돌려준다.
- 상세 조회는 현재 사용자 기준으로
  - `isJoined`
  - `myProgress`
    를 계산해 반환한다.
- 개인 리더보드는 participant `currentValue` 내림차순이다.
- 팀 리더보드는 팀별 participant 합산 값 기준이다.

## 현재 제약

- 승인형 참여, 플랫폼 생성, richer visibility 정책은 스키마 확장 필드로만 남아 있고 현재 서비스 계약으로 적극 사용되지 않는다.
- participant `status`의 `WITHDRAWN` 의미는 현재 leave 구현과 완전히 일치하지 않는다. 현재 leave는 레코드 삭제다.
- 챌린지 진행률은 명시적 업데이트와 workout aggregation service 호출에 의존하며, 완전히 분리된 비동기 플랫폼으로 동작하지는 않는다.

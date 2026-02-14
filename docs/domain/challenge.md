# 챌린지 (Challenge)

## 정의

목표 달성형 이벤트. 유저/크루/플랫폼이 생성하며, 개인 또는 크루 단위로 참여한다.
워크아웃 등록 시 조건 매칭되면 자동으로 진행률에 반영된다.

## 엔티티 구조

### Challenge (챌린지)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| creatorType | enum | USER / CREW / PLATFORM |
| creatorId | UUID | 생성자 (User ID 또는 Crew ID) |
| title | string | 챌린지 이름 |
| description | string? | 설명 |
| imageUrl | string? | 대표 이미지 |
| goalType | enum | DISTANCE / COUNT / STREAK / PACE |
| goalValue | float | 목표 수치 |
| participationUnit | enum | INDIVIDUAL / CREW |
| participationMode | enum | SOLO / TEAM |
| joinType | enum | OPEN / APPROVAL |
| visibility | enum | PUBLIC / FOLLOWERS / CREW_ONLY |
| startDate | date | 시작일 |
| endDate | date | 종료일 |
| createdAt | datetime | 생성 시각 |

### 생성자별 조합 규칙

| 생성자 | 참여 단위 | 참여 모드 | 공개 범위 |
|--------|----------|----------|----------|
| **PLATFORM** | INDIVIDUAL 또는 CREW | SOLO 또는 TEAM | PUBLIC |
| **CREW** | INDIVIDUAL | SOLO 또는 TEAM | CREW_ONLY 또는 PUBLIC |
| **CREW** | CREW (크루 대항) | SOLO | PUBLIC |
| **USER** | INDIVIDUAL | SOLO 또는 TEAM | PUBLIC 또는 FOLLOWERS |

### 참여 모드 설명

| 모드 | 설명 |
|------|------|
| SOLO | 각 참여자(개인/크루)가 개별적으로 목표 달성 |
| TEAM | 챌린지 내에서 팀을 구성하여 팀 단위로 경쟁 |

## 목표 타입 (goalType)

| 타입 | 설명 | 예시 |
|------|------|------|
| DISTANCE | 거리 누적 (meters) | "한 달 200km 달리기" |
| COUNT | 횟수 | "이번 달 20회 러닝" |
| STREAK | 연속 일수 | "30일 연속 달리기" |
| PACE | 페이스 달성 | "5:00/km 이내로 10km 완주" |

## ChallengeParticipant (참여자)

| 필드 | 타입 | 설명 |
|------|------|------|
| challengeId | UUID | FK → Challenge |
| userId | UUID? | FK → User (개인 참여 시) |
| crewId | UUID? | FK → Crew (크루 참여 시) |
| challengeTeamId | UUID? | FK → ChallengeTeam (팀 모드 시) |
| status | enum | PENDING / ACTIVE / COMPLETED / WITHDRAWN / REMOVED |
| progress | float | 현재 진행률 |
| joinedAt | datetime | 참여 시각 |
| completedAt | datetime? | 목표 달성 시각 |

### 참여 상태

| 상태 | 설명 |
|------|------|
| PENDING | 승인 대기 중 (APPROVAL 모드) |
| ACTIVE | 참여 중 |
| COMPLETED | 목표 달성 |
| WITHDRAWN | 본인 포기 |
| REMOVED | 주최자가 제외 |

## ChallengeTeam (챌린지 팀)

팀 모드(TEAM) 시 챌린지 내부에서 편성되는 임시 팀.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| challengeId | UUID | FK → Challenge |
| name | string | 팀 이름 |

## 승인 권한

| 챌린지 생성자 | 참여 승인 권한 |
|--------------|---------------|
| USER | 생성자 본인 |
| CREW | 크루 OWNER / ADMIN |
| PLATFORM | 시스템 관리자 |

## 자동 집계 규칙

- 워크아웃이 등록되면 참여 중인 챌린지 조건과 매칭
- 조건 충족 시 자동으로 progress 업데이트
- CREW 참여 시 크루 멤버들의 워크아웃이 합산 집계
- 크루 대표(OWNER/ADMIN)가 크루 단위 참여를 신청하며, 크루원은 별도 신청 없이 자동 집계

## 크루 참여 동작

1. 크루 OWNER/ADMIN이 크루를 챌린지에 참여 등록
2. 해당 크루의 모든 멤버 워크아웃이 자동으로 크루 합산에 반영
3. 크루원 개개인은 별도 참여 신청 불필요

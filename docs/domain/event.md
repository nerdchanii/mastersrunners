# 대회/이벤트 (Event)

## 정의

공식 마라톤/러닝 대회. 하나의 대회는 여러 종목(EventCategory)을 포함한다.

## 엔티티 구조

### Event (대회)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| name | string | 대회명 |
| date | date | 대회 일자 |
| location | string | 장소 |
| description | string? | 설명 |
| officialUrl | string? | 공식 홈페이지 |
| registrationUrl | string? | 접수 페이지 |
| imageUrl | string? | 대표 이미지 |
| createdAt | datetime | 생성 시각 |

### EventCategory (종목)

하나의 대회에 여러 종목이 존재한다 (1:N).

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| eventId | UUID | FK → Event |
| name | string | 종목명 (풀코스, 하프, 10km 등) |
| distance | float | 거리 (meters) |
| entryFee | int? | 참가비 (원) |

### EventParticipant (대회 참가)

User와 EventCategory의 N:N 조인 테이블.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| userId | UUID | FK → User |
| eventCategoryId | UUID | FK → EventCategory |
| createdAt | datetime | 등록 시각 |

### OfficialResult (공식 기록)

EventParticipant에 1:1 연결. 유저가 직접 입력/수정 가능.

| 필드 | 타입 | 설명 |
|------|------|------|
| eventParticipantId | UUID | FK → EventParticipant (1:1) |
| gunTime | int | Gun Time (seconds) |
| netTime | int | Net Time / Chip Time (seconds) |
| overallRank | int? | 전체 순위 |
| ageGroupRank | int? | 에이지그룹 순위 |
| ageGroup | string? | 에이지그룹 명칭 |

## 워크아웃 연결

- Workout에 `eventParticipantId` (optional FK)
- 워크아웃 등록 시 **GPS 좌표 + 날짜** 기반으로 대회 추천 ("이 대회 뛰었나요?")
- 유저가 수동으로 연결/해제 가능

## 대회 후기

별도 엔티티 없음. **Post + 워크아웃 첨부 + 대회 연결 상태**로 표현.

- 워크아웃이 대회에 연결된 상태에서, 해당 워크아웃을 첨부한 포스트 = 대회 후기
- 대회 페이지에서 해당 대회에 연결된 포스트들을 모아서 표시 가능

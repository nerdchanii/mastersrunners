---
doc_state: current
owner: product
last_verified: 2026-03-30
sources:
  - packages/database/prisma/schema.prisma
  - apps/api/src
---

# 워크아웃 (Workout)

## 정의

워크아웃은 러닝 기록의 기본 단위다. 소셜 포스트와 분리되어 저장되며, 필요할 때 포스트·대회 결과·신발 기록에 연결된다.

## 핵심 모델

### Workout

현재 스키마의 핵심 필드는 다음과 같다.

- 소유자와 분류
  - `userId`
  - `workoutTypeId`
  - `sport`
  - `source`
  - `externalId`
  - `externalSource`
- 기록 수치
  - `distance` (meters)
  - `duration` (seconds)
  - `movingTime`
  - `pace` (seconds per kilometer)
  - `bestPace`
  - `elevationGain`, `elevationLoss`, `minElevation`, `maxElevation`
  - `avgHeartRate`, `maxHeartRate`
  - `avgCadence`, `maxCadence`
  - `calories`, `avgTemperature`
- 위치와 시각
  - `startLat`, `startLng`, `endLat`, `endLng`
  - `hasGps`
  - `date`
  - `startedAt`, `finishedAt`
- 메타데이터
  - `title`
  - `memo`
  - `visibility`
  - `shoeId`
  - `deletedAt`

### 연관 모델

- `WorkoutFile`
  - 원본 FIT/GPX/TCX 업로드 파일과 처리 상태를 저장한다.
- `WorkoutRoute`
  - 인코딩된 폴리라인과 상세 route JSON을 저장한다.
- `WorkoutLap`
  - 랩 번호, trigger, 거리, 시간, 페이스, 심박/케이던스, 고도 정보를 저장한다.
- `WorkoutPhoto`
  - 워크아웃 사진과 정렬 순서를 저장한다.

## 생성 경로

- 수동 입력
- FIT 파일 업로드
- GPX 파일 업로드
- 외부 플랫폼 동기화
  - Garmin
  - Coros
  - Strava

## 연결 규칙

- 포스트 연결
  - `PostWorkout`을 통해 하나의 포스트에 여러 워크아웃을 연결할 수 있다.
- 신발 연결
  - 워크아웃은 `shoeId`로 개인 신발(`Shoe`)에 연결된다.
- 대회 연결
  - 워크아웃은 `EventParticipant.workoutId`로 대회 참가 기록과 연결될 수 있다.

## 단위 규칙

| 항목   | 저장 기준  | 설명                              |
| ------ | ---------- | --------------------------------- |
| 거리   | meters     | ADR-0003 기준 canonical unit      |
| 시간   | seconds    | duration, movingTime, result time |
| 페이스 | seconds/km | UI에서만 `min:sec/km` 등으로 변환 |

## 현재 제약

- 워크아웃 상세와 생성 UX는 풍부하지만 route 파일이 여전히 크다.
- 외부 동기화 모델은 스키마에 있지만, 모든 플랫폼이 동일 성숙도로 구현된 것은 아니다.

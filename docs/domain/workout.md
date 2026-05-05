---
doc_state: current
owner: product
last_verified: 2026-05-05
sources:
  - packages/database/prisma/schema.prisma
  - packages/database/prisma/migrations/20260423022000_remove_workout_legacy_detail_schema/migration.sql
  - apps/api/src/uploads/uploads.service.ts
  - apps/api/src/workouts/workouts.service.ts
  - tasks/archive/I-0018-060-db-deploy-migration-backfill-compat.md
  - tasks/todo/I-0018-040-repo-cloudflare-workout-private-storage-backfill.md
  - tasks/todo/I-0018-070-db-workout-legacy-physical-cleanup.md
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
  - `encodedPolyline`
  - `detailPath`
  - `detailFormatVersion`
  - `deletedAt`

### 연관 모델

- `WorkoutFile`
  - 원본 FIT/GPX 업로드 파일과 처리 상태를 저장한다.
  - canonical raw source 위치는 필수 `sourcePath`로 보관한다.
  - legacy row는 final private-storage backfill 전까지 기존 `fileUrl` 값을 compatibility `sourcePath`로 보관할 수 있으며, 일반 API 응답에는 source 위치를 노출하지 않는다.
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

- 워크아웃 상세와 생성 UX는 풍부하지만 detail blob payload는 여전히 크다.
- detail 응답은 `Workout.detailPath` private blob을 정본으로 합성하므로, blob이 없거나 손상되면 route/lap 상세는 비게 된다.
- raw source가 남아 있는데 `detailPath`가 없거나 읽을 수 없는 imported workout은 운영 경고 대상으로 취급한다.
- 외부 동기화 모델은 스키마에 있지만, 모든 플랫폼이 동일 성숙도로 구현된 것은 아니다.

## 삭제 규칙

- 현재 workout 삭제는 hard delete가 아니라 `deletedAt`을 채우는 soft delete다.
- 삭제 후 shoe 거리 차감이 비동기 보정처럼 시도되지만, 실패해도 workout 삭제 자체는 유지된다.
- 현재 전용 restore API는 없다.

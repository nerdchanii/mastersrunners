# 워크아웃 (Workout)

## 정의

순수 운동 데이터 기록 단위. 소셜 콘텐츠(포스트)와 분리된다.
포스트에 첨부할 수 있지만, 워크아웃 자체는 피드에 노출되지 않는다.

## 엔티티 구조

### Workout (워크아웃)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| userId | UUID | FK → User |
| workoutTypeId | UUID | FK → WorkoutType (분류) |
| title | string | 제목 (선택) |
| distance | float | 거리 (meters) |
| duration | int | 시간 (seconds) |
| pace | float | 페이스 (seconds/km) |
| cadence | float? | 케이던스 (spm) |
| heartRateAvg | int? | 평균 심박 |
| heartRateMax | int? | 최대 심박 |
| calories | int? | 소모 칼로리 |
| elevationGain | float? | 누적 상승 고도 (meters) |
| elevationLoss | float? | 누적 하강 고도 (meters) |
| memo | string? | 메모 (최대 2000자) |
| source | enum | MANUAL / FIT_UPLOAD / GPX_UPLOAD / GARMIN_SYNC / COROS_SYNC |
| userShoeId | UUID? | FK → UserShoe (착용 신발) |
| eventParticipantId | UUID? | FK → EventParticipant (대회 연결) |
| startedAt | datetime | 운동 시작 시각 |
| deletedAt | datetime? | Soft delete |
| createdAt | datetime | 생성 시각 |

### WorkoutLap (랩)

모든 워크아웃 유형에서 랩 데이터를 표시한다 (인터벌 전용이 아님).

| 필드 | 타입 | 설명 |
|------|------|------|
| lapNumber | int | 랩 순서 |
| distance | float | 구간 거리 (meters) |
| duration | int | 구간 시간 (seconds) |
| pace | float | 구간 페이스 (seconds/km) |
| heartRateAvg | int? | 구간 평균 심박 |
| cadence | float? | 구간 케이던스 |

### WorkoutRoute (루트)

GPS 경로 데이터. 포인트 배열로 저장.

### WorkoutFile (원본 파일)

업로드된 FIT/GPX 원본 파일. Cloudflare R2 저장, Presigned URL로 접근.

### WorkoutPhoto (사진)

워크아웃에 직접 첨부된 사진. 제한 없음.

## 생성 방법

| 방법 | 설명 |
|------|------|
| 수동 입력 | 앱에서 직접 기록 입력 |
| FIT 업로드 | FIT 파일 파싱 → 자동 필드 채움 |
| GPX 업로드 | GPX 파일 파싱 → 자동 필드 채움 |
| Garmin 동기화 | Garmin Connect API (후순위) |
| Coros 동기화 | Coros API (후순위) |

## 분류체계 (Taxonomy)

확장 가능한 구조: DB 정의 테이블 (enum이 아님). 관리자/시스템이 유형 추가 가능.

### WorkoutType (정의 테이블)

| 필드 | 설명 |
|------|------|
| id | UUID |
| category | 상위 카테고리 |
| name | 하위 유형 이름 |
| description | 설명 |
| sortOrder | 정렬 순서 |
| isActive | 활성 여부 |

### 카테고리 & 하위 유형

**LONG_RUN (장거리)**
- LSD: 느린 장거리 달리기
- 지속주 (Sustained): 일정 페이스 장거리
- 시간주 (Time-based): 시간 기준 장거리

**SPEED (스피드)**
- 인터벌 (Interval): 고정 거리 반복 (예: 1000m x 5)
- 가변 인터벌 (Variable Interval): 혼합 거리 반복 (예: 200/400/800/400/200)
- 파틀렉 (Fartlek): 비구조화 스피드 변화

**THRESHOLD (강도)**
- 템포런 (Tempo Run): LT 페이스 달리기

**EASY (가벼운 런)**
- 이지런 (Easy Run): 편안한 페이스 달리기
- 리커버리 (Recovery): 회복 목적 저강도
- 조깅 (Jog): 가볍게 달리기

**RACE (레이스)**
- 대회 연동 워크아웃

**TRAIL (트레일)**
- 트레일 러닝

**CROSS_TRAINING (크로스트레이닝)**
- 러닝 외 보조 운동

> 하위 유형은 향후 세분화/추가 가능. 유저가 직관적으로 고를 수 있는 이름 사용.

## 대회 연결

- Workout에 `eventParticipantId` (optional FK)
- 워크아웃 등록 시 GPS 좌표 + 날짜 기반으로 대회 추천 ("이 대회 뛰었나요?")
- 유저가 수동으로 연결/해제

## 단위 규칙

| 항목 | DB 저장 | UI 변환 |
|------|---------|---------|
| 거리 | meters | km / mi |
| 시간 | seconds | mm:ss / hh:mm:ss |
| 페이스 | seconds/km | min:sec/km / min:sec/mi |
| 고도 | meters | m / ft |

유저 설정에서 km ↔ mi 단위 전환 가능.
